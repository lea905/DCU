import React from 'react';
import { MediaCard } from './MediaCard';

export function MediaGrid({ mediaList, watchedItems, onToggleWatch }) {
  if (mediaList.length === 0) {
    return (
      <div className="empty-state">
        <h2>Aucune œuvre trouvée</h2>
        <p>Essayez de modifier vos filtres ou votre recherche.</p>
      </div>
    );
  }

  return (
    <div className="media-grid">
      {mediaList.map((media) => (
        <MediaCard
          key={media.id}
          media={media}
          isWatched={watchedItems.includes(media.id)}
          onToggleWatch={onToggleWatch}
        />
      ))}
    </div>
  );
}
