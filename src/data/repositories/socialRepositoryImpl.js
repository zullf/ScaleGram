import { doc, writeBatch, getDoc, collection, getDocs, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { notificationRepositoryImpl } from './notificationRepositoryImpl';

export const socialRepositoryImpl = {
  followUser: async (currentUserId, targetUserId) => {
    try {
      const batch = writeBatch(db);

      const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
      const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
      const existingFollow = await getDoc(followingRef);
      if (existingFollow.exists()) {
        console.log(`[Social] ${currentUserId} sudah follow ${targetUserId}`);
        return;
      }

      batch.set(followingRef, { followedAt: new Date() });
      batch.set(followerRef, { followedAt: new Date() });

      const currentUserDoc = doc(db, 'users', currentUserId);
      const targetUserDoc = doc(db, 'users', targetUserId);

      batch.set(currentUserDoc, { followingCount: increment(1) }, { merge: true });
      batch.set(targetUserDoc, { followersCount: increment(1) }, { merge: true });

      await batch.commit();
      console.log(`[Social] ${currentUserId} berhasil follow ${targetUserId}`);

      try {
        await notificationRepositoryImpl.createNotification(
          currentUserId, 
          targetUserId,  
          'FOLLOW'       
        );
        console.log('Notifikasi follow berhasil dikirim!');
      } catch (notifErr) {
        console.error('Ops, gagal ngirim notif:', notifErr);
      }

    } catch (error) {
      console.error('Gagal update follow:', error.message);
      throw error;
    }
  },

  unfollowUser: async (currentUserId, targetUserId) => {
    try {
      const batch = writeBatch(db);

      const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
      const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
      const existingFollow = await getDoc(followingRef);
      if (!existingFollow.exists()) {
        console.log(`[Social] ${currentUserId} belum follow ${targetUserId}`);
        return;
      }

      batch.delete(followingRef);
      batch.delete(followerRef);

      const currentUserDoc = doc(db, 'users', currentUserId);
      const targetUserDoc = doc(db, 'users', targetUserId);

      batch.set(currentUserDoc, { followingCount: increment(-1) }, { merge: true });
      batch.set(targetUserDoc, { followersCount: increment(-1) }, { merge: true });

      await batch.commit();
      console.log(`[Social] ${currentUserId} berhasil unfollow ${targetUserId}`);
    } catch (error) {
      console.error('Gagal update unfollow:', error.message);
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
  },

  getFollowers: async (userId) => {
    try {
      const followersRef = collection(db, 'users', userId, 'followers');
      const snapshot = await getDocs(followersRef);
      
      const followerIds = snapshot.docs.map(doc => doc.id);

      if (followerIds.length === 0) return [];

      const followersList = await Promise.all(
        followerIds.map(async (followerId) => {
          const userRef = doc(db, 'users', followerId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            return { id: followerId, ...userSnap.data() };
          }
          return null;
        })
      );

      return followersList.filter(user => user !== null);

    } catch (error) {
      console.error("Gagal mengambil daftar followers:", error);
      throw error;
    }
  },

  getFollowing: async (userId) => {
    try {
      const followingRef = collection(db, 'users', userId, 'following');
      const snapshot = await getDocs(followingRef);

      const followingIds = snapshot.docs.map(doc => doc.id);

      if (followingIds.length === 0) return [];

      const followingList = await Promise.all(
        followingIds.map(async (followingId) => {
          const userRef = doc(db, 'users', followingId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            return { id: followingId, ...userSnap.data() };
          }
          return null;
        })
      );
      return followingList.filter(user => user !== null);

    } catch (error) {
      console.error("Gagal mengambil daftar following:", error);
      throw error;
    }
  },
};
