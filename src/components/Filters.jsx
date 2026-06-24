import React from 'react';

export function Filters({ filters, onFilterChange }) {
  const universes = ['DCU', 'DCEU', 'Arrowverse', 'Elseworlds', 'DCAMU'];
  const formats = ['Movie', 'Series', 'Short'];
  const canonicity = [{ label: 'Canon', value: 'canon' }, { label: 'Non-Canon', value: 'non-canon' }];

  const toggleFilter = (category, value) => {
    const currentValues = filters[category];
    let newValues;
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    onFilterChange({ ...filters, [category]: newValues });
  };

  const isSelected = (category, value) => filters[category].includes(value);

  return (
    <section className="filters-section">
      <div className="filter-group">
        <span className="filter-label">Univers :</span>
        {universes.map(u => (
          <button 
            key={u}
            className={`filter-chip ${isSelected('universes', u) ? 'active' : ''}`}
            onClick={() => toggleFilter('universes', u)}
          >
            {u}
          </button>
        ))}
      </div>

      <div className="filter-group">
        <span className="filter-label">Format :</span>
        {formats.map(f => (
          <button 
            key={f}
            className={`filter-chip ${isSelected('formats', f) ? 'active' : ''}`}
            onClick={() => toggleFilter('formats', f)}
          >
            {f === 'Movie' ? 'Films' : f === 'Series' ? 'Séries' : 'Courts-métrages'}
          </button>
        ))}
      </div>

      <div className="filter-group">
        <span className="filter-label">Canonicité :</span>
        {canonicity.map(c => (
          <button 
            key={c.value}
            className={`filter-chip ${isSelected('canonicity', c.value) ? 'active' : ''}`}
            onClick={() => toggleFilter('canonicity', c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </section>
  );
}
