import React from 'react';

export function MediaCard({ media, isWatched, onToggleWatch }) {
  // Déterminer la classe CSS du badge univers
  const getUniverseClass = (universe) => {
    const u = universe.toLowerCase();
    if (u.includes('dceu')) return 'dceu';
    if (u.includes('dcu')) return 'dcu';
    if (u.includes('arrowverse')) return 'arrowverse';
    if (u.includes('tomorrowverse')) return 'tomorrowverse';
    return 'elseworlds';
  };

  return (
    <div className={`media-card ${isWatched ? 'watched' : ''}`}>
      <div className="card-poster">
        <div className="card-poster-fallback">{media.title}</div>
        {media.posterUrl && (
          <img src={media.posterUrl} alt={`Affiche de ${media.title}`} loading="lazy" />
        )}
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{media.title}</h3>
        <div className="card-meta">
          <span>{new Date(media.releaseDate).getFullYear()}</span>
          <span>{media.duration} min</span>
        </div>
        
        <div className="card-badges">
          <span className={`badge ${getUniverseClass(media.universe)}`}>
            {media.universe}
          </span>
          <span className={`badge ${media.canon ? 'canon' : 'non-canon'}`}>
            {media.canon ? 'Canon' : 'Non-Canon'}
          </span>
          <span className="badge format">{media.type}</span>
        </div>

        <button 
          className={`watch-btn ${isWatched ? 'watched' : 'unwatched'}`}
          onClick={() => onToggleWatch(media.id)}
        >
          {isWatched ? '✓ Vue' : '+ Marquer comme vue'}
        </button>
      </div>
    </div>
  );
}
