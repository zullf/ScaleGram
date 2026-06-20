import { doc, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const userRepository = {
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
      console.error('Error saat follow user:', error);
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
      console.error('Error saat unfollow user:', error);
      throw error;
    }
  },

  searchUsers: async (searchQuery) => {
    try {
      const usersRef = collection(db, 'users');

      const qName = query(
        usersRef,
        where('displayName', '>=', searchQuery),
        where('displayName', '<=', searchQuery + '\uf8ff')
      );

      const qEmail = query(
        usersRef,
        where('email', '>=', searchQuery),
        where('email', '<=', searchQuery + '\uf8ff')
      );

      const [nameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(qName),
        getDocs(qEmail)
      ]);

      const usersMap = new Map();
      
      nameSnapshot.docs.forEach(doc => {
        usersMap.set(doc.id, { id: doc.id, ...doc.data() });
      });

      emailSnapshot.docs.forEach(doc => {
        if (!usersMap.has(doc.id)) {
          usersMap.set(doc.id, { id: doc.id, ...doc.data() });
        }
      });

      return Array.from(usersMap.values());
    } catch (error) {
      console.error('Error saat mencari user:', error);
      throw error;
    }
  }
};
