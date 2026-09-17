import React, { useState, useMemo } from 'react';
import type { Song } from '../types/song';
import { usePlayer } from '../context/PlayerContext';
import { SongCover } from '../components/SongCover';
import { EDITORIAL_IMAGES } from '../lib/covers';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Disc, 
  Heart, 
  MoreHorizontal, 
  Music2,
  Plus
} from 'lucide-react';

interface LibraryViewProps {
  songs: Song[];
  onOpenUpload?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ songs, onOpenUpload }) => {
  const { 
    currentSong, 
    isPlaying, 
    playSong, 
    togglePlay, 
    favorites, 
    toggleFavorite, 
    recentlyPlayed 
  } = usePlayer();

  // Mode: 'archive' (Screen 02 MUSIC LIBRARY) vs 'personal' (Screen 06 YOUR LIBRARY)
  const [activeTab, setActiveTab] = useState<'archive' | 'recently_played' | 'favorites'>('archive');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Category filter pills for Screen 02
  const filterPills = [
    { id: 'ALL', label: '01 ALL' },
    { id: 'Arijit Singh Radio', label: '02 ARIJIT SINGH' },
    { id: 'Atmospheric', label: '03 ATMOSPHERIC' },
    { id: 'Mix Hit', label: '04 MIX HIT' },
    { id: 'Malayalam', label: '05 MALAYALAM' },
    { id: 'Tamil Hit', label: '06 TAMIL HIT' },
    { id: 'Other', label: '07 OTHER' },
  ];

  const filteredArchiveSongs = useMemo(() => {
    if (selectedCategory === 'ALL') return songs;

    if (selectedCategory.includes('Arijit')) {
      return songs.filter((s) => {
        const title = s.title.toLowerCase();
        const artist = (s.artist || '').toLowerCase();
        return (
          artist.includes('arijit') ||
          title.includes('shayad') ||
          title.includes('raataan') ||
          title.includes('kesariya') ||
          title.includes('channa') ||
          title.includes('samjhawan') ||
          title.includes('ranjha') ||
          title.includes('satranga') ||
          title.includes('pal')
        );
      });
    }

    return songs.filter((s) => {
      const cat = (s.category || 'other').toLowerCase();
      return cat.includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(cat);
    });
  }, [songs, selectedCategory]);

  const favoriteSongs = useMemo(() => {
    return songs.filter((s) => favorites.includes(s.id));
  }, [songs, favorites]);

  return (
    <div className="space-y-8 pb-28 select-none">
      {/* Top Mode Selector Tabs */}
      <div className="flex items-center justify-between border-b border-[#e29d8f]/10 pb-3">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-[#e29d8f] font-semibold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{activeTab === 'archive' ? '02. MUSIC LIBRARY' : '06. YOUR LIBRARY'}</span>
        </div>

        {/* Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-3.5 py-1.5 rounded-xl font-bold tracking-wider transition-all ${
              activeTab === 'archive'
                ? 'bg-[#311b26] text-[#f5bcaf] border border-[#e29d8f]/30'
                : 'text-[#ab9398] hover:text-white'
            }`}
          >
            MUSIC LIBRARY (02)
          </button>
          <button
            onClick={() => setActiveTab('recently_played')}
            className={`px-3.5 py-1.5 rounded-xl font-bold tracking-wider transition-all ${
              activeTab === 'recently_played'
                ? 'bg-[#311b26] text-[#f5bcaf] border border-[#e29d8f]/30'
                : 'text-[#ab9398] hover:text-white'
            }`}
          >
            YOUR HISTORY (06)
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3.5 py-1.5 rounded-xl font-bold tracking-wider transition-all ${
              activeTab === 'favorites'
                ? 'bg-[#311b26] text-[#f5bcaf] border border-[#e29d8f]/30'
                : 'text-[#ab9398] hover:text-white'
            }`}
          >
            FAVORITES ({favorites.length})
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SCREEN 02: MUSIC LIBRARY (Editorial Numbered Cards Grid)     */}
      {/* ============================================================ */}
      {activeTab === 'archive' && (
        <div className="space-y-8">
          {/* Main Title Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e29d8f]/10 pb-6">
            <div>
              <p className="text-[10px] font-mono tracking-[0.25em] text-[#e29d8f] uppercase mb-1">
                {songs.length} RECORDINGS
              </p>
              <h1 className="font-display text-6xl sm:text-8xl md:text-9xl text-white tracking-widest leading-[0.88]">
                MUSIC <br className="hidden sm:inline" />
                <span className="text-[#f5bcaf]">LIBRARY</span>
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col text-right text-[10px] font-mono tracking-[0.2em] text-[#a88d92] uppercase space-y-1">
                <span>SONGS • ARTISTS</span>
                <span>ALBUMS • PLAYLISTS</span>
              </div>

              {onOpenUpload && (
                <button
                  onClick={onOpenUpload}
                  className="w-10 h-10 rounded-full bg-[#1f131a] hover:bg-[#e29d8f] text-[#e29d8f] hover:text-[#090608] border border-[#e29d8f]/30 flex items-center justify-center transition-all shadow-lg"
                  title="Add track"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}

              <div className="md:text-right space-y-1">
                <span className="font-display text-2xl text-white tracking-wider block">
                  {songs.length} SONGS
                </span>
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#a88d92] uppercase block">
                  YOUR PERSONAL ARCHIVE
                </span>
              </div>
            </div>
          </div>

          {/* Filter Pills (01 ALL, 02 ARIJIT SINGH, 03 ATMOSPHERIC...) */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
            {filterPills.map((pill) => {
              const isSelected = selectedCategory === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedCategory(pill.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#e29d8f] text-[#0c080b] shadow-md shadow-[#e29d8f]/20'
                      : 'bg-[#160d13] text-[#ab9398] hover:text-white border border-[#e29d8f]/10 hover:border-[#e29d8f]/30'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Numbered Cards Grid (Screen 02) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5">
            {filteredArchiveSongs.map((song, index) => {
              const isSongActive = currentSong?.id === song.id;
              const isSongPlaying = isSongActive && isPlaying;
              const rank = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;

              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, filteredArchiveSongs)}
                  className={`group relative flex flex-col justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isSongActive
                      ? 'bg-[#291722] border-[#e29d8f]/50 shadow-2xl shadow-black/80'
                      : 'bg-[#140d12]/70 hover:bg-[#20131c] border-[#e29d8f]/15 hover:border-[#e29d8f]/40 hover:-translate-y-1'
                  }`}
                >
                  {/* Artwork with rank number badge */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-[#0c080b] border border-[#e29d8f]/15">
                    <SongCover
                      url={song.cover_url}
                      alt={song.title}
                      category={song.category}
                      size="md"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Number badge on image */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-[#f5bcaf] border border-[#e29d8f]/20">
                      {rank}
                    </div>

                    {/* Playing indicator */}
                    {isSongPlaying && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <Disc className="w-8 h-8 text-[#e29d8f] animate-spin-slow" />
                      </div>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="space-y-1">
                    <h3 className={`font-bold text-sm line-clamp-1 ${isSongActive ? 'text-[#f5bcaf]' : 'text-[#f5ebe6] group-hover:text-white'}`}>
                      {song.title}
                    </h3>
                    <p className="text-xs text-[#a88d92] line-clamp-1">
                      {song.artist || song.category || 'Pattupetti Classic'}
                    </p>
                  </div>

                  {/* Bottom bar on card: Duration and "PLAY →" */}
                  <div className="mt-4 pt-3 border-t border-[#e29d8f]/10 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-[#a88d92] tabular-nums">
                      {song.duration || '03:42'}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#e29d8f] group-hover:translate-x-0.5 transition-transform">
                      {isSongPlaying ? 'PAUSE' : 'PLAY'} →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom quote (Screen 02) */}
          <div className="pt-6">
            <p className="font-script text-3xl text-[#f5bcaf]/90">
              Every song a story.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 06: YOUR LIBRARY (Recently Played & Favorites)        */}
      {/* ============================================================ */}
      {(activeTab === 'recently_played' || activeTab === 'favorites') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Title & List of Songs */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <h1 className="font-display text-6xl sm:text-7xl text-white tracking-widest leading-none">
                YOUR LIBRARY
              </h1>
              <div className="flex items-center gap-6 mt-3 text-xs font-mono tracking-widest uppercase text-[#a88d92]">
                <span className={activeTab === 'recently_played' ? 'text-[#e29d8f] border-b border-[#e29d8f] pb-0.5' : ''}>
                  RECENTLY PLAYED
                </span>
                <span>•</span>
                <span className={activeTab === 'favorites' ? 'text-[#e29d8f] border-b border-[#e29d8f] pb-0.5' : ''}>
                  FAVORITE SONGS
                </span>
                <span>•</span>
                <span>PLAYLISTS</span>
                <span>•</span>
                <span>DOWNLOADS</span>
              </div>
            </div>

            {/* List */}
            {((activeTab === 'recently_played' ? recentlyPlayed : favoriteSongs).length > 0) ? (
              <div className="space-y-2">
                {(activeTab === 'recently_played' ? recentlyPlayed : favoriteSongs).map((song, idx) => {
                  const isSongActive = currentSong?.id === song.id;
                  const isSongPlaying = isSongActive && isPlaying;
                  const isFav = favorites.includes(song.id);

                  return (
                    <div
                      key={song.id}
                      onClick={() => playSong(song, activeTab === 'recently_played' ? recentlyPlayed : favoriteSongs)}
                      className={`group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border ${
                        isSongActive
                          ? 'bg-[#291722] border-[#e29d8f]/40 shadow-lg'
                          : 'bg-[#140d12]/70 hover:bg-[#20131c] border-[#e29d8f]/10 hover:border-[#e29d8f]/25'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#0c080b] border border-[#e29d8f]/15 flex-shrink-0">
                          <SongCover
                            url={song.cover_url}
                            alt={song.title}
                            category={song.category}
                            size="sm"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className={`font-bold text-sm truncate ${isSongActive ? 'text-[#f5bcaf]' : 'text-white'}`}>
                            {song.title}
                          </h4>
                          <p className="text-xs text-[#a88d92] truncate mt-0.5">
                            {song.artist || song.category || 'Pattupetti'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Played time ago + Play circle + Options */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-[11px] font-mono text-[#a88d92] hidden sm:inline">
                          {song.playedAt || `Played ${idx + 1}h ago`}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(song.id);
                          }}
                          className="p-1 text-[#7e676b] hover:text-[#e29d8f]"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-[#e29d8f] fill-[#e29d8f]' : ''}`} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSongActive) {
                              togglePlay();
                            } else {
                              playSong(song);
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-[#e29d8f] text-[#0c080b] flex items-center justify-center shadow-md shadow-[#e29d8f]/20 hover:scale-105 transition-all"
                        >
                          {isSongPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                          )}
                        </button>

                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-[#7e676b] hover:text-white"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center text-[#a88d92] bg-[#140d12]/50 rounded-2xl border border-[#e29d8f]/10">
                <Music2 className="w-8 h-8 text-[#7e676b] mx-auto mb-2" />
                <p className="text-sm">
                  {activeTab === 'recently_played'
                    ? 'No songs played yet. Start playing music to see your history!'
                    : 'No favorites yet. Click the heart icon on any song to save it here!'}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Aesthetic Poster Card (Screen 06) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-b from-[#1e131b] via-[#140d13] to-[#0c080b] border border-[#e29d8f]/25 shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#e29d8f]/10 rounded-full blur-2xl pointer-events-none" />

              {/* Atmospheric visual banner */}
              <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-6 border border-[#e29d8f]/20">
                <img
                  src={EDITORIAL_IMAGES.libraryPoster}
                  alt="Aesthetic Poster"
                  className="w-full h-full object-cover grayscale contrast-125 sepia-[0.35]"
                />
              </div>

              {/* Vertical / Block Typography Quote */}
              <div className="space-y-1">
                <p className="font-display text-2xl text-white tracking-widest uppercase">
                  COLLECTING SONGS
                </p>
                <p className="font-display text-2xl text-[#f5bcaf] tracking-widest uppercase">
                  COLLECTING GOOD DAYS.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-[#e29d8f]/15">
                <p className="font-script text-xl text-[#e29d8f]">
                  Your music. Your space.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
