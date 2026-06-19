import { doc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { notificationRepositoryImpl } from './notificationRepositoryImpl';

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

      try {
        await notificationRepositoryImpl.createNotification(
          currentUserId, 
          targetUserId, 
          'FOLLOW'
        );
        console.log(`[Notification] Log follow berhasil dibuat di Firestore`);
      } catch (notifError) {
        console.log(`[Notification] Gagal membuat log notifikasi, tapi follow tetap berhasil`);
      }

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