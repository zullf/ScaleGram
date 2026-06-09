import { NavigationContainer } from '@react-navigation/native';

import { appThemes } from '../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import AppDrawer from './AppDrawer';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const themeMode = useThemeStore((state) => state.themeMode);

  return (
    <NavigationContainer theme={appThemes[themeMode]}>
     {/* {isAuthenticated ? <AppDrawer /> : <AuthStack />} */}
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
