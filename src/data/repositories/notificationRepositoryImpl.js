import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

class NotificationRepositoryImpl {
  async createNotification(actorId, targetUserId, type, referenceId = null) {
    try {
      if (actorId === targetUserId) return;

      const actorRef = doc(db, 'users', actorId);
      const actorSnap = await getDoc(actorRef);
      const actorData = actorSnap.exists() ? actorSnap.data() : {};
      const actorDisplayName = actorData.displayName || actorData.username || 'Pengguna';
      const actorPhotoUrl = actorData.photoUrl || actorData.photoURL || actorData.profilePic || '';

      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        actorId: actorId,
        targetUserId: targetUserId,
        type: type,
        referenceId: referenceId,
        actor: {
          id: actorId,
          displayName: actorDisplayName,
          photoUrl: actorPhotoUrl
        },
        isRead: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Eror internal Firestore Notifikasi:', error.message);
      throw error;
    }
  }

  async getNotifications(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('targetUserId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const rawNotifs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const populatedNotifs = await Promise.all(
        rawNotifs.map(async (notif) => {
          let actorData = notif.actor || {};

          if (!actorData.displayName || actorData.displayName === '') {
            const userRef = doc(db, 'users', notif.actorId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              actorData = {
                displayName: userData.displayName || userData.username || 'Pengguna',
                photoUrl: userData.photoUrl || userData.photoURL || userData.profilePic || ''
              };
            }
          }

          return {
            ...notif,
            actor: {
              id: notif.actorId,
              displayName: actorData.displayName || 'Pengguna',
              photoUrl: actorData.photoUrl || ''
            }
          };
        })
      );

      return populatedNotifs;
    } catch (error) {
      console.error('Gagal ambil data notifikasi:', error);
      throw error;
    }
  }
}

export const notificationRepositoryImpl = new NotificationRepositoryImpl();