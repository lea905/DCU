import React from 'react';

export function Header({ 
  totalMedia, 
  watchedCount, 
  searchQuery, 
  onSearchChange, 
  sortBy, 
  onSortChange 
}) {
  const percentage = totalMedia > 0 ? Math.round((watchedCount / totalMedia) * 100) : 0;

  return (
    <header className="header">
      <h1>DC Universe Watch Order</h1>
      
      <div className="progress-container">
        <div className="progress-text">
          <span>Progression Globale</span>
          <span>{watchedCount} / {totalMedia} œuvres vues - {percentage}%</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="controls">
        <input 
          type="text" 
          className="search-input"
          placeholder="Rechercher un film ou une série..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        
        <div className="sort-toggle">
          <button 
            className={`sort-btn ${sortBy === 'release' ? 'active' : ''}`}
            onClick={() => onSortChange('release')}
          >
            Ordre de Sortie
          </button>
          <button 
            className={`sort-btn ${sortBy === 'chronological' ? 'active' : ''}`}
            onClick={() => onSortChange('chronological')}
          >
            Ordre Chronologique
          </button>
        </div>
      </div>
    </header>
  );
}
