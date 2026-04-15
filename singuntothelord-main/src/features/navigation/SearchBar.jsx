import React, { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SearchBar = React.memo(({ searchTerm, onSearchChange }) => {
  const { darkMode } = useTheme();
  const inputRef = useRef(null);

  return (
    <div className="max-w-2xl mx-auto mb-6">
      <div role="search" aria-label="Search hymns" className="relative">
        <label htmlFor="search-input" className="sr-only">
          Search hymns by title, author, number, or first line
        </label>
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          placeholder="Search hymns..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search hymns"
          aria-describedby="search-description"
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode
            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
        />
        <span id="search-description" className="sr-only">
          Enter keywords to search through hymns
        </span>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.searchTerm === nextProps.searchTerm &&
         prevProps.onSearchChange === nextProps.onSearchChange;
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;