import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../shared/hooks/useLocalStorage';

export const HymnContext = createContext();

export const HymnProvider = ({ children }) => {
  const [favorites, setFavorites] = useLocalStorage('hymnFavorites', []);
  const [recent, setRecent] = useLocalStorage('hymnRecent', []);
  const [playlists, setPlaylists] = useLocalStorage('hymnPlaylists', []);

  const toggleFavorite = useCallback((hymnId) => {
    setFavorites(prev =>
      prev.includes(hymnId)
        ? prev.filter(id => id !== hymnId)
        : [...prev, hymnId]
    );
  }, [setFavorites]);

  const addToRecent = useCallback((hymn) => {
    setRecent(prev =>
      [hymn, ...prev.filter(h => h.id !== hymn.id)].slice(0, 5)
    );
  }, [setRecent]);

  const value = {
    favorites,
    toggleFavorite,
    recent,
    addToRecent,
    playlists,
    setPlaylists,
  };

  return (
    <HymnContext.Provider value={value}>
      {children}
    </HymnContext.Provider>
  );
};

export const useHymnContext = () => {
  const context = useContext(HymnContext);
  if (!context) {
    throw new Error('useHymnContext must be used within HymnProvider');
  }
  return context;
};