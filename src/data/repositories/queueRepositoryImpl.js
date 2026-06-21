import { createSQLiteDataSource } from '../datasources/sqlite/sqliteDataSource';

const localDB = createSQLiteDataSource();

localDB.initDB()

class QueueRepositoryImpl {
  
  async enqueueAction(actionType, payload) {
    try {
      const id = localDB.addActionToQueue(actionType, payload);
      return id;
    } catch (error) {
      console.error('Gagal masuk antrean di QueueRepository:', error);
      throw error;
    }
  }

  async getPendingQueue() {
    try {
      const actions = localDB.getPendingActions();
   
      return actions.map(action => ({
        ...action,
        payload: JSON.parse(action.payload) 
      }));
    } catch (error) {
      console.error('Gagal ambil antrean di QueueRepository:', error);
      return [];
    }
  }

  async removeQueue(id) {
    try {
      localDB.removeActionFromQueue(id);
    } catch (error) {
      console.error('Gagal hapus antrean di QueueRepository:', error);
      throw error;
    }
  }
}

export const queueRepositoryImpl = new QueueRepositoryImpl();