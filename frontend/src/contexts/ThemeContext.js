import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Force dark theme
    setTheme('dark');
    document.documentElement.className = 'dark';
    localStorage.setItem('theme', 'dark');
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // Always keep dark
      document.documentElement.className = 'dark';
      localStorage.setItem('theme', 'dark');
    }
  }, [isLoaded]);

  const toggleTheme = () => {
    // No-op: locked to dark theme
    setTheme('dark');
    document.documentElement.className = 'dark';
  };

  const setSpecificTheme = () => {
    // No-op to prevent switching themes
    setTheme('dark');
    document.documentElement.className = 'dark';
  };

  const value = {
    theme,
    toggleTheme,
    setSpecificTheme,
    isLoaded
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 