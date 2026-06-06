import { StatusBar } from 'expo-status-bar';

import AppProvider from './src/app/AppProvider';
import RootNavigator from './src/presentation/navigation/RootNavigator';
import { useThemeStore } from './src/store/themeStore';

function AppStatusBar() {
  const themeMode = useThemeStore((state) => state.themeMode);

  return <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <AppProvider>
      <RootNavigator />
      <AppStatusBar />
    </AppProvider>
  );
}
