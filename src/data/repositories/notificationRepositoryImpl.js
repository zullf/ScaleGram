import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, where, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Notifications from 'expo-notifications'; 

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
  async registerPushToken(userId) {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('User tidak memberi izin notifikasi');
        return;
      }

      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId: 'b13b56f6-1a4b-41fe-aa72-f359b1c706bd'
      });
      const pushToken = tokenResponse.data;

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { expoPushToken: pushToken }, { merge: true });
      
      console.log("Token tersimpan di Firestore:", pushToken);
    } catch (error) {
      console.error("Gagal mendaftarkan token:", error.message);
    }
  }

  async triggerPushNotification(targetUserId, title, body, data = {}) {
    try {
      const targetUserRef = doc(db, 'users', targetUserId);
      const targetUserSnap = await getDoc(targetUserRef);
      
      if (!targetUserSnap.exists()) return;
      
      const targetUserData = targetUserSnap.data();
      const pushToken = targetUserData.expoPushToken; 

      if (!pushToken) {
        console.log(`[Push Notif] Target user tidak memiliki push token.`);
        return;
      }

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: pushToken,
          sound: 'default',
          title: title,
          body: body,
          data: data,
        }),
      });

      const result = await response.json();
      console.log(`[Push Notif] Respon Asli Expo:`, JSON.stringify(result, null, 2));

    } catch (error) {
      console.error('Gagal mengirim push notification:', error.message);
    }
  }

  async createNotification(actorId, targetUserId, type, referenceId = null) {
    try {
      if (actorId === targetUserId) return;

      const actorRef = doc(db, 'users', actorId);
      const actorSnap = await getDoc(actorRef);
      const actorData = actorSnap.exists() ? actorSnap.data() : {};

      const notificationsRef = collection(db, 'notifications');
      const notificationRef = doc(notificationsRef, createNotificationId(actorId, targetUserId, type, referenceId));

      const actorName = getDisplayName(actorData);

      await setDoc(notificationRef, {
        actorId: actorId,
        targetUserId: targetUserId,
        type: type,
        referenceId: referenceId,
        actor: {
          id: actorId,
          displayName: actorName,
          username: actorData.username || null,
          email: actorData.email || null,
          bio: actorData.bio || null,
          photoUrl: getPhotoUrl(actorData)
        },
        isRead: false,
        createdAt: serverTimestamp()
      }, { merge: true });

      let notifTitle = 'ScaleGram';
      let notifBody = `${actorName} berinteraksi dengan Anda.`;

      if (type === 'follow') {
        notifTitle = 'Pengikut Baru!';
        notifBody = `${actorName} mulai mengikuti Anda.`;
      } else if (type === 'like') {
        notifTitle = 'Suka';
        notifBody = `${actorName} menyukai postingan Anda.`;
      } else if (type === 'comment') {
        notifTitle = 'Komentar Baru';
        notifBody = `${actorName} mengomentari postingan Anda.`;
      }

      await this.triggerPushNotification(targetUserId, notifTitle, notifBody, { type, referenceId });

    } catch (error) {
      console.error('Eror internal Firestore Notifikasi:', error.message);
      throw error;
    }
  }

  async getNotifications(userId) {
    try {
      const q = query(collection(db, 'notifications'), where('targetUserId', '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const rawNotifs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const uniqueNotifs = Array.from(rawNotifs.reduce((map, notif) => {
        const key = createNotificationKey(notif);
        if (key && !map.has(key)) map.set(key, notif);
        return map;
      }, new Map()).values());
      
      const actorCache = new Map();
      const populatedNotifs = await Promise.all(uniqueNotifs.map(async (notif) => {
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
            photoUrl: getPhotoUrl(actorData)
          }
        };
      }));
      return populatedNotifs;
    } catch (error) {
      console.error('Gagal ambil data notifikasi:', error);
      throw error;
    }
  }
}

export const notificationRepositoryImpl = new NotificationRepositoryImpl();
