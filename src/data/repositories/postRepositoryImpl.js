import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs, 
  addDoc 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '../../config/firebase'; 

export const postRepository = {
  
  /**
   * Mengambil feed post dengan sistem infinite scroll
   * @param {number} pageSize - Jumlah item per load
   * @param {object|null} lastVisible - Dokumen terakhir dari query sebelumnya
   */
  getPosts: async (pageSize = 10, lastVisible = null) => {
    try {
      let q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      return { posts, lastDoc };
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  /**
   * Membuat post baru (Upload foto ke Storage + Simpan data ke Firestore)
   * @param {object} postData - Data post (caption, userId, dll)
   * @param {string} fileUri - Lokasi file lokal di HP
   */
  uploadPost: async (postData, fileUri) => {
    try {
      // 1. Upload ke Storage
      const filename = `${Date.now()}_${fileUri.substring(fileUri.lastIndexOf('/') + 1)}`;
      const storageRef = ref(storage, `posts/${filename}`);

      const response = await fetch(fileUri);
      const blob = await response.blob();

      const uploadTask = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      // 2. Simpan ke Firestore
      const docRef = await addDoc(collection(db, 'posts'), {
        ...postData,
        imageUrl: downloadURL,
        createdAt: new Date()
      });

      return docRef.id;
    } catch (error) {
      console.error("Error uploading post:", error);
      throw error;
    }
  }
};