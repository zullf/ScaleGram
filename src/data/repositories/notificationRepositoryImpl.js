import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const DEFAULT_NAMES = new Set(['', 'Pengguna', 'User', 'ScaleGram User']);

function getDisplayName(userData = {}) {
  const candidates = [
    userData.displayName,
    userData.username,
    userData.userName,
    userData.email?.split('@')?.[0],
  ];

  return candidates.find((name) => name && !DEFAULT_NAMES.has(String(name).trim())) || 'ScaleGram User';
}

function getPhotoUrl(userData = {}) {
  return userData.photoURL || userData.photoUrl || userData.profilePic || userData.userAvatar || '';
}

function createNotificationId(actorId, targetUserId, type, referenceId) {
  return [targetUserId, actorId, type, referenceId || 'profile'].join('_');
}

function createNotificationKey(notification = {}) {
  return createNotificationId(
    notification.actorId || notification.actor?.id,
    notification.targetUserId,
    notification.type,
    notification.referenceId
  );
}

class NotificationRepositoryImpl {
  async createNotification(actorId, targetUserId, type, referenceId = null) {
    try {
      if (actorId === targetUserId) return;

      const actorRef = doc(db, 'users', actorId);
      const actorSnap = await getDoc(actorRef);
      const actorData = actorSnap.exists() ? actorSnap.data() : {};

      const notificationsRef = collection(db, 'notifications');
      const notificationRef = doc(notificationsRef, createNotificationId(actorId, targetUserId, type, referenceId));

      await setDoc(notificationRef, {
        actorId: actorId,
        targetUserId: targetUserId,
        type: type,
        referenceId: referenceId,
        actor: {
          id: actorId,
          displayName: getDisplayName(actorData),
          username: actorData.username || null,
          email: actorData.email || null,
          bio: actorData.bio || null,
          photoUrl: getPhotoUrl(actorData)
        },
        isRead: false,
        createdAt: serverTimestamp()
      }, { merge: true });
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
      const uniqueNotifs = Array.from(
        rawNotifs
          .reduce((map, notif) => {
            const key = createNotificationKey(notif);
            if (key && !map.has(key)) {
              map.set(key, notif);
            }
            return map;
          }, new Map())
          .values()
      );
      const actorCache = new Map();

      const populatedNotifs = await Promise.all(
        uniqueNotifs.map(async (notif) => {
          let actorData = notif.actor || {};

          if (notif.actorId) {
            if (!actorCache.has(notif.actorId)) {
              const userRef = doc(db, 'users', notif.actorId);
              const userSnap = await getDoc(userRef);
              actorCache.set(notif.actorId, userSnap.exists() ? userSnap.data() : null);
            }

            const latestActorData = actorCache.get(notif.actorId);
            if (latestActorData) actorData = latestActorData;
          }

          return {
            ...notif,
            actor: {
              id: notif.actorId,
              displayName: getDisplayName(actorData),
              username: actorData.username || null,
              email: actorData.email || null,
              bio: actorData.bio || null,
              photoUrl: getPhotoUrl(actorData)
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
