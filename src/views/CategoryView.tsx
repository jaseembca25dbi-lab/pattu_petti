import React, { useMemo } from 'react';
import type { Song } from '../types/song';
import { usePlayer } from '../context/PlayerContext';
import { SongCover } from '../components/SongCover';
import { getPlaylistCover } from '../lib/covers';
import { 
  Play, 
  Pause, 
  Shuffle, 
  Sparkles, 
  MoreHorizontal, 
  Heart,
  Music2
} from 'lucide-react';

interface CategoryViewProps {
  categoryName: string;
  songs: Song[];
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  categoryName,
  songs,
}) => {
  const { 
    currentSong, 
    isPlaying, 
    playSong, 
    togglePlay, 
    shufflePlay, 
    favorites, 
    toggleFavorite 
  } = usePlayer();

  // Filter songs for this category / playlist
  const categorySongs = useMemo(() => {
    const term = categoryName.toLowerCase().trim();
    if (!term || term === 'all') return songs;

    if (term.includes('arijit')) {
      return songs.filter((s) => {
        const title = s.title.toLowerCase();
        const artist = (s.artist || '').toLowerCase();
        const cat = (s.category || '').toLowerCase();
        return (
          cat.includes('arijit') ||
          artist.includes('arijit') ||
          title.includes('shayad') ||
          title.includes('raataan') ||
          title.includes('kesariya') ||
          title.includes('channa') ||
          title.includes('samjhawan') ||
          title.includes('ranjha') ||
          title.includes('satranga') ||
          title.includes('hawayein') ||
          title.includes('ae dil') ||
          title.includes('pal')
        );
      });
    }

    return songs.filter((s) => {
      const cat = (s.category || 'other').toLowerCase();
      return cat.includes(term) || term.includes(cat);
    });
  }, [categoryName, songs]);

  const isCurrentPlaylistPlaying = 
    isPlaying && currentSong && categorySongs.some((s) => s.id === currentSong.id);

  const handlePlayAll = () => {
    if (categorySongs.length === 0) return;
    if (isCurrentPlaylistPlaying) {
      togglePlay();
    } else {
      playSong(categorySongs[0], categorySongs);
    }
  };

  const handleShuffleAll = () => {
    if (categorySongs.length === 0) return;
    shufflePlay(categorySongs);
  };

  // Image and description tailored to the category
  const playlistDetails = useMemo(() => {
    const t = categoryName.toLowerCase();
    const coverImage = getPlaylistCover(categoryName);

    if (t.includes('bollywood') || t.includes('trending')) {
      return {
        title: 'TRENDING BOLLYWOOD',
        desc: 'Latest hits. Big emotions. Bollywood always on repeat.',
        image: coverImage,
        quote: 'Music that Moves You.',
      };
    }
    if (t.includes('arijit')) {
      return {
        title: 'ARIJIT SINGH RADIO',
        desc: 'Soulful tracks for quieter days and louder feelings.',
        image: coverImage,
        quote: 'Music Heals Differently.',
      };
    }
    if (t.includes('shafi') || t.includes('malayalam')) {
      return {
        title: 'SHAFI KOLLAM RADIO',
        desc: 'Timeless melodies from the voice that touches hearts.',
        image: coverImage,
        quote: 'Songs that Feel Like Home.',
      };
    }
    if (t.includes('tamil')) {
      return {
        title: 'TAMIL HIT PLAYLIST',
        desc: 'Timeless tracks from Kollywood for every mood.',
        image: coverImage,
        quote: 'Music Beyond Language.',
      };
    }
    if (t.includes('mix')) {
      return {
        title: 'MIX HIT PLAYLIST',
        desc: 'Different genres. Same good vibes. A little bit of everything.',
        image: coverImage,
        quote: 'Good Music No Limits.',
      };
    }
    return {
      title: `${categoryName.toUpperCase()} ARCHIVE`,
      desc: `Curated ${categoryName} recordings preserved in high-fidelity for your listening pleasure.`,
      image: coverImage,
      quote: 'Feel Every Word.',
    };
  }, [categoryName]);

  return (
    <div className="space-y-8 pb-28 select-none">
      {/* Top Banner (Screen 04) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a1017] via-[#140c12] to-[#0c080b] border border-[#e29d8f]/20 p-6 md:p-10 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Playlist Details */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-[#e29d8f] font-semibold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>04. PLAYLIST / CATEGORY</span>
            </div>

            <p className="text-[10px] font-mono tracking-[0.3em] text-[#a88d92] uppercase">
              PLAYLIST • {categorySongs.length} SONGS
            </p>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl text-white tracking-widest leading-[0.88]">
              {playlistDetails.title}
            </h1>

            <p className="text-xs text-[#ab9398] max-w-xl leading-relaxed">
              {playlistDetails.desc}
            </p>

            {/* Play All & Shuffle Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handlePlayAll}
                disabled={categorySongs.length === 0}
                className="w-12 h-12 rounded-full bg-[#e29d8f] hover:bg-[#f0b5a8] text-[#0c080b] flex items-center justify-center shadow-lg shadow-[#e29d8f]/25 active:scale-95 transition-all disabled:opacity-30"
                title="Play playlist"
              >
                {isCurrentPlaylistPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                )}
              </button>

              <button
                onClick={handleShuffleAll}
                disabled={categorySongs.length === 0}
                className="p-3 rounded-full bg-[#20141c] hover:bg-[#2e1c28] text-[#e29d8f] border border-[#e29d8f]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                title="Shuffle play"
              >
                <Shuffle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Column: Hero Graphic with Cover Art */}
          <div className="md:col-span-4 flex justify-center md:justify-end">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border border-[#e29d8f]/30 bg-[#1e131b] group">
              <img
                src={playlistDetails.image}
                alt={playlistDetails.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c080b]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <span className="font-script text-2xl text-[#f5bcaf] drop-shadow-md">
                  {playlistDetails.quote}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRACKS TABLE (Screen 04) */}
      <div className="space-y-2">
        {/* Table Header Row */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-[#e29d8f]/10 text-[10px] font-mono tracking-widest text-[#a88d92] uppercase">
          <div className="col-span-1 text-right pr-2">#</div>
          <div className="col-span-6 sm:col-span-6">TITLE</div>
          <div className="col-span-3 sm:col-span-3 hidden sm:block">ARTIST</div>
          <div className="col-span-2 sm:col-span-2 text-right">DURATION</div>
        </div>

        {/* Rows */}
        {categorySongs.length > 0 ? (
          <div className="space-y-1">
            {categorySongs.map((song, index) => {
              const isSongActive = currentSong?.id === song.id;
              const isSongPlaying = isSongActive && isPlaying;
              const isFav = favorites.includes(song.id);
              const rank = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;

              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, categorySongs)}
                  className={`grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl transition-all cursor-pointer border ${
                    isSongActive
                      ? 'bg-[#291722] border-[#e29d8f]/40 shadow-lg'
                      : 'bg-[#140d12]/60 hover:bg-[#1f131a] border-[#e29d8f]/10 hover:border-[#e29d8f]/25'
                  }`}
                >
                  {/* # Rank */}
                  <div className="col-span-1 text-right pr-2 font-mono text-xs">
                    <span className={isSongActive ? 'text-[#e29d8f] font-bold' : 'text-[#7e676b]'}>
                      {rank}
                    </span>
                  </div>

                  {/* Title + Thumbnail */}
                  <div className="col-span-8 sm:col-span-6 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0c080b] border border-[#e29d8f]/15 flex-shrink-0">
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
                      <p className="text-[11px] text-[#a88d92] truncate sm:hidden">
                        {song.artist || song.category || 'Pattupetti'}
                      </p>
                    </div>
                  </div>

                  {/* Artist */}
                  <div className="col-span-3 hidden sm:block truncate text-xs text-[#a88d92]">
                    {song.artist || 'Original Artist'}
                  </div>

                  {/* Duration + Play + Options */}
                  <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-3">
                    <span className="font-mono text-xs text-[#a88d92] tabular-nums hidden sm:inline">
                      {song.duration || '03:42'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(song.id);
                      }}
                      className="p-1 text-[#7e676b] hover:text-[#e29d8f] transition-colors"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-[#e29d8f] fill-[#e29d8f]' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSongActive) {
                          togglePlay();
                        } else {
                          playSong(song, categorySongs);
                        }
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isSongActive
                          ? 'bg-[#e29d8f] text-[#0c080b]'
                          : 'bg-[#21141e] hover:bg-[#e29d8f] text-[#e29d8f] hover:text-[#0c080b]'
                      }`}
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
          <div className="py-16 text-center text-[#a88d92]">
            <Music2 className="w-8 h-8 text-[#7e676b] mx-auto mb-2" />
            <p className="text-sm">No songs found in this category.</p>
          </div>
        )}
      </div>

      {/* Bottom Quote Card (Screen 04) */}
      <div className="pt-6">
        <div className="inline-block p-4 rounded-2xl bg-[#160d13] border border-[#e29d8f]/15">
          <p className="font-script text-2xl text-[#f5bcaf]">
            Same Vibes Different Stories.
          </p>
        </div>
      </div>
    </div>
  );
};
