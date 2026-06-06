import * as SQLite from 'expo-sqlite';

export function createSQLiteDataSource(databaseName) {
  return {
    databaseName,
    open: () => SQLite.openDatabaseAsync(databaseName),
  };
}
