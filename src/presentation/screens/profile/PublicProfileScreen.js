import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';

import ProfileGridEmpty from '../../components/profile/ProfileGridEmpty';
import ProfileHeaderBar from '../../components/profile/ProfileHeaderBar';
import ProfilePostGridItem from '../../components/profile/ProfilePostGridItem';
import PublicProfileHeader from '../../components/profile/PublicProfileHeader';
import { normalizeProfileUser } from '../../components/profile/profileFormatters';
import { socialUsecases } from '../../../domain/usecases/socialUsecases';
import { useAuthStore } from '../../../store/authStore';
import { useFeed } from '../../hooks/useFeed';
import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

export default function PublicProfileScreen({ navigation, route }) {
  const currentUser = useAuthStore((state) => state.user);
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const { posts, loading, error, loadMore } = useFeed(30);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const profileUser = useMemo(() => normalizeProfileUser(route.params?.user), [route.params?.user]);
  const isOwnProfile = currentUser?.id === profileUser.id;
  const userPosts = posts.filter((post) => post.userId === profileUser.id);

  useEffect(() => {
    if (isOwnProfile) {
      navigation.replace('MainTabs', { screen: 'Profile' });
    }
  }, [isOwnProfile, navigation]);

  const loadSocialState = useCallback(async () => {
    if (!profileUser.id) return;

    try {
      const [followers, following, followStatus] = await Promise.all([
        socialUsecases.getFollowers(profileUser.id),
        socialUsecases.getFollowing(profileUser.id),
        currentUser?.id && !isOwnProfile
          ? socialUsecases.checkFollowStatus(currentUser.id, profileUser.id)
          : Promise.resolve(false),
      ]);

      setFollowersCount(Math.max(followers.length, followStatus ? 1 : 0));
      setFollowingCount(following.length);
      setIsFollowing(followStatus);
    } catch (err) {
      console.log('Gagal memuat status follow:', err?.message || err);
    }
  }, [currentUser?.id, isOwnProfile, profileUser.id]);

  useEffect(() => {
    loadSocialState();
  }, [loadSocialState]);

  const handleToggleFollow = async () => {
    if (!currentUser?.id || !profileUser.id || isOwnProfile) return;

    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setFollowersCount((count) => Math.max(count + (nextFollowing ? 1 : -1), 0));
    setFollowLoading(true);

    try {
      if (nextFollowing) {
        await socialUsecases.followUser(currentUser.id, profileUser.id);
      } else {
        await socialUsecases.unfollowUser(currentUser.id, profileUser.id);
      }
    } catch (err) {
      setIsFollowing(!nextFollowing);
      setFollowersCount((count) => Math.max(count + (nextFollowing ? -1 : 1), 0));
      console.log('Gagal update follow:', err?.message || err);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ProfileHeaderBar
        title={profileUser.displayName}
        subtitle={`${userPosts.length} posts`}
        colors={colors}
        onBack={navigation.goBack}
      />

      <FlatList
        data={userPosts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <PublicProfileHeader
            colors={colors}
            profileUser={profileUser}
            postsCount={userPosts.length}
            followersCount={followersCount}
            followingCount={followingCount}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            followLoading={followLoading}
            onToggleFollow={handleToggleFollow}
          />
        }
        contentContainerStyle={[
          styles.gridContent,
          userPosts.length === 0 && styles.emptyGridContent,
        ]}
        renderItem={({ item }) => (
          <ProfilePostGridItem
            post={item}
            onPress={() => navigation.navigate('PostDetail', { post: item })}
          />
        )}
        ListEmptyComponent={
          <ProfileGridEmpty loading={loading} error={error} colors={colors} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContent: {
    paddingBottom: 104,
  },
  emptyGridContent: {
    flexGrow: 1,
  },
});
