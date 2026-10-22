import { useAppTheme } from '@/context/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  try {
    const { theme } = useAppTheme();
    return theme;
  } catch {
    return 'light';
  }
}
