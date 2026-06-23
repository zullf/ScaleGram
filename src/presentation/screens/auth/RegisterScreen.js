import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import AppButton from '../../components/common/AppButton';
import AuthFormContainer from '../../components/auth/AuthFormContainer';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthLinkRow from '../../components/auth/AuthLinkRow';
import AuthTextField from '../../components/auth/AuthTextField';
import PasswordField from '../../components/auth/PasswordField';
import { useAuthStore } from '../../../store/authStore';

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
      navigation.replace('Login');
    } catch (e) {
      console.log('Register gagal:', e?.message || e);
    }
  };

  return (
    <AuthLayout>
      <AuthFormContainer
        title="Buat Akun"
        subtitle="Daftar untuk mulai menggunakan ScaleGram"
        loading={isLoading}
        error={error}
      >
        <AuthTextField
          label="Nama Lengkap"
          placeholder="Bima"
          value={nama}
          onChangeText={setNama}
        />
        <AuthTextField
          label="Email Address"
          placeholder="bima@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <PasswordField
          value={password}
          onChangeText={setPassword}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((current) => !current)}
          style={styles.passwordField}
        />

        <AppButton
          title="Daftar Sekarang"
          onPress={handleRegister}
          disabled={isLoading}
          style={styles.primaryButton}
        />

        <AuthLinkRow
          prompt="Sudah punya akun?"
          linkText="Login"
          onPress={() => {
            clearError();
            navigation.goBack();
          }}
        />
      </AuthFormContainer>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  passwordField: {
    marginBottom: 21,
  },
  primaryButton: {
    height: 44,
    borderRadius: 8,
    marginBottom: 24,
  },
});
