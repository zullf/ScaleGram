import React from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, View } from 'react-native';

import { useDependencies } from '../../../app/DependencyProvider';
import ScreenHeader from '../../components/common/ScreenHeader';
import ScreenState from '../../components/common/ScreenState';
import PostCard from '../../components/feed/PostCard';
import { useAuthStore } from '../../../store/authStore';
import { useFeed } from '../../hooks/useFeed';

const PURPLE = '#6366F1';

export default function FeedScreen({ navigation }) {
  const { posts, setPosts, loading, refreshing, loadingMore, error, refetch, loadMore } = useFeed();
  const {
    repositories: { postRepository },
  } = useDependencies();
  const user = useAuthStore((state) => state.user);

  const handleLike = async (post) => {
    if (!user?.id || !post?.id) return;

    const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    const alreadyLiked = likedBy.includes(user.id);
    const nextLikedBy = alreadyLiked
      ? likedBy.filter((userId) => userId !== user.id)
      : [...likedBy, user.id];
    const nextLikesCount = Math.max((post.likesCount || 0) + (alreadyLiked ? -1 : 1), 0);

    setPosts((currentPosts) =>
      currentPosts.map((item) =>
        item.id === post.id
          ? { ...item, likedBy: nextLikedBy, likesCount: nextLikesCount }
          : item
      )
    );

    try {
      if (alreadyLiked) {
        await postRepository.unlikePost(post.id, user.id);
      } else {
        await postRepository.likePost(post.id, user.id);
      }
    } catch (err) {
      console.error('Error updating like:', err);
      setPosts((currentPosts) =>
        currentPosts.map((item) =>
          item.id === post.id
            ? { ...item, likedBy, likesCount: post.likesCount || 0 }
            : item
        )
      );
    }
  };

  const renderPost = ({ item }) => {
    const likedBy = Array.isArray(item.likedBy) ? item.likedBy : [];
    const isLiked = Boolean(user?.id && likedBy.includes(user.id));
    const openPostDetail = (params = {}) => {
      navigation.getParent()?.navigate('PostDetail', { post: item, ...params });
    };
    const openPublicProfile = () => {
      if (item.userId === user?.id) {
        navigation.navigate('Profile');
        return;
      }

      navigation.getParent()?.navigate('PublicProfile', {
        user: {
          id: item.userId,
          displayName: item.userName,
          photoURL: item.userAvatar,
        },
      });
    };

    return (
      <PostCard
        post={item}
        isLiked={isLiked}
        onLikePress={() => handleLike(item)}
        onOpenPost={() => openPostDetail()}
        onCommentPress={() => openPostDetail({ focusComments: true })}
        onOpenAuthor={openPublicProfile}
      />
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return <ScreenState loading />;
    }

    if (error) {
      return (
        <ScreenState
          icon="cloud-offline-outline"
          title="Gagal memuat feed"
          message={error}
          actionLabel="Coba lagi"
          onAction={refetch}
        />
      );
    }

    return (
      <ScreenState
        icon="images-outline"
        title="Belum ada postingan"
        message="Postingan dari backend akan muncul di sini setelah berhasil dibuat."
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScreenHeader showMenu showLogo />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.feedContent,
          posts.length === 0 && styles.emptyFeedContent,
        ]}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={11}
        removeClippedSubviews
        onRefresh={refetch}
        refreshing={refreshing}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footerLoader} color={PURPLE} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  feedContent: {
    paddingBottom: 104,
  },
  emptyFeedContent: {
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: 18,
  },
});
