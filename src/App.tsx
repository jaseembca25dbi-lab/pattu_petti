import React, { useState, useEffect, useCallback } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { Sidebar, type NavTab } from './components/Sidebar';
import { BottomPlayer } from './components/BottomPlayer';
import { NowPlayingModal } from './components/NowPlayingModal';
import { SupabaseSetupNotice } from './components/SupabaseSetupNotice';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { LibraryView } from './views/LibraryView';
import { CategoryView } from './views/CategoryView';
import type { Song } from './types/song';
import { parseFilenameArtistTitle, folderToCategory } from './lib/filename';
import { supabase, isSupabaseConfigured, rawSupabaseUrl } from './lib/supabase';
import { getAutoCover } from './lib/covers';
import {
  Radio,
  Home,
  Search,
  Library,
  RefreshCw,
  Disc,
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('Arijit Singh Radio');
  
  // Instant cache load: render immediately from localStorage without blocking UI
  const [songs, setSongs] = useState<Song[]>(() => {
    try {
      const cached = localStorage.getItem('pattupetti_songs_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('pattupetti_songs_cache');
      return !(cached && JSON.parse(cached).length > 0);
    } catch {
      return true;
    }
  });

  // Fetch songs exclusively from the Supabase 'songs' storage bucket
  const fetchSongs = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSongs([]);
      setIsLoading(false);
      return;
    }

    try {
      const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.opus', '.webm'];
      const loadedSongs: Song[] = [];
      const seenPaths = new Set<string>();

      // Recursive scanner for the 'songs' storage bucket
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
              let audioUrl = urlData?.publicUrl || '';
              // Fix URL if running through Vite proxy
              if (rawSupabaseUrl && audioUrl.includes('/supabase-proxy')) {
                audioUrl = audioUrl.replace(/https?:\/\/[^/]+\/supabase-proxy/, rawSupabaseUrl);
              }

              const pathKey = `${bucket}/${itemPath}`.toLowerCase();
              if (audioUrl && !seenPaths.has(pathKey)) {
                seenPaths.add(pathKey);

                // Parse clean title & artist from the filename
                const { title, artist } = parseFilenameArtistTitle(item.name);

                // Derive category from the immediate parent folder name
                const folderSegments = folderPath.split('/').filter(Boolean);
                const category = folderSegments.length > 0
                  ? folderToCategory(folderSegments[0])
                  : 'Mix Hit';

                loadedSongs.push({
                  id: `${bucket}/${itemPath}`,
                  title: title || item.name,
                  artist: artist || undefined,
                  audio_url: audioUrl,
                  category,
                  cover_url: getAutoCover(title, category),
                  created_at: item.created_at || item.updated_at || new Date().toISOString(),
                });
              }
            } else if (!item.metadata) {
              // No metadata = it's a subfolder, recurse into it
              await scanBucketPath(bucket, itemPath);
            }
          }
        } catch (scanErr) {
          console.warn(`Error scanning "${bucket}/${folderPath}":`, scanErr);
        }
      };

      await scanBucketPath('songs', '');

      // Always use ONLY real Supabase songs — never fall back to dummy defaults
      if (loadedSongs.length > 0) {
        setSongs(loadedSongs);
        try {
          localStorage.setItem('pattupetti_songs_cache', JSON.stringify(loadedSongs));
        } catch (e) {
          console.warn('Cache write error:', e);
        }
      }
    } catch (err: any) {
      console.error('Error fetching Supabase songs:', err);
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
            availableCollections={Array.from(new Set(songs.map((s) => s.category || 'Mix Hit').filter(Boolean))).sort()}
          />
        </div>

        {/* Scrollable Main Views */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-[#140c12]/60 via-[#0c080b] to-[#080507] px-4 md:px-8 pt-6 pb-28">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#e29d8f]/10">
            <div className="text-xs text-[#a88d92] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e29d8f] animate-pulse" />
              <span className="font-mono text-[11px] tracking-wider uppercase">Pattupetti Hi-Fi Stream</span>
            </div>
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
