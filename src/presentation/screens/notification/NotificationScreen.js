import { StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

export default function NotificationScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Notification</Text>
      <Text style={[styles.description, { color: colors.mutedText }]}>
        Placeholder notifikasi.
      </Text>
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
  },
});
