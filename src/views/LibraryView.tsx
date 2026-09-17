import React, { useState, useMemo } from 'react';
import type { Song } from '../types/song';
import { SongCard } from '../components/SongCard';
import { usePlayer } from '../context/PlayerContext';
import { Library, Play, ArrowUpDown } from 'lucide-react';

interface LibraryViewProps {
  songs: Song[];
}

export const LibraryView: React.FC<LibraryViewProps> = ({ songs }) => {
  const { playSong } = usePlayer();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  const filteredAndSortedSongs = useMemo(() => {
    let list = songs.filter((song) => {
      if (selectedCategory === 'All') return true;
      const cat = song.category || 'Other';
      return cat.toLowerCase() === selectedCategory.toLowerCase();
    });

    return list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return a.title.localeCompare(b.title);
    });
  }, [songs, selectedCategory, sortBy]);

  // Derive unique category names from actual songs in the bucket
  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    songs.forEach((s) => { if (s.category) cats.add(s.category); });
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [songs]);

  const handlePlayAll = () => {
    if (filteredAndSortedSongs.length > 0) {
      playSong(filteredAndSortedSongs[0], filteredAndSortedSongs);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Library className="w-4 h-4" />
            <span>Your Collection</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Music Library</h1>
          <p className="text-xs text-neutral-400">
            {songs.length} {songs.length === 1 ? 'song' : 'songs'} in your personal library
          </p>
        </div>

        <div className="flex items-center gap-3">
          {filteredAndSortedSongs.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-900/60 p-3 rounded-2xl border border-white/5">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              selectedCategory === 'All'
                ? 'bg-white/15 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All
          </button>
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 self-end sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-[11px]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-dark-950 text-white border border-white/10 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="newest">Recently Added</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Songs Grid */}
      {filteredAndSortedSongs.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredAndSortedSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              queueContext={filteredAndSortedSongs}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-neutral-400">
          <p className="text-sm">No songs match the selected category ({selectedCategory}).</p>
        </div>
      )}
    </div>
  );
};
