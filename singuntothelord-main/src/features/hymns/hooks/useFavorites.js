import { useCallback } from 'react';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage';

export const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage('hymnFavorites', []);

  const toggleFavorite = useCallback((hymnId) => {
    setFavorites(prev =>
      prev.includes(hymnId)
        ? prev.filter(id => id !== hymnId)
        : [...prev, hymnId]
    );
  }, [setFavorites]);

  const isFavorite = useCallback((hymnId) => {
    return favorites.includes(hymnId);
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
};