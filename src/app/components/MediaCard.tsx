import React from 'react';
import { Media } from '@prisma/client';

interface MediaCardProps {
  media: Media;
  isWatched: boolean;
  onToggleWatch: (e: React.MouseEvent, id: string) => void;
  onClick: () => void;
}

export function MediaCard({ media, isWatched, onToggleWatch, onClick }: MediaCardProps) {
  const getUniverseClass = (universe: string) => {
    const u = universe.toLowerCase();
    if (u.includes('dceu')) return 'dceu';
    if (u.includes('dcu')) return 'dcu';
    if (u.includes('arrowverse')) return 'arrowverse';
    return 'elseworlds';
  };

  return (
    <div 
      className={`poster-card ${isWatched ? 'watched' : ''}`}
      onClick={onClick}
    >
      {media.posterUrl ? (
        <img src={media.posterUrl} alt={media.title} className="poster-img" loading="lazy" />
      ) : (
        <div className="poster-fallback">DC</div>
      )}

      <div className="poster-overlay">
        <span className={`badge ${getUniverseClass(media.universe)}`}>{media.universe}</span>
        <h3 className="poster-title">{media.title}</h3>
      </div>

      <div 
        className={`poster-checkbox ${isWatched ? 'checked' : ''}`}
        onClick={(e) => onToggleWatch(e, media.id)}
      >
        {isWatched && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{width: '16px', height: '16px'}}>
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
    </div>
  );
}
