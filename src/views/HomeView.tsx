import React, { useMemo } from 'react';
import type { Song } from '../types/song';
import { SongCard } from '../components/SongCard';
import { Sparkles, FolderHeart, Loader2 } from 'lucide-react';

interface HomeViewProps {
  songs: Song[];
  isLoading: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  songs,
  isLoading,
}) => {
  // Recently added songs (last 8 songs sorted by created_at desc)
  const recentlyAdded = useMemo(() => {
    return [...songs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  }, [songs]);

  // Dynamically group songs by category
  // If category is null or empty string, group under 'Other'
  const categorizedSongs = useMemo(() => {
    const groups: Record<string, Song[]> = {};

    songs.forEach((song) => {
      const cat = song.category && song.category.trim() ? song.category.trim() : 'Other';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(song);
    });

    return groups;
  }, [songs]);

  // Dynamic category order — derived from bucket folder names
  const orderedCategoryNames = useMemo(() => {
    return Object.keys(categorizedSongs)
      .filter((cat) => categorizedSongs[cat].length > 0)
      .sort((a, b) => a.localeCompare(b));
  }, [categorizedSongs]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        <p className="text-sm text-neutral-400 font-medium">Loading your music library from Supabase...</p>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 rounded-2xl bg-dark-800/80 border border-white/5 flex items-center justify-center mb-5 text-brand-400 shadow-xl shadow-brand-500/5">
          <FolderHeart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Pattupetti is Empty</h2>
        <p className="text-neutral-400 max-w-md text-sm mb-6 leading-relaxed">
          Upload your favorite songs directly to Supabase Storage. They will automatically appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Hero / Welcome Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-950/40 via-dark-800/60 to-dark-900/60 border border-brand-500/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Personal Music Space</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome to Pattupetti
            </h1>
            <p className="text-neutral-400 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
              Stream your songs stored in Supabase with continuous playback and dynamic category organization.
            </p>
          </div>
        </div>
      </div>

      {/* Recently Added Section */}
      {recentlyAdded.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Recently Added</h2>
              <p className="text-xs text-neutral-400">Latest songs added to your library</p>
            </div>
            <span className="text-xs font-medium text-neutral-500">
              {recentlyAdded.length} {recentlyAdded.length === 1 ? 'song' : 'songs'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recentlyAdded.map((song) => (
              <SongCard key={song.id} song={song} queueContext={recentlyAdded} />
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Category Sections */}
      {orderedCategoryNames.map((categoryName) => {
        const categoryList = categorizedSongs[categoryName] || [];
        if (categoryList.length === 0) return null;

        return (
          <section key={categoryName} className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {categoryName}
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-medium">
                {categoryList.length} {categoryList.length === 1 ? 'song' : 'songs'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {categoryList.map((song) => (
                <SongCard key={song.id} song={song} queueContext={categoryList} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
