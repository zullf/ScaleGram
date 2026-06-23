import { initializeScaleGramDatabase, openScaleGramDatabase } from '../../sqlite/database';

export const createSQLiteDataSource = (dbName = 'scalegram.db') => {
  const db = openScaleGramDatabase(dbName);

  return {
    initDB: () => {
      initializeScaleGramDatabase(db);
      console.log("[SQLite] Database & Tabel 'posts' dan 'action_queue' siap!");
    },

    cachePosts: (posts, category = 'feed') => {
      const deleteStmt = db.prepareSync('DELETE FROM posts WHERE category = $category');
      
      const insertStmt = db.prepareSync(
        'INSERT OR REPLACE INTO posts (id, category, data_json, savedAt) VALUES ($id, $category, $data_json, $savedAt)'
      );
      
      try {
        db.withTransactionSync(() => {
          deleteStmt.executeSync({ $category: category });

          for (const post of posts) {
            insertStmt.executeSync({
              $id: post.id,
              $category: category,
              $data_json: JSON.stringify(post), 
              $savedAt: new Date().toISOString()
            });
          }
        });
        console.log(`[SQLite] Berhasil mem-fotokopi ${posts.length} postingan untuk mode Offline (Kategori: ${category}).`);
      } catch (err) {
         console.log("Error SQLite Cache:", err);
      } finally {
        deleteStmt.finalizeSync();
        insertStmt.finalizeSync();
      }
    },

    getCachedPosts: (category = 'feed') => {
      try {
        const result = db.getAllSync('SELECT data_json FROM posts WHERE category = ? ORDER BY savedAt DESC', [category]);

        const parsedPosts = result.map(row => JSON.parse(row.data_json));
        
        console.log(`[SQLite] Berhasil memuat ${parsedPosts.length} postingan offline dari kategori: ${category}.`);
        return parsedPosts;
      } catch (err) {
        console.warn("Gagal ambil cache:", err);
        return [];
      }
    },

    getCachedPostEntries: () => {
      try {
        return db.getAllSync('SELECT id, category, data_json, savedAt FROM posts ORDER BY savedAt DESC')
          .map((row) => ({
            id: row.id,
            category: row.category || 'feed',
            savedAt: row.savedAt,
            post: JSON.parse(row.data_json),
          }));
      } catch (err) {
        console.warn("Gagal ambil daftar cache:", err);
        return [];
      }
    },

    addActionToQueue: (actionType, payload) => {
      const statement = db.prepareSync(
        'INSERT INTO action_queue (id, actionType, payload, status, createdAt) VALUES ($id, $actionType, $payload, $status, $createdAt)'
      );
      try {
        const id = Date.now().toString() + Math.random().toString(36).substring(7); 
        statement.executeSync({
          $id: id,
          $actionType: actionType,
          $payload: JSON.stringify(payload), 
          $status: 'PENDING',
          $createdAt: new Date().toISOString()
        });
        console.log(`[SQLite] Aksi [${actionType}] berhasil masuk ke antrean lokal (Offline Mode).`);
        return id;
      } catch (err) {
        console.error("Gagal insert antrean:", err);
      } finally {
        statement.finalizeSync();
      }
    },

    getPendingActions: () => {
      try {
        return db.getAllSync("SELECT * FROM action_queue WHERE status = 'PENDING' ORDER BY createdAt ASC");
      } catch (err) {
        console.error("Gagal ambil antrean:", err);
        return [];
      }
    },

    removeActionFromQueue: (id) => {
      const statement = db.prepareSync('DELETE FROM action_queue WHERE id = $id');
      try {
        statement.executeSync({ $id: id });
        console.log(`[SQLite] Antrean id ${id} berhasil dihapus karena sudah sinkron.`);
      } catch (err) {
        console.error("Gagal hapus antrean:", err);
      } finally {
        statement.finalizeSync();
      }
    }
  };
};
