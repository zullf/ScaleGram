import { doc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const socialRepository = {
  /**
   * Mengikuti (Follow) user lain
   * @param {string} currentUserId - ID user yang sedang login
   * @param {string} targetUserId - ID user yang mau difollow
   */
  followUser: async (currentUserId, targetUserId) => {
    try {
      const batch = writeBatch(db);

      // Lokasi simpan data: users/{currentUserId}/following/{targetUserId}
      const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
      
      // Lokasi simpan data: users/{targetUserId}/followers/{currentUserId}
      const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);

      // Daftarkan aksi ke dalam batch
      batch.set(followingRef, { followedAt: new Date() });
      batch.set(followerRef, { followedAt: new Date() });

      // Eksekusi bersamaan
      await batch.commit();
      console.log(`[Social] ${currentUserId} berhasil follow ${targetUserId}`);
    } catch (error) {
      console.error("Error saat follow user:", error);
      throw error;
    }
  },

  /**
   * Batal mengikuti (Unfollow) user lain
   * @param {string} currentUserId - ID user yang sedang login
   * @param {string} targetUserId - ID user yang mau diunfollow
   */
  unfollowUser: async (currentUserId, targetUserId) => {
    try {
      const batch = writeBatch(db);

      const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
      const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);

      // Hapus data dari kedua koleksi secara bersamaan
      batch.delete(followingRef);
      batch.delete(followerRef);

      await batch.commit();
      console.log(`[Social] ${currentUserId} berhasil unfollow ${targetUserId}`);
    } catch (error) {
      console.error("Error saat unfollow user:", error);
      throw error;
    }
  },

  /**
   * Mengecek apakah user saat ini sudah mem-follow target user
   * @param {string} currentUserId 
   * @param {string} targetUserId 
   * @returns {boolean}
   */
  checkFollowStatus: async (currentUserId, targetUserId) => {
    try {
      const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
      const docSnap = await getDoc(followingRef);
      return docSnap.exists();
    } catch (error) {
      console.error("Error saat cek status follow:", error);
      throw error;
    }
  }
};