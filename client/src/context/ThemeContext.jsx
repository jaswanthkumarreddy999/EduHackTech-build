// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Modes: 'learning' (default) or 'competition'
  const [mode, setMode] = useState('learning');

  // Dynamic values based on mode
  const theme = {
    mode,
    // Base color for text/borders
    primary: mode === 'learning' ? 'text-learn-600' : 'text-comp-600',
    // Background color for buttons/banners
    bgPrimary: mode === 'learning' ? 'bg-learn-600' : 'bg-comp-600',
    // Light background for tags/sections
    bgLight: mode === 'learning' ? 'bg-learn-50' : 'bg-comp-50',
    // Hover states
    hover: mode === 'learning' ? 'hover:bg-learn-900' : 'hover:bg-comp-900',
    
    toggleMode: () => setMode((prev) => (prev === 'learning' ? 'competition' : 'learning')),
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);