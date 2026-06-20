import { NavigationContainer } from '@react-navigation/native';

import { appThemes } from '../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const themeMode = useThemeStore((state) => state.themeMode);

  return (
    <NavigationContainer theme={appThemes[themeMode]}>
     {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
