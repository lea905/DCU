import { useState, useEffect } from 'react';

/**
 * Custom hook pour gérer le localStorage
 * @param {string} key - La clé dans le localStorage
 * @param {any} initialValue - La valeur par défaut si la clé n'existe pas
 */
export function useLocalStorage(key, initialValue) {
  // Initialisation du state avec la valeur du localStorage ou la valeur initiale
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erreur lors de la lecture de la clé "${key}" dans le localStorage`, error);
      return initialValue;
    }
  });

  // Mise à jour du localStorage à chaque changement de la valeur
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Erreur lors de l'écriture de la clé "${key}" dans le localStorage`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
