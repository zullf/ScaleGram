import { createPostRepository } from './postRepositoryImpl';
import { 
  getDocs, 
  getCountFromServer, 
  addDoc, 
  runTransaction, 
  writeBatch, 
  updateDoc 
} from 'firebase/firestore';
import { mapFirestoreDocToPostEntity } from '../mappers/postMapper';

// 1. MOCKING FIREBASE & UTILS
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  where: jest.fn(),
  doc: jest.fn().mockReturnValue({ id: 'mock-id-komentar' }),
  increment: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  getDocs: jest.fn(),
  getCountFromServer: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  runTransaction: jest.fn(),
  writeBatch: jest.fn(),
}));

jest.mock('../mappers/postMapper', () => ({
  mapFirestoreDocToPostEntity: jest.fn((doc) => ({ id: doc.id, ...doc.data() }))
}));

// Mock Fetch API Global untuk Google Apps Script
global.fetch = jest.fn();

// 2. SKENARIO PENGUJIAN
describe('Pabrik Pengujian: postRepositoryImpl (Mesin Fotokopi)', () => {
  let postRepository;
  let mockSqliteDataSource;
  const mockFirebaseDataSource = { db: {} };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Bikin brankas palsu
    mockSqliteDataSource = {
      cachePosts: jest.fn(),
      getCachedPosts: jest.fn(),
    };

    // Buat ulang repository sebelum tiap tes
    postRepository = createPostRepository(mockFirebaseDataSource, mockSqliteDataSource);

    // Matikan console.log & error biar terminal bersih
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Skenario 1: getPosts (Feed)', () => {
    it('Harus bisa mengambil feed dari Firebase dan menyimpannya di SQLite', async () => {
      // Palsukan balasan dari Firebase
      const mockDocs = {
        docs: [
          { id: 'post1', data: () => ({ caption: 'Halo Dunia' }) }
        ]
      };
      getDocs.mockResolvedValue(mockDocs);
      getCountFromServer.mockResolvedValue({ data: () => ({ count: 5 }) }); // Palsukan jumlah komen

      const result = await postRepository.getPosts(10, null);

      expect(getDocs).toHaveBeenCalled();
      expect(mockSqliteDataSource.cachePosts).toHaveBeenCalled();
      expect(result.posts[0].commentsCount).toBe(5);
    });

    it('Harus membaca dari SQLite jika Firebase error (Offline)', async () => {
      getDocs.mockRejectedValue(new Error('Internet Mati!'));
      mockSqliteDataSource.getCachedPosts.mockReturnValue([{ id: 'post1', caption: 'Offline Post' }]);

      const result = await postRepository.getPosts(10, null);

      expect(mockSqliteDataSource.getCachedPosts).toHaveBeenCalledWith('feed');
      expect(result.posts[0].caption).toBe('Offline Post');
      expect(result.lastDoc).toBeNull();
    });
  });

  describe('Skenario 2: uploadPost', () => {
    it('Harus berhasil upload gambar via fetch ke GAS lalu simpan ke Firestore', async () => {
      // Palsukan balasan API Google Script
      global.fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ url: 'https://gambar.com/1.jpg' })
      });
      addDoc.mockResolvedValue({ id: 'newPost123' });

      const fileData = { base64: 'abc', fileName: 'test.jpg', mimeType: 'image/jpeg' };
      const id = await postRepository.uploadPost({ caption: 'Keren' }, fileData);

      expect(global.fetch).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalled();
      expect(id).toBe('newPost123');
    });
  });

  describe('Skenario 3: Transaksi Like & Unlike', () => {
    it('Harus bisa like post menggunakan runTransaction', async () => {
      // Palsukan jalannya transaksi
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ likedBy: [], likesCount: 0 }) // Belum di-like
        }),
        update: jest.fn()
      };
      runTransaction.mockImplementation(async (db, callback) => callback(mockTransaction));

      await postRepository.likePost('post1', 'userA');

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.anything(),
        {
          likesCount: 1,
          likedBy: ['userA']
        }
      );
    });

    it('Harus bisa unlike post menggunakan runTransaction', async () => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ likedBy: ['userA'], likesCount: 1 }) // Sudah di-like
        }),
        update: jest.fn()
      };
      runTransaction.mockImplementation(async (db, callback) => callback(mockTransaction));

      await postRepository.unlikePost('post1', 'userA');

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.anything(), 
        {
          likesCount: 0,
          likedBy: []
        }
      );
    });
  });

  describe('Skenario 4: addComment & getComments', () => {
    it('Harus bisa menambah komentar menggunakan writeBatch', async () => {
      const mockBatch = {
        set: jest.fn(),
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(true)
      };
      writeBatch.mockReturnValue(mockBatch);

      await postRepository.addComment('post1', { text: 'Bagus bang' });

      expect(writeBatch).toHaveBeenCalled();
      expect(mockBatch.set).toHaveBeenCalled();
      expect(mockBatch.update).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('Harus bisa mengambil daftar komentar', async () => {
      getDocs.mockResolvedValue({
        docs: [{ id: 'comment1', data: () => ({ text: 'Bagus bang' }) }]
      });

      const comments = await postRepository.getComments('post1');
      expect(comments[0].text).toBe('Bagus bang');
    });
  });

  describe('Skenario 5: savePost & getSavedPosts', () => {
    it('Harus bisa menyimpan (savePost) menggunakan updateDoc', async () => {
      await postRepository.savePost('post1', 'userA');
      expect(updateDoc).toHaveBeenCalled();
    });

    it('Harus bisa mengambil Saved Posts dan menyimpannya di SQLite', async () => {
      getDocs.mockResolvedValue({
        docs: [{ id: 'post1', data: () => ({ caption: 'Tersimpan' }) }]
      });

      const savedPosts = await postRepository.getSavedPosts('userA');
      
      expect(getDocs).toHaveBeenCalled();
      expect(mockSqliteDataSource.cachePosts).toHaveBeenCalledWith(savedPosts, 'saved');
      expect(savedPosts[0].caption).toBe('Tersimpan');
    });
  });

  describe('Skenario 6: searchPosts', () => {
    it('Harus bisa melakukan pencarian', async () => {
      getDocs.mockResolvedValue({
        docs: [{ id: 'post1', data: () => ({ caption: 'Cari aku' }) }]
      });
      getCountFromServer.mockResolvedValue({ data: () => ({ count: 0 }) });

      const results = await postRepository.searchPosts('Cari');
      expect(results[0].caption).toBe('Cari aku');
    });
  });
});