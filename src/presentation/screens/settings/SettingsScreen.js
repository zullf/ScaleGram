import { Button, StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

export default function SettingsScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const toggleThemeMode = useThemeStore((state) => state.toggleThemeMode);
  const colors = appThemes[themeMode].colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      <Text style={[styles.description, { color: colors.mutedText }]}>
        Theme aktif: {themeMode}
      </Text>
      <Button title="Toggle Theme" onPress={toggleThemeMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
});
