import { queueRepositoryImpl } from '../../data/repositories/queueRepositoryImpl';
import { socialRepositoryImpl } from '../../data/repositories/socialRepositoryImpl';
import { createPostRepository } from '../../data/repositories/postRepositoryImpl';
import { db } from '../../config/firebase'; 

const postRepository = createPostRepository({ db });

export const syncUsecases = {
  processOfflineQueue: async () => {
    try {
      const pendingActions = await queueRepositoryImpl.getPendingQueue();
      
      if (pendingActions.length === 0) {
        return { success: true, message: "Tidak ada antrean." };
      }

      console.log(`[Sync Worker] Menemukan ${pendingActions.length} aksi tertunda. Memulai sinkronisasi ke Firebase...`);

      for (const action of pendingActions) {
        const { id, actionType, payload } = action;
        
        try {
          if (actionType === 'FOLLOW') {
            console.log(`[Sync Worker] Memproses ID Antrean [${id}]: Fitur FOLLOW untuk Target User: ${payload.targetUserId}`);
            await socialRepositoryImpl.followUser(payload.currentUserId, payload.targetUserId);
            await queueRepositoryImpl.removeQueue(id);
            console.log(`[Sync Worker] ID Antrean [${id}] SUKSES tersinkronisasi dan dihapus.`);
            
          } else if (actionType === 'UNFOLLOW') {
            console.log(`[Sync Worker] Memproses ID Antrean [${id}]: Fitur UNFOLLOW untuk Target User: ${payload.targetUserId}`);
            await socialRepositoryImpl.unfollowUser(payload.currentUserId, payload.targetUserId);
            await queueRepositoryImpl.removeQueue(id);
            console.log(`[Sync Worker] ID Antrean [${id}] SUKSES (UNFOLLOW) tersinkronisasi dan dihapus.`);
            
          } else if (actionType === 'LIKE') {
            console.log(`[Sync Worker] Memproses ID Antrean [${id}]: Fitur LIKE untuk Post: ${payload.postId}`);
            
            await postRepository.likePost(payload.postId, payload.userId);
            
            await queueRepositoryImpl.removeQueue(id);
            console.log(`[Sync Worker] ID Antrean [${id}] SUKSES (LIKE) tersinkronisasi dan dihapus.`);
          }else if (actionType === 'UNLIKE') {
            console.log(`[Sync Worker] Memproses ID Antrean [${id}]: Fitur UNLIKE untuk Post: ${payload.postId}`);
            await postRepository.unlikePost(payload.postId, payload.userId);
            await queueRepositoryImpl.removeQueue(id);
            console.log(`[Sync Worker] ID Antrean [${id}] SUKSES (UNLIKE) tersinkronisasi dan dihapus.`);
          } else if (actionType === 'COMMENT') {
            console.log(`[Sync Worker] Memproses ID Antrean [${id}]: Fitur COMMENT untuk Post: ${payload.postId}`);
            
            const finalCommentData = {
              ...payload.commentData,
              createdAt: new Date(payload.commentData.createdAt) 
            };

            await postRepository.addComment(payload.postId, finalCommentData);
            
            await queueRepositoryImpl.removeQueue(id);
            console.log(`[Sync Worker] ID Antrean [${id}] SUKSES (COMMENT) tersinkronisasi dan dihapus.`);
          }
          
        } catch (actionError) {
          console.error(`[Sync Worker] Gagal memproses ID Antrean [${id}]:`, actionError);
        }
      }

      console.log("[Sync Worker] Proses sinkronisasi selesai!");
      return { success: true, message: "Sinkronisasi selesai." };

    } catch (error) {
      console.error("[Sync Worker] Eror fatal saat menjalankan Sync Worker:", error);
      throw error;
    }
  }
};