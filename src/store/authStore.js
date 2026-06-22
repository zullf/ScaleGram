import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authUsecases } from '../domain/usecases/authUsecases';
import { authRepository } from '../data/repositories/authRepositoryImpl';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,        
      isAuthenticated: false, 
      isLoading: false,  
      error: null,       

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authUsecases.login(email, password);
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

      updateUser: (updatedUser = {}) => {
        set((state) => ({
          user: {
            ...state.user,
            ...updatedUser,
            photoURL: updatedUser.photoURL ?? updatedUser.photoUrl ?? state.user?.photoURL ?? null,
          },
        }));
      },

      deleteAccount: async () => {
        set({ isLoading: true, error: null });
        try {
          await authUsecases.deleteAccount();
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
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
