import { useState, useEffect, useCallback } from 'react';
import { useDependencies } from '../../app/DependencyProvider';

function uniquePostsById(posts) {
  const seen = new Set();

  return posts.filter((post) => {
    if (!post?.id || seen.has(post.id)) {
      return false;
    }

    seen.add(post.id);
    return true;
  });
}

export function useFeed(pageSize = 10) {
  const { repositories: { postRepository } } = useDependencies();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setLastVisible(null);
      setHasMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const { posts: newPosts, lastDoc } = await postRepository.getPosts(pageSize, null);
      setPosts(uniquePostsById(newPosts));
      setLastVisible(lastDoc);
      setHasMore(newPosts.length === pageSize);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pageSize, postRepository]);

  const loadMore = useCallback(async () => {
    if (loading || refreshing || loadingMore || !hasMore || !lastVisible) return;

    setLoadingMore(true);
    try {
      const { posts: morePosts, lastDoc } = await postRepository.getPosts(pageSize, lastVisible);
      if (morePosts.length > 0) {
        setPosts(prev => uniquePostsById([...prev, ...morePosts]));
        setLastVisible(lastDoc);
      }
      if (morePosts.length < pageSize) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, refreshing, loadingMore, hasMore, pageSize, lastVisible, postRepository]);

  const refetch = useCallback(() => fetchPosts(true), [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    setPosts,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    refetch,
    loadMore
  };
}
