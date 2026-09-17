import React, { useState, useEffect, useCallback } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { Sidebar, type NavTab } from './components/Sidebar';
import { BottomPlayer } from './components/BottomPlayer';
import { NowPlayingModal } from './components/NowPlayingModal';
import { UploadModal } from './components/UploadModal';
import { SupabaseSetupNotice } from './components/SupabaseSetupNotice';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { LibraryView } from './views/LibraryView';
import { CategoryView } from './views/CategoryView';
import type { Song } from './types/song';
import { cleanFileNameToTitle } from './lib/filename';
import { supabase, isSupabaseConfigured, rawSupabaseUrl } from './lib/supabase';
import { DEFAULT_SONGS } from './data/defaultSongs';
import { getAutoCover } from './lib/covers';
import {
  Radio,
  Home,
  Search,
  Library,
  RefreshCw,
  Plus,
  Disc,
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('Arijit Singh Radio');
  const [songs, setSongs] = useState<Song[]>(DEFAULT_SONGS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Fetch songs from Supabase, or merge with default catalog
  const fetchSongs = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSongs(DEFAULT_SONGS);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.opus', '.webm'];
      const loadedSongs: Song[] = [];
      const seenPaths = new Set<string>();

      // Fetch DB metadata lookup map if available
      const dbMetaByFilename = new Map<string, any>();
      try {
        const { data: dbSongs, error: dbError } = await supabase
          .from('songs')
          .select('*');

        if (!dbError && dbSongs && dbSongs.length > 0) {
          for (const s of dbSongs) {
            const raw = (s.audio_url || s.url || s.title || '').toLowerCase();
            const fn = raw.split('/').pop() || '';
            if (fn) dbMetaByFilename.set(fn, s);

            // Also directly register DB songs if they have direct audio_url
            if (s.audio_url && !seenPaths.has(s.id)) {
              seenPaths.add(s.id);
              loadedSongs.push({
                id: String(s.id),
                title: s.title || 'Untitled Track',
                artist: s.artist,
                audio_url: s.audio_url,
                category: s.category || s.genre || 'Mix Hit',
                cover_url: s.cover_url || getAutoCover(s.title, s.category),
                created_at: s.created_at || new Date().toISOString(),
              });
            }
          }
        }
      } catch (e) {
        console.warn('DB metadata query skipped:', e);
      }

      // Recursive scanner for storage buckets
      const scanBucketPath = async (bucket: string, folderPath = '') => {
        try {
          const { data: items, error } = await supabase.storage
            .from(bucket)
            .list(folderPath, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

          if (error || !items) return;

          for (const item of items) {
            const itemPath = folderPath ? `${folderPath}/${item.name}` : item.name;
            const ext = item.name.includes('.') ? item.name.slice(item.name.lastIndexOf('.')).toLowerCase() : '';
            const isAudio = AUDIO_EXTENSIONS.includes(ext);

            if (isAudio) {
              const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(itemPath);
              let audioUrl = urlData?.publicUrl;
              if (rawSupabaseUrl && audioUrl?.includes('/supabase-proxy')) {
                audioUrl = audioUrl.replace(/https?:\/\/[^/]+\/supabase-proxy/, rawSupabaseUrl);
              }

              const pathKey = `${bucket}/${itemPath}`.toLowerCase();
              if (audioUrl && !seenPaths.has(pathKey)) {
                seenPaths.add(pathKey);
                const dbInfo = dbMetaByFilename.get(item.name.toLowerCase());
                const cleanTitle = dbInfo?.title || cleanFileNameToTitle(item.name);
                
                // Derive category from immediate folder name if inside a folder
                const folderSegments = folderPath.split('/').filter(Boolean);
                const categoryName = folderSegments.length > 0
                  ? folderSegments[0].split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                  : 'Mix Hit';

                loadedSongs.push({
                  id: dbInfo?.id ? String(dbInfo.id) : `${bucket}/${itemPath}`,
                  title: cleanTitle,
                  artist: dbInfo?.artist,
                  audio_url: audioUrl,
                  category: dbInfo?.genre || dbInfo?.category || categoryName,
                  cover_url: dbInfo?.cover_url || getAutoCover(cleanTitle, categoryName),
                  created_at: item.created_at || new Date().toISOString(),
                });
              }
            } else if (!item.id || item.id === item.name || !item.name.includes('.')) {
              // Recurse into subfolder
              await scanBucketPath(bucket, itemPath);
            }
          }
        } catch (scanErr) {
          console.warn(`Error scanning "${bucket}/${folderPath}":`, scanErr);
        }
      };

      // Only scan the 'songs' bucket
      await scanBucketPath('songs', '');

      // When Supabase has songs, use ONLY those (no dummy defaults mixed in)
      if (loadedSongs.length > 0) {
        setSongs(loadedSongs);
      } else {
        // No Supabase songs yet — show default template library
        setSongs(DEFAULT_SONGS);
      }
    } catch (err: any) {
      console.warn('Error fetching Supabase songs, using default library:', err);
      setSongs(DEFAULT_SONGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setActiveTab('category');
  };

  const handleSongUploaded = (newSong: Song) => {
    setSongs((prev) => [newSong, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090608] text-[#f5ebe6] overflow-hidden select-none">
      {/* Optional Top Notice if Supabase keys needed */}
      <SupabaseSetupNotice />

      {/* Mobile Top Navigation Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0e0a0d] border-b border-[#e29d8f]/10 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#e29d8f] flex items-center justify-center text-[#090608] font-bold">
            <Radio className="w-4 h-4" />
          </div>
          <span className="font-display text-2xl tracking-wider text-white">PATTUPETTI</span>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="p-1.5 rounded-lg bg-[#241620] text-[#e29d8f] border border-[#e29d8f]/20"
          title="Upload song"
        >
          <Plus className="w-4 h-4" />
        </button>
      </header>

      {/* Main Workspace: Sidebar + Dynamic Content View */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            selectedCollection={activeTab === 'category' ? selectedCategory : null}
            onSelectCollection={handleSelectCategory}
          />
        </div>

        {/* Scrollable Main Views */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-[#140c12]/60 via-[#0c080b] to-[#080507] px-4 md:px-8 pt-6 pb-28">
          {/* Top Bar inside main viewport */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#e29d8f]/10">
            <div className="text-xs text-[#a88d92] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e29d8f] animate-pulse" />
              <span className="font-mono text-[11px] tracking-wider uppercase">Pattupetti Hi-Fi Stream</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e29d8f] hover:bg-[#f0b5a8] text-[#090608] text-xs font-bold transition-all shadow-md shadow-[#e29d8f]/20 active:scale-95"
                title="Upload new song"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Upload Track</span>
              </button>

              <button
                onClick={fetchSongs}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1017] hover:bg-[#271823] text-[#ab9398] hover:text-white text-xs border border-[#e29d8f]/15 transition-all disabled:opacity-50"
                title="Sync library"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#e29d8f]' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>
            </div>
          </div>

          {/* Active Views */}
          {activeTab === 'home' && (
            <HomeView
              songs={songs}
              isLoading={isLoading}
              onSelectCategory={handleSelectCategory}
            />
          )}

          {activeTab === 'search' && (
            <SearchView
              songs={songs}
            />
          )}

          {activeTab === 'library' && (
            <LibraryView
              songs={songs}
            />
          )}

          {activeTab === 'category' && (
            <CategoryView
              categoryName={selectedCategory}
              songs={songs}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-24 left-0 right-0 h-14 bg-[#0e0a0d]/95 backdrop-blur-lg border-t border-[#e29d8f]/15 z-30 flex items-center justify-around px-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-4 text-xs font-medium transition-colors ${
            activeTab === 'home' ? 'text-[#e29d8f]' : 'text-[#8c7479]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center gap-1 py-1 px-4 text-xs font-medium transition-colors ${
            activeTab === 'search' ? 'text-[#e29d8f]' : 'text-[#8c7479]'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center gap-1 py-1 px-4 text-xs font-medium transition-colors ${
            activeTab === 'library' ? 'text-[#e29d8f]' : 'text-[#8c7479]'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>Library</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategory('Arijit Singh Radio');
            setActiveTab('category');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 text-xs font-medium transition-colors ${
            activeTab === 'category' ? 'text-[#e29d8f]' : 'text-[#8c7479]'
          }`}
        >
          <Disc className="w-4 h-4" />
          <span>Playlist</span>
        </button>
      </nav>

      {/* Global Persistent Bottom Audio Player (Screen 07) */}
      <BottomPlayer />

      {/* Full Screen Now Playing Modal (Screen 05) */}
      <NowPlayingModal />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSongUploaded={handleSongUploaded}
      />
    </div>
  );
};

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}
