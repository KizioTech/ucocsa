import React from 'react';
import { ArrowLeft, Moon, Sun, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const NavigationHeader = ({
  currentView,
  onBack,
  showAppInfoModal,
  isOnline
}) => {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <header
      role="banner"
      aria-label="Main navigation"
      className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {currentView !== 'home' && (
              <button
                onClick={onBack}
                aria-label="Go back to home"
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <h1
                className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
              >
                SING UNTO THE LORD
              </h1>
              <button
                onClick={showAppInfoModal}
                aria-label="Show app information"
                className={`p-3 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <Info className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isOnline && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Offline
              </span>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={darkMode}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
            >
              {darkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;