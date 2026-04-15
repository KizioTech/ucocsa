import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../shared/hooks/useLocalStorage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useLocalStorage('hymnTheme', false);
  const [fontSize, setFontSize] = useLocalStorage('hymnFontSize', 16);

  const value = {
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};