import { Theme } from '../types';

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#059669', // 翠綠色 - focus效果（山林）
    secondary: '#D97706', // 琥珀色 - hover效果（沙色/土壤）
    tertiary: '#6B7280', // 石灰色 - 預設顏色（岩石）
    background: '#FEFDF8', // 米白色（自然紙張色）
    surface: '#F7F5F0', // 淺沙色（戶外帳篷色）
    text: '#1C2B1F', // 深綠色（樹幹色）
    textSecondary: '#52525B', // 灰綠色（樹影色）
    border: '#D6D3C7', // 淺褐色（乾草色）
    trackDefault: '#6B7280', // tertiary
    trackHover: '#D97706', // secondary
    trackFocus: '#059669', // primary
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#F87171', // 紅色 - focus效果
    secondary: '#FBBF24', // 橙色 - hover效果
    tertiary: '#9CA3AF', // 灰色 - 預設顏色
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    trackDefault: '#9CA3AF', // tertiary
    trackHover: '#FBBF24', // secondary
    trackFocus: '#F87171', // primary
  },
};

export const themes = [lightTheme, darkTheme];