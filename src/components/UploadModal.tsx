import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Music, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { supabase, isSupabaseConfigured, rawSupabaseUrl } from '../lib/supabase';
import { cleanFileNameToTitle } from '../lib/filename';
import { STANDARD_CATEGORIES, type Category, type Song } from '../types/song';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSongUploaded: (newSong: Song) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSongUploaded,
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [category, setCategory] = useState<Category>('Malayalam');
  const [detectedTitle, setDetectedTitle] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const title = cleanFileNameToTitle(file.name);
      setDetectedTitle(title);
      setErrorMessage(null);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile) {
      setErrorMessage('Please select an audio file to upload.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMessage('Supabase is not configured yet. Please configure your .env file with your Supabase URL & Key.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Prepare clean Title from filename
      const title = detectedTitle.trim() || cleanFileNameToTitle(audioFile.name);

      // 2. Upload audio file to 'music' bucket
      setUploadStatus('Uploading audio file to cloud storage...');
      const audioExtension = audioFile.name.split('.').pop()?.toLowerCase() || 'mp3';
      const sanitizedAudioName = audioFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const audioPath = `${Date.now()}_${sanitizedAudioName}`;

      const { error: audioUploadError } = await supabase.storage
        .from('music')
        .upload(audioPath, audioFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: audioFile.type || `audio/${audioExtension}`,
        });

      if (audioUploadError) {
        throw new Error(`Audio upload failed: ${audioUploadError.message}. Ensure the 'music' storage bucket exists in Supabase.`);
      }

      // Get public audio URL
      const { data: audioUrlData } = supabase.storage
        .from('music')
        .getPublicUrl(audioPath);
      
      let audioUrl = audioUrlData.publicUrl;
      if (rawSupabaseUrl && audioUrl.includes('/supabase-proxy')) {
        audioUrl = audioUrl.replace(/https?:\/\/[^/]+\/supabase-proxy/, rawSupabaseUrl);
      }

      // 3. Upload optional cover image to 'covers' bucket
      let coverUrl: string | null = null;
      if (coverFile) {
        setUploadStatus('Uploading cover artwork...');
        const coverExt = coverFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const sanitizedCoverName = coverFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const coverPath = `${Date.now()}_${sanitizedCoverName}`;

        const { error: coverUploadError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: coverFile.type || `image/${coverExt}`,
          });

        if (coverUploadError) {
          console.warn('Cover upload issue:', coverUploadError);
        } else {
          const { data: coverUrlData } = supabase.storage
            .from('covers')
            .getPublicUrl(coverPath);
          coverUrl = coverUrlData.publicUrl;
          if (rawSupabaseUrl && coverUrl.includes('/supabase-proxy')) {
            coverUrl = coverUrl.replace(/https?:\/\/[^/]+\/supabase-proxy/, rawSupabaseUrl);
          }
        }
      }

      // 4. Insert row into `songs` table
      setUploadStatus('Registering song in library...');
      let insertPayload: any = {
        title: title,
        audio_url: audioUrl,
        category: category,
        cover_url: coverUrl,
      };

      let { data: insertedSong, error: dbError } = await supabase
        .from('songs')
        .insert([insertPayload])
        .select()
        .single();

      // Graceful fallback if user's existing table has 'genre' instead of 'category'
      if (dbError && dbError.message.includes("'category' column")) {
        insertPayload = {
          title: title,
          audio_url: audioUrl,
          genre: category,
          cover_url: coverUrl,
        };
        const retry = await supabase
          .from('songs')
          .insert([insertPayload])
          .select()
          .single();
        insertedSong = retry.data;
        dbError = retry.error;
      }

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}. Make sure table 'songs' exists.`);
      }

      setSuccessMessage(`"${title}" has been successfully added to Pattupetti!`);
      setUploadStatus('Complete!');

      // Notify parent to update local state immediately
      if (insertedSong) {
        const normalizedSong: Song = {
          id: insertedSong.id,
          title: insertedSong.title,
          audio_url: insertedSong.audio_url,
          category: insertedSong.category || insertedSong.genre || category,
          cover_url: insertedSong.cover_url || null,
          created_at: insertedSong.created_at,
        };
        onSongUploaded(normalizedSong);
      }

      // Automatically close modal after brief delay
      setTimeout(() => {
        handleReset();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Upload process error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setAudioFile(null);
    setCoverFile(null);
    setDetectedTitle('');
    setCategory('Malayalam');
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadStatus('');
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
    if (audioInputRef.current) audioInputRef.current.value = '';
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-dark-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-dark-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload to Pattupetti</h2>
              <p className="text-xs text-neutral-400">Store in Supabase & stream anywhere</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!isUploading) {
                handleReset();
                onClose();
              }
            }}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUpload} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Audio File Selection (Required) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Song Audio File <span className="text-brand-400">*</span>
            </label>
            <div
              onClick={() => audioInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                audioFile
                  ? 'border-brand-500/60 bg-brand-500/5'
                  : 'border-white/10 hover:border-brand-500/40 hover:bg-dark-800/60'
              }`}
            >
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
                onChange={handleAudioChange}
                className="hidden"
                disabled={isUploading}
              />
              {audioFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2.5 rounded-full bg-brand-500/20 text-brand-400">
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white truncate max-w-xs">{audioFile.name}</p>
                    <p className="text-xs text-neutral-400">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-neutral-400">
                  <div className="p-3 rounded-full bg-dark-800 border border-white/5">
                    <UploadCloud className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">Click to select audio file</span>
                    <p className="text-xs text-neutral-500 mt-0.5">MP3, WAV, AAC, M4A, FLAC</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title Preview derived strictly from Filename */}
          {detectedTitle && (
            <div className="p-3 rounded-xl bg-dark-950/80 border border-white/5">
              <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Extracted Song Title (from filename):
              </span>
              <p className="text-sm font-bold text-brand-400 break-words">
                {detectedTitle}
              </p>
            </div>
          )}

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Song Category <span className="text-brand-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              disabled={isUploading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
            >
              {STANDARD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-500 mt-1">
              Organizes the song in your home dashboard sections.
            </p>
          </div>

          {/* Optional Cover Artwork */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-300">
                Cover Image <span className="text-neutral-500 font-normal">(Optional)</span>
              </label>
              {coverFile && (
                <button
                  type="button"
                  onClick={removeCover}
                  className="text-[11px] text-neutral-400 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            <div
              onClick={() => coverInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex items-center justify-center gap-3 ${
                coverFile
                  ? 'border-brand-500/50 bg-brand-500/5'
                  : 'border-white/10 hover:border-brand-500/30 hover:bg-dark-800/40'
              }`}
            >
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
                disabled={isUploading}
              />
              {coverPreview ? (
                <div className="flex items-center gap-3 w-full">
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-white/10"
                  />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{coverFile?.name}</p>
                    <p className="text-[11px] text-brand-400">Artwork ready for upload</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 py-1 text-neutral-400">
                  <ImageIcon className="w-5 h-5 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-300">Choose album artwork (JPG, PNG, WebP)</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="space-y-2 p-3 rounded-xl bg-dark-950 border border-brand-500/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-400 font-medium flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {uploadStatus}
                </span>
              </div>
              <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 animate-pulse rounded-full w-3/4" />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!audioFile || isUploading}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-sm font-bold shadow-lg shadow-brand-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Song</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
