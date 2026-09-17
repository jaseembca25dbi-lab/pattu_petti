import React from 'react';
import { Play, Pause } from 'lucide-react';
import type { Song } from '../types/song';
import { usePlayer } from '../context/PlayerContext';
import { SongCover } from './SongCover';

interface SongCardProps {
  song: Song;
  queueContext?: Song[];
}

export const SongCard: React.FC<SongCardProps> = ({ song, queueContext }) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  const handleCardClick = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, queueContext);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col p-3.5 rounded-2xl cursor-pointer transition-all duration-300 ease-out border ${
        isCurrentSong
          ? 'bg-dark-800/90 border-brand-500/40 shadow-lg shadow-brand-500/10'
          : 'bg-dark-900/60 hover:bg-dark-800/80 border-white/5 hover:border-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50'
      }`}
    >
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-dark-950">
        <SongCover
          url={song.cover_url}
          alt={song.title}
          size="lg"
          className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Playing equalizer indicator overlay if active */}
        {isCurrentlyPlaying && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex items-end gap-1 h-6">
              <span className="w-1 bg-brand-400 rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-5" />
              <span className="w-1 bg-brand-400 rounded-full animate-[bounce_1.1s_ease-in-out_infinite] h-3" />
              <span className="w-1 bg-brand-400 rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-6" />
              <span className="w-1 bg-brand-400 rounded-full animate-[bounce_0.9s_ease-in-out_infinite] h-4" />
            </div>
          </div>
        )}

        {/* Floating Quick Play Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className={`absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-brand-500 text-black flex items-center justify-center shadow-lg shadow-brand-500/40 transition-all duration-300 transform ${
            isCurrentSong
              ? 'opacity-100 scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 hover:scale-110 hover:bg-brand-400'
          }`}
          title={isCurrentlyPlaying ? 'Pause' : 'Play'}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-5 h-5 fill-black" />
          ) : (
            <Play className="w-5 h-5 fill-black translate-x-0.5" />
          )}
        </button>

        {/* Category Pill on image */}
        {song.category && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold tracking-wider text-neutral-300 uppercase">
            {song.category}
          </div>
        )}
      </div>

      {/* Song Information */}
      <div className="flex flex-col flex-grow justify-between">
        <div>
          <h3
            className={`font-semibold text-sm line-clamp-2 leading-snug transition-colors ${
              isCurrentSong ? 'text-brand-400' : 'text-neutral-100 group-hover:text-white'
            }`}
            title={song.title}
          >
            {song.title}
          </h3>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
          <span className="truncate">
            {song.category || 'Other'}
          </span>
          {isCurrentSong && (
            <span className="text-[11px] font-medium text-brand-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
              Playing
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
