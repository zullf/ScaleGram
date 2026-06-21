import { socialUsecases } from './socialUsecases';
import { socialRepositoryImpl } from '../../data/repositories/socialRepositoryImpl';
import { queueRepositoryImpl } from '../../data/repositories/queueRepositoryImpl';
import * as Network from 'expo-network';
import { createPostRepository } from '../../data/repositories/postRepositoryImpl';

// 1. MOCKING (BARANG PALSU)
jest.mock('../../data/repositories/socialRepositoryImpl', () => ({
  socialRepositoryImpl: {
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
    checkFollowStatus: jest.fn(),
    getFollowers: jest.fn(),
    getFollowing: jest.fn(),
  },
}));

jest.mock('../../data/repositories/queueRepositoryImpl', () => ({
  queueRepositoryImpl: {
    enqueueAction: jest.fn(),
  },
}));

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(),
}));

jest.mock('../../config/firebase', () => ({
  db: {},
}));

// PERBAIKAN DI SINI: Kita pastikan robot langsung mengembalikan fungsi palsu tanpa delay
jest.mock('../../data/repositories/postRepositoryImpl', () => ({
  createPostRepository: jest.fn().mockReturnValue({
    likePost: jest.fn(),
    unlikePost: jest.fn(),
    addComment: jest.fn(),
  })
}));


// 2. SKENARIO PENGUJIAN
describe('Pabrik Pengujian: socialUsecases', () => {
  let mockPostRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    // Tarik referensi barang palsu yang sudah paten di atas
    mockPostRepo = createPostRepository();
  });

  describe('Skenario 1: Saat Internet NYALA (Online)', () => {
    beforeEach(() => {
      Network.getNetworkStateAsync.mockResolvedValue({ isConnected: true });
    });

    it('followUser: harus memanggil Firebase langsung', async () => {
      socialRepositoryImpl.followUser.mockResolvedValue('sukses-follow');
      const hasil = await socialUsecases.followUser('userA', 'userB');
      
      expect(socialRepositoryImpl.followUser).toHaveBeenCalledWith('userA', 'userB');
      expect(hasil).toBe('sukses-follow');
    });

    it('likePost: harus menembak like ke Firebase', async () => {
      mockPostRepo.likePost.mockResolvedValue('sukses-like');
      const hasil = await socialUsecases.likePost('userA', 'post1');
      
      expect(mockPostRepo.likePost).toHaveBeenCalledWith('post1', 'userA');
      expect(hasil).toBe('sukses-like');
    });

    it('unlikePost: harus menembak unlike ke Firebase', async () => {
      mockPostRepo.unlikePost.mockResolvedValue('sukses-unlike');
      const hasil = await socialUsecases.unlikePost('userA', 'post1');
      
      expect(mockPostRepo.unlikePost).toHaveBeenCalledWith('post1', 'userA');
      expect(hasil).toBe('sukses-unlike');
    });
  });

  describe('Skenario 2: Saat Internet MATI (Offline Mode Pesawat)', () => {
    beforeEach(() => {
      Network.getNetworkStateAsync.mockResolvedValue({ isConnected: false });
    });

    it('unfollowUser: harus menitipkan aksi ke brankas SQLite', async () => {
      const hasil = await socialUsecases.unfollowUser('userA', 'userB');
      
      expect(queueRepositoryImpl.enqueueAction).toHaveBeenCalledWith('UNFOLLOW', { currentUserId: 'userA', targetUserId: 'userB' });
      expect(hasil.status).toBe('queued');
    });

    it('addComment: harus menitipkan komentar ke antrean dengan ID sementara', async () => {
      const commentData = { text: 'Keren bang!', createdAt: new Date('2026-01-01T00:00:00.000Z') };
      const hasil = await socialUsecases.addComment('post1', commentData);
      
      expect(queueRepositoryImpl.enqueueAction).toHaveBeenCalled();
      expect(hasil).toMatch(/^offline-sync-/); 
    });
  });

  describe('Skenario 3: Fungsi Biasa (Tanpa Cek Sinyal)', () => {
    it('getFollowers: harus bisa mengambil daftar follower', async () => {
      socialRepositoryImpl.getFollowers.mockResolvedValue(['userB', 'userC']);
      const hasil = await socialUsecases.getFollowers('userA');
      
      expect(socialRepositoryImpl.getFollowers).toHaveBeenCalledWith('userA');
      expect(hasil).toEqual(['userB', 'userC']);
    });

    it('getFollowing: harus bisa mengambil data following', async () => {
      socialRepositoryImpl.getFollowing.mockResolvedValue(['userX', 'userY']);
      const hasil = await socialUsecases.getFollowing('userA');
      
      expect(socialRepositoryImpl.getFollowing).toHaveBeenCalledWith('userA');
      expect(hasil).toEqual(['userX', 'userY']);
    });
  });
});