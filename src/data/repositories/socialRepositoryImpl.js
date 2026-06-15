import { doc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const socialRepository = {
  followUser: async (currentUserId, targetUserId) => {
    try {
      const batch = writeBatch(db);

      const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
      
      const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);

      batch.set(followingRef, { followedAt: new Date() });
      batch.set(followerRef, { followedAt: new Date() });

      await batch.commit();
      console.log(`[Social] ${currentUserId} berhasil follow ${targetUserId}`);
    } catch (error) {
      console.error("Error saat follow user:", error);
      throw error;
    }
  },

  unfollowUser: async (currentUserId, targetUserId) => {
    try {
      const batch = writeBatch(db);

      const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
      const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);

      batch.delete(followingRef);
      batch.delete(followerRef);

      await batch.commit();
      console.log(`[Social] ${currentUserId} berhasil unfollow ${targetUserId}`);
    } catch (error) {
      console.error("Error saat unfollow user:", error);
      throw error;
    }
  },

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