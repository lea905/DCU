'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MediaListItem } from './MediaListItem';
import { Modal } from './Modal';
import { Media } from '@prisma/client';
import { signIn, signOut } from 'next-auth/react';

export default function WatchOrderApp({ 
  initialMedia, 
  serverProgress, 
  isLoggedIn 
}: { 
  initialMedia: Media[], 
  serverProgress: string[],
  isLoggedIn: boolean 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = searchParams.get('sort') || 'release';
  const hideWatched = searchParams.get('hide') === '1';
  const tab = searchParams.get('tab') || 'watch-order'; // 'watch-order' | 'news'
  const universesParam = searchParams.getAll('universe');
  const canonParam = searchParams.get('canon'); 
  
  const [watchedItems, setWatchedItems] = useState<string[]>(serverProgress);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // Sync logic
  useEffect(() => {
    const local = localStorage.getItem('dcu_watched');
    const localItems: string[] = local ? JSON.parse(local) : [];

    if (isLoggedIn) {
      // If logged in but local exists and has items not in server, we should import them.
      // For simplicity, we just merge them and send them to the server if missing.
      const missingOnServer = localItems.filter(id => !serverProgress.includes(id));
      if (missingOnServer.length > 0) {
        // Send to server
        missingOnServer.forEach(id => {
          fetch('/api/progress', {
            method: 'POST',
            body: JSON.stringify({ mediaId: id, watched: true }),
            headers: { 'Content-Type': 'application/json' }
          });
        });
        setWatchedItems(Array.from(new Set([...serverProgress, ...localItems])));
      } else {
        setWatchedItems(serverProgress);
      }
      // Clear local storage after import
      localStorage.removeItem('dcu_watched');
    } else {
      setWatchedItems(localItems);
    }
  }, [isLoggedIn, serverProgress]);

  const toggleWatch = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isNowWatched = !watchedItems.includes(id);
    
    let newWatched;
    if (isNowWatched) {
      newWatched = [...watchedItems, id];
    } else {
      newWatched = watchedItems.filter(i => i !== id);
    }
    
    setWatchedItems(newWatched);

    if (isLoggedIn) {
      await fetch('/api/progress', {
        method: 'POST',
        body: JSON.stringify({ mediaId: id, watched: isNowWatched }),
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      localStorage.setItem('dcu_watched', JSON.stringify(newWatched));
    }
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

  // Split media
  const watchOrderMedia = useMemo(() => initialMedia.filter(m => m.releaseDate && m.status !== 'In Development'), [initialMedia]);
  const newsMedia = useMemo(() => initialMedia.filter(m => !m.releaseDate || m.status === 'In Development'), [initialMedia]);

  const displayedMedia = useMemo(() => {
    let result = tab === 'watch-order' ? [...watchOrderMedia] : [...newsMedia];

    if (universesParam.length > 0) {
      result = result.filter(m => universesParam.includes(m.universe));
    }
    if (canonParam === 'true') result = result.filter(m => m.canon);
    if (canonParam === 'false') result = result.filter(m => !m.canon);

    if (hideWatched && tab === 'watch-order') {
      result = result.filter(m => !watchedItems.includes(m.id));
    }

    result.sort((a, b) => {
      if (sort === 'release') return a.releaseOrder - b.releaseOrder;
      return a.chronologicalOrder - b.chronologicalOrder;
    });

    return result;
  }, [watchOrderMedia, newsMedia, tab, universesParam, canonParam, hideWatched, watchedItems, sort]);

  const percentage = watchOrderMedia.length > 0 
    ? Math.round((watchedItems.length / watchOrderMedia.length) * 100) 
    : 0;

  return (
    <>
      <header className="header">
        <h1>DCU Tracker</h1>
        <div style={{ marginTop: '1rem' }}>
          {isLoggedIn ? (
             <button onClick={() => signOut()} className="auth-btn">Se déconnecter</button>
          ) : (
             <button onClick={() => signIn('github')} className="auth-btn">Se connecter via GitHub</button>
          )}
        </div>
      </header>

      {tab === 'watch-order' && (
        <div className="intro-metrics glass-panel">
          <div className="intro-metric">
            <span className="intro-metric-value">{percentage}%</span>
            <span className="intro-metric-label">Complété</span>
          </div>
          <div className="intro-metric">
            <span className="intro-metric-value">{watchedItems.length}</span>
            <span className="intro-metric-label">Vus</span>
          </div>
          <div className="intro-metric">
            <span className="intro-metric-value">{watchOrderMedia.length - watchedItems.length}</span>
            <span className="intro-metric-label">Restants</span>
          </div>
        </div>
      )}

      <div className="tabs-container">
        <button 
          className={`tab-btn ${tab === 'watch-order' ? 'active' : ''}`}
          onClick={() => updateUrlParams('tab', 'watch-order')}
        >
          Watch Order
        </button>
        <button 
          className={`tab-btn ${tab === 'news' ? 'active' : ''}`}
          onClick={() => updateUrlParams('tab', 'news')}
        >
          News & Upcoming
        </button>
      </div>

      <div className="controls" style={{ marginTop: '1rem' }}>
        <button className={`sort-btn ${sort === 'release' ? 'active' : ''}`} onClick={() => updateUrlParams('sort', 'release')}>
          Sortie
        </button>
        <button className={`sort-btn ${sort === 'chronological' ? 'active' : ''}`} onClick={() => updateUrlParams('sort', 'chronological')}>
          Chronologie
        </button>
      </div>

      <div className="filters-section">
        {['DCU', 'DCEU', 'Elseworlds'].map(u => (
          <button key={u} className={`filter-chip ${universesParam.includes(u) ? 'active' : ''}`} onClick={() => toggleUniverse(u)}>
            {u}
          </button>
        ))}
        <button className={`filter-chip ${canonParam === 'true' ? 'active' : ''}`} onClick={() => updateUrlParams('canon', canonParam === 'true' ? null : 'true')}>
          Canon Only
        </button>
        {tab === 'watch-order' && (
          <button className={`filter-chip ${hideWatched ? 'active' : ''}`} onClick={() => updateUrlParams('hide', hideWatched ? null : '1')}>
            {hideWatched ? 'Afficher les vus' : 'Masquer les vus'}
          </button>
        )}
      </div>

      <div className="media-list">
        {displayedMedia.map(media => (
          <MediaListItem 
            key={media.id} 
            media={media} 
            isWatched={watchedItems.includes(media.id)}
            onToggleWatch={toggleWatch}
            onClick={() => setSelectedMedia(media)}
          />
        ))}
        {displayedMedia.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>Aucune œuvre trouvée avec ces filtres.</p>
        )}
      </div>

      {selectedMedia && (
        <Modal media={selectedMedia} onClose={() => setSelectedMedia(null)} />
      )}
    </>
  );
}
