import React from 'react';
import { Media } from '@prisma/client';

interface ModalProps {
  media: Media;
  onClose: () => void;
}

export function Modal({ media, onClose }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800 }}>{media.title}</h2>
          
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)' }}>
            <span>{media.releaseDate ? new Date(media.releaseDate).getFullYear() : 'TBA'}</span>
            <span>•</span>
            <span>{media.duration} min</span>
            <span>•</span>
            <span style={{ color: 'var(--color-accent-blue)' }}>{media.universe}</span>
          </div>

          <div style={{ marginTop: '1rem', lineHeight: '1.6' }}>
            <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Résumé</h4>
            <p>{media.summary || 'Aucun résumé disponible pour le moment. (Sera complété par le scraper).'}</p>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', gap: '1rem' }}>
            <span className="badge format" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              {media.type}
            </span>
            <span className={`badge ${media.canon ? 'dcu' : 'elseworlds'}`}>
              {media.canon ? 'Canon' : 'Non-Canon'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
