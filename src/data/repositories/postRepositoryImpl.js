import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs, 
  getCountFromServer,
  addDoc,
  doc,
  getDoc, 
  where,
  increment,
  writeBatch,
  runTransaction,
  updateDoc,    
  arrayUnion,     
  arrayRemove     
} from 'firebase/firestore';
import { mapFirestoreDocToPostEntity } from '../mappers/postMapper';
import { notificationRepositoryImpl } from './notificationRepositoryImpl'; 

const GAS_URL = "https://script.google.com/macros/s/AKfycby3eJyYnCPUb31AEGSeTVZKdIAs0E2UDEMi7ybwGYI6HZLZvOUTHpTVBTbWBOCNN1hN/exec";

export function createPostRepository(firebaseDataSource, sqliteDataSource) {
  const { db } = firebaseDataSource;

  const normalizeTags = (tags = []) => {
    if (!Array.isArray(tags)) return [];

    return [...new Set(
      tags
        .map((tag) => String(tag).trim().replace(/^#/, '').toLowerCase())
        .filter(Boolean)
    )];
  };

  const getCommentCount = async (postId) => {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const snapshot = await getCountFromServer(commentsRef);

    return snapshot.data().count || 0;
  };

  const attachCommentCounts = async (posts) => {
    return Promise.all(
      posts.map(async (post) => ({
        ...post,
        commentsCount: await getCommentCount(post.id),
      }))
    );
  };

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
        const posts = await attachCommentCounts(
          snapshot.docs.map(doc => mapFirestoreDocToPostEntity(doc))
        );
        
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];

        if (sqliteDataSource && !lastVisible) {
           sqliteDataSource.cachePosts(posts, 'feed');
        }

        return { posts, lastDoc };

      } catch (error) {
        console.error(" ALASAN ASLI FIREBASE GAGAL:", error);
        console.log("Firebase gagal/Offline. Membaca Feed dari brankas SQLite...");
        
        if (sqliteDataSource) {
           const cachedPosts = sqliteDataSource.getCachedPosts('feed');
           return { posts: cachedPosts, lastDoc: null }; 
        }
        
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
          tags: normalizeTags(postData.tags),
          imageUrl: downloadURL,
          createdAt: new Date(),
          likesCount: 0,
          commentsCount: 0,
          likedBy: [],
          savedBy: [] 
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
        let postOwnerId = null; 
        
        await runTransaction(db, async (transaction) => {
          const postDoc = await transaction.get(postRef);
          
          if (!postDoc.exists()) {
            throw new Error("Post tidak ditemukan!");
          }

          const data = postDoc.data();
          const currentLikedBy = data.likedBy || [];
          const currentLikesCount = data.likesCount || 0;
          postOwnerId = data.userId;

          if (!currentLikedBy.includes(userId)) {
            transaction.update(postRef, {
              likesCount: currentLikesCount + 1,
              likedBy: [...currentLikedBy, userId]
            });
          }
        });

        if (postOwnerId && postOwnerId !== userId) {
          try {
            await notificationRepositoryImpl.createNotification(
              userId,       
              postOwnerId,  
              'LIKE',       
              postId        
            );
          } catch (notifErr) {
            console.error("Gagal kirim notif like:", notifErr);
          }
        }

      } catch (error) {
        console.error("Error liking post (Transaction):", error);
        throw error;
      }
    },

    unlikePost: async (postId, userId) => {
      try {
        const postRef = doc(db, 'posts', postId);
        
        await runTransaction(db, async (transaction) => {
          const postDoc = await transaction.get(postRef);
          
          if (!postDoc.exists()) {
            throw new Error("Post tidak ditemukan!");
          }

          const currentLikedBy = postDoc.data().likedBy || [];
          const currentLikesCount = postDoc.data().likesCount || 0;

          if (currentLikedBy.includes(userId)) {
            const newLikedBy = currentLikedBy.filter(id => id !== userId);
            transaction.update(postRef, {
              likesCount: currentLikesCount > 0 ? currentLikesCount - 1 : 0,
              likedBy: newLikedBy
            });
          }
        });
      } catch (error) {
        console.error("Error unliking post (Transaction):", error);
        throw error;
      }
    },

    addComment: async (postId, commentData) => {
      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);
        let postOwnerId = null;
        if (postSnap.exists()) {
          postOwnerId = postSnap.data().userId;
        }

        const batch = writeBatch(db);
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const commentRef = doc(commentsRef);

        batch.set(commentRef, {
          ...commentData,
          createdAt: new Date()
        });
        batch.update(postRef, {
          commentsCount: increment(1)
        });

        await batch.commit();

        const commentAuthorId = commentData.userId;
        if (postOwnerId && commentAuthorId && postOwnerId !== commentAuthorId) {
          try {
            await notificationRepositoryImpl.createNotification(
              commentAuthorId, 
              postOwnerId,     
              'COMMENT',       
              postId           
            );
          } catch (notifErr) {
            console.error("Gagal kirim notif comment:", notifErr);
          }
        }

        return commentRef.id;
      } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
      }
    },

    getComments: async (postId) => {
      try {
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Error getting comments:", error);
        throw error;
      }
    },

    savePost: async (postId, userId) => {
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          savedBy: arrayUnion(userId)
        });
      } catch (error) {
        console.error("Error saving post:", error);
        throw error;
      }
    },

    unsavePost: async (postId, userId) => {
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          savedBy: arrayRemove(userId)
        });
      } catch (error) {
        console.error("Error unsaving post:", error);
        throw error;
      }
    },

    getSavedPosts: async (userId) => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('savedBy', 'array-contains', userId)
        );
        const snapshot = await getDocs(q);
        
        const posts = snapshot.docs.map(doc => mapFirestoreDocToPostEntity(doc));
        const sortedPosts = posts.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA; 
        });

        if (sqliteDataSource) {
           sqliteDataSource.cachePosts(sortedPosts, 'saved');
        }

        return sortedPosts;
      } catch (error) {
        console.log("Firebase gagal/Offline. Membaca Saved Posts dari brankas SQLite...");
        
        if (sqliteDataSource) {
           return sqliteDataSource.getCachedPosts('saved');
        }
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
        return attachCommentCounts(
          snapshot.docs.map(doc => mapFirestoreDocToPostEntity(doc))
        );
      } catch (error) {
        console.error('Error searching posts:', error);
        throw error;
      }
    },

    searchPostsByTag: async (tag) => {
      try {
        const normalizedTag = String(tag).trim().replace(/^#/, '').toLowerCase();

        if (!normalizedTag) return [];

        const postsRef = collection(db, 'posts');
        const q = query(
          postsRef,
          where('tags', 'array-contains', normalizedTag)
        );
        const snapshot = await getDocs(q);
        const posts = await attachCommentCounts(
          snapshot.docs.map(doc => mapFirestoreDocToPostEntity(doc))
        );

        return posts.sort((a, b) => {
          const timeA = a.createdAt?.seconds || a.createdAt?.getTime?.() || 0;
          const timeB = b.createdAt?.seconds || b.createdAt?.getTime?.() || 0;
          return timeB - timeA;
        });
      } catch (error) {
        console.error('Error searching posts by tag:', error);
        throw error;
      }
    }
  };
}
