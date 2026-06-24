import React from 'react';
import { Media } from '@prisma/client';

interface MediaListItemProps {
  media: Media;
  isWatched: boolean;
  onToggleWatch: (e: React.MouseEvent, id: string) => void;
  onClick: () => void;
}

export function MediaListItem({ media, isWatched, onToggleWatch, onClick }: MediaListItemProps) {
  const getUniverseClass = (universe: string) => {
    const u = universe.toLowerCase();
    if (u.includes('dceu')) return 'dceu';
    if (u.includes('dcu')) return 'dcu';
    if (u.includes('arrowverse')) return 'arrowverse';
    return 'elseworlds';
  };

  const formattedDate = media.releaseDate 
    ? new Date(media.releaseDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    : 'À définir';

  return (
    <div className={`media-list-item ${isWatched ? 'watched' : ''}`} onClick={onClick}>
      <div className="media-list-left">
        <h3 className="media-title">{media.title}</h3>
        <div className="media-meta">
          <span className={`badge ${getUniverseClass(media.universe)}`}>{media.universe}</span>
          <span className="media-date">{formattedDate}</span>
          <span className="media-type">{media.type}</span>
        </div>
      </div>
      
      <div className="media-list-right">
        {media.status !== 'Released' && (
          <span className="media-status-badge">{media.status}</span>
        )}
        
        <button 
          className={`check-btn ${isWatched ? 'checked' : ''}`}
          onClick={(e) => onToggleWatch(e, media.id)}
          title={isWatched ? 'Marquer comme non vu' : 'Marquer comme vu'}
        >
          {isWatched ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{width: '14px', height: '14px'}}>
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
             <div className="check-empty"></div>
          )}
        </button>
      </div>
    </div>
  );
}
