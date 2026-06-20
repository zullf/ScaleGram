import { socialRepositoryImpl } from '../../data/repositories/socialRepositoryImpl';

export const socialUsecases = {
  followUser: async (currentUserId, targetUserId) => {
    return await socialRepositoryImpl.followUser(currentUserId, targetUserId);
  },

  unfollowUser: async (currentUserId, targetUserId) => {
    return await socialRepositoryImpl.unfollowUser(currentUserId, targetUserId);
  },

  checkFollowStatus: async (currentUserId, targetUserId) => {
    return await socialRepositoryImpl.checkFollowStatus(currentUserId, targetUserId);
  },

  getFollowers: async (userId) => {
    return await socialRepositoryImpl.getFollowers(userId);
  },

  getFollowing: async (userId) => {
    return await socialRepositoryImpl.getFollowing(userId);
  }
};