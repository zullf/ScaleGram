import {
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';

import { darkColors, lightColors } from './colors';

export const appThemes = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      ...lightColors,
      card: lightColors.surface,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      ...darkColors,
      card: darkColors.surface,
    },
  },
};
