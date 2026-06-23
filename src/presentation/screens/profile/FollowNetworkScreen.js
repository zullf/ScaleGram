import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import UserAvatar from '../../components/common/UserAvatar';
import ProfileHeaderBar from '../../components/profile/ProfileHeaderBar';
import { normalizeProfileUser } from '../../components/profile/profileFormatters';
import { userRepository } from '../../../data/repositories/userRepositoryImpl';
import { socialUsecases } from '../../../domain/usecases/socialUsecases';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

const PURPLE = '#6366F1';
const tabs = [
  { key: 'followers', label: 'Followers' },
  { key: 'following', label: 'Following' },
];

export default function FollowNetworkScreen({ navigation, route }) {
  const { userId, initialTab = 'followers' } = route.params || {};
  const currentUser = useAuthStore((state) => state.user);
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;

  const [activeTab, setActiveTab] = useState(
    initialTab === 'following' ? 'following' : 'followers'
  );
  const [profileUser, setProfileUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const activeUsers = useMemo(
    () => (activeTab === 'followers' ? followers : following),
    [activeTab, followers, following]
  );
  const title = profileUser?.displayName || 'Network';
  const subtitle = `${followers.length} followers · ${following.length} following`;

  const loadNetwork = useCallback(async ({ silent = false } = {}) => {
    if (!userId) {
      setError('User tidak ditemukan.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!silent) setLoading(true);
    setError(null);

    try {
      const [latestProfile, fetchedFollowers, fetchedFollowing] = await Promise.all([
        userRepository.getProfile(userId).catch(() => null),
        socialUsecases.getFollowers(userId),
        socialUsecases.getFollowing(userId),
      ]);

      setProfileUser(latestProfile ? normalizeProfileUser(latestProfile) : null);
      setFollowers(fetchedFollowers.map(normalizeProfileUser).filter((user) => user.id));
      setFollowing(fetchedFollowing.map(normalizeProfileUser).filter((user) => user.id));
    } catch (err) {
      setError(err?.message || 'Gagal memuat daftar user.');
      console.log('Gagal memuat follow network:', err?.message || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNetwork();
  }, [loadNetwork]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNetwork({ silent: true });
  }, [loadNetwork]);

  const handleSelectUser = useCallback((selectedUser) => {
    const normalizedUser = normalizeProfileUser(selectedUser);
    if (!normalizedUser.id) return;

    if (normalizedUser.id === currentUser?.id) {
      navigation.navigate('MainTabs', { screen: 'Profile' });
      return;
    }

    navigation.push('PublicProfile', { user: normalizedUser });
  }, [currentUser?.id, navigation]);

  const renderUser = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[styles.userRow, { borderBottomColor: colors.border || '#EEF2FF' }]}
        activeOpacity={0.76}
        onPress={() => handleSelectUser(item)}
      >
        <UserAvatar name={item.displayName} uri={item.photoURL} size={50} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text || '#111827' }]} numberOfLines={1}>
            {item.displayName}
          </Text>
          <Text style={[styles.userMeta, { color: colors.mutedText || '#6B7280' }]} numberOfLines={2}>
            {item.bio || item.email || 'ScaleGram user'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.mutedText || '#9CA3AF'} />
      </TouchableOpacity>
    ),
    [colors, handleSelectUser]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background || '#FFFFFF' }]}>
      <ProfileHeaderBar
        title={title}
        subtitle={subtitle}
        colors={colors}
        onBack={navigation.goBack}
      />

      <View style={[styles.tabShell, { backgroundColor: colors.card || '#FFFFFF', borderBottomColor: colors.border || '#E5E7EB' }]}>
        <View style={[styles.segmentedControl, { backgroundColor: colors.background || '#F3F4F6' }]}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.key === 'followers' ? followers.length : following.length;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                activeOpacity={0.78}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabLabel, { color: isActive ? '#FFFFFF' : colors.mutedText || '#6B7280' }]}>
                  {tab.label}
                </Text>
                <Text style={[styles.tabCount, { color: isActive ? '#E0E7FF' : colors.mutedText || '#6B7280' }]}>
                  {count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={activeUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={[
          styles.listContent,
          activeUsers.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={PURPLE}
            colors={[PURPLE]}
          />
        }
        ListEmptyComponent={
          <NetworkEmptyState
            loading={loading}
            error={error}
            activeTab={activeTab}
            colors={colors}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function NetworkEmptyState({ loading, error, activeTab, colors }) {
  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="small" color={PURPLE} />
      </View>
    );
  }

  const isFollowers = activeTab === 'followers';

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="people-outline" size={30} color={PURPLE} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text || '#111827' }]}>
        {isFollowers ? 'Belum ada followers' : 'Belum mengikuti siapa pun'}
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.mutedText || '#6B7280' }]}>
        {error || (isFollowers
          ? 'Daftar followers akan muncul di sini.'
          : 'Daftar following akan muncul di sini.')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabShell: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedControl: {
    minHeight: 46,
    borderRadius: 8,
    flexDirection: 'row',
    padding: 4,
  },
  tabButton: {
    flex: 1,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
  },
  activeTabButton: {
    backgroundColor: PURPLE,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '900',
  },
  tabCount: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 28,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  userRow: {
    minHeight: 76,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
  },
  userName: {
    fontSize: 15,
    fontWeight: '900',
  },
  userMeta: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 3,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 14,
  },
  emptyMessage: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
  },
});
