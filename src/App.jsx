import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { MediaGrid } from './components/MediaGrid';
import { dcMedia } from './data/mockData';
import { useLocalStorage } from './hooks/useLocalStorage';
import './index.css';

function App() {
  // State pour les filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('release'); // 'release' ou 'chronological'
  const [filters, setFilters] = useState({
    universes: [],
    formats: [],
    canonicity: []
  });

  // Custom hook pour sauvegarder les œuvres vues
  const [watchedItems, setWatchedItems] = useLocalStorage('dcu_watched_items', []);

  // Fonction pour basculer l'état "vu" d'une œuvre
  const handleToggleWatch = (id) => {
    if (watchedItems.includes(id)) {
      setWatchedItems(watchedItems.filter(itemId => itemId !== id));
    } else {
      setWatchedItems([...watchedItems, id]);
    }
  };

  // Filtrage et Tri des données
  const filteredAndSortedMedia = useMemo(() => {
    let result = [...dcMedia];

    // Recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => item.title.toLowerCase().includes(query));
    }

    // Filtre Univers
    if (filters.universes.length > 0) {
      result = result.filter(item => filters.universes.includes(item.universe));
    }

    // Filtre Format
    if (filters.formats.length > 0) {
      result = result.filter(item => filters.formats.includes(item.type));
    }

    // Filtre Canonicité
    if (filters.canonicity.length > 0) {
      const wantCanon = filters.canonicity.includes('canon');
      const wantNonCanon = filters.canonicity.includes('non-canon');
      
      if (wantCanon && wantNonCanon) {
        // Garde tout (les deux sont sélectionnés)
      } else if (wantCanon) {
        result = result.filter(item => item.canon === true);
      } else if (wantNonCanon) {
        result = result.filter(item => item.canon === false);
      }
    }

    // Tri
    result.sort((a, b) => {
      if (sortBy === 'release') {
        return a.releaseOrder - b.releaseOrder;
      } else {
        return a.chronologicalOrder - b.chronologicalOrder;
      }
    });

    return result;
  }, [searchQuery, filters, sortBy]);

  return (
    <div className="app-container">
      <Header 
        totalMedia={dcMedia.length}
        watchedCount={watchedItems.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <main>
        <Filters 
          filters={filters} 
          onFilterChange={setFilters} 
        />
        
        <div style={{ marginTop: '2rem' }}>
          <MediaGrid 
            mediaList={filteredAndSortedMedia}
            watchedItems={watchedItems}
            onToggleWatch={handleToggleWatch}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
