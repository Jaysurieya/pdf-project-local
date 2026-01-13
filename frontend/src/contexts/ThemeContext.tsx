import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      // If no theme is saved, default to light mode (no dark class)
      if (savedTheme === null) {
        document.documentElement.classList.remove('dark');
        return false;
      }
      const shouldUseDark = savedTheme === 'dark';
      if (shouldUseDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return shouldUseDark;
    }
    return false;
  });

  const toggleTheme = () => {
    const newDarkState = !isDark;
    if (newDarkState) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setIsDark(newDarkState);
  };

  // Sync theme changes across tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem('theme');
      const shouldUseDark = savedTheme === 'dark';
      
      if (shouldUseDark && !document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
      } else if (!shouldUseDark && document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
      }
      
      if (shouldUseDark !== isDark) {
        setIsDark(shouldUseDark);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};