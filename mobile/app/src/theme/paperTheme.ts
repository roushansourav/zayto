import { MD3LightTheme as DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import { tokens } from './tokens';

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: tokens.colors.primary,
    secondary: tokens.colors.secondary,
    surface: tokens.colors.surfaceLight,
    background: tokens.colors.surfaceLight,
    outline: tokens.colors.dividerLight,
    onSurface: tokens.colors.textPrimaryLight
  },
  roundness: tokens.radius
} as const;

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: tokens.colors.primary,
    secondary: tokens.colors.secondary,
    surface: tokens.colors.surfaceDark,
    background: tokens.colors.surfaceDark,
    outline: tokens.colors.dividerDark,
    onSurface: tokens.colors.textPrimaryDark
  },
  roundness: tokens.radius
} as const;
