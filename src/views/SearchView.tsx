import React, { useState, useMemo } from 'react';
import type { Song } from '../types/song';
import { usePlayer } from '../context/PlayerContext';
import { SongCover } from '../components/SongCover';
import { EDITORIAL_IMAGES } from '../lib/covers';
import { 
  Search as SearchIcon, 
  X, 
  Play, 
  Pause, 
  MoreHorizontal, 
  Music, 
  Sparkles,
  Heart
} from 'lucide-react';

interface SearchViewProps {
  songs: Song[];
}

export const SearchView: React.FC<SearchViewProps> = ({ songs }) => {
  const { currentSong, isPlaying, playSong, togglePlay, favorites, toggleFavorite } = usePlayer();
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  // Derive unique categories from songs
  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    songs.forEach((s) => {
      if (s.category) cats.add(s.category);
    });
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [songs]);

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const q = query.toLowerCase().trim();
      const matchesQuery = 
        !q ||
        song.title.toLowerCase().includes(q) ||
        (song.artist && song.artist.toLowerCase().includes(q)) ||
        (song.category && song.category.toLowerCase().includes(q));

      const matchesTag = 
        selectedTag === 'ALL' ||
        (song.category && song.category.toLowerCase() === selectedTag.toLowerCase());

      return matchesQuery && matchesTag;
    });
  }, [songs, query, selectedTag]);

  return (
    <div className="space-y-8 pb-28 select-none">
      {/* Top Banner: Monumental "SEARCH THE ARCHIVE" + Side Portrait (Screen 03) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#170e14] via-[#120a10] to-[#0c080b] border border-[#e29d8f]/20 p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Title & Tags */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-[#e29d8f] font-semibold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>03. SEARCH PAGE</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl text-white tracking-widest leading-[0.9]">
              SEARCH <br />
              <span className="text-[#f5bcaf]">THE ARCHIVE</span>
            </h1>

            {/* Quick Mood Pills */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] tracking-[0.2em] text-[#a88d92] font-semibold uppercase pt-2">
              <span className="text-[#e29d8f]">INDEX:</span>
              <button 
                onClick={() => setSelectedTag('ALL')}
                className={`transition-colors ${selectedTag === 'ALL' ? 'text-white border-b border-[#e29d8f]' : 'hover:text-white'}`}
              >
                SONGS
              </button>
              <span>•</span>
              <button 
                onClick={() => setSelectedTag('Mix Hit')}
                className={`transition-colors ${selectedTag === 'Mix Hit' ? 'text-white border-b border-[#e29d8f]' : 'hover:text-white'}`}
              >
                PEOPLE
              </button>
              <span>•</span>
              <button 
                onClick={() => setSelectedTag('Arijit Singh Radio')}
                className={`transition-colors ${selectedTag === 'Arijit Singh Radio' ? 'text-white border-b border-[#e29d8f]' : 'hover:text-white'}`}
              >
                MOODS
              </button>
              <span>•</span>
              <button 
                onClick={() => setSelectedTag('Tamil Hit')}
                className={`transition-colors ${selectedTag === 'Tamil Hit' ? 'text-white border-b border-[#e29d8f]' : 'hover:text-white'}`}
              >
                MOMENTS
              </button>
            </div>
          </div>

          {/* Right Portrait Image */}
          <div className="md:col-span-4 hidden md:flex justify-end">
            <div className="relative w-48 h-56 rounded-2xl overflow-hidden shadow-2xl border border-[#e29d8f]/30 bg-[#1e131b]">
              <img
                src={EDITORIAL_IMAGES.searchHero}
                alt="Search Archive Hero"
                className="w-full h-full object-cover grayscale contrast-125 sepia-[0.3] brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c080b]/80 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Sleek Pill Search Input */}
      <div className="space-y-4">
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#e29d8f]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, categories..."
            className="w-full pl-14 pr-12 py-3.5 rounded-full bg-[#160d13] border border-[#e29d8f]/20 text-[#f5ebe6] placeholder-[#8c7479] text-sm focus:outline-none focus:border-[#e29d8f] focus:ring-1 focus:ring-[#e29d8f]/40 transition-all shadow-xl"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#a88d92] hover:text-white hover:bg-white/10"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
          <button
            onClick={() => setSelectedTag('ALL')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
              selectedTag === 'ALL'
                ? 'bg-[#e29d8f] text-[#0c080b] font-bold shadow-md shadow-[#e29d8f]/20'
                : 'bg-[#180f15] text-[#ab9398] hover:text-white border border-[#e29d8f]/10'
            }`}
          >
            All Tracks
          </button>
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedTag(cat)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                selectedTag === cat
                  ? 'bg-[#e29d8f] text-[#0c080b] font-bold shadow-md shadow-[#e29d8f]/20'
                  : 'bg-[#180f15] text-[#ab9398] hover:text-white border border-[#e29d8f]/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-[#e29d8f]/10 pb-2">
        <span className="text-xs font-mono uppercase tracking-widest text-[#e29d8f]">
          {query ? `SEARCH RESULTS FOR "${query.toUpperCase()}"` : 'SEARCH RESULTS'}
        </span>
        <span className="text-xs font-mono text-[#a88d92]">
          {filteredSongs.length} RESULTS
        </span>
      </div>

      {/* Numbered Editorial Results List (Screen 03) */}
      {filteredSongs.length > 0 ? (
        <div className="space-y-1.5">
          {filteredSongs.map((song, index) => {
            const isSongActive = currentSong?.id === song.id;
            const isSongPlaying = isSongActive && isPlaying;
            const isFav = favorites.includes(song.id);
            const rank = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;

            return (
              <div
                key={song.id}
                onClick={() => playSong(song, filteredSongs)}
                className={`group flex items-center justify-between px-4 py-2.5 rounded-xl transition-all cursor-pointer border ${
                  isSongActive
                    ? 'bg-[#291722] border-[#e29d8f]/40 shadow-lg shadow-black/40'
                    : 'bg-[#140d12]/60 hover:bg-[#1f131a] border-[#e29d8f]/10 hover:border-[#e29d8f]/25'
                }`}
              >
                {/* Left: Number + Artwork + Title/Artist */}
                <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                  {/* Rank number */}
                  <span className={`font-mono text-xs w-6 text-right flex-shrink-0 ${isSongActive ? 'text-[#e29d8f] font-bold' : 'text-[#7e676b]'}`}>
                    {rank}
                  </span>

                  {/* Thumbnail */}
                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#0c080b] border border-[#e29d8f]/15 flex-shrink-0 shadow-md">
                    <SongCover
                      url={song.cover_url}
                      alt={song.title}
                      category={song.category}
                      size="sm"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Song Meta */}
                  <div className="min-w-0">
                    <h3 className={`font-bold text-sm truncate ${isSongActive ? 'text-[#f5bcaf]' : 'text-[#f5ebe6] group-hover:text-white'}`}>
                      {song.title}
                    </h3>
                    <p className="text-xs text-[#a88d92] truncate mt-0.5">
                      {song.artist || song.category || 'Pattupetti Classic'}
                    </p>
                  </div>
                </div>

                {/* Right: Duration + Play Button + Options */}
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  {/* Category Pill */}
                  {song.category && (
                    <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-black/40 text-[#a88d92] border border-[#e29d8f]/10">
                      {song.category}
                    </span>
                  )}

                  {/* Duration */}
                  <span className="font-mono text-xs text-[#a88d92] tabular-nums">
                    {song.duration || '03:42'}
                  </span>

                  {/* Heart */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(song.id);
                    }}
                    className="p-1 text-[#7e676b] hover:text-[#e29d8f] transition-colors"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-[#e29d8f] fill-[#e29d8f]' : ''}`} />
                  </button>

                  {/* Circular Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isSongActive) {
                        togglePlay();
                      } else {
                        playSong(song, filteredSongs);
                      }
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isSongActive
                        ? 'bg-[#e29d8f] text-[#0c080b] shadow-md shadow-[#e29d8f]/30'
                        : 'bg-[#22151f] group-hover:bg-[#e29d8f] text-[#e29d8f] group-hover:text-[#0c080b]'
                    }`}
                  >
                    {isSongPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                    )}
                  </button>

                  {/* Options */}
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#170f15] border border-[#e29d8f]/15 flex items-center justify-center mb-3 text-[#7e676b]">
            <Music className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-white mb-1">No songs matched your query</p>
          <p className="text-xs text-[#a88d92] max-w-sm">
            Try searching for other song titles or select another category filter.
          </p>
        </div>
      )}

      {/* Bottom Quote Card (Screen 03) */}
      <div className="pt-6">
        <div className="inline-block p-4 rounded-2xl bg-[#160d13] border border-[#e29d8f]/15">
          <p className="font-script text-2xl text-[#f5bcaf]">
            Find what moves you.
          </p>
        </div>
      </div>
    </div>
  );
};
