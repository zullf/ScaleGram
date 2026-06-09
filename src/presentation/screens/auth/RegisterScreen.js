import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

export default function RegisterScreen({ navigation }) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { register, isLoading, error, clearError } = useAuthStore();
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;

  const handleRegister = async () => {
    clearError();
    try {
      await register(email, password, nama);
      navigation.navigate('Login');
    } catch (e) {
      console.log('Register gagal:', e?.message || e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Daftar ScaleGram</Text>

      {isLoading && <ActivityIndicator size="large" color="#007AFF" style={{ marginBottom: 12 }} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap"
          placeholderTextColor="#8E8E93"
          value={nama}
          onChangeText={setNama}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8E8E93"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8E8E93"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={isLoading}>
          <Text style={styles.buttonText}>Daftar Sekarang</Text>
        </TouchableOpacity>

        <Button title="Kembali ke Login" onPress={() => { clearError(); navigation.goBack(); }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24 },
  formContainer: { width: '100%', backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16 },
  input: { height: 50, borderColor: '#E5E5EA', borderWidth: 1, borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, backgroundColor: '#FAFAFA', fontSize: 16, color: '#1c1c1f' },
  primaryButton: { backgroundColor: '#007AFF', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#FF3B30', marginVertical: 10, textAlign: 'center', fontWeight: '500' }
});
