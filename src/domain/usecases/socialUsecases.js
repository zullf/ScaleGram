import { userRepository } from '../../data/repositories/userRepositoryImpl';

export const socialUsecases = {
  followUser: async (currentUserId, targetUserId) => {
    return await userRepository.followUser(currentUserId, targetUserId);
  },

  unfollowUser: async (currentUserId, targetUserId) => {
    return await userRepository.unfollowUser(currentUserId, targetUserId);
  },

  checkFollowStatus: async (currentUserId, targetUserId) => {
    return await userRepository.checkFollowStatus(currentUserId, targetUserId);
  },

  getFollowers: async (userId) => {
    return await userRepository.getFollowers(userId);
  },

  getFollowing: async (userId) => {
    return await userRepository.getFollowing(userId);
  }
};