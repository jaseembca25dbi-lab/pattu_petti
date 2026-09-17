import React, { useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Heart, 
  Minimize2, 
  Disc3, 
  Volume2, 
  VolumeX,
  Volume1,
  Sparkles
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { SongCover } from './SongCover';

export const NowPlayingModal: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullScreenPlayerOpen,
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

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreenPlayerOpen) {
        toggleFullScreenPlayer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreenPlayerOpen, toggleFullScreenPlayer]);

  if (!isFullScreenPlayerOpen || !currentSong) return null;

  const isFav = favorites.includes(currentSong.id);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0c080b]/95 backdrop-blur-2xl text-[#f5ebe6] flex flex-col justify-between overflow-y-auto animate-in fade-in duration-300 select-none">
      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#e29d8f]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#933d31]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 border-b border-[#e29d8f]/10">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl tracking-widest text-white">PATTUPETTI</span>
          <span className="text-[10px] tracking-[0.25em] text-[#e29d8f]/70 uppercase hidden sm:inline">
            • PERSONAL MUSIC BOX
          </span>
        </div>

        {/* Center Tabs */}
        <div className="hidden md:flex items-center gap-8 text-xs tracking-[0.2em] font-medium text-[#c4a8ad]">
          <button className="text-[#e29d8f] border-b border-[#e29d8f] pb-0.5">MUSIC</button>
          <button className="hover:text-white transition-colors">LYRICS</button>
          <button className="hover:text-white transition-colors">RELATED</button>
        </div>

        {/* Close / Minimize */}
        <button
          onClick={() => toggleFullScreenPlayer(false)}
          className="p-2.5 rounded-full bg-white/5 hover:bg-[#e29d8f]/20 text-[#c4a8ad] hover:text-white transition-all active:scale-95"
          title="Minimize full screen view (Esc)"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content: Vinyl Sleeve + Player Details */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 md:px-16 py-8 max-w-7xl mx-auto w-full">
        {/* LEFT / CENTER: Realistic Vinyl slipping out from sleeve */}
        <div className="relative flex items-center justify-center max-w-[420px] w-full">
          {/* Vinyl Record (sliding out to the right) */}
          <div
            className={`absolute right-[-15%] sm:right-[-25%] w-60 h-60 sm:w-80 sm:h-80 vinyl-record vinyl-grooves flex items-center justify-center shadow-2xl transition-all duration-700 ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
          >
            {/* Center Vinyl Label */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#170e14] border-4 border-[#e29d8f]/40 flex flex-col items-center justify-center p-2 text-center shadow-inner">
              <Disc3 className="w-6 h-6 text-[#e29d8f] mb-1 opacity-80" />
              <span className="text-[8px] sm:text-[9px] font-display text-white uppercase tracking-wider line-clamp-1">
                {currentSong.title}
              </span>
              <span className="text-[7px] text-[#e29d8f]/80 uppercase tracking-widest mt-0.5">
                PATTUPETTI 33 RPM
              </span>
              {/* Center spindle hole */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#0c080b] border border-[#e29d8f]/30 mt-1" />
            </div>
          </div>

          {/* Album Cover Sleeve (foreground) */}
          <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/90 border border-[#e29d8f]/20 bg-[#160d13]">
            <SongCover
              url={currentSong.cover_url}
              alt={currentSong.title}
              category={currentSong.category}
              size="xl"
              className="w-full h-full object-cover"
            />
            {/* Cursive Accent Overlay on Cover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
              <span className="font-script text-3xl sm:text-4xl text-[#f5bcaf] drop-shadow-md">
                {currentSong.title}
              </span>
              <span className="text-xs text-white/80 font-medium tracking-widest uppercase mt-1">
                {currentSong.artist || 'Soulful Melodies'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Typography & Big Controls */}
        <div className="w-full max-w-lg flex flex-col justify-center space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs tracking-[0.25em] text-[#e29d8f] font-semibold uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>01 NOW PLAYING</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl text-white tracking-wider leading-none">
              NOW PLAYING
            </h1>
          </div>

          {/* Song info */}
          <div className="border-l-2 border-[#e29d8f]/50 pl-4 py-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {currentSong.title}
            </h2>
            <p className="text-base sm:text-lg text-[#e29d8f] font-medium mt-1">
              {currentSong.artist || 'Original Soundtrack'}
            </p>
            {currentSong.category && (
              <span className="inline-block mt-2 text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#e29d8f]/10 text-[#f5bcaf] border border-[#e29d8f]/20">
                {currentSong.category}
              </span>
            )}
          </div>

          {/* Progress Timeline */}
          <div className="space-y-2 pt-2">
            <div className="relative group flex items-center h-4">
              <div className="w-full h-1.5 bg-[#251720] group-hover:h-2 rounded-full overflow-hidden transition-all">
                <div
                  className="h-full bg-gradient-to-r from-[#d77c6b] to-[#e29d8f] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Progress bar"
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-[#c4a8ad] tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between pt-2">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-2.5 rounded-full transition-all ${
                isShuffle ? 'text-[#e29d8f] bg-[#e29d8f]/10' : 'text-[#a88d92] hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Prev */}
            <button
              onClick={prevSong}
              className="p-2 text-[#e29d8f] hover:text-white transition-colors hover:scale-110 active:scale-95"
              title="Previous"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            {/* Big Play / Pause (Rose-filled) */}
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-[#e29d8f] hover:bg-[#f0b5a8] text-[#0c080b] flex items-center justify-center shadow-lg shadow-[#e29d8f]/30 hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextSong}
              className="p-2 text-[#e29d8f] hover:text-white transition-colors hover:scale-110 active:scale-95"
              title="Next"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            {/* Heart Favorite */}
            <button
              onClick={() => toggleFavorite(currentSong.id)}
              className={`p-2.5 rounded-full transition-all ${
                isFav ? 'text-[#e29d8f]' : 'text-[#a88d92] hover:text-white'
              }`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-[#e29d8f]' : ''}`} />
            </button>
          </div>

          {/* Repeat and Volume row */}
          <div className="flex items-center justify-between pt-4 border-t border-[#e29d8f]/10">
            <button
              onClick={toggleRepeat}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                isRepeat ? 'text-[#e29d8f]' : 'text-[#a88d92] hover:text-white'
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>{isRepeat ? 'Repeating' : 'Repeat'}</span>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-[#a88d92] hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <div className="relative w-20 group flex items-center h-3">
                <div className="w-full h-1 bg-[#251720] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#e29d8f] rounded-full"
                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>

          {/* Editorial Quote Footnote */}
          <div className="pt-3 text-right">
            <span className="font-script text-lg text-[#e29d8f]/80 tracking-wide">
              SOME SONGS FEEL LIKE HOME. ✦
            </span>
          </div>
        </div>
      </main>

      {/* Bottom Bar Spacing */}
      <footer className="px-8 py-4 text-center text-[10px] text-[#a88d92]/60 uppercase tracking-widest border-t border-[#e29d8f]/10">
        Pattupetti Audio Experience • Press ESC or tap top right to close
      </footer>
    </div>
  );
};
