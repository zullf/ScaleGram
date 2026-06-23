// src/app/container.js
import { db, storage, auth } from '../config/firebase';
import { createPostFirebaseDataSource } from '../data/datasources/firebase/postFirebaseDataSource';
import { createSQLiteDataSource } from '../data/datasources/sqlite/sqliteDataSource';
import { createNotificationRepository } from '../data/repositories/notificationRepositoryImpl';
import { createPostRepository } from '../data/repositories/postRepositoryImpl';
import { createSocialRepository } from '../data/repositories/socialRepositoryImpl';
import { createQueueRepository } from '../data/repositories/queueRepositoryImpl';
import { createUserRepository } from '../data/repositories/userRepositoryImpl';
import { createNotificationUsecases } from '../domain/usecases/notificationUsecases';
import { createSocialUsecases } from '../domain/usecases/socialUsecases';
import { authRepository } from '../data/repositories/authRepositoryImpl';

const postDataSource = createPostFirebaseDataSource(db, storage);
const sqlite = createSQLiteDataSource('scalegram.db');
sqlite.initDB();

const notificationRepository = createNotificationRepository(db, sqlite);
const postRepository = createPostRepository(postDataSource, sqlite);
const queueRepository = createQueueRepository(sqlite);
const socialRepository = createSocialRepository(db);
const userRepository = createUserRepository(db);

const notificationUsecases = createNotificationUsecases(notificationRepository);
const socialUsecases = createSocialUsecases({
  socialRepository,
  postRepository,
  notificationRepository,
  queueRepository
});

// --- Exports for background tasks ---
export const backgroundContainer = {
  queueRepository,
  socialRepository,
  postRepository,
  notificationRepository,
  userRepository,
};

// --- Exports for React's DependencyProvider ---
export const appDependencies = {
  firebase: {
    auth,
    db,
    storage,
  },
  dataSources: {
    postDataSource,
    sqlite,
  },
  repositories: {
    authRepository,
    postRepository,
    userRepository,
    notificationRepository,
    socialRepository,
    queueRepository,
  },
  usecases: {
    notificationUsecases,
    socialUsecases,
  }
};
