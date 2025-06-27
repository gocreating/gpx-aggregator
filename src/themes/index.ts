import { Theme } from '../types';

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    trackDefault: '#3B82F6',
    trackHover: '#F59E0B', // 橙色hover效果
    trackFocus: '#EF4444', // 紅色focus效果
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#60A5FA',
    secondary: '#9CA3AF',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    trackDefault: '#60A5FA',
    trackHover: '#FBBF24', // 橙色hover效果
    trackFocus: '#F87171', // 紅色focus效果
  },
};

export const themes = [lightTheme, darkTheme];