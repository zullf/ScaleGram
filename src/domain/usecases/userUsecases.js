import { useState } from 'react';
import { userRepository } from '../../data/repositories/userRepositoryImpl'; 

export const useEditProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const editProfile = async (userId, payload) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await userRepository.updateProfile(userId, payload);
      
      setIsLoading(false);
      return { success: true, data: updatedUser };
      
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Terjadi kesalahan saat menyimpan profil');
      return { success: false, error: err.message };
    }
  };

  return {
    editProfile,
    isLoading,
    error,
    setError 
  };
};