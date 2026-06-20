import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs, 
  addDoc,
  doc,
  updateDoc,
  increment,
  where,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

const GAS_URL = "https://script.google.com/macros/s/AKfycby3eJyYnCPUb31AEGSeTVZKdIAs0E2UDEMi7ybwGYI6HZLZvOUTHpTVBTbWBOCNN1hN/exec";

export function createPostRepository(firebaseDataSource) {
  const { db } = firebaseDataSource;

  return {
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
        console.error("Gagal konek ke Firebase:", error);
        throw error;
      }
    },

    uploadPost: async (postData, fileData) => {
      try {
        const { base64, fileName, mimeType } = fileData;

        const response = await fetch(GAS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            base64: base64,
            fileName: fileName,
            mimeType: mimeType
          })
        });

        const data = await response.json();
        
        const downloadURL = data.url;

        const docRef = await addDoc(collection(db, 'posts'), {
          ...postData,
          imageUrl: downloadURL,
          createdAt: new Date(),
          likesCount: 0,
          likedBy: []
        });

        return docRef.id;
      } catch (error) {
        console.error("Error uploading post to GAS:", error);
        throw error;
      }
    },

    likePost: async (postId, userId) => {
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          likesCount: increment(1),
          likedBy: arrayUnion(userId)
        });
      } catch (error) {
        console.error("Error liking post:", error);
        throw error;
      }
    },

    unlikePost: async (postId, userId) => {
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          likesCount: increment(-1),
          likedBy: arrayRemove(userId)
        });
      } catch (error) {
        console.error("Error unliking post:", error);
        throw error;
      }
    },

    addComment: async (postId, commentData) => {
      try {
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const docRef = await addDoc(commentsRef, {
          ...commentData,
          createdAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
      }
    },

    searchPosts: async (searchQuery) => {
      try {
        const postsRef = collection(db, 'posts');
        const q = query(
          postsRef,
          where('caption', '>=', searchQuery),
          where('caption', '<=', searchQuery + '\uf8ff')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error searching posts:', error);
        throw error;
      }
    }
  };
}