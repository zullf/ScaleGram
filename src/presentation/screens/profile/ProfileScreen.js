import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import UserAvatar from '../../components/common/UserAvatar';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { useFeed } from '../../hooks/useFeed';
import { appThemes } from '../../theme/theme';

const PURPLE = '#6366F1';
const profileTabs = [
  { key: 'posts', label: 'Postingan', icon: 'grid-outline' },
  { key: 'saved', label: 'Saved', icon: 'bookmark-outline' },
];

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const { posts, loading, error, refetch, loadMore } = useFeed(30);
  const [activeTab, setActiveTab] = useState('posts');

  const displayName = user?.displayName || 'ScaleGram User';
  const email = user?.email || 'Belum ada user aktif';
  const userPosts = posts.filter((post) => post.userId === user?.id);
  const gridData = activeTab === 'posts' ? userPosts : [];

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            height: 56 + insets.top,
            paddingTop: insets.top,
            borderBottomColor: colors.border || '#E5E7EB',
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text || '#111827' }]} numberOfLines={1}>
          {displayName}
        </Text>
        <TouchableOpacity style={styles.settingsButton} activeOpacity={0.72}>
          <Ionicons name="settings-outline" size={24} color={colors.text || '#111827'} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileTopRow}>
          <View style={styles.avatarRing}>
            <UserAvatar name={displayName} uri={user?.photoURL} size={86} />
          </View>

          <View style={styles.statsRow}>
            <ProfileStat value={String(userPosts.length)} label="Posts" colors={colors} />
            <ProfileStat value="0" label="Followers" colors={colors} />
            <ProfileStat value="0" label="Following" colors={colors} />
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
            Share moments, save inspiration, and keep your creative feed tidy.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.editButton, { borderColor: colors.border || '#D1D5DB' }]}
          activeOpacity={0.76}
        >
          <Text style={[styles.editButtonText, { color: colors.text || '#111827' }]}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tabsRow, { borderTopColor: colors.border || '#E5E7EB', borderBottomColor: colors.border || '#E5E7EB' }]}>
        {profileTabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={isActive ? PURPLE : colors.mutedText || '#6B7280'}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? PURPLE : colors.mutedText || '#6B7280' },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={gridData}
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
            loading={loading && activeTab === 'posts'}
            error={error}
            colors={colors}
          />
        }
        onEndReached={activeTab === 'posts' ? loadMore : undefined}
        onEndReachedThreshold={0.5}
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

function ProfileStat({ value, label, colors }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.text || '#111827' }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedText || '#6B7280' }]}>{label}</Text>
    </View>
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
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
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
    backgroundColor: '#FFFFFF',
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
  tabsRow: {
    height: 50,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: PURPLE,
  },
  tabText: {
    fontSize: 12,
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
