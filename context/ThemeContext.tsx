import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // This function runs only once on initial load
    if (typeof window === 'undefined') return 'light'; // Server-side rendering safety
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme as Theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // This effect applies the theme to the HTML tag and localStorage whenever it changes
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
    
    // Update the mobile address bar color
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#000000' : '#fafafa');
  }, [theme]);

  // This effect listens for OS-level theme changes (e.g., sunrise/sunset)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only change if the user has NOT manually overridden the theme
      if (!localStorage.getItem('theme-manual-override')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    // When a user clicks the button, we set an override flag
    localStorage.setItem('theme-manual-override', 'true');
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
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