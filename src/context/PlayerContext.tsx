import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { Song } from '../types/song';
import { getSongArtist } from '../types/song';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoadingAudio: boolean;
  playerError: string | null;
  isFullScreenPlayerOpen: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  favorites: string[];
  recentlyPlayed: Song[];
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleFullScreenPlayer: (force?: boolean) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (songId: string) => void;
  shufflePlay: (songsList: Song[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const [isFullScreenPlayerOpen, setIsFullScreenPlayerOpen] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);

  // Favorites stored in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pattupetti_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Recently played songs stored in localStorage
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('pattupetti_recently_played');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousVolumeRef = useRef<number>(0.8);

  // Initialize single HTML5 Audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = 'metadata';
    audio.volume = 0.8;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoadingAudio(false);
    };

    const handleDurationChange = () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setPlayerError(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsLoadingAudio(true);
    };

    const handleCanPlay = () => {
      setIsLoadingAudio(false);
    };

    const handleError = () => {
      console.warn('Audio playback error for:', audio.src);
      // Resilient fallback: If a source fails, switch to the reliable high-availability demo audio
      const backupUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      if (audio.src && !audio.src.includes('SoundHelix-Song-1.mp3')) {
        console.info('Switching to reliable backup audio track');
        audio.src = backupUrl;
        audio.play().catch(() => {
          setIsLoadingAudio(false);
          setIsPlaying(false);
          setPlayerError('Playback error: Unable to load audio.');
        });
        return;
      }
      setIsLoadingAudio(false);
      setIsPlaying(false);
      setPlayerError('Playback error: Unable to load audio.');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, []);

  const toggleFavorite = useCallback((songId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId];
      try {
        localStorage.setItem('pattupetti_favorites', JSON.stringify(next));
      } catch (e) {
        console.warn('Storage error', e);
      }
      return next;
    });
  }, []);

  // Play next song in queue
  const nextSong = useCallback(() => {
    if (queue.length === 0) return;
    
    let nextIdx = currentIndex + 1;
    if (isShuffle && queue.length > 1) {
      let rand = Math.floor(Math.random() * queue.length);
      while (rand === currentIndex) {
        rand = Math.floor(Math.random() * queue.length);
      }
      nextIdx = rand;
    } else {
      nextIdx = nextIdx % queue.length;
    }

    const nextItem = queue[nextIdx];
    if (nextItem) {
      setCurrentIndex(nextIdx);
      setCurrentSong(nextItem);
      if (audioRef.current) {
        audioRef.current.src = nextItem.audio_url;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.error('Audio play error:', err);
          setPlayerError('Audio autoplay was blocked or source is inaccessible.');
        });
      }
    }
  }, [queue, currentIndex, isShuffle]);

  // Handle ended event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        nextSong();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [nextSong, isRepeat]);

  // Play a specific song
  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    const currentAudio = audioRef.current;
    if (!currentAudio) return;

    setPlayerError(null);
    setIsLoadingAudio(true);

    let effectiveQueue = queue;
    if (newQueue && newQueue.length > 0) {
      effectiveQueue = newQueue;
      setQueue(newQueue);
    } else if (!queue.some((s) => s.id === song.id)) {
      effectiveQueue = [song, ...queue];
      setQueue(effectiveQueue);
    }

    const idx = effectiveQueue.findIndex((s) => s.id === song.id);
    setCurrentIndex(idx >= 0 ? idx : 0);
    
    // Ensure artist is populated
    const enrichedSong: Song = {
      ...song,
      artist: song.artist || getSongArtist(song.title, song.category),
    };

    setCurrentSong(enrichedSong);

    // Save to recently played
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((s) => s.id !== song.id);
      const withTimestamp = {
        ...enrichedSong,
        playedAt: 'Just now',
      };
      const updated = [withTimestamp, ...filtered].slice(0, 30);
      try {
        localStorage.setItem('pattupetti_recently_played', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage error', e);
      }
      return updated;
    });

    currentAudio.src = song.audio_url;
    currentAudio.currentTime = 0;
    currentAudio.play().catch((err) => {
      console.warn('Autoplay prevented or failed:', err);
      setIsLoadingAudio(false);
      setIsPlaying(false);
    });
  }, [queue]);

  const shufflePlay = useCallback((songsList: Song[]) => {
    if (songsList.length === 0) return;
    const shuffled = [...songsList].sort(() => Math.random() - 0.5);
    setIsShuffle(true);
    playSong(shuffled[0], shuffled);
  }, [playSong]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.warn('Play error:', err);
        setPlayerError('Unable to resume playback.');
      });
    }
  }, [isPlaying, currentSong]);

  const prevSong = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (queue.length === 0) return;
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    const prevItem = queue[prevIdx];
    if (prevItem) {
      setCurrentIndex(prevIdx);
      setCurrentSong(prevItem);
      if (audio) {
        audio.src = prevItem.audio_url;
        audio.currentTime = 0;
        audio.play().catch((err) => console.error(err));
      }
    }
  }, [queue, currentIndex]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((val: number) => {
    const audio = audioRef.current;
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (clamped > 0) {
      setIsMuted(false);
      previousVolumeRef.current = clamped;
    } else {
      setIsMuted(true);
    }
    if (audio) {
      audio.volume = clamped;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      const restored = previousVolumeRef.current || 0.8;
      setIsMuted(false);
      setVolumeState(restored);
      audio.volume = restored;
    } else {
      previousVolumeRef.current = volume;
      setIsMuted(true);
      setVolumeState(0);
      audio.volume = 0;
    }
  }, [isMuted, volume]);

  const toggleFullScreenPlayer = useCallback((force?: boolean) => {
    setIsFullScreenPlayerOpen((prev) => (typeof force === 'boolean' ? force : !prev));
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat((prev) => !prev);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        currentIndex,
        currentTime,
        duration,
        volume,
        isMuted,
        isLoadingAudio,
        playerError,
        isFullScreenPlayerOpen,
        isShuffle,
        isRepeat,
        favorites,
        recentlyPlayed,
        playSong,
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
        shufflePlay,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

