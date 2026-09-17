import React, { useState, useMemo } from 'react';
import type { Song } from '../types/song';
import { SongCard } from '../components/SongCard';
import { Search as SearchIcon, X, Music } from 'lucide-react';

interface SearchViewProps {
  songs: Song[];
}

export const SearchView: React.FC<SearchViewProps> = ({ songs }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Derive unique category names from actual songs in the bucket
  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    songs.forEach((s) => { if (s.category) cats.add(s.category); });
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [songs]);

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchesQuery = song.title.toLowerCase().includes(query.toLowerCase().trim());
      const songCategory = song.category || 'Other';
      const matchesCategory = selectedCategory === 'All' || songCategory.toLowerCase() === selectedCategory.toLowerCase();
      return matchesQuery && matchesCategory;
    });
  }, [songs, query, selectedCategory]);

  return (
    <div className="space-y-6 pb-16">
      {/* Search Bar & Filter Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Search</h1>
          <p className="text-xs text-neutral-400">Search songs by title in your Pattupetti collection</p>
        </div>

        {/* Input Field */}
        <div className="relative max-w-xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by song title (e.g. Randinappoo)..."
            className="w-full pl-12 pr-10 py-3 rounded-2xl bg-dark-900 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
              selectedCategory === 'All'
                ? 'bg-brand-500 text-black font-bold shadow-md shadow-brand-500/20'
                : 'bg-dark-800 text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            All Categories
          </button>
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-black font-bold shadow-md shadow-brand-500/20'
                : 'bg-dark-800 text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 pt-2">
        <span className="text-sm font-semibold text-neutral-300">
          {query ? `Results for "${query}"` : 'All Songs'}
        </span>
        <span className="text-xs text-neutral-400 font-medium">
          {filteredSongs.length} {filteredSongs.length === 1 ? 'song found' : 'songs found'}
        </span>
      </div>

      {/* Results Grid */}
      {filteredSongs.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredSongs.map((song) => (
            <SongCard key={song.id} song={song} queueContext={filteredSongs} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-white/5 flex items-center justify-center mb-3 text-neutral-500">
            <Music className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-white mb-1">No songs matched your search</p>
          <p className="text-xs text-neutral-400 max-w-sm">
            Try searching with a different keyword.
          </p>
        </div>
      )}
    </div>
  );
};
