import { Button, StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

export default function RegisterScreen({ navigation }) {
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Register</Text>
      <Text style={[styles.description, { color: colors.mutedText }]}>
        Placeholder register. Form dan Firebase Auth dibuat di tahap fitur.
      </Text>
      <Button title="Kembali ke Login" onPress={() => navigation.goBack()} />
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
    textAlign: 'center',
    marginBottom: 24,
  },
});
