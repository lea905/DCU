'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MediaCard } from './MediaCard';
import { Modal } from './Modal';
import { Media } from '@prisma/client';

export default function WatchOrderApp({ initialMedia }: { initialMedia: Media[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL States
  const sort = searchParams.get('sort') || 'release';
  const hideWatched = searchParams.get('hide') === '1';
  
  // Custom multi-select logic from URL
  const universesParam = searchParams.getAll('universe');
  const canonParam = searchParams.get('canon'); // 'true' or 'false'
  
  const [watchedItems, setWatchedItems] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('dcu_watched');
    if (saved) setWatchedItems(JSON.parse(saved));
  }, []);

  const toggleWatch = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    let newWatched;
    if (watchedItems.includes(id)) {
      newWatched = watchedItems.filter(i => i !== id);
    } else {
      newWatched = [...watchedItems, id];
    }
    setWatchedItems(newWatched);
    localStorage.setItem('dcu_watched', JSON.stringify(newWatched));
  };

  const updateUrlParams = (key: string, value: string | string[] | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.delete(key);
      value.forEach(v => params.append(key, v));
    } else {
      params.set(key, value);
    }
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const toggleUniverse = (u: string) => {
    const current = [...universesParam];
    if (current.includes(u)) {
      updateUrlParams('universe', current.filter(x => x !== u));
    } else {
      updateUrlParams('universe', [...current, u]);
    }
  };

  const filteredMedia = useMemo(() => {
    let result = [...initialMedia];

    if (universesParam.length > 0) {
      result = result.filter(m => universesParam.includes(m.universe));
    }
    
    if (canonParam === 'true') result = result.filter(m => m.canon);
    if (canonParam === 'false') result = result.filter(m => !m.canon);

    if (hideWatched) {
      result = result.filter(m => !watchedItems.includes(m.id));
    }

    result.sort((a, b) => {
      if (sort === 'release') return a.releaseOrder - b.releaseOrder;
      return a.chronologicalOrder - b.chronologicalOrder;
    });

    return result;
  }, [initialMedia, universesParam, canonParam, hideWatched, watchedItems, sort]);

  const percentage = initialMedia.length > 0 
    ? Math.round((watchedItems.length / initialMedia.length) * 100) 
    : 0;

  return (
    <>
      <header className="header">
        <h1>DCU Viewing Order</h1>
      </header>

      <div className="intro-metrics glass-panel">
        <div className="intro-metric">
          <span className="intro-metric-value">{percentage}%</span>
          <span className="intro-metric-label">Complete</span>
        </div>
        <div className="intro-metric">
          <span className="intro-metric-value">{watchedItems.length}</span>
          <span className="intro-metric-label">Watched</span>
        </div>
        <div className="intro-metric">
          <span className="intro-metric-value">{initialMedia.length - watchedItems.length}</span>
          <span className="intro-metric-label">Remaining</span>
        </div>
      </div>

      <div className="controls">
        <button 
          className={`sort-btn ${sort === 'release' ? 'active' : ''}`}
          onClick={() => updateUrlParams('sort', 'release')}
        >
          Release Order
        </button>
        <button 
          className={`sort-btn ${sort === 'chronological' ? 'active' : ''}`}
          onClick={() => updateUrlParams('sort', 'chronological')}
        >
          Chronological
        </button>
      </div>

      <div className="filters-section">
        {['DCU', 'DCEU', 'Elseworlds'].map(u => (
          <button 
            key={u}
            className={`filter-chip ${universesParam.includes(u) ? 'active' : ''}`}
            onClick={() => toggleUniverse(u)}
          >
            {u}
          </button>
        ))}
        
        <button 
          className={`filter-chip ${canonParam === 'true' ? 'active' : ''}`}
          onClick={() => updateUrlParams('canon', canonParam === 'true' ? null : 'true')}
        >
          Canon Only
        </button>

        <button 
          className={`filter-chip ${hideWatched ? 'active' : ''}`}
          onClick={() => updateUrlParams('hide', hideWatched ? null : '1')}
        >
          {hideWatched ? 'Show Watched' : 'Hide Watched'}
        </button>
      </div>

      <div className="grid-posters">
        {filteredMedia.map(media => (
          <MediaCard 
            key={media.id} 
            media={media} 
            isWatched={watchedItems.includes(media.id)}
            onToggleWatch={toggleWatch}
            onClick={() => setSelectedMedia(media)}
          />
        ))}
      </div>

      {selectedMedia && (
        <Modal 
          media={selectedMedia} 
          onClose={() => setSelectedMedia(null)} 
        />
      )}
    </>
  );
}
