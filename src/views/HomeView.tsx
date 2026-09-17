import React, { useMemo } from 'react';
import type { Song } from '../types/song';
import { usePlayer } from '../context/PlayerContext';
import { SongCover } from '../components/SongCover';
import { EDITORIAL_IMAGES } from '../lib/covers';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  Sparkles, 
  Disc, 
  FolderHeart, 
  Loader2 
} from 'lucide-react';

interface HomeViewProps {
  songs: Song[];
  isLoading: boolean;
  onSelectCategory?: (category: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  songs,
  isLoading,
  onSelectCategory,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

  // Featured track: Raataan Lambiyan or the first song
  const featuredSong = useMemo(() => {
    if (songs.length === 0) return null;
    const found = songs.find((s) => s.title.toLowerCase().includes('raataan') || s.title.toLowerCase().includes('shayad'));
    return found || songs[0];
  }, [songs]);

  // Recently added songs (top 8)
  const recentlyAdded = useMemo(() => {
    return [...songs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  }, [songs]);

  // Group songs by category dynamically
  const categoriesMap = useMemo(() => {
    const map: Record<string, Song[]> = {};
    songs.forEach((song) => {
      const cat = song.category && song.category.trim() ? song.category.trim() : 'Mix Hit';
      if (!map[cat]) map[cat] = [];
      map[cat].push(song);
    });
    return map;
  }, [songs]);

  const categoryNames = useMemo(() => {
    return Object.keys(categoriesMap).filter((cat) => categoriesMap[cat].length > 0);
  }, [categoriesMap]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#e29d8f] animate-spin" />
        <p className="font-mono text-xs tracking-widest text-[#a88d92] uppercase">
          Scanning your Pattupetti archive...
        </p>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 rounded-2xl bg-[#1a1017] border border-[#e29d8f]/20 flex items-center justify-center mb-5 text-[#e29d8f] shadow-xl">
          <FolderHeart className="w-10 h-10" />
        </div>
        <h2 className="font-display text-4xl text-white tracking-wide mb-2">ARCHIVE EMPTY</h2>
        <p className="text-[#a88d92] max-w-md text-xs mb-6 leading-relaxed">
          Upload audio files to start streaming your personal music box.
        </p>
      </div>
    );
  }

  const isFeaturedPlaying = currentSong?.id === featuredSong?.id && isPlaying;

  const handleFeaturedPlay = () => {
    if (!featuredSong) return;
    if (currentSong?.id === featuredSong.id) {
      togglePlay();
    } else {
      playSong(featuredSong, songs);
    }
  };

  return (
    <div className="space-y-12 pb-24 select-none">
      {/* Top Editorial Nav Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e29d8f]/10 text-xs">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-[#e29d8f] font-semibold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>01. HOME PAGE</span>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-[11px] tracking-[0.2em] text-[#ab9398] font-medium">
          <span className="hover:text-[#f5ebe6] cursor-pointer transition-colors">MUSIC</span>
          <span>•</span>
          <span className="hover:text-[#f5ebe6] cursor-pointer transition-colors">PEOPLE</span>
          <span>•</span>
          <span className="hover:text-[#f5ebe6] cursor-pointer transition-colors">MOMENTS</span>
          <span>•</span>
          <span className="text-[#e29d8f]">ALWAYS WITH YOU</span>
        </div>
      </div>

      {/* SCREEN 01 HERO SECTION: Monumental Title + Moody Portrait */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b1018] via-[#120a10] to-[#0c080b] border border-[#e29d8f]/20 p-6 md:p-10 shadow-2xl">
        {/* Ambient Glow */}
        <div className="absolute -top-10 -left-10 w-96 h-96 bg-[#e29d8f]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#d77c6b]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Layer: Condensed Bebas Neue "PATTUPETTI" */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="w-full">
            <h1 className="font-display text-7xl sm:text-9xl md:text-[120px] lg:text-[150px] text-white tracking-widest leading-[0.85] select-none">
              PATTUPETTI
            </h1>
          </div>
        </div>

        {/* Center Editorial Composition */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-4">
          {/* Left Text & Cursive Quote */}
          <div className="md:col-span-4 space-y-4">
            <p className="font-script text-4xl sm:text-5xl text-[#f5bcaf] leading-tight drop-shadow-md">
              Music That Stays With You.
            </p>
            <div className="w-16 h-[1px] bg-[#e29d8f]/40 my-2" />
            <p className="text-xs text-[#a88d92] tracking-wide leading-relaxed">
              Every track is a memory. A timeless soundscape curated for slow afternoons, deep thoughts, and midnight drives.
            </p>
          </div>

          {/* Center Artistic Portrait Artwork */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-64 h-72 sm:w-72 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border border-[#e29d8f]/30 bg-[#1e131b] group">
              <img
                src={EDITORIAL_IMAGES.heroPortrait}
                alt="Editorial Portrait"
                className="w-full h-full object-cover grayscale contrast-125 sepia-[0.35] brightness-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c080b]/90 via-transparent to-[#e29d8f]/10" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[9px] font-mono tracking-widest text-[#f5bcaf] uppercase">
                <span>VIBE • SOUND • SOUL</span>
                <span>✦</span>
              </div>
            </div>
          </div>

          {/* Right Subtitle & Manifesto */}
          <div className="md:col-span-3 flex flex-col justify-between h-full space-y-6 md:text-right">
            <div>
              <span className="text-[#e29d8f] text-lg block mb-1">✦</span>
              <p className="font-display text-xl sm:text-2xl text-white tracking-widest uppercase leading-snug">
                A PERSONAL MUSIC BOX FOR REAL PEOPLE.
              </p>
            </div>
            <p className="text-[11px] text-[#a88d92] tracking-wider leading-relaxed">
              300+ handpicked sound recordings directly streaming with high-fidelity acoustic reproduction.
            </p>
          </div>
        </div>

        {/* BOTTOM BANNER: 01 FEATURED NOW */}
        {featuredSong && (
          <div className="relative z-10 mt-8 pt-6 border-t border-[#e29d8f]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#160d13]/60 backdrop-blur-md rounded-2xl p-4 border border-[#e29d8f]/20">
            {/* Left: 01 FEATURED NOW */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-left pr-4 border-r border-[#e29d8f]/20">
                <span className="text-[10px] font-mono text-[#e29d8f] block font-bold">01</span>
                <span className="font-display text-sm tracking-wider text-white uppercase whitespace-nowrap">
                  FEATURED NOW
                </span>
              </div>

              {/* Song Thumbnail & Info */}
              <div className="flex items-center gap-3">
                <div 
                  onClick={handleFeaturedPlay}
                  className="w-12 h-12 rounded-xl overflow-hidden bg-[#1f131a] border border-[#e29d8f]/20 flex-shrink-0 shadow-md cursor-pointer"
                >
                  <SongCover
                    url={featuredSong.cover_url}
                    alt={featuredSong.title}
                    category={featuredSong.category}
                    size="sm"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 
                    onClick={handleFeaturedPlay}
                    className="font-bold text-sm text-white hover:text-[#f5bcaf] cursor-pointer"
                  >
                    {featuredSong.title}
                  </h3>
                  <p className="text-xs text-[#e29d8f]">
                    {featuredSong.artist || 'Arijit Singh / Soundtracks'}
                  </p>
                </div>
              </div>

              {/* Circular Play Button */}
              <button
                onClick={handleFeaturedPlay}
                className="w-10 h-10 rounded-full bg-[#e29d8f] hover:bg-[#f0b5a8] text-[#0c080b] flex items-center justify-center shadow-lg shadow-[#e29d8f]/20 active:scale-95 transition-all ml-2"
                title={isFeaturedPlaying ? 'Pause' : 'Play'}
              >
                {isFeaturedPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}
              </button>
            </div>

            {/* Right: GOOD MUSIC BRIGHTER DAYS */}
            <div 
              onClick={() => onSelectCategory && onSelectCategory('Arijit Singh Radio')}
              className="flex items-center gap-4 self-end sm:self-center text-right cursor-pointer group"
            >
              <div className="text-right">
                <span className="font-display text-sm tracking-widest text-white uppercase block group-hover:text-[#f5bcaf] transition-colors">
                  GOOD MUSIC
                </span>
                <span className="text-[10px] tracking-[0.2em] text-[#e29d8f] uppercase">
                  BRIGHTER DAYS.
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#e29d8f]/60 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )}
      </div>

      {/* FEATURED CATEGORIES & COLLECTIONS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#e29d8f]/10 pb-3">
          <div>
            <h2 className="font-display text-3xl text-white tracking-wider">FEATURED ARCHIVES</h2>
            <p className="text-xs text-[#a88d92]">Explore your sound collections</p>
          </div>
          <span className="text-xs font-mono text-[#e29d8f]">{categoryNames.length} COLLECTIONS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categoryNames.map((cat, idx) => {
            const count = categoriesMap[cat]?.length || 0;
            return (
              <div
                key={cat}
                onClick={() => onSelectCategory && onSelectCategory(cat)}
                className="group p-4 rounded-2xl bg-[#140d12]/80 hover:bg-[#20141d] border border-[#e29d8f]/15 hover:border-[#e29d8f]/40 transition-all cursor-pointer shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#a88d92] mb-3">
                  <span>0{idx + 1}</span>
                  <Disc className="w-3.5 h-3.5 text-[#e29d8f] group-hover:rotate-45 transition-transform" />
                </div>
                <h3 className="font-display text-xl text-white tracking-wide line-clamp-1 group-hover:text-[#f5bcaf]">
                  {cat}
                </h3>
                <p className="text-[10px] text-[#a88d92] mt-1 font-mono">{count} tracks</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENTLY ADDED TRACKS */}
      {recentlyAdded.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e29d8f]/10 pb-3">
            <div>
              <h2 className="font-display text-3xl text-white tracking-wider">FRESH DISCOVERIES</h2>
              <p className="text-xs text-[#a88d92]">Latest sonic additions to the vault</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recentlyAdded.map((song, index) => {
              const isSongActive = currentSong?.id === song.id;
              const isSongPlaying = isSongActive && isPlaying;
              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, recentlyAdded)}
                  className={`group relative p-3 rounded-2xl transition-all cursor-pointer shadow-xl flex flex-col justify-between border ${
                    isSongActive
                      ? 'bg-[#291722] border-[#e29d8f]/50'
                      : 'bg-[#150e14]/70 hover:bg-[#21141f] border-[#e29d8f]/10 hover:border-[#e29d8f]/30 hover:-translate-y-1'
                  }`}
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-[#0c080b] border border-[#e29d8f]/15">
                    <SongCover
                      url={song.cover_url}
                      alt={song.title}
                      category={song.category}
                      size="md"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-mono text-[#f5bcaf] border border-[#e29d8f]/20">
                      0{index + 1}
                    </div>

                    {/* Quick Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSongActive) {
                          togglePlay();
                        } else {
                          playSong(song, recentlyAdded);
                        }
                      }}
                      className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#e29d8f] text-[#0c080b] flex items-center justify-center shadow-lg shadow-[#e29d8f]/30 transition-all duration-200 transform ${
                        isSongActive ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                      }`}
                    >
                      {isSongPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      )}
                    </button>
                  </div>

                  <div>
                    <h4 className={`font-bold text-xs truncate ${isSongActive ? 'text-[#f5bcaf]' : 'text-white'}`}>
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-[#a88d92] truncate mt-0.5">
                      {song.artist || song.category || 'Pattupetti'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
