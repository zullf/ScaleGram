import { createContext, useContext, useMemo } from 'react';

import { auth, db, storage } from '../config/firebase';
// 1. Import instance Auth yang sudah kita perbaiki (sesuaikan path jika perlu)
import { firebaseAuthDataSource } from '../data/datasources/firebaseAuthDataSource'; 
import { authRepository } from '../data/repositories/authRepositoryImpl';

// Biarkan data source lain yang belum diubah tetap pakai 'create...'
import { createPostFirebaseDataSource } from '../data/datasources/firebase/postFirebaseDataSource';
import { createUserFirebaseDataSource } from '../data/datasources/firebase/userFirebaseDataSource';
import { createAsyncStorageDataSource } from '../data/datasources/local/asyncStorageDataSource';
import { createSQLiteDataSource } from '../data/datasources/sqlite/sqliteDataSource';
import { createPostRepository } from '../data/repositories/postRepositoryImpl';
import { createUserRepository } from '../data/repositories/userRepositoryImpl';

const DependencyContext = createContext(null);

export default function DependencyProvider({ children }) {
  const dependencies = useMemo(() => {
    
    // 2. Gunakan langsung instance Auth yang sudah ada, tanpa fungsi create()
    const authDataSource = firebaseAuthDataSource;
    
    const postDataSource = createPostFirebaseDataSource(db, storage);
    const userDataSource = createUserFirebaseDataSource(db);
    const localStorage = createAsyncStorageDataSource();
    const sqlite = createSQLiteDataSource('scalegram.db');

    return {
      firebase: {
        auth,
        db,
        storage,
      },
      dataSources: {
        authDataSource,
        postDataSource,
        userDataSource,
        localStorage,
        sqlite,
      },
      repositories: {
        // 3. Gunakan langsung instance AuthRepository
        authRepository: authRepository,
        postRepository: createPostRepository(postDataSource),
        userRepository: createUserRepository(userDataSource),
      },
    };
  }, []);

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
}

export function useDependencies() {
  const context = useContext(DependencyContext);

  if (!context) {
    throw new Error('useDependencies must be used inside DependencyProvider');
  }

  return context;
}