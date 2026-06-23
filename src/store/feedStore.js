import { create } from 'zustand';

export const useFeedStore = create((set) => ({
  posts: [],
  lastVisible: null,
  hasMore: true,
  error: null,
  isOfflineMode: false,

  setPosts: (nextPosts) => set((state) => ({
    posts: typeof nextPosts === 'function' ? nextPosts(state.posts) : nextPosts,
  })),

  setFeedResult: ({ posts, lastVisible, hasMore, error, isOfflineMode = false }) => set({
    posts,
    lastVisible,
    hasMore,
    error,
    isOfflineMode,
  }),

  appendFeedResult: ({ posts, lastVisible, hasMore, error, isOfflineMode }) => set((state) => ({
    posts,
    lastVisible: lastVisible ?? state.lastVisible,
    hasMore,
    error,
    isOfflineMode: isOfflineMode ?? state.isOfflineMode,
  })),

  setFeedError: (error) => set({ error }),
  resetPagination: () => set({ lastVisible: null, hasMore: true }),
}));
