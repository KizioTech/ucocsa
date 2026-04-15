import React from 'react';
import { categories } from '../../data/categories';
import { useTheme } from '../../context/ThemeContext';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const { darkMode } = useTheme();

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      <button
        onClick={() => onCategoryChange('')}
        className={`px-4 py-2 rounded-full transition-colors ${selectedCategory === ''
          ? 'bg-blue-600 text-white'
          : darkMode
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
      >
        All
      </button>
      {Object.entries(categories).map(([category, { icon: Icon, color }]) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-full transition-colors flex items-center space-x-2 ${selectedCategory === category
            ? 'bg-blue-600 text-white'
            : darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span>{category}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;