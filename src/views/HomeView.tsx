import React, { useMemo } from "react";
import type { Song } from "../types/song";
import { usePlayer } from "../context/PlayerContext";
import { SongCover } from "../components/SongCover";
import { EDITORIAL_IMAGES } from "../lib/covers";
import { Play, Pause, ChevronRight, FolderHeart, ArrowRight, Music2 } from "lucide-react";

interface HomeViewProps {
  songs: Song[];
  isLoading: boolean;
  onSelectCategory?: (category: string) => void;
}

const MOOD_COLOURS: Record<string, { bg: string; label: string }> = {
  "Arijit Singh Radio": { bg: "from-[#3b1f1a] to-[#1e0f0c]", label: "ARIJIT" },
  "Mix Hit":            { bg: "from-[#1f2b3b] to-[#0c1420]", label: "MIX HIT" },
  "Shafi Kollam Radio": { bg: "from-[#1b3522] to-[#0c1a10]", label: "SHAFI" },
  "Tamil Hit":          { bg: "from-[#2e1e38] to-[#140d1e]", label: "TAMIL" },
  "Malayalam":          { bg: "from-[#2b2418] to-[#14110c]", label: "MALAYALAM" },
};
function getMoodColour(cat: string) {
  return MOOD_COLOURS[cat] || { bg: "from-[#251a21] to-[#120d10]", label: cat.split(" ")[0].toUpperCase() };
}

const MOOD_COVERS: Record<string, string> = {
  "Arijit Singh Radio": EDITORIAL_IMAGES.aedil,
  "Mix Hit":            EDITORIAL_IMAGES.tumsehi,
  "Shafi Kollam Radio": EDITORIAL_IMAGES.kallipenne,
  "Tamil Hit":          EDITORIAL_IMAGES.radhimaa,
  "Malayalam":          EDITORIAL_IMAGES.njankettiya,
};

export const HomeView: React.FC<HomeViewProps> = ({ songs, isLoading, onSelectCategory }) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

  const featuredSong = useMemo(() => (songs.length === 0 ? null : songs[0]), [songs]);

  const recentlyAdded = useMemo(
    () => [...songs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6),
    [songs]
  );

  const categoriesMap = useMemo(() => {
    const map: Record<string, Song[]> = {};
    songs.forEach((song) => {
      const cat = song.category?.trim() || "Mix Hit";
      if (!map[cat]) map[cat] = [];
      map[cat].push(song);
    });
    return map;
  }, [songs]);

  const categoryNames = useMemo(
    () => Object.keys(categoriesMap).filter((c) => categoriesMap[c].length > 0),
    [categoriesMap]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-[#e29d8f]/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-[#e29d8f] border-t-transparent animate-spin" />
        </div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-[#a88d92] uppercase animate-pulse">
          Scanning your Pattupetti archive…
        </p>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8">
        <div className="w-20 h-20 rounded-2xl bg-[#1a1017] border border-[#e29d8f]/20 flex items-center justify-center mb-5 text-[#e29d8f] shadow-xl">
          <FolderHeart className="w-10 h-10" />
        </div>
        <h2 className="font-display text-4xl text-white tracking-wide mb-2">ARCHIVE EMPTY</h2>
        <p className="text-[#a88d92] max-w-md text-xs mb-6 leading-relaxed">
          Upload audio files to your Supabase songs bucket to start streaming.
        </p>
      </div>
    );
  }

  const isFeaturedPlaying = currentSong?.id === featuredSong?.id && isPlaying;
  const handleFeaturedPlay = () => {
    if (!featuredSong) return;
    currentSong?.id === featuredSong.id ? togglePlay() : playSong(featuredSong, songs);
  };

  return (
    <div className="pb-28 select-none overflow-x-hidden">

      {/* ═══════════ HERO ═══════════ */}
      <div className="relative min-h-[82vh] flex flex-col overflow-hidden rounded-3xl bg-[#0d0009] mb-10 border border-[#e29d8f]/10">

        {/* Background portrait */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={EDITORIAL_IMAGES.heroPortrait}
            alt="Hero"
            className="w-full h-full object-cover object-top anim-hero-img"
            style={{ opacity: 0.55, filter: "grayscale(25%) contrast(1.12) sepia(0.2) brightness(0.55)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b000a]/95 via-[#0b000a]/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b000a] via-transparent to-transparent" />
        </div>

        {/* Top nav */}
        <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 pt-6 pb-4 anim-header">
          <div className="flex items-center gap-8 text-[11px] tracking-[0.25em] font-semibold">
            {["MUSIC", "PEOPLE", "MOMENTS", "PLAYLISTS"].map((item) => (
              <span key={item} className="text-[#c8a8a0] hover:text-white cursor-pointer transition-colors duration-200 hidden md:block">
                {item}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-md">
            <Music2 className="w-3.5 h-3.5 text-[#e29d8f]" />
            <span className="text-[11px] text-[#c8a8a0] tracking-wider hidden sm:block">
              {songs.length} tracks in archive
            </span>
          </div>
        </nav>

        {/* Hero text */}
        <div className="relative z-20 flex-1 flex flex-col justify-center px-6 md:px-10 pb-6">
          <div className="overflow-hidden mb-2">
            <h1
              className="font-display text-[clamp(3.5rem,12vw,9rem)] text-white leading-[0.88] tracking-widest anim-hero-t1"
              style={{ textShadow: "0 4px 40px rgba(226,157,143,0.18)" }}
            >
              PATTUPETTI
            </h1>
          </div>
          <div className="overflow-hidden mb-1">
            <p className="font-display text-[clamp(1rem,3.5vw,2.2rem)] text-[#f5bcaf] tracking-[0.25em] uppercase anim-hero-t2">
              MUSIC THAT STAYS WITH YOU.
            </p>
          </div>
          <div className="overflow-hidden mb-8">
            <p className="text-[#9c8289] text-[11px] tracking-[0.18em] uppercase anim-hero-t3">
              A personal music box for real people.
            </p>
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-6 anim-hero-t4">
            <button
              onClick={handleFeaturedPlay}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#e29d8f] hover:bg-[#f0b5a8] text-[#0c000a] font-bold text-sm tracking-widest transition-all active:scale-95 play-btn-glow group"
            >
              {isFeaturedPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
              {isFeaturedPlaying ? "PAUSE" : "PLAY NOW"}
              <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-8 text-center">
              <div>
                <p className="font-display text-2xl text-white leading-none">{songs.length}</p>
                <p className="text-[10px] tracking-widest text-[#a88d92] uppercase">Songs</p>
              </div>
              <div className="w-px h-8 bg-[#e29d8f]/20" />
              <div>
                <p className="font-display text-2xl text-white leading-none">{categoryNames.length}</p>
                <p className="text-[10px] tracking-widest text-[#a88d92] uppercase">Playlists</p>
              </div>
              <div className="w-px h-8 bg-[#e29d8f]/20" />
              <div>
                <p className="font-display text-2xl text-white leading-none">∞</p>
                <p className="text-[10px] tracking-widest text-[#a88d92] uppercase">Moods</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Now banner */}
        {featuredSong && (
          <div className="relative z-20 mx-4 mb-4 md:mx-8 md:mb-6 anim-player">
            <div className="bg-[#120009]/80 backdrop-blur-xl border border-[#e29d8f]/20 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="hidden sm:flex flex-col items-start pr-5 border-r border-[#e29d8f]/15 min-w-[110px]">
                <span className="font-mono text-[10px] text-[#e29d8f] font-bold tracking-wider">01</span>
                <span className="font-display text-sm text-white tracking-wider uppercase">FEATURED NOW</span>
              </div>

              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div onClick={handleFeaturedPlay} className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#1e0f1a] border border-[#e29d8f]/20 cursor-pointer shadow-lg">
                  <SongCover url={featuredSong.cover_url} alt={featuredSong.title} category={featuredSong.category} size="sm" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 onClick={handleFeaturedPlay} className="font-bold text-sm text-white hover:text-[#f5bcaf] cursor-pointer truncate">
                    {featuredSong.title}
                  </h3>
                  <p className="text-xs text-[#e29d8f] truncate">{featuredSong.artist || "Pattupetti"}</p>
                </div>
                <div className="hidden md:flex items-end gap-[3px] h-6 px-2">
                  {isFeaturedPlaying
                    ? Array.from({ length: 8 }).map((_, i) => <span key={i} className="waveform-bar" />)
                    : Array.from({ length: 8 }).map((_, i) => (
                        <span key={i} className="waveform-bar-static" style={{ height: `${[12,20,16,24,18,14,22,16][i]}px` }} />
                      ))}
                </div>
              </div>

              <button onClick={handleFeaturedPlay} className="w-11 h-11 rounded-full bg-[#e29d8f] hover:bg-[#f0b5a8] text-[#0c000a] flex items-center justify-center shadow-lg shadow-[#e29d8f]/25 active:scale-95 transition-all flex-shrink-0">
                {isFeaturedPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ 02 RECENTLY PLAYED ═══════════ */}
      {recentlyAdded.length > 0 && (
        <section className="mb-12 anim-section" style={{ animationDelay: "1.0s" }}>
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="font-mono text-[10px] text-[#e29d8f] tracking-widest block mb-1">02</span>
              <h2 className="font-display text-3xl md:text-4xl text-white tracking-wider">RECENTLY PLAYED</h2>
            </div>
            <button
              onClick={() => onSelectCategory && onSelectCategory(categoryNames[0])}
              className="flex items-center gap-1 text-[11px] font-mono text-[#e29d8f] hover:text-white tracking-widest transition-colors group"
            >
              SEE ALL <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {recentlyAdded.map((song, index) => {
              const isActive = currentSong?.id === song.id;
              const isActivePlaying = isActive && isPlaying;
              return (
                <div
                  key={song.id}
                  onClick={() => (isActive ? togglePlay() : playSong(song, recentlyAdded))}
                  className={`group relative flex-shrink-0 w-44 cursor-pointer anim-section stagger-${Math.min(index + 1, 8)}`}
                >
                  <div className={`relative w-44 h-44 rounded-2xl overflow-hidden mb-3 border transition-all duration-300 ${isActive ? "border-[#e29d8f]/60 shadow-[0_0_24px_rgba(226,157,143,0.3)]" : "border-[#e29d8f]/10 group-hover:border-[#e29d8f]/30"}`}>
                    <SongCover url={song.cover_url} alt={song.title} category={song.category} size="md" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                      <div className="w-12 h-12 rounded-full bg-[#e29d8f] shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                        {isActivePlaying ? <Pause className="w-5 h-5 fill-current text-[#0c000a]" /> : <Play className="w-5 h-5 fill-current text-[#0c000a] translate-x-0.5" />}
                      </div>
                    </div>
                  </div>
                  <h4 className={`text-xs font-bold truncate mb-0.5 transition-colors ${isActive ? "text-[#f5bcaf]" : "text-white group-hover:text-[#f5bcaf]"}`}>{song.title}</h4>
                  <p className="text-[11px] text-[#a88d92] truncate">{song.artist || song.category || "Pattupetti"}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════ 03 BROWSE BY MOOD ═══════════ */}
      {categoryNames.length > 0 && (
        <section className="anim-section" style={{ animationDelay: "1.25s" }}>
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="font-mono text-[10px] text-[#e29d8f] tracking-widest block mb-1">03</span>
              <h2 className="font-display text-3xl md:text-4xl text-white tracking-wider">BROWSE BY MOOD</h2>
            </div>
            <span className="text-[11px] font-mono text-[#7a6570] tracking-widest">{categoryNames.length} COLLECTIONS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categoryNames.map((cat, index) => {
              const count = categoriesMap[cat]?.length || 0;
              const mood = getMoodColour(cat);
              const coverImg = MOOD_COVERS[cat];
              return (
                <div
                  key={cat}
                  onClick={() => onSelectCategory && onSelectCategory(cat)}
                  className={`group relative overflow-hidden rounded-2xl cursor-pointer anim-section stagger-${Math.min(index + 1, 8)} border border-white/5 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
                  style={{ minHeight: "160px" }}
                >
                  {coverImg ? (
                    <div className="absolute inset-0">
                      <img src={coverImg} alt={cat} className="w-full h-full object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-500" style={{ filter: "grayscale(40%) contrast(1.1) sepia(0.3)" }} />
                    </div>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${mood.bg}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="relative z-10 h-full flex flex-col justify-between p-4" style={{ minHeight: "160px" }}>
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] text-white/50">0{index + 1}</span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[#e29d8f] text-[#0c000a]">
                        <Play className="w-3 h-3 fill-current translate-x-px" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display text-xl md:text-2xl text-white tracking-wider leading-tight group-hover:text-[#f5bcaf] transition-colors">{mood.label}</h3>
                      <p className="text-[11px] text-white/50 font-mono mt-1">{count} songs</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
