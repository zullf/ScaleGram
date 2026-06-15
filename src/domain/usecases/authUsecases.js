import { authRepository } from '../../data/repositories/authRepositoryImpl';

export const authUsecases = {
  login: async (email, password) => {
    if (!email || !password) {
      throw new Error('Email dan password harus diisi.');
    }
    return await authRepository.login(email, password);
  },

  register: async (email, password, displayName) => {
    if (!email || !password || !displayName) {
      throw new Error('Semua field (nama, email, password) harus diisi.');
    }
    if (password.length < 6) {
      throw new Error('Password minimal harus 6 karakter.');
    }
    return await authRepository.register(email, password, displayName);
  },

  googleSignIn: async (idToken) => {
    if (!idToken) {
      throw new Error('Google ID Token tidak ditemukan.');
    }
    return await authRepository.googleSignIn(idToken);
  },

  logout: async () => {
    return await authRepository.logout();
  },

  resetPassword: async (email) => {
    if (!email) {
      throw new Error('Email harus diisi untuk mereset password.');
    }
    return await authRepository.resetPassword(email);
  },

  updateProfile: async (displayName) => {
    if (!displayName || displayName.trim() === '') {
      throw new Error('Nama tidak boleh kosong.');
    }
    return await authRepository.updateProfile(displayName);
  },

  deleteAccount: async () => {
    return await authRepository.deleteAccount();
  }
};