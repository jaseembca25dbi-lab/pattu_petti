import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Volume1,
  AlertCircle,
  Music
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { SongCover } from './SongCover';

export const BottomPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoadingAudio,
    playerError,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
    toggleMute,
  } = usePlayer();

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = (isMuted ? 0 : volume) * 100;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-dark-900/90 backdrop-blur-2xl border-t border-white/10 z-40 px-4 md:px-6 flex items-center justify-between transition-all select-none">
      {/* LEFT SECTION: Current Song Info */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[180px] max-w-[320px]">
        {currentSong ? (
          <>
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md shadow-black/40 bg-dark-950">
              <SongCover
                url={currentSong.cover_url}
                alt={currentSong.title}
                size="sm"
                className="w-full h-full object-cover"
              />
              {isLoadingAudio && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 
                className="text-sm font-semibold text-white truncate hover:underline cursor-pointer"
                title={currentSong.title}
              >
                {currentSong.title}
              </h4>
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                {currentSong.category || 'Other'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 text-neutral-500">
            <div className="w-14 h-14 rounded-xl bg-dark-800/60 border border-white/5 flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 text-neutral-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-neutral-400">Ready to play</p>
              <p className="text-xs text-neutral-600">Select a song from library</p>
            </div>
          </div>
        )}
      </div>

      {/* CENTER SECTION: Audio Controls & Progress Bar */}
      <div className="flex flex-col items-center max-w-2xl w-full px-2 sm:px-6">
        {/* Buttons Row */}
        <div className="flex items-center gap-4 sm:gap-6 mb-1.5">
          <button
            onClick={prevSong}
            disabled={!currentSong}
            className="text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1.5 rounded-full hover:bg-white/5 active:scale-95"
            title="Previous track"
            aria-label="Previous track"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentSong}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 transform shadow-md shadow-brand-500/20 active:scale-95 ${
              currentSong
                ? 'bg-brand-500 text-black hover:bg-brand-400 hover:scale-105'
                : 'bg-dark-800 text-neutral-500 cursor-not-allowed'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={nextSong}
            disabled={!currentSong}
            className="text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1.5 rounded-full hover:bg-white/5 active:scale-95"
            title="Next track"
            aria-label="Next track"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Timers */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono text-neutral-400 w-9 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 group flex items-center h-4">
            {/* Custom Track Background */}
            <div className="w-full h-1.5 bg-neutral-800 group-hover:h-2 rounded-full overflow-hidden transition-all">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Hidden / native range overlay for smooth dragging */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeekChange}
              disabled={!currentSong}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Song progress"
            />
          </div>

          <span className="text-[11px] font-mono text-neutral-400 w-9 text-left tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        {playerError && (
          <div className="text-[11px] text-red-400 flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{playerError}</span>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: Volume Controls */}
      <div className="flex items-center justify-end gap-2.5 w-1/4 min-w-[140px] max-w-[240px]">
        <button
          onClick={toggleMute}
          className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-5 h-5 text-red-400" />
          ) : volume < 0.5 ? (
            <Volume1 className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        <div className="relative w-24 group flex items-center h-4">
          <div className="w-full h-1.5 bg-neutral-800 group-hover:h-2 rounded-full overflow-hidden transition-all">
            <div
              className="h-full bg-brand-500 group-hover:bg-brand-400 rounded-full transition-all"
              style={{ width: `${volumePercent}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Volume control"
          />
        </div>
      </div>
    </footer>
  );
};
