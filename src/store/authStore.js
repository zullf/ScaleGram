import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authUsecases } from '../domain/usecases/authUsecases';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,        
      isAuthenticated: false, // 1. Tambahkan state default
      isLoading: false,  
      error: null,       

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authUsecases.login(email, password);
          // 2. Ubah isAuthenticated jadi true
          set({ user, isAuthenticated: true, isLoading: false }); 
        } catch (error) {
          set({ error: error.message, isLoading: false }); 
          throw error; 
        }
      },

      register: async (email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authUsecases.register(email, password, displayName);
          // 3. Ubah isAuthenticated jadi true
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      googleSignInStore: async (idToken) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authUsecases.googleSignIn(idToken);
          // 4. Ubah isAuthenticated jadi true
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await authUsecases.logout();
          // 5. Kembalikan ke false saat logout
          set({ user: null, isAuthenticated: false, isLoading: false }); 
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authUsecases.resetPassword(email);
          set({ isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateProfile: async (displayName) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authUsecases.updateProfile(displayName);
          set({ user: updatedUser, isLoading: false }); 
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteAccount: async () => {
        set({ isLoading: true, error: null });
        try {
          await authUsecases.deleteAccount();
          // 6. Kembalikan ke false saat akun dihapus
          set({ user: null, isAuthenticated: false, isLoading: false }); 
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'scalegram-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 7. Simpan juga status isAuthenticated ke AsyncStorage biar ga perlu login ulang saat app ditutup
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);