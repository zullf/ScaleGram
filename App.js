import React from 'react';
import AppProvider from './src/app/AppProvider';
import RootNavigator from './src/presentation/navigation/RootNavigator';

export default function App() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}