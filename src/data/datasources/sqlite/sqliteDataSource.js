import * as SQLite from 'expo-sqlite';

export const createSQLiteDataSource = (dbName = 'scalegram.db') => {
  const db = SQLite.openDatabaseSync(dbName);

  return {
    initDB: () => {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          caption TEXT,
          userId TEXT,
          imageUrl TEXT,
          createdAt TEXT
        );
      `);
      console.log("[SQLite] Database & Tabel 'posts' siap!");
    },

    cachePosts: (posts) => {
      const statement = db.prepareSync(
        'INSERT OR REPLACE INTO posts (id, caption, userId, imageUrl, createdAt) VALUES ($id, $caption, $userId, $imageUrl, $createdAt)'
      );
      
      try {
        db.withTransactionSync(() => {
          for (const post of posts) {
            
            let createdAtStr = new Date().toISOString();
            if (post.createdAt) {
              if (typeof post.createdAt.toDate === 'function') {
                createdAtStr = post.createdAt.toDate().toISOString();
              } else {
                createdAtStr = String(post.createdAt);
              }
            }
            
            statement.executeSync({
              $id: post.id,
              $caption: post.caption || '',
              $userId: post.userId || '',
              $imageUrl: post.imageUrl || '',
              $createdAt: createdAtStr
            });
          }
        });
        console.log(`[SQLite] Berhasil menyimpan ${posts.length} postingan ke cache lokal.`);
      } catch (err) {
         console.log("Error SQLite:", err);
      } finally {
        statement.finalizeSync();
      }
    },

    getCachedPosts: () => {
      const result = db.getAllSync('SELECT * FROM posts ORDER BY createdAt DESC');
      console.log(`[SQLite] Berhasil memuat ${result.length} postingan dari cache lokal.`);
      return result;
    }
  };
};