import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, InteractionManager, SafeAreaView, StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import AnimatedProfileTabs from '../../components/profile/AnimatedProfileTabs';
import ProfileGridEmpty from '../../components/profile/ProfileGridEmpty';
import ProfileHeaderBar from '../../components/profile/ProfileHeaderBar';
import ProfilePostGridItem from '../../components/profile/ProfilePostGridItem';
import PublicProfileHeader from '../../components/profile/PublicProfileHeader';
import { normalizeProfileUser } from '../../components/profile/profileFormatters';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { userRepository } from '../../../data/repositories/userRepositoryImpl';
import { socialUsecases } from '../../../domain/usecases/socialUsecases';
import { useAuthStore } from '../../../store/authStore';
import { useFeed } from '../../hooks/useFeed';
import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';
import { notificationRepositoryImpl } from '../../../data/repositories/notificationRepositoryImpl';
import { auth } from '../../../config/firebase';

const profileTabs = [
  { key: 'posts', label: 'Postingan', icon: 'grid-outline' },
  { key: 'saved', label: 'Saved', icon: 'bookmark-outline' },
];

export default function PublicProfileScreen({ navigation, route }) {
  const currentUser = useAuthStore((state) => state.user);
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const { posts, loading, error, loadMore } = useFeed(30);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [unfollowConfirmVisible, setUnfollowConfirmVisible] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const routeProfileUser = useMemo(() => normalizeProfileUser(route.params?.user), [route.params?.user]);
  const [profileUser, setProfileUser] = useState(routeProfileUser);
  const isOwnProfile = currentUser?.id === profileUser.id;
  const userPosts = useMemo(
    () => posts.filter((post) => post.userId === profileUser.id),
    [posts, profileUser.id]
  );
  const gridData = useMemo(
    () => (activeTab === 'posts' ? userPosts : []),
    [activeTab, userPosts]
  );
  const followersCount = followers.length;
  const followingCount = following.length;

  useEffect(() => {
    setProfileUser(routeProfileUser);
  }, [routeProfileUser]);

  useEffect(() => {
    if (isOwnProfile) {
      navigation.replace('MainTabs', { screen: 'Profile' });
    }
  }, [isOwnProfile, navigation]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(async () => {
      if (!routeProfileUser.id) return;

      try {
        const latestProfile = await userRepository.getProfile(routeProfileUser.id);
        if (latestProfile) {
          const normalizedProfile = normalizeProfileUser(latestProfile);
          setProfileUser((currentProfile) =>
            currentProfile.id === normalizedProfile.id &&
            currentProfile.displayName === normalizedProfile.displayName &&
            currentProfile.photoURL === normalizedProfile.photoURL &&
            currentProfile.bio === normalizedProfile.bio
              ? currentProfile
              : normalizedProfile
          );
        }
      } catch (err) {
        console.log('Gagal memuat profile user:', err?.message || err);
      }
    });

    return () => task.cancel?.();
  }, [routeProfileUser.id]);

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

      setFollowers(followers);
      setFollowing(following);
      setIsFollowing(followStatus);
    } catch (err) {
      console.log('Gagal memuat status follow:', err?.message || err);
    }
  }, [currentUser?.id, isOwnProfile, profileUser.id]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(loadSocialState);
    return () => task.cancel?.();
  }, [loadSocialState]);

  const updateFollowState = useCallback(async (nextFollowing) => {
    if (!currentUser?.id || !profileUser.id || isOwnProfile) return;

    setIsFollowing(nextFollowing);
    setFollowers((currentFollowers) => {
      if (nextFollowing) {
        const currentProfileUser = normalizeProfileUser(currentUser);
        return currentFollowers.some((item) => item.id === currentProfileUser.id)
          ? currentFollowers
          : [currentProfileUser, ...currentFollowers];
      }

      return currentFollowers.filter((item) => item.id !== currentUser.id);
    });
    setFollowLoading(true);

    try {
      if (nextFollowing) {
        await socialUsecases.followUser(currentUser.id, profileUser.id);
        await notificationRepositoryImpl.createNotification(
          currentUser.id,   
          profileUser.id,   
          'follow',         
          null             
        );

      } else {
        await socialUsecases.unfollowUser(currentUser.id, profileUser.id);
      }
    } catch (err) {
      setIsFollowing(!nextFollowing);
      loadSocialState();
      console.log('Gagal update follow:', err?.message || err);
    } finally {
      setFollowLoading(false);
    }
  }, [currentUser, isOwnProfile, loadSocialState, profileUser.id]);

  const handleToggleFollow = useCallback(() => {
    if (!isFollowing) {
      updateFollowState(true);
      return;
    }

    setUnfollowConfirmVisible(true);
  }, [isFollowing, updateFollowState]);

  const handleProfileSwipe = useCallback((event) => {
    const { state, translationX } = event.nativeEvent;

    if (state !== State.END) return;

    if (translationX < -45) {
      setActiveTab('saved');
    }

    if (translationX > 45) {
      setActiveTab('posts');
    }
  }, []);

  const openFollowNetwork = useCallback((initialTab) => {
    if (!profileUser.id) return;

    navigation.navigate('FollowNetwork', {
      userId: profileUser.id,
      initialTab,
    });
  }, [navigation, profileUser.id]);
  const openFollowers = useCallback(() => openFollowNetwork('followers'), [openFollowNetwork]);
  const openFollowing = useCallback(() => openFollowNetwork('following'), [openFollowNetwork]);
  const keyExtractor = useCallback((item) => item.id, []);
  const renderGridItem = useCallback(
    ({ item }) => (
      <ProfilePostGridItem
        post={item}
        onPress={() => navigation.navigate('PostDetail', { post: item })}
      />
    ),
    [navigation]
  );
  const listHeader = useMemo(
    () => (
      <>
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
          onFollowersPress={openFollowers}
          onFollowingPress={openFollowing}
        />
        <AnimatedProfileTabs
          tabs={profileTabs}
          activeTab={activeTab}
          colors={colors}
          onChange={setActiveTab}
        />
      </>
    ),
    [
      activeTab,
      colors,
      followLoading,
      followersCount,
      followingCount,
      handleToggleFollow,
      isFollowing,
      isOwnProfile,
      openFollowers,
      openFollowing,
      profileUser,
      userPosts.length,
    ]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ProfileHeaderBar
        title={profileUser.displayName}
        subtitle={`${userPosts.length} posts`}
        colors={colors}
        onBack={navigation.goBack}
      />

      <PanGestureHandler
        activeOffsetX={[-20, 20]}
        failOffsetY={[-18, 18]}
        onHandlerStateChange={handleProfileSwipe}
      >
        <View style={styles.contentArea}>
          <FlatList
            data={gridData}
            keyExtractor={keyExtractor}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={listHeader}
            contentContainerStyle={[
              styles.gridContent,
              gridData.length === 0 && styles.emptyGridContent,
            ]}
            renderItem={renderGridItem}
            ListEmptyComponent={
              <ProfileGridEmpty
                loading={loading && activeTab === 'posts'}
                error={activeTab === 'posts' ? error : null}
                colors={colors}
                title={activeTab === 'saved' ? 'Belum ada saved post' : 'Belum ada postingan'}
                message={
                  activeTab === 'saved'
                    ? 'Saved post user lain tidak ditampilkan secara publik.'
                    : 'Postingan user ini akan tampil di sini.'
                }
              />
            }
            onEndReached={activeTab === 'posts' ? loadMore : undefined}
            onEndReachedThreshold={0.5}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            updateCellsBatchingPeriod={50}
            windowSize={7}
            removeClippedSubviews
          />
        </View>
      </PanGestureHandler>
      <ConfirmationModal
        visible={unfollowConfirmVisible}
        title="Batal Mengikuti?"
        message={`Apakah Anda yakin ingin berhenti mengikuti ${profileUser.displayName || 'pengguna ini'}?`}
        confirmText="Unfollow"
        cancelText="Batal"
        isDestructive={true}
        icon="person-remove-outline"
        onConfirm={async () => {
          setUnfollowConfirmVisible(false);
          await updateFollowState(false);
        }}
        onCancel={() => setUnfollowConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  gridContent: {
    paddingBottom: 104,
  },
  emptyGridContent: {
    flexGrow: 1,
  },
});
