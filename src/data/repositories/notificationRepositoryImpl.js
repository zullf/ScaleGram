import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';


class NotificationRepositoryImpl {
  async createNotification(actorId, targetUserId, type, referenceId = null) {
    try {
      if (actorId === targetUserId) return;

      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        actorId: actorId,
        targetUserId: targetUserId,
        type: type,
        referenceId: referenceId,
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
          const userRef = doc(db, 'users', notif.actorId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};

          return {
            ...notif,
            actor: {
              id: notif.actorId,
              username: userData.username || 'Pengguna',
              profilePic: userData.profilePic || null 
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