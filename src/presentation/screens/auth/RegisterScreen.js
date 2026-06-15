import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuthStore } from '../../../store/authStore';

const logoImage = require('../../../../assets/logo.jpg');

export default function RegisterScreen({ navigation }) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, isLoading, error, clearError } = useAuthStore();

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <View style={styles.container}>
        <Image source={logoImage} style={styles.logo} resizeMode="contain" />

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Buat Akun</Text>
            <Text style={styles.subtitle}>Daftar untuk mulai menggunakan ScaleGram</Text>
          </View>

          {isLoading && <ActivityIndicator size="large" color="#4D49DF" style={styles.loader} />}
          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.formContainer}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Bima"
              placeholderTextColor="#B8B4C7"
              value={nama}
              onChangeText={setNama}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="bima@gmail.com"
              placeholderTextColor="#B8B4C7"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#B8B4C7"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((current) => !current)}
                activeOpacity={0.7}
              >
                <View style={styles.eyeIcon}>
                  <View style={[styles.eyePupil, showPassword && styles.eyePupilActive]} />
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Daftar Sekarang</Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Sudah punya akun?</Text>
              <TouchableOpacity
                onPress={() => {
                  clearError();
                  navigation.goBack();
                }}
              >
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#FCF8FF',
    paddingHorizontal: 14,
    paddingTop: 24,
    paddingBottom: 14,
  },
  logo: {
    width: 132,
    height: 42,
    marginTop: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    color: '#1D1B26',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#5D596C',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  loader: { marginBottom: 12 },
  formContainer: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  label: {
    color: '#282433',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    height: 44,
    borderColor: '#C7C0E1',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 14,
    backgroundColor: '#FAF8FF',
    fontSize: 13,
    color: '#1D1B26',
  },
  passwordField: {
    height: 44,
    borderColor: '#C7C0E1',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FAF8FF',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 21,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#1D1B26',
  },
  eyeButton: {
    minWidth: 46,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  eyeIcon: {
    width: 18,
    height: 12,
    borderColor: '#5D596C',
    borderWidth: 1.4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5D596C',
  },
  eyePupilActive: { backgroundColor: '#4D49DF' },
  primaryButton: {
    backgroundColor: '#4D49DF',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4D49DF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    color: '#5D596C',
    fontSize: 12,
    marginRight: 8,
  },
  loginLink: {
    color: '#4D49DF',
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});
