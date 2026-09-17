import React, { useState } from 'react';
import { getAutoCover } from '../lib/covers';

interface SongCoverProps {
  url?: string | null;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  category?: string | null;
}

export const SongCover: React.FC<SongCoverProps> = ({
  url,
  alt,
  className = '',
  category,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    return getAutoCover(alt, category, url);
  });
  const [errorCount, setErrorCount] = useState<number>(0);

  const handleError = () => {
    if (errorCount === 0) {
      // Try fallback from curated pool
      setErrorCount(1);
      setImgSrc(getAutoCover(alt, category, null));
    }
  };

  return (
    <div className={`relative overflow-hidden bg-[#160d13] ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        className="w-full h-full object-cover select-none pointer-events-none"
        loading="lazy"
      />
      {/* Subtle warm rose gradient overlay for editorial consistency */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
