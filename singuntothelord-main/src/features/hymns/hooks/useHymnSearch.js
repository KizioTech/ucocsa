import { useMemo } from 'react';

export const useHymnSearch = (hymns, searchTerm, category) => {
  return useMemo(() => {
    return hymns.filter(hymn => {
      const matchesSearch = !searchTerm ||
        hymn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hymn.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hymn.firstLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hymn.id.toString() === searchTerm;

      const matchesCategory = !category || hymn.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [hymns, searchTerm, category]);
};