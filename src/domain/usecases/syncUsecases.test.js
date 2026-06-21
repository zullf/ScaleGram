import { syncUsecases } from './syncUsecases';
import { queueRepositoryImpl } from '../../data/repositories/queueRepositoryImpl';
import { socialRepositoryImpl } from '../../data/repositories/socialRepositoryImpl';
import { createPostRepository } from '../../data/repositories/postRepositoryImpl';

// 1. MOCKING (BARANG PALSU)
jest.mock('../../data/repositories/queueRepositoryImpl', () => ({
  queueRepositoryImpl: {
    getPendingQueue: jest.fn(),
    removeQueue: jest.fn(),
  },
}));

jest.mock('../../data/repositories/socialRepositoryImpl', () => ({
  socialRepositoryImpl: {
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
  },
}));

jest.mock('../../config/firebase', () => ({
  db: {},
}));

jest.mock('../../data/repositories/postRepositoryImpl', () => ({
  createPostRepository: jest.fn().mockReturnValue({
    likePost: jest.fn(),
    unlikePost: jest.fn(),
    addComment: jest.fn(),
  }),
}));

// 2. SKENARIO PENGUJIAN
describe('Pabrik Pengujian: syncUsecases (Mandor Sinyal)', () => {
  let mockPostRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPostRepo = createPostRepository();
    
    // Matikan console.log dan error sebentar biar terminal bersih
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // Nyalakan console lagi setelah tes selesai
    jest.restoreAllMocks();
  });

  it('Skenario 1: Antrean Kosong -> Harus langsung selesai', async () => {
    queueRepositoryImpl.getPendingQueue.mockResolvedValue([]);
    
    const hasil = await syncUsecases.processOfflineQueue();
    
    expect(queueRepositoryImpl.getPendingQueue).toHaveBeenCalled();
    expect(hasil).toEqual({ success: true, message: "Tidak ada antrean." });
  });

  it('Skenario 2: Antrean Penuh -> Harus memproses semua jenis aksi dan menghapusnya', async () => {
    // Siapkan brankas palsu yang isinya komplit
    const antreanPalsu = [
      { id: 'q1', actionType: 'FOLLOW', payload: { currentUserId: 'u1', targetUserId: 'u2' } },
      { id: 'q2', actionType: 'UNFOLLOW', payload: { currentUserId: 'u1', targetUserId: 'u2' } },
      { id: 'q3', actionType: 'LIKE', payload: { userId: 'u1', postId: 'p1' } },
      { id: 'q4', actionType: 'UNLIKE', payload: { userId: 'u1', postId: 'p1' } },
      { id: 'q5', actionType: 'COMMENT', payload: { postId: 'p1', commentData: { text: 'Halo', createdAt: '2026-01-01T00:00:00.000Z' } } },
    ];
    
    queueRepositoryImpl.getPendingQueue.mockResolvedValue(antreanPalsu);

    const hasil = await syncUsecases.processOfflineQueue();

    // Pastikan semua repository dipanggil dengan data yang benar
    expect(socialRepositoryImpl.followUser).toHaveBeenCalledWith('u1', 'u2');
    expect(socialRepositoryImpl.unfollowUser).toHaveBeenCalledWith('u1', 'u2');
    expect(mockPostRepo.likePost).toHaveBeenCalledWith('p1', 'u1');
    expect(mockPostRepo.unlikePost).toHaveBeenCalledWith('p1', 'u1');
    expect(mockPostRepo.addComment).toHaveBeenCalledWith('p1', expect.objectContaining({ text: 'Halo' }));
    
    // Pastikan brankas dihapus 5 kali sesuai jumlah antrean
    expect(queueRepositoryImpl.removeQueue).toHaveBeenCalledTimes(5);
    expect(hasil).toEqual({ success: true, message: "Sinkronisasi selesai." });
  });

  it('Skenario 3: Satu aksi gagal -> Lanjut ke aksi berikutnya tanpa crash', async () => {
    const antreanPalsu = [
      { id: 'q1', actionType: 'FOLLOW', payload: { currentUserId: 'u1', targetUserId: 'u2' } }, // Sengaja dibikin gagal
      { id: 'q2', actionType: 'LIKE', payload: { userId: 'u1', postId: 'p1' } }, // Harus tetap jalan
    ];
    queueRepositoryImpl.getPendingQueue.mockResolvedValue(antreanPalsu);
    
    // Bikin followUser melempar error
    socialRepositoryImpl.followUser.mockRejectedValue(new Error('Firebase ngadat!'));

    await syncUsecases.processOfflineQueue();

    // Walau q1 gagal, q2 (LIKE) harus tetap terkirim
    expect(socialRepositoryImpl.followUser).toHaveBeenCalled();
    expect(mockPostRepo.likePost).toHaveBeenCalled();
    
    // Yang dihapus dari brankas cuma q2 karena q1 gagal
    expect(queueRepositoryImpl.removeQueue).toHaveBeenCalledWith('q2');
    expect(queueRepositoryImpl.removeQueue).not.toHaveBeenCalledWith('q1');
  });

  it('Skenario 4: Eror Fatal -> Harus ditangkap oleh catch terluar', async () => {
    // Bikin SQLite gagal dibuka dari awal
    queueRepositoryImpl.getPendingQueue.mockRejectedValue(new Error('SQLite Meledak!'));

    // Tes apakah fungsi benar-benar melemparkan error (throw)
    await expect(syncUsecases.processOfflineQueue()).rejects.toThrow('SQLite Meledak!');
  });
});