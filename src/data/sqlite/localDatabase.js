export {
  DEFAULT_DATABASE_NAME,
  initializeScaleGramDatabase as initializeLocalDatabase,
  openScaleGramDatabase as openLocalDatabase,
} from './database';

export function openLocalDatabase(dbName = DEFAULT_DATABASE_NAME) {
  return SQLite.openDatabaseSync(dbName);
}

export function initializeLocalDatabase(db) {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      category TEXT DEFAULT 'feed',
      data_json TEXT NOT NULL,
      savedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS action_queue (
      id TEXT PRIMARY KEY,
      actionType TEXT,
      payload TEXT,
      status TEXT DEFAULT 'PENDING',
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      data_json TEXT NOT NULL,
      savedAt TEXT NOT NULL
    );
  `);
}
