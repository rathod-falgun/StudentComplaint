import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, ThemeMode, Themes, darkTheme, lightTheme } from '@/constants/theme';

const THEME_STORAGE_KEY = '@app_theme_mode';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  colors: lightTheme,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous web hydration helper to prevent theme flickering on web
  const getInitialTheme = (): ThemeMode => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
          return saved;
        }
      } catch {}
    }
    return 'light';
  };

  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  // Load from persistent storage on mount (AsyncStorage / SecureStore)
  useEffect(() => {
    let isMounted = true;
    const loadSavedTheme = async () => {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          const webSaved = window.localStorage.getItem(THEME_STORAGE_KEY);
          if (webSaved === 'dark' || webSaved === 'light') {
            if (isMounted) setThemeState(webSaved);
            return;
          }
        }

        const nativeSaved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (nativeSaved === 'dark' || nativeSaved === 'light') {
          if (isMounted) setThemeState(nativeSaved);
        }
      } catch (e) {
        console.log('Error reading saved theme:', e);
      }
    };

    loadSavedTheme();
    return () => {
      isMounted = false;
    };
  }, []);

  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
      }
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.log('Error saving theme preference:', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';
  const colors = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      colors,
      toggleTheme,
      setTheme,
    }),
    [theme, isDark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
