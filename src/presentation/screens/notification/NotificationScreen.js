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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDependencies } from '../../../app/DependencyProvider';
import { notificationUsecases } from '../../../domain/usecases/notificationUsecases';
import { socialUsecases } from '../../../domain/usecases/socialUsecases';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import UserAvatar from '../../components/common/UserAvatar';
import { normalizeProfileUser } from '../../components/profile/profileFormatters';
import { appThemes } from '../../theme/theme';

const PURPLE = '#6366F1';

export default function NotificationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const { repositories: { postRepository } } = useDependencies();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openingPostId, setOpeningPostId] = useState(null);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const result = await notificationUsecases.getNotifications(user.id);
      setNotifications(result);
    } catch (err) {
      setError(err.message || 'Gagal memuat aktivitas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const sections = useMemo(() => groupNotifications(notifications), [notifications]);

  const listData = useMemo(
    () => sections.flatMap((section) => [
      { id: `section-${section.title}`, type: 'section', title: section.title },
      ...section.data,
    ]),
    [sections]
  );

  const openActorProfile = useCallback((notification) => {
    const actor = normalizeNotificationActor(notification);

    if (!actor.id) return;

    if (actor.id === user?.id) {
      navigation.navigate('Profile');
      return;
    }

    const rootNavigation = navigation.getParent?.() || navigation;
    rootNavigation.navigate('PublicProfile', { user: actor });
  }, [navigation, user?.id]);

  const openNotificationTarget = useCallback(async (notification) => {
    if (notification.type === 'FOLLOW') {
      openActorProfile(notification);
      return;
    }

    if (!notification.referenceId) {
      openActorProfile(notification);
      return;
    }

    setOpeningPostId(notification.id);
    try {
      const post = await postRepository.getPostById(notification.referenceId);
      if (post) {
        const rootNavigation = navigation.getParent?.() || navigation;
        rootNavigation.navigate('PostDetail', { post });
      }
    } catch (err) {
      setError(err.message || 'Gagal membuka postingan.');
    } finally {
      setOpeningPostId(null);
    }
  }, [navigation, openActorProfile, postRepository]);

  const renderItem = ({ item }) => {
    if (item.type === 'section') {
      return <Text style={[styles.sectionTitle, { color: colors.text || '#111827' }]}>{item.title}</Text>;
    }

    return (
      <NotificationItem
        notification={item}
        colors={colors}
        opening={openingPostId === item.id}
        onOpenActor={() => openActorProfile(item)}
        onOpenTarget={() => openNotificationTarget(item)}
      />
    );
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
        <View style={styles.headerSide} />
        <Text style={[styles.headerTitle, { color: colors.primary || PURPLE }]}>Activity</Text>
        <View style={styles.headerSide} />
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { backgroundColor: colors.background || '#FCF8FF' },
          listData.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchNotifications(true)}
            tintColor={PURPLE}
            colors={[PURPLE]}
          />
        }
        ListEmptyComponent={
          <ActivityState loading={loading} error={error} onRetry={() => fetchNotifications()} colors={colors} />
        }
        ListFooterComponent={listData.length > 0 ? <ActivityFooter colors={colors} /> : null}
      />
    </SafeAreaView>
  );
}

function NotificationItem({ notification, colors, opening, onOpenActor, onOpenTarget }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const actor = normalizeNotificationActor(notification);
  const actorName = actor.displayName || actor.email || 'Pengguna';
  const actorPhoto = actor.photoURL;
  const descriptor = getNotificationDescriptor(notification.type);
  const targetUserId = actor.id || notification.actorId;

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (notification.type !== 'FOLLOW') return;

      if (currentUser?.id && targetUserId) {
        setIsChecking(true);
        try {
          const status = await socialUsecases.checkFollowStatus(currentUser.id, targetUserId);
          setIsFollowing(status);
        } catch (err) {
          console.error('Gagal cek status follow:', err);
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkFollowStatus();
  }, [currentUser?.id, notification.type, targetUserId]);

  const handlePressFollow = async () => {
    if (!currentUser?.id || !targetUserId || currentUser.id === targetUserId || isActionLoading) return;

    const nextIsFollowing = !isFollowing;
    setIsActionLoading(true);
    setIsFollowing(nextIsFollowing);

    try {
      if (nextIsFollowing) {
        await socialUsecases.followUser(currentUser.id, targetUserId);
      } else {
        await socialUsecases.unfollowUser(currentUser.id, targetUserId);
      }
    } catch (err) {
      setIsFollowing(!nextIsFollowing);
      console.error('Gagal toggle follow dari notifikasi:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <View style={[styles.notificationItem, { backgroundColor: colors.background || '#FCF8FF' }]}>
      <TouchableOpacity style={styles.avatarWrap} activeOpacity={0.78} onPress={onOpenActor}>
        <UserAvatar name={actorName} uri={actorPhoto} size={46} />
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor: descriptor.color,
              borderColor: colors.background || '#FCF8FF',
            },
          ]}
        >
          <Ionicons name={descriptor.badgeIcon} size={11} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.notificationBody} activeOpacity={0.78} onPress={onOpenTarget}>
        <Text style={[styles.notificationText, { color: colors.text || '#1D1B26' }]}>
          <Text style={styles.actorName}>{actorName}</Text>
          {descriptor.message}
        </Text>
        <Text style={[styles.timeText, { color: colors.mutedText || '#6B7280' }]}>
          {timeAgo(notification.createdAt)}
        </Text>
      </TouchableOpacity>

      {opening ? (
        <ActivityIndicator size="small" color={PURPLE} />
      ) : notification.type === 'FOLLOW' ? (
        <TouchableOpacity
          style={[
            styles.followBackButton,
            isFollowing && styles.followingButton,
            isFollowing && { backgroundColor: colors.card || '#FFFFFF' },
          ]}
          activeOpacity={0.78}
          disabled={isActionLoading || isChecking}
          onPress={handlePressFollow}
        >
          {isActionLoading || isChecking ? (
            <ActivityIndicator size="small" color={isFollowing ? PURPLE : '#FFFFFF'} />
          ) : (
            <Text style={[styles.followBackText, isFollowing && styles.followingText]}>
              {isFollowing ? 'Following' : 'Follow back'}
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.openButton} activeOpacity={0.72} onPress={onOpenTarget}>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedText || '#9CA3AF'} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function ActivityState({ loading, error, onRetry, colors }) {
  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <View style={styles.stateContainer}>
      <Ionicons name={error ? 'alert-circle-outline' : 'notifications-outline'} size={36} color={PURPLE} />
      <Text style={[styles.stateTitle, { color: colors.text || '#111827' }]}>
        {error ? 'Gagal memuat aktivitas' : 'Belum ada aktivitas'}
      </Text>
      <Text style={[styles.stateMessage, { color: colors.mutedText || '#6B7280' }]}>
        {error || 'Notifikasi dari follow, like, dan komentar akan muncul di sini.'}
      </Text>
      {error ? (
        <TouchableOpacity style={styles.retryButton} activeOpacity={0.78} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Coba lagi</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function ActivityFooter({ colors }) {
  return (
    <View style={styles.footer}>
      <Ionicons name="refresh-circle-outline" size={34} color={colors.mutedText || '#B7B1C9'} />
      <Text style={[styles.footerText, { color: colors.mutedText || '#A8A2B8' }]}>
        That's all your activity for the week.
      </Text>
    </View>
  );
}

function normalizeNotificationActor(notification = {}) {
  const actor = notification.actor || {};

  return normalizeProfileUser({
    id: actor.id || notification.actorId,
    displayName: actor.displayName || actor.username || actor.email,
    photoURL: actor.photoURL || actor.photoUrl || actor.profilePic,
    email: actor.email,
    bio: actor.bio,
  });
}

function groupNotifications(notifications) {
  const today = [];
  const thisWeek = [];

  notifications.forEach((notification) => {
    if (isToday(notification.createdAt)) {
      today.push(notification);
    } else {
      thisWeek.push(notification);
    }
  });

  return [
    today.length > 0 ? { title: 'Today', data: today } : null,
    thisWeek.length > 0 ? { title: 'This Week', data: thisWeek } : null,
  ].filter(Boolean);
}

function getNotificationDescriptor(type) {
  switch (type) {
    case 'FOLLOW':
      return {
        message: ' started following you.',
        badgeIcon: 'person-add',
        color: PURPLE,
      };
    case 'LIKE':
      return {
        message: ' liked your post.',
        badgeIcon: 'heart',
        color: '#4F46E5',
      };
    case 'COMMENT':
      return {
        message: ' commented on your post.',
        badgeIcon: 'chatbubble',
        color: '#2563EB',
      };
    default:
      return {
        message: ' interacted with you.',
        badgeIcon: 'notifications',
        color: PURPLE,
      };
  }
}

function toDate(dateInput) {
  if (!dateInput) return null;
  return dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
}

function isToday(dateInput) {
  const date = toDate(dateInput);
  if (!date) return true;

  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function timeAgo(dateInput) {
  const date = toDate(dateInput);
  if (!date) return 'Baru saja';

  const seconds = Math.max(Math.round((Date.now() - date.getTime()) / 1000), 0);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return 'Baru saja';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerSide: {
    width: 42,
    height: 42,
  },
  headerTitle: {
    flex: 1,
    color: PURPLE,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 104,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 14,
  },
  notificationItem: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    marginRight: 12,
  },
  typeBadge: {
    position: 'absolute',
    right: 0,
    bottom: 1,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBody: {
    flex: 1,
    minWidth: 0,
  },
  notificationText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  actorName: {
    fontWeight: '900',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  followBackButton: {
    minWidth: 94,
    height: 34,
    borderRadius: 17,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    paddingHorizontal: 14,
  },
  followingButton: {
    backgroundColor: '#FFFFFF',
    borderColor: PURPLE,
    borderWidth: 1,
  },
  followBackText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  followingText: {
    color: PURPLE,
  },
  openButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  stateMessage: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
});
