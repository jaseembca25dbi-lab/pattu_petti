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
  Music,
  Heart,
  Shuffle,
  Repeat,
  Maximize2
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
    isShuffle,
    isRepeat,
    favorites,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
    toggleMute,
    toggleFullScreenPlayer,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
  } = usePlayer();

  const isFav = currentSong ? favorites.includes(currentSong.id) : false;

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
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-[#0d090c]/95 backdrop-blur-2xl border-t border-[#e29d8f]/15 z-40 px-4 md:px-8 flex items-center justify-between transition-all select-none shadow-2xl">
      {/* LEFT SECTION: Current Song Info */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[200px] max-w-[340px]">
        {currentSong ? (
          <>
            <div 
              onClick={() => toggleFullScreenPlayer(true)}
              className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md shadow-black/60 bg-[#160d13] border border-[#e29d8f]/20 cursor-pointer group"
              title="Click to expand Now Playing view"
            >
              <SongCover
                url={currentSong.cover_url}
                alt={currentSong.title}
                category={currentSong.category}
                size="sm"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {isLoadingAudio && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#e29d8f] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 
                onClick={() => toggleFullScreenPlayer(true)}
                className="text-sm font-bold text-white truncate hover:text-[#f5bcaf] cursor-pointer"
                title={currentSong.title}
              >
                {currentSong.title}
              </h4>
              <p className="text-xs text-[#a88d92] truncate mt-0.5">
                {currentSong.artist || currentSong.category || 'Pattupetti'}
              </p>
            </div>
            <button
              onClick={() => toggleFavorite(currentSong.id)}
              className="p-1.5 text-[#ab9398] hover:text-[#e29d8f] transition-colors rounded-full hover:bg-white/5"
              title={isFav ? 'Remove favorite' : 'Add favorite'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'text-[#e29d8f] fill-[#e29d8f]' : ''}`} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-[#7e676b]">
            <div className="w-14 h-14 rounded-xl bg-[#140d12] border border-[#e29d8f]/10 flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 text-[#7e676b]" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-[#a88d92] uppercase tracking-wider">PATTUPETTI</p>
              <p className="text-xs text-[#7e676b]">Select a song to play</p>
            </div>
          </div>
        )}
      </div>

      {/* CENTER SECTION: Audio Controls & Progress Bar */}
      <div className="flex flex-col items-center max-w-2xl w-full px-2 sm:px-6">
        {/* Buttons Row */}
        <div className="flex items-center gap-4 sm:gap-6 mb-1.5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition-colors ${
              isShuffle ? 'text-[#e29d8f] bg-[#e29d8f]/10' : 'text-[#8c7479] hover:text-[#f5ebe6]'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous */}
          <button
            onClick={prevSong}
            disabled={!currentSong}
            className="text-[#e29d8f] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1.5 rounded-full hover:bg-white/5 active:scale-95"
            title="Previous track"
            aria-label="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Main Play / Pause Circle (Rose Gold) */}
          <button
            onClick={togglePlay}
            disabled={!currentSong}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 transform shadow-lg shadow-[#e29d8f]/20 active:scale-95 ${
              currentSong
                ? 'bg-[#e29d8f] text-[#0c080b] hover:bg-[#f0b5a8] hover:scale-105'
                : 'bg-[#22151f] text-[#7e676b] cursor-not-allowed'
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

          {/* Next */}
          <button
            onClick={nextSong}
            disabled={!currentSong}
            className="text-[#e29d8f] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1.5 rounded-full hover:bg-white/5 active:scale-95"
            title="Next track"
            aria-label="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-1.5 rounded-full transition-colors ${
              isRepeat ? 'text-[#e29d8f] bg-[#e29d8f]/10' : 'text-[#8c7479] hover:text-[#f5ebe6]'
            }`}
            title="Repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar & Timers */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#a88d92] w-9 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 group flex items-center h-4">
            {/* Custom Track Background */}
            <div className="w-full h-1 bg-[#251720] group-hover:h-1.5 rounded-full overflow-hidden transition-all">
              <div
                className="h-full bg-[#e29d8f] rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Native range overlay */}
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

          <span className="text-[11px] font-mono text-[#a88d92] w-9 text-left tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        {playerError && (
          <div className="text-[11px] text-rose-400 flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{playerError}</span>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: Volume & Fullscreen Expand */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[150px] max-w-[240px]">
        <button
          onClick={toggleMute}
          className="text-[#ab9398] hover:text-[#f5ebe6] transition-colors p-1.5 rounded-lg hover:bg-white/5"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : volume < 0.5 ? (
            <Volume1 className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        <div className="relative w-20 sm:w-24 group flex items-center h-4">
          <div className="w-full h-1 bg-[#251720] group-hover:h-1.5 rounded-full overflow-hidden transition-all">
            <div
              className="h-full bg-[#e29d8f] rounded-full transition-all"
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

        {/* Fullscreen Expand button (opens Screen 05 Now Playing) */}
        <button
          onClick={() => toggleFullScreenPlayer(true)}
          disabled={!currentSong}
          className="p-1.5 text-[#ab9398] hover:text-[#e29d8f] transition-colors rounded-lg hover:bg-white/5 disabled:opacity-30"
          title="Open Now Playing"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
