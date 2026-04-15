import React from 'react';
import { Heart, Music } from 'lucide-react';
import { categories } from '../../../data/categories';
import { useTheme } from '../../../context/ThemeContext';
import { useHymnContext } from '../../../context/HymnContext';

const HymnCard = React.memo(({ hymn, onSelect }) => {
  const { darkMode } = useTheme();
  const { favorites, toggleFavorite } = useHymnContext();

  const CategoryIcon = categories[hymn.category]?.icon || Music;

  return (
    <article
      role="article"
      aria-labelledby={`hymn-title-${hymn.id}`}
      className={`p-6 rounded-lg border-2 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${darkMode
        ? 'bg-gray-800 border-gray-600 hover:border-blue-500'
        : 'bg-white border-gray-200 hover:border-blue-500'
        }`}
      onClick={() => onSelect(hymn)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
            {hymn.id}
          </div>
          <div className="flex items-center space-x-2">
            <CategoryIcon className={`h-5 w-5 ${categories[hymn.category]?.color || 'text-gray-500'}`} aria-hidden="true" />
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {hymn.category}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(hymn.id);
          }}
          aria-label={
            favorites.includes(hymn.id)
              ? `Remove ${hymn.title} from favorites`
              : `Add ${hymn.title} to favorites`
          }
          aria-pressed={favorites.includes(hymn.id)}
          className={`p-2 rounded-full transition-colors ${favorites.includes(hymn.id)
            ? 'text-red-500 hover:bg-red-50'
            : darkMode
              ? 'text-gray-400 hover:bg-gray-700'
              : 'text-gray-400 hover:bg-gray-100'
            }`}
        >
          <Heart
            className={`h-5 w-5 ${favorites.includes(hymn.id) ? 'fill-current' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <h3
        id={`hymn-title-${hymn.id}`}
        className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
      >
        {hymn.title}
      </h3>
      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        by {hymn.author}
      </p>
      <p className={`text-sm italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        "{hymn.firstLine}"
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {hymn.youtubeId && (
            <div className="flex items-center space-x-1 text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M10 16.5l6-4.5-6-4.5v9zm12-4.5c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10 10-4.477 10-10zm-2 0c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z" />
              </svg>
              <span className="text-xs">Video Available</span>
            </div>
          )}
        </div>
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {hymn.verses.length} verse{hymn.verses.length !== 1 ? 's' : ''}
        </div>
      </div>
    </article>
  );
}, (prevProps, nextProps) => {
  return prevProps.hymn.id === nextProps.hymn.id &&
         prevProps.onSelect === nextProps.onSelect;
});

HymnCard.displayName = 'HymnCard';

export default HymnCard;