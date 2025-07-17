import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  const [primary, setPrimary] = useState('#2ecc71');

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    mode,
    primary,
    toggleMode,
    setPrimary,
    colors: {
      primary: '#2ecc71',
      secondary: '#27ae60',
      background: mode === 'light' ? '#f8faf8' : '#1a1a1a',
      surface: mode === 'light' ? '#ffffff' : '#2d2d2d',
      text: mode === 'light' ? '#333333' : '#ffffff',
      textSecondary: mode === 'light' ? '#666666' : '#cccccc',
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
