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

import UserAvatar from '../../components/common/UserAvatar';
import { notificationUsecases } from '../../../domain/usecases/notificationUsecases';
import { socialUsecases } from '../../../domain/usecases/socialUsecases';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

const PURPLE = '#6366F1';

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [followBackLoadingIds, setFollowBackLoadingIds] = useState({});
  const [followedBackIds, setFollowedBackIds] = useState({});

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

  const handleFollowBack = useCallback(async (notification) => {
    const targetUserId = notification.actor?.id || notification.actorId;

    if (!user?.id || !targetUserId || user.id === targetUserId) return;

    setFollowBackLoadingIds((current) => ({ ...current, [notification.id]: true }));
    setError(null);

    try {
      await socialUsecases.followUser(user.id, targetUserId);
      setFollowedBackIds((current) => ({ ...current, [notification.id]: true }));
    } catch (err) {
      setError(err.message || 'Gagal follow back.');
      console.log('Gagal follow back:', err?.message || err);
    } finally {
      setFollowBackLoadingIds((current) => ({ ...current, [notification.id]: false }));
    }
  }, [user?.id]);

  const renderItem = ({ item }) => {
    if (item.type === 'section') {
      return <Text style={[styles.sectionTitle, { color: colors.text || '#111827' }]}>{item.title}</Text>;
    }

    return (
      <NotificationItem
        notification={item}
        followBackLoading={!!followBackLoadingIds[item.id]}
        followedBack={!!followedBackIds[item.id]}
        onFollowBack={handleFollowBack}
        colors={colors}
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
        <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.72}>
          <Ionicons name="search-outline" size={22} color={PURPLE} />
        </TouchableOpacity>
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

function NotificationItem({ notification, followBackLoading, followedBack, onFollowBack, colors }) {
  const actorName = notification.actor?.username || notification.actor?.displayName || 'Pengguna';
  const descriptor = getNotificationDescriptor(notification.type);

  return (
    <View style={[styles.notificationItem, { backgroundColor: colors.background || '#FCF8FF' }]}>
      <View style={styles.avatarWrap}>
        <UserAvatar
          name={actorName}
          uri={notification.actor?.profilePic || notification.actor?.photoURL}
          size={46}
        />
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
      </View>

      <View style={styles.notificationBody}>
        <Text style={[styles.notificationText, { color: colors.text || '#1D1B26' }]}>
          <Text style={styles.actorName}>{actorName}</Text>
          {descriptor.message}
        </Text>
        <Text style={[styles.timeText, { color: colors.mutedText || '#6B7280' }]}>
          {timeAgo(notification.createdAt)}
        </Text>
      </View>

      {notification.type === 'FOLLOW' ? (
        <TouchableOpacity
          style={[
            styles.followBackButton,
            followedBack && styles.followingButton,
            followedBack && { backgroundColor: colors.card || '#FFFFFF' },
          ]}
          activeOpacity={0.78}
          disabled={followBackLoading || followedBack}
          onPress={() => onFollowBack(notification)}
        >
          {followBackLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[styles.followBackText, followedBack && styles.followingText]}>
              {followedBack ? 'Following' : 'Follow back'}
            </Text>
          )}
        </TouchableOpacity>
      ) : null}
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
        that&apos;s all your activity for the week.
      </Text>
    </View>
  );
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
  headerIconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
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
