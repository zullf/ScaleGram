import React from 'react';
import { ActivityIndicator, FlatList, Share, StatusBar, StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import { useDependencies } from '../../../app/DependencyProvider';
import ScreenHeader from '../../components/common/ScreenHeader';
import ScreenState from '../../components/common/ScreenState';
import PostCard from '../../components/feed/PostCard';
import { useDrawerController } from '../../navigation/DrawerController';
import { useAuthStore } from '../../../store/authStore';
import { useFeed } from '../../hooks/useFeed';
import { socialUsecases } from '../../../domain/usecases/socialUsecases';
import { appThemes } from '../../theme/theme';
import { useThemeStore } from '../../../store/themeStore';

const PURPLE = '#6366F1';

function getPostAuthorName(post = {}) {
  return [post.userName, post.displayName, post.userEmail?.split('@')?.[0]]
    .find((name) => name && !['Pengguna', 'User', 'ScaleGram User'].includes(String(name).trim())) || 'ScaleGram User';
}

export default function FeedScreen({ navigation }) {
  const { posts, setPosts, loading, refreshing, loadingMore, error, refetch, loadMore } = useFeed();
  const {
    repositories: { postRepository },
  } = useDependencies();
  const user = useAuthStore((state) => state.user);
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const { openDrawer } = useDrawerController();
  const handleFeedSwipe = React.useCallback((event) => {
    const { state, translationX, translationY } = event.nativeEvent;

    if (state !== State.END) return;
    if (translationX > 55 && Math.abs(translationY) < 30) {
      openDrawer();
    }
  }, [openDrawer]);

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
        await socialUsecases.unlikePost(user.id, post.id);
      } else {
        await socialUsecases.likePost(user.id, post.id);
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

  const handleSave = async (post) => {
    if (!user?.id || !post?.id) return;

    const savedBy = Array.isArray(post.savedBy) ? post.savedBy : [];
    const alreadySaved = savedBy.includes(user.id);
    const nextSavedBy = alreadySaved
      ? savedBy.filter((userId) => userId !== user.id)
      : [...savedBy, user.id];

    // Optimistic UI Update
    setPosts((currentPosts) =>
      currentPosts.map((item) =>
        item.id === post.id
          ? { ...item, savedBy: nextSavedBy }
          : item
      )
    );

    try {
      if (alreadySaved) {
        await postRepository.unsavePost(post.id, user.id);
      } else {
        await postRepository.savePost(post.id, user.id);
      }
    } catch (err) {
      console.error('Error updating save:', err);
      setPosts((currentPosts) =>
        currentPosts.map((item) =>
          item.id === post.id
            ? { ...item, savedBy }
            : item
        )
      );
    }
  };

  const handleShare = async (post) => {
    if (!post?.id) return;

    try {
      const captionText = post.caption ? `\n\n"${post.caption}"` : '';
      const imageText = post.imageUrl ? `\n\n${post.imageUrl}` : '';

      await Share.share({
        message: `Cek postingan dari ${getPostAuthorName(post)} di ScaleGram!${captionText}${imageText}`,
      });
    } catch (err) {
      console.error('Error saat membagikan:', err?.message || err);
    }
  };

  const renderPost = ({ item, index }) => {
    const likedBy = Array.isArray(item.likedBy) ? item.likedBy : [];
    const isLiked = Boolean(user?.id && likedBy.includes(user.id));

    const savedBy = Array.isArray(item.savedBy) ? item.savedBy : [];
    const isSaved = Boolean(user?.id && savedBy.includes(user.id));

    const openPostDetail = (params = {}) => {
      navigation.getParent()?.navigate('PostDetail', {
        post: item,
        ...params,
        onPostUpdate: (updatedPost) => {
          setPosts((currentPosts) =>
            currentPosts.map((p) =>
              p.id === updatedPost.id ? updatedPost : p
            )
          );
        }
      });
    };
    const openPublicProfile = () => {
      if (item.userId === user?.id) {
        navigation.navigate('Profile');
        return;
      }

      navigation.getParent()?.navigate('PublicProfile', {
        user: {
          id: item.userId,
          displayName: getPostAuthorName(item),
          photoURL: item.userAvatar,
        },
      });
    };

    return (
      <PostCard
        post={item}
        index={index}
        isLiked={isLiked}
        isSaved={isSaved}
        onLikePress={() => handleLike(item)}
        onSavePress={() => handleSave(item)}
        onOpenPost={() => openPostDetail()}
        onCommentPress={() => openPostDetail({ focusComments: true })}
        onOpenAuthor={openPublicProfile}
        onSharePress={() => handleShare(item)}
        colors={colors}
      />
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return <ScreenState loading colors={colors} />;
    }

    if (error) {
      return (
        <ScreenState
          icon="cloud-offline-outline"
          title="Gagal memuat feed"
          message={error}
          actionLabel="Coba lagi"
          onAction={refetch}
          colors={colors}
        />
      );
    }

    return (
      <ScreenState
        icon="images-outline"
        title="Belum ada postingan"
        message="Postingan dari backend akan muncul di sini setelah berhasil dibuat."
        colors={colors}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#FFFFFF' }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card || '#FFFFFF'}
      />
      <PanGestureHandler
        activeOffsetX={[-18, 18]}
        failOffsetY={[-24, 24]}
        onHandlerStateChange={handleFeedSwipe}
      >
        <View style={styles.feedShell}>
          <ScreenHeader showMenu showLogo onMenuPress={openDrawer} colors={colors} />

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
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feedShell: {
    flex: 1,
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
