import { Button, StyleSheet, Text, View } from 'react-native';

import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

export default function LoginScreen({ navigation }) {
  const setUser = useAuthStore((state) => state.setUser);
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>ScaleGram</Text>
      <Text style={[styles.description, { color: colors.mutedText }]}>
        Placeholder login. Firebase Auth belum dipanggil di tahap setup awal.
      </Text>
      <View style={styles.actions}>
        <Button
          title="Masuk Demo"
          onPress={() => setUser({ uid: 'demo-user', email: 'demo@scalegram.app' })}
        />
        <Button
          title="Buat Akun"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
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
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
});
