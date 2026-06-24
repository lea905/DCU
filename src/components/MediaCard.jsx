import React from 'react';

export function MediaCard({ media, isWatched, onToggleWatch }) {
  const getUniverseClass = (universe) => {
    const u = universe.toLowerCase();
    if (u.includes('dceu')) return 'dceu';
    if (u.includes('dcu')) return 'dcu';
    if (u.includes('arrowverse')) return 'arrowverse';
    if (u.includes('tomorrowverse')) return 'tomorrowverse';
    return 'elseworlds';
  };

  // Convert date format
  const releaseYear = new Date(media.releaseDate).getFullYear();

  return (
    <div className={`media-card-horizontal ${isWatched ? 'watched' : ''}`} onClick={() => onToggleWatch(media.id)}>
      <div className="card-poster-wrapper">
        {media.posterUrl ? (
          <img src={media.posterUrl} alt={media.title} className="poster-img" loading="lazy" />
        ) : (
          <div className="poster-fallback">DC</div>
        )}
      </div>
      
      <div className="card-info">
        <div className="card-header">
          <h3 className="card-title">{media.title}</h3>
          <span className="card-year">{releaseYear}</span>
        </div>
        
        <div className="card-details">
          <span className="duration">{media.duration} min</span>
          <span className="dot">•</span>
          <span className={`badge ${getUniverseClass(media.universe)}`}>{media.universe}</span>
          {!media.canon && <span className="badge non-canon">Non-Canon</span>}
          <span className="badge format">{media.type}</span>
        </div>
      </div>

      <div className="card-action">
        <div className={`custom-checkbox ${isWatched ? 'checked' : ''}`}>
          {isWatched && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
