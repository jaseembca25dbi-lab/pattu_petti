import React, { useState } from 'react';
import { Music2 } from 'lucide-react';

interface SongCoverProps {
  url?: string | null;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SongCover: React.FC<SongCoverProps> = ({
  url,
  alt,
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);

  // Icon sizing based on size prop
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  if (url && !hasError) {
    return (
      <img
        src={url}
        alt={alt}
        onError={() => setHasError(true)}
        className={`object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  // Stylish dark gradient placeholder with vinyl ring effect
  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-[#161c28] via-[#10141e] to-[#0a0d14] text-emerald-400/70 overflow-hidden select-none border border-white/5 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.15),transparent_70%)]" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
      <div className="relative z-10 flex flex-col items-center justify-center">
        <Music2 className={`${iconSizes[size]} text-emerald-400 drop-shadow`} />
      </div>
    </div>
  );
};
