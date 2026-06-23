import { useCallback, useEffect } from 'react';

import { useDependencies } from '../../app/DependencyProvider';
import { useFeedStore } from '../../store/feedStore';

export function useFeed(pageSize = 10, options = {}) {
  const { repositories: { postRepository } } = useDependencies();
  const posts = useFeedStore((state) => state.posts);
  const setPosts = useFeedStore((state) => state.setPosts);
  const loading = useFeedStore((state) => state.loading);
  const refreshing = useFeedStore((state) => state.refreshing);
  const loadingMore = useFeedStore((state) => state.loadingMore);
  const error = useFeedStore((state) => state.error);
  const hasMore = useFeedStore((state) => state.hasMore);
  const fetchPosts = useFeedStore((state) => state.fetchPosts);
  const loadMorePosts = useFeedStore((state) => state.loadMore);
  const autoFetch = options.autoFetch !== false;

  const refetch = useCallback(
    () => fetchPosts({ postRepository, pageSize, force: true, refresh: true }),
    [fetchPosts, pageSize, postRepository]
  );

  const loadMore = useCallback(
    () => loadMorePosts({ postRepository, pageSize }),
    [loadMorePosts, pageSize, postRepository]
  );

  useEffect(() => {
    if (!autoFetch) return;

    fetchPosts({ postRepository, pageSize });
  }, [autoFetch, fetchPosts, pageSize, postRepository]);

  return {
    posts,
    setPosts,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    refetch,
    loadMore,
  };
}
