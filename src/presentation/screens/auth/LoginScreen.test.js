import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';
import { useAuthStore } from '../../../store/authStore';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

// 1. MOCKING DEPENDENCIES (Menipu Zustand & Hooks)
jest.mock('../../../store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../hooks/useGoogleAuth', () => ({
  useGoogleAuth: jest.fn(),
}));

// Meredam peringatan UI yang tidak relevan dengan tes integrasi
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: View };
});
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('Integration Test: Alur Login ke Dashboard', () => {
  const mockLogin = jest.fn();
  const mockNavigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();

    // 2. SETUP KONDISI AWAL (Belum Login)
    useAuthStore.mockReturnValue({
      login: mockLogin,
      resetPassword: jest.fn(),
      googleSignInStore: jest.fn(),
      user: null, // Kondisi belum login agar form tampil
      isLoading: false,
      error: null,
      logout: jest.fn(),
      clearError: jest.fn(),
      deleteAccount: jest.fn(),
    });

    useGoogleAuth.mockReturnValue({
      isGoogleLoading: false,
      signInWithGoogle: jest.fn(),
      signOutGoogle: jest.fn(),
      revokeGoogleAccess: jest.fn(),
    });
  });

  it('Langkah 1: Harus merender form login dengan benar', () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByText('Selamat Datang')).toBeTruthy();
    expect(getByPlaceholderText('bima@gmail.com')).toBeTruthy();
  });

  it('Langkah 2: Harus memicu proses login saat user mengetik email dan menekan tombol Login', async () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    // User berinteraksi mengetik email
    const emailInput = getByPlaceholderText('bima@gmail.com');
    fireEvent.changeText(emailInput, 'asdos@scalegram.com');

    // User menekan tombol
    const tombolLogin = getByText('Login');
    fireEvent.press(tombolLogin);

    // Memastikan integrasi tombol dengan Zustand store berjalan sukses
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('Langkah 3: Harus bisa berpindah ke layar Register', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    const tombolRegister = getByText('Register');
    fireEvent.press(tombolRegister);

    // Memastikan integrasi navigasi berjalan sukses
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });
});