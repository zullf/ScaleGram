import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const notificationRepository = {
  createNotification: async (actorId, targetUserId, type, referenceId = null) => {
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
      console.error('Gagal membuat notifikasi:', error);
      throw error;
    }
  }
};