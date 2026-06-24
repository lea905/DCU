import React from 'react';

export function Header({ 
  mediaList, 
  watchedItems, 
  searchQuery, 
  onSearchChange, 
  sortBy, 
  onSortChange 
}) {
  const totalMedia = mediaList.length;
  const watchedCount = watchedItems.length;
  const percentage = totalMedia > 0 ? Math.round((watchedCount / totalMedia) * 100) : 0;

  const totalTime = mediaList.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const watchedTime = mediaList
    .filter(m => watchedItems.includes(m.id))
    .reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const remainingTime = totalTime - watchedTime;

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <header className="header">
      <h1>MCU Viewing Order</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Adaptation DC Universe</p>
      
      <div className="intro-metrics">
        <div className="intro-metric">
          <span className="intro-metric-value">{percentage}%</span>
          <span className="intro-metric-label">Complete</span>
        </div>
        <div className="intro-metric">
          <span className="intro-metric-value">{formatTime(watchedTime)}</span>
          <span className="intro-metric-label">Time Spent Watching</span>
        </div>
        <div className="intro-metric">
          <span className="intro-metric-value">{formatTime(remainingTime)}</span>
          <span className="intro-metric-label">Remaining</span>
        </div>
      </div>

      <div className="controls">
        <input 
          type="text" 
          className="search-input"
          placeholder="Search..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        
        <div className="sort-toggle">
          <button 
            className={`sort-btn ${sortBy === 'release' ? 'active' : ''}`}
            onClick={() => onSortChange('release')}
          >
            Release Date
          </button>
          <button 
            className={`sort-btn ${sortBy === 'chronological' ? 'active' : ''}`}
            onClick={() => onSortChange('chronological')}
          >
            Chronological
          </button>
        </div>
      </div>
    </header>
  );
}
