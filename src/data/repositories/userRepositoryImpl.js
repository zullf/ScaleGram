import { doc, writeBatch, collection, query, where, getDocs, getDoc, setDoc } from 'firebase/firestore';
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

  checkFollowStatus: async (currentUserId, targetUserId) => {
    try {
      const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
      const docSnap = await getDoc(followerRef);
      
      return docSnap.exists(); 
    } catch (error) {
      console.error('Error checking follow status:', error);
      throw error;
    }
  },

  getFollowers: async (userId) => {
    try {
      const followersRef = collection(db, 'users', userId, 'followers');
      const snapshot = await getDocs(followersRef);
      return snapshot.docs.map(doc => doc.id); 
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  },

  getFollowing: async (userId) => {
    try {
      const followingRef = collection(db, 'users', userId, 'following');
      const snapshot = await getDocs(followingRef);
      return snapshot.docs.map(doc => doc.id); 
    } catch (error) {
      console.error('Error getting following:', error);
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
  },

  getProfile: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },

  updateProfile: async (userId, payload = {}) => {
    try {
      let finalPhotoUrl = payload.existingPhotoUrl ?? null;

      if (payload.newPhotoBase64) {
        const GAS_URL = "https://script.google.com/macros/s/AKfycby3eJyYnCPUb31AEGSeTVZKdIAs0E2UDEMi7ybwGYI6HZLZvOUTHpTVBTbWBOCNN1hN/exec"; // Ganti pakai link script GAS lu
        const response = await fetch(GAS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            base64: payload.newPhotoBase64,
            fileName: payload.newPhotoFileName || `profile_${Date.now()}.jpg`,
            mimeType: payload.newPhotoMimeType || 'image/jpeg',
          }),
        });
        
        const result = await response.json();
        const uploadedPhotoUrl = result.imageUrl ?? result.url ?? null;

        if (!uploadedPhotoUrl) {
          throw new Error('Upload foto profil gagal. URL foto tidak diterima dari server.');
        }

        finalPhotoUrl = uploadedPhotoUrl; 
      }

      const rawUpdatedData = {
        displayName: payload.displayName ?? '', 
        bio: payload.bio ?? '',
        photoURL: finalPhotoUrl ?? null,
        photoUrl: finalPhotoUrl ?? null,
        updatedAt: new Date(),
      };
      const updatedData = Object.fromEntries(
        Object.entries(rawUpdatedData).filter(([, value]) => value !== undefined)
      );

      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, updatedData, { merge: true });
      const updatedSnap = await getDoc(userRef);

      console.log(`[Profile] ${userId} berhasil update profil`);
      return updatedSnap.exists()
        ? { id: updatedSnap.id, ...updatedSnap.data() }
        : { id: userId, ...updatedData };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};
