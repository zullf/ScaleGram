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
import { createSQLiteDataSource } from '../datasources/sqlite/sqliteDataSource';

const localDb = createSQLiteDataSource();
localDb.initDB();

export const postRepository = {
  
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

      if (!lastVisible && posts.length > 0) {
        localDb.cachePosts(posts);
      }

      return { posts, lastDoc };
    } catch (error) {
      console.log("Gagal konek ke Firebase (Mungkin Offline):", error.message);
      
      if (!lastVisible) {
        console.log("Beralih ke Mode Offline...");
        const cachedPosts = localDb.getCachedPosts();
        return { posts: cachedPosts, lastDoc: null };
      }

      throw error;
    }
  },

  uploadPost: async (postData, fileUri) => {
    try {
      const filename = `${Date.now()}_${fileUri.substring(fileUri.lastIndexOf('/') + 1)}`;
      const storageRef = ref(storage, `posts/${filename}`);

      const response = await fetch(fileUri);
      const blob = await response.blob();

      const uploadTask = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(uploadTask.ref);

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