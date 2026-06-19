import { notificationRepositoryImpl } from '../../data/repositories/notificationRepositoryImpl';

export const notificationUsecases = {
  createNotification: async (actorId, targetUserId, type, referenceId = null) => {
    return await notificationRepositoryImpl.createNotification(actorId, targetUserId, type, referenceId);
  }
};