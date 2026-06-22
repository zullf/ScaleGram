import { createContext, useContext, useMemo } from 'react';

import { auth, db, storage } from '../config/firebase';
import { firebaseAuthDataSource } from '../data/datasources/firebaseAuthDataSource'; 
import { authRepository } from '../data/repositories/authRepositoryImpl';

import { createPostFirebaseDataSource } from '../data/datasources/firebase/postFirebaseDataSource';
import { createUserFirebaseDataSource } from '../data/datasources/firebase/userFirebaseDataSource';
import { createAsyncStorageDataSource } from '../data/datasources/local/asyncStorageDataSource';
import { createSQLiteDataSource } from '../data/datasources/sqlite/sqliteDataSource';

import { createPostRepository } from '../data/repositories/postRepositoryImpl'; 
import { userRepository } from '../data/repositories/userRepositoryImpl';

const DependencyContext = createContext(null);

export default function DependencyProvider({ children }) {
  const dependencies = useMemo(() => {
    
    const authDataSource = firebaseAuthDataSource;
    const postDataSource = createPostFirebaseDataSource(db, storage);
    const userDataSource = createUserFirebaseDataSource(db);
    const localStorage = createAsyncStorageDataSource();
    const sqlite = createSQLiteDataSource('scalegram.db');
    sqlite.initDB();

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
        authRepository: authRepository,
        postRepository: createPostRepository(postDataSource, sqlite), 
        userRepository: userRepository,
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
