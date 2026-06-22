import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import AnimatedProfileTabs from '../../components/profile/AnimatedProfileTabs';
import FollowListModal from '../../components/profile/FollowListModal';
import UserAvatar from '../../components/common/UserAvatar';
import { normalizeProfileUser } from '../../components/profile/profileFormatters';
import { socialUsecases } from '../../../domain/usecases/socialUsecases';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { useFeed } from '../../hooks/useFeed';
import { appThemes } from '../../theme/theme';

import { createPostRepository } from '../../../data/repositories/postRepositoryImpl';
import { userRepository } from '../../../data/repositories/userRepositoryImpl';
import { db } from '../../../config/firebase';

const postRepository = createPostRepository({ db });
const PURPLE = '#6366F1';
const profileTabs = [
  { key: 'posts', label: 'Postingan', icon: 'grid-outline' },
  { key: 'saved', label: 'Saved', icon: 'bookmark-outline' },
];

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const { posts, loading, error, refetch, loadMore } = useFeed(30);

  const [activeTab, setActiveTab] = useState('posts');
  const [profileUser, setProfileUser] = useState(user);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followListType, setFollowListType] = useState(null);

  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const currentProfile = profileUser || user;
  const displayName = currentProfile?.displayName || 'ScaleGram User';
  const email = currentProfile?.email || 'Belum ada user aktif';
  const userPosts = posts.filter((post) => post.userId === user?.id);
  const followersCount = followers.length;
  const followingCount = following.length;

  const gridData = activeTab === 'posts' ? userPosts : savedPosts;
  const currentLoading = activeTab === 'posts' ? loading : loadingSaved;

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setProfileUser(null);
      return;
    }

    try {
      const latestProfile = await userRepository.getProfile(user.id);
      if (latestProfile) {
        setProfileUser(latestProfile);
        updateUser(latestProfile);
      } else {
        setProfileUser(user);
      }
    } catch (err) {
      console.log('Gagal memuat profil terbaru:', err?.message || err);
      setProfileUser(user);
    }
  }, [updateUser, user?.id]);

  const loadSocialStats = useCallback(async () => {
    if (!user?.id) {
      setFollowers([]);
      setFollowing([]);
      return;
    }

    try {
      const [followers, following] = await Promise.all([
        socialUsecases.getFollowers(user.id),
        socialUsecases.getFollowing(user.id),
      ]);

      setFollowers(followers);
      setFollowing(following);
    } catch (err) {
      console.log('Gagal memuat statistik profile:', err?.message || err);
    }
  }, [user?.id]);

  const loadSavedPosts = useCallback(async () => {
    if (!user?.id) return;

    setLoadingSaved(true);
    try {
      const fetchedSavedPosts = await postRepository.getSavedPosts(user.id);
      setSavedPosts(fetchedSavedPosts);
    } catch (err) {
      console.log('Gagal memuat saved posts:', err);
    } finally {
      setLoadingSaved(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'saved') {
      loadSavedPosts();
    }
  }, [activeTab, loadSavedPosts]);

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

  useFocusEffect(
    useCallback(() => {
      refetch();
      loadProfile();
      loadSocialStats();
      if (activeTab === 'saved') loadSavedPosts();
    }, [loadProfile, loadSocialStats, refetch, activeTab, loadSavedPosts])
  );

  const handleSelectFollowUser = (selectedUser) => {
    const normalizedUser = normalizeProfileUser(selectedUser);
    setFollowListType(null);

    if (!normalizedUser.id || normalizedUser.id === user?.id) return;

    navigation.getParent()?.navigate('PublicProfile', { user: normalizedUser });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            height: 56 + insets.top,
            paddingTop: insets.top,
            borderBottomColor: colors.border || '#E5E7EB',
            backgroundColor: colors.card || '#FFFFFF',
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text || '#111827' }]} numberOfLines={1}>
          {displayName}
        </Text>
      </View>

        <View style={[styles.profileSection, { backgroundColor: colors.card || '#FFFFFF' }]}>
        <View style={styles.profileTopRow}>
          <View style={[styles.avatarRing, { backgroundColor: colors.card || '#FFFFFF' }]}>
            <UserAvatar name={displayName} uri={currentProfile?.photoURL || currentProfile?.photoUrl} size={86} />
          </View>

          <View style={styles.statsRow}>
            <ProfileStat value={String(userPosts.length)} label="Posts" colors={colors} />
            <ProfileStat
              value={String(followersCount)}
              label="Followers"
              colors={colors}
              onPress={() => setFollowListType('followers')}
            />
            <ProfileStat
              value={String(followingCount)}
              label="Following"
              colors={colors}
              onPress={() => setFollowListType('following')}
            />
          </View>
        </View>

        <View style={styles.bioBlock}>
          <Text style={[styles.displayName, { color: colors.text || '#111827' }]}>
            {displayName}
          </Text>
          <Text style={[styles.emailText, { color: colors.mutedText || '#6B7280' }]} numberOfLines={1}>
            {email}
          </Text>
          <Text style={[styles.bioText, { color: colors.text || '#111827' }]}>
            {currentProfile?.bio || 'Share moments, save inspiration, and keep your creative feed tidy.'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.editButton, { borderColor: colors.border || '#D1D5DB' }]}
          activeOpacity={0.76}
          onPress={() => navigation.navigate('EditProfileScreen', { currentUser: currentProfile })}
        >
          <Text style={[styles.editButtonText, { color: colors.text || '#111827' }]}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <PanGestureHandler
        activeOffsetX={[-20, 20]}
        failOffsetY={[-18, 18]}
        onHandlerStateChange={handleProfileSwipe}
      >
        <View style={styles.contentArea}>
          <AnimatedProfileTabs
            tabs={profileTabs}
            activeTab={activeTab}
            colors={colors}
            onChange={setActiveTab}
          />

          <FlatList
            data={gridData}
            key={activeTab}
            keyExtractor={(item) => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.gridContent,
              gridData.length === 0 && styles.emptyGridContent,
            ]}
            renderItem={({ item }) => (
              <PostThumbnail
                post={item}
                onPress={() => navigation.getParent()?.navigate('PostDetail', { post: item })}
              />
            )}
            ListEmptyComponent={
              <ProfileGridEmpty
                activeTab={activeTab}
                loading={currentLoading}
                error={error}
                colors={colors}
              />
            }
            onEndReached={activeTab === 'posts' ? loadMore : undefined}
            onEndReachedThreshold={0.5}
          />
        </View>
      </PanGestureHandler>

      <FollowListModal
        visible={!!followListType}
        title={followListType === 'following' ? 'Following' : 'Followers'}
        users={followListType === 'following' ? following : followers}
        colors={colors}
        onClose={() => setFollowListType(null)}
        onSelectUser={handleSelectFollowUser}
      />
    </SafeAreaView>
  );
}

function PostThumbnail({ post, onPress }) {
  return (
    <TouchableOpacity style={styles.gridCellWrap} activeOpacity={0.82} onPress={onPress}>
      <View style={styles.gridCell}>
        {post.imageUrl ? (
          <Image source={{ uri: post.imageUrl }} style={styles.thumbnailImage} contentFit="cover" />
        ) : (
          <Ionicons name="image-outline" size={24} color={PURPLE} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function ProfileGridEmpty({ activeTab, loading, error, colors }) {
  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="small" color={PURPLE} />
      </View>
    );
  }

  const isSaved = activeTab === 'saved';

  return (
    <View style={styles.emptyState}>
      <Ionicons
        name={isSaved ? 'bookmark-outline' : 'images-outline'}
        size={34}
        color={PURPLE}
      />
      <Text style={[styles.emptyTitle, { color: colors.text || '#111827' }]}>
        {isSaved ? 'Belum ada saved post' : 'Belum ada postingan'}
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.mutedText || '#6B7280' }]}>
        {error || (isSaved
          ? 'Postingan yang kamu simpan akan muncul di sini.'
          : 'Postingan yang kamu buat akan tampil di grid profile.')}
      </Text>
    </View>
  );
}

function ProfileStat({ value, label, colors, onPress }) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.statItem} activeOpacity={0.72} onPress={onPress}>
      <Text style={[styles.statValue, { color: colors.text || '#111827' }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedText || '#6B7280' }]}>{label}</Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  contentArea: {
    flex: 1,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 2,
    borderColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 18,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  bioBlock: {
    marginTop: 14,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '800',
  },
  emailText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  editButton: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  gridContent: {
    paddingBottom: 104,
  },
  emptyGridContent: {
    flexGrow: 1,
  },
  gridCellWrap: {
    width: '33.333%',
    aspectRatio: 1,
    padding: 1,
  },
  gridCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 52,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyMessage: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
  },
});
