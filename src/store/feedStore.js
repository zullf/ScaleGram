import { create } from 'zustand';

const FEED_STALE_MS = 60 * 1000;

let initialFetchPromise = null;
let loadMorePromise = null;

function uniquePostsById(posts = []) {
  const seen = new Set();

  return posts.filter((post) => {
    if (!post?.id || seen.has(post.id)) {
      return false;
    }

    seen.add(post.id);
    return true;
  });
}

function shouldUseCachedFeed(state, pageSize) {
  return (
    state.posts.length > 0 &&
    state.pageSizeLoaded >= pageSize &&
    Date.now() - state.lastFetchedAt < FEED_STALE_MS
  );
}

export const useFeedStore = create((set, get) => ({
  posts: [],
  loading: true,
  refreshing: false,
  loadingMore: false,
  error: null,
  lastVisible: null,
  hasMore: true,
  lastFetchedAt: 0,
  pageSizeLoaded: 0,

  setPosts: (updater) =>
    set((state) => ({
      posts: uniquePostsById(
        typeof updater === 'function' ? updater(state.posts) : updater
      ),
    })),

  fetchPosts: async ({ postRepository, pageSize = 10, force = false, refresh = false }) => {
    const state = get();

    if (!force && shouldUseCachedFeed(state, pageSize)) {
      return;
    }

    if (initialFetchPromise) {
      return initialFetchPromise;
    }

    set({
      loading: !refresh && state.posts.length === 0,
      refreshing: refresh,
      error: null,
      hasMore: refresh ? true : state.hasMore,
      lastVisible: refresh ? null : state.lastVisible,
    });

    initialFetchPromise = postRepository
      .getPosts(pageSize, null)
      .then(({ posts: newPosts = [], lastDoc = null, error = null }) => {
        set({
          posts: uniquePostsById(newPosts),
          lastVisible: lastDoc,
          hasMore: newPosts.length === pageSize,
          error,
          lastFetchedAt: Date.now(),
          pageSizeLoaded: pageSize,
        });
      })
      .catch((err) => {
        set((currentState) => ({
          error: err?.message || 'Gagal memuat feed.',
          hasMore: false,
          posts: currentState.posts,
        }));
      })
      .finally(() => {
        initialFetchPromise = null;
        set({ loading: false, refreshing: false });
      });

    return initialFetchPromise;
  },

  loadMore: async ({ postRepository, pageSize = 10 }) => {
    const state = get();

    if (
      state.loading ||
      state.refreshing ||
      state.loadingMore ||
      !state.hasMore ||
      !state.lastVisible ||
      loadMorePromise
    ) {
      return loadMorePromise;
    }

    set({ loadingMore: true });

    loadMorePromise = postRepository
      .getPosts(pageSize, state.lastVisible)
      .then(({ posts: morePosts = [], lastDoc = null, error = null }) => {
        set((currentState) => ({
          posts: uniquePostsById([...currentState.posts, ...morePosts]),
          lastVisible: lastDoc,
          hasMore: morePosts.length === pageSize,
          error,
          lastFetchedAt: Date.now(),
          pageSizeLoaded: Math.max(currentState.pageSizeLoaded, pageSize),
        }));
      })
      .catch((err) => {
        set({
          error: err?.message || 'Gagal memuat feed berikutnya.',
          hasMore: false,
        });
      })
      .finally(() => {
        loadMorePromise = null;
        set({ loadingMore: false });
      });

    return loadMorePromise;
  },
}));
