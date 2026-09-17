import React, { useState, useEffect, useCallback } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { Sidebar, type NavTab } from './components/Sidebar';
import { BottomPlayer } from './components/BottomPlayer';
import { SupabaseSetupNotice } from './components/SupabaseSetupNotice';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { LibraryView } from './views/LibraryView';
import type { Song } from './types/song';
import { cleanFileNameToTitle } from './lib/filename';
import { supabase, isSupabaseConfigured, rawSupabaseUrl } from './lib/supabase';
import {
  Radio,
  Home,
  Search,
  Library,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch songs from Supabase:
  // 1. Scans storage buckets ('songs' and 'music') and all subfolders ('mix hit', 'shafi kollam radio', 'tamil hit', etc.)
  //    for real playable audio files with valid public URLs.
  // 2. Augments with any database metadata (custom covers, titles) from the 'songs' table.
  const fetchSongs = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      setErrorMessage(
        'Supabase configuration not detected. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY in your hosting environment variables.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

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

        if (!dbError && dbSongs) {
          for (const s of dbSongs) {
            const raw = (s.audio_url || s.url || s.title || '').toLowerCase();
            const fn = raw.split('/').pop() || '';
            if (fn) dbMetaByFilename.set(fn, s);
          }
        }
      } catch (e) {
        console.warn('DB metadata query skipped:', e);
      }

      // Scan storage buckets
      const candidateBuckets = ['songs', 'music'];

      for (const bucket of candidateBuckets) {
        try {
          const { data: rootItems, error: rootError } = await supabase.storage
            .from(bucket)
            .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

          if (rootError || !rootItems) continue;

          for (const item of rootItems) {
            const ext = item.name.includes('.') ? item.name.slice(item.name.lastIndexOf('.')).toLowerCase() : '';
            const isAudio = AUDIO_EXTENSIONS.includes(ext);

            if (isAudio) {
              // Audio file directly in root
              const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(item.name);
              let audioUrl = urlData?.publicUrl;
              if (rawSupabaseUrl && audioUrl?.includes('/supabase-proxy')) {
                audioUrl = audioUrl.replace(/https?:\/\/[^/]+\/supabase-proxy/, rawSupabaseUrl);
              }

              const pathKey = `${bucket}/${item.name}`.toLowerCase();
              if (audioUrl && !seenPaths.has(pathKey)) {
                seenPaths.add(pathKey);
                const dbInfo = dbMetaByFilename.get(item.name.toLowerCase());
                const cleanTitle = dbInfo?.title || cleanFileNameToTitle(item.name);

                loadedSongs.push({
                  id: dbInfo?.id ? String(dbInfo.id) : `${bucket}/${item.name}`,
                  title: cleanTitle,
                  audio_url: audioUrl,
                  category: dbInfo?.genre || dbInfo?.category || 'General',
                  cover_url: dbInfo?.cover_url || null,
                  created_at: item.created_at || new Date().toISOString(),
                });
              }
            } else if (!item.id || item.id === item.name || !item.name.includes('.')) {
              // Folder (e.g. "mix hit", "shafi kollam radio", "tamil hit")
              const folderName = item.name;
              const { data: folderFiles } = await supabase.storage
                .from(bucket)
                .list(folderName, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

              for (const file of folderFiles || []) {
                const fileExt = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
                if (!AUDIO_EXTENSIONS.includes(fileExt)) continue;

                const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(`${folderName}/${file.name}`);
                let audioUrl = urlData?.publicUrl;
                if (rawSupabaseUrl && audioUrl?.includes('/supabase-proxy')) {
                  audioUrl = audioUrl.replace(/https?:\/\/[^/]+\/supabase-proxy/, rawSupabaseUrl);
                }

                const pathKey = `${bucket}/${folderName}/${file.name}`.toLowerCase();
                if (audioUrl && !seenPaths.has(pathKey)) {
                  seenPaths.add(pathKey);
                  const dbInfo = dbMetaByFilename.get(file.name.toLowerCase());
                  const cleanTitle = dbInfo?.title || cleanFileNameToTitle(file.name);
                  const categoryName = folderName
                    .split(' ')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');

                  loadedSongs.push({
                    id: dbInfo?.id ? String(dbInfo.id) : `${bucket}/${folderName}/${file.name}`,
                    title: cleanTitle,
                    audio_url: audioUrl,
                    category: dbInfo?.genre || dbInfo?.category || categoryName,
                    cover_url: dbInfo?.cover_url || null,
                    created_at: file.created_at || new Date().toISOString(),
                  });
                }
              }
            }
          }
        } catch (storageErr) {
          console.warn(`Error scanning storage bucket "${bucket}":`, storageErr);
        }
      }

      setSongs(loadedSongs);
    } catch (err: any) {
      console.error('Error loading songs:', err);
      setErrorMessage(
        `Failed to load songs: ${err.message || 'Network error'}. Please check your Supabase bucket permissions and environment variables.`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07080b] text-[#f1f5f9] overflow-hidden select-none">
      {/* Top Notice if Supabase setup needed */}
      <SupabaseSetupNotice />

      {/* Mobile Top Navigation Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-dark-950 border-b border-white/5 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-black font-bold">
            <Radio className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-white text-base tracking-tight">Pattupetti</span>
        </div>
      </header>

      {/* Main Workspace: Sidebar + Dynamic Content View */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />
        </div>

        {/* Scrollable Main Views */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-dark-900/60 to-[#07080b] px-4 md:px-8 pt-6 pb-28">
          {/* Top Bar inside main viewport */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
            <div className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span>Personal Cloud Streaming</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchSongs}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-neutral-300 hover:text-white text-xs border border-white/5 transition-all disabled:opacity-50"
                title="Refresh song library from Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-400' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>
            </div>
          </div>

          {/* Connection Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-200">Supabase Connection Alert</p>
                  <p className="text-neutral-400 mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <button
                onClick={fetchSongs}
                className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium text-xs flex-shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Active View */}
          {activeTab === 'home' && (
            <HomeView
              songs={songs}
              isLoading={isLoading}
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
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-24 left-0 right-0 h-14 bg-dark-950/95 backdrop-blur-lg border-t border-white/10 z-30 flex items-center justify-around px-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-4 text-xs font-medium transition-colors ${
            activeTab === 'home' ? 'text-brand-400' : 'text-neutral-400'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center gap-1 py-1 px-4 text-xs font-medium transition-colors ${
            activeTab === 'search' ? 'text-brand-400' : 'text-neutral-400'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center gap-1 py-1 px-4 text-xs font-medium transition-colors ${
            activeTab === 'library' ? 'text-brand-400' : 'text-neutral-400'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>Library</span>
        </button>
      </nav>

      {/* Global Persistent Bottom Audio Player */}
      <BottomPlayer />
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
