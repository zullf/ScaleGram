import { socialRepositoryImpl } from '../../data/repositories/socialRepositoryImpl';
import { queueRepositoryImpl } from '../../data/repositories/queueRepositoryImpl'; 
import * as Network from 'expo-network'; 
import { createPostRepository } from '../../data/repositories/postRepositoryImpl';
import { db } from '../../config/firebase';

const postRepository = createPostRepository({ db });

export const socialUsecases = {
  followUser: async (currentUserId, targetUserId) => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      
      if (networkState.isConnected) {
        return await socialRepositoryImpl.followUser(currentUserId, targetUserId);
      } else {
        const payload = { currentUserId, targetUserId };
        await queueRepositoryImpl.enqueueAction('FOLLOW', payload);
        return { status: 'queued', message: 'Anda sedang offline. Aksi akan dikirim nanti.' };
      }
    } catch (error) {
      console.error('Gagal memproses followUser di Usecase:', error);
      throw error;
    }
  },

  unfollowUser: async (currentUserId, targetUserId) => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      
      if (networkState.isConnected) {
        return await socialRepositoryImpl.unfollowUser(currentUserId, targetUserId);
      } else {
        const payload = { currentUserId, targetUserId };
        await queueRepositoryImpl.enqueueAction('UNFOLLOW', payload);
        return { status: 'queued', message: 'Anda sedang offline. Aksi unfollow akan dikirim nanti.' };
      }
    } catch (error) {
      console.error('Gagal memproses unfollowUser di Usecase:', error);
      throw error;
    }
  },

  checkFollowStatus: async (currentUserId, targetUserId) => {
    return await socialRepositoryImpl.checkFollowStatus(currentUserId, targetUserId);
  },

  getFollowers: async (userId) => {
    return await socialRepositoryImpl.getFollowers(userId);
  },

  getFollowing: async (userId) => {
    return await socialRepositoryImpl.getFollowing(userId);
  },

  likePost: async (userId, postId) => {
     try {
       const networkState = await Network.getNetworkStateAsync();
       if (networkState.isConnected) {
         return await postRepository.likePost(postId, userId); 
       } else {
         const payload = { userId, postId };
         await queueRepositoryImpl.enqueueAction('LIKE', payload);
         return { status: 'queued', message: 'Anda sedang offline. Aksi like akan dikirim nanti.' };
       }
     } catch (error) {
       console.error('Gagal memproses likePost di Usecase:', error);
       throw error;
     }
  },

  unlikePost: async (userId, postId) => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      
      if (networkState.isConnected) {
        return await postRepository.unlikePost(postId, userId); 
      } else {
        const payload = { userId, postId };
        await queueRepositoryImpl.enqueueAction('UNLIKE', payload);
        return { status: 'queued', message: 'Offline. Aksi unlike dititipkan.' };
      }
    } catch (error) {
      console.error('Gagal memproses unlikePost di Usecase:', error);
      throw error;
    }
  },

  addComment: async (postId, commentData) => {
    try {
      const networkState = await Network.getNetworkStateAsync();

      if (networkState.isConnected) {
        return await postRepository.addComment(postId, commentData);
      } else {
        const payload = { 
          postId, 
          commentData: {
            ...commentData,
            createdAt: commentData.createdAt ? commentData.createdAt.toISOString() : new Date().toISOString()
          }
        };
        await queueRepositoryImpl.enqueueAction('COMMENT', payload);
        return `offline-sync-${Date.now()}`;
      }
    } catch (error) {
      console.error('Gagal memproses addComment di Usecase:', error);
      throw error;
    }
  },
};