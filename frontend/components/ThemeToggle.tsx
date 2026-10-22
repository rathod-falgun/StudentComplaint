import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
  showLabel?: boolean;
  style?: any;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  compact = false,
  showLabel = false,
  style,
}) => {
  const { theme, isDark, toggleTheme, colors } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={toggleTheme}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1C1C26' : '#F2EDE4',
          borderColor: isDark ? '#2D2D3D' : '#E2DDD2',
        },
        compact && styles.containerCompact,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      accessibilityHint="Toggles between creamy light mode and dark mode"
      {...(Platform.OS === 'web'
        ? ({ title: `Switch to ${isDark ? 'Light' : 'Dark'} mode` } as any)
        : {})}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: isDark ? '#262638' : '#FFFFFF',
            shadowColor: isDark ? '#000000' : '#172033',
          },
        ]}
      >
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={compact ? 15 : 17}
          color={isDark ? '#60A5FA' : '#D97706'}
        />
      </View>

      {showLabel && (
        <Text
          style={[
            styles.label,
            { color: isDark ? '#E2E8F0' : '#3D3833' },
          ]}
        >
          {isDark ? 'Dark' : 'Light'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 22,
    borderWidth: 1,
    gap: 6,
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.2s ease' } as any,
      default: {},
    }),
  },
  containerCompact: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 20,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)' } as any,
      default: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
      },
    }),
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    paddingRight: 4,
  },
});

export default ThemeToggle;
