import { SafeAreaProvider } from 'react-native-safe-area-context';

import DependencyProvider from './DependencyProvider';

export default function AppProvider({ children }) {
  return (
    <SafeAreaProvider>
      <DependencyProvider>{children}</DependencyProvider>
    </SafeAreaProvider>
  );
}
