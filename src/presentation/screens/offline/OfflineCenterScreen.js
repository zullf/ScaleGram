import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDependencies } from '../../../app/DependencyProvider';
import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

const PURPLE = '#6366F1';

const tips = [
  'Images are automatically compressed for offline viewing.',
  'Syncing prioritizes text and small files first.',
  'Low battery mode may pause synchronization.',
];

export default function OfflineCenterScreen({ navigation }) {
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const { dataSources: { sqlite } } = useDependencies();
  const [cachedContent, setCachedContent] = useState([]);
  const [pendingSync, setPendingSync] = useState([]);
  const [lastSync, setLastSync] = useState(null);

  const loadOfflineData = useCallback(() => {
    const cacheEntries = sqlite.getCachedPostEntries?.() || [];
    const pendingActions = sqlite.getPendingActions?.() || [];

    setCachedContent(cacheEntries.map(mapCachedEntry));
    setPendingSync(pendingActions.map(mapPendingAction));
    setLastSync(cacheEntries[0]?.savedAt || null);
  }, [sqlite]);

  useFocusEffect(
    useCallback(() => {
      loadOfflineData();
    }, [loadOfflineData])
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border || '#E5E7EB' }]}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.72} onPress={handleBack}>
          <Ionicons name="arrow-back" size={22} color={colors.text || '#111827'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text || '#111827' }]}>
          Offline Center
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={cachedContent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={[styles.statusCard, { backgroundColor: colors.card || '#FFFFFF' }]}>
              <View style={styles.statusTopRow}>
                <View style={styles.statusIconWrap}>
                  <Ionicons name="cloud-done-outline" size={24} color={PURPLE} />
                </View>
                <View style={styles.statusTextWrap}>
                  <Text style={[styles.statusLabel, { color: colors.mutedText || '#6B7280' }]}>
                    Sync Status
                  </Text>
                  <Text style={[styles.statusTitle, { color: colors.text || '#111827' }]}>
                    {pendingSync.length > 0 ? `${pendingSync.length} action pending` : 'All data up to date'}
                  </Text>
                </View>
              </View>
              <View style={styles.statusMetaRow}>
                <Text style={[styles.lastSyncText, { color: colors.mutedText || '#6B7280' }]}>
                  Last Cache: {lastSync ? formatSavedAt(lastSync) : 'No cached data'}
                </Text>
                <Text style={styles.progressText}>{pendingSync.length > 0 ? 'Queued' : '100%'}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, pendingSync.length > 0 && styles.progressQueued]} />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text || '#111827' }]}>
              Cached Content
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={[styles.cachedItem, { backgroundColor: colors.card || '#FFFFFF' }]}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} contentFit="cover" />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Ionicons name="image-outline" size={22} color={PURPLE} />
              </View>
            )}
            <View style={styles.cachedBody}>
              <Text style={styles.categoryText}>{item.category}</Text>
              <Text style={[styles.itemTitle, { color: colors.text || '#111827' }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.itemDescription, { color: colors.mutedText || '#6B7280' }]} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={[styles.emptyCard, { backgroundColor: colors.card || '#FFFFFF' }]}>
            <Ionicons name="cloud-offline-outline" size={24} color={PURPLE} />
            <Text style={[styles.emptyText, { color: colors.mutedText || '#6B7280' }]}>
              Belum ada cache offline.
            </Text>
          </View>
        }
        ListFooterComponent={
          <>
            <Text style={[styles.sectionTitle, { color: colors.text || '#111827' }]}>
              Pending Sync
            </Text>
            {pendingSync.length > 0 ? pendingSync.map((item) => (
              <View key={item.id} style={[styles.pendingItem, { backgroundColor: colors.card || '#FFFFFF' }]}>
                <View style={styles.pendingIconWrap}>
                  <Ionicons name={item.icon} size={20} color={PURPLE} />
                </View>
                <View style={styles.pendingBody}>
                  <Text style={[styles.itemTitle, { color: colors.text || '#111827' }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.itemDescription, { color: colors.mutedText || '#6B7280' }]}>
                    {item.meta}
                  </Text>
                </View>
                <Ionicons name="sync-outline" size={18} color="#9CA3AF" />
              </View>
            )) : (
              <View style={[styles.emptyCard, { backgroundColor: colors.card || '#FFFFFF' }]}>
                <Ionicons name="checkmark-circle-outline" size={24} color={PURPLE} />
                <Text style={[styles.emptyText, { color: colors.mutedText || '#6B7280' }]}>
                  Tidak ada aksi tertunda.
                </Text>
              </View>
            )}

            <View style={[styles.tipsCard, { backgroundColor: colors.card || '#FFFFFF' }]}>
              <Text style={[styles.tipsTitle, { color: colors.text || '#111827' }]}>
                Connectivity Tips
              </Text>
              {tips.map((tip) => (
                <View key={tip} style={styles.tipRow}>
                  <Ionicons name="information-circle-outline" size={17} color={PURPLE} />
                  <Text style={[styles.tipText, { color: colors.mutedText || '#6B7280' }]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}

function mapCachedEntry(entry) {
  const post = entry.post || {};
  const authorName = [post.userName, post.displayName, post.userEmail?.split('@')?.[0]]
    .find((name) => name && !['Pengguna', 'User', 'ScaleGram User'].includes(String(name).trim())) || null;
  const categoryLabels = {
    feed: 'Feed cache',
    saved: 'Saved post',
    profile: 'Profile media',
  };

  return {
    id: `${entry.category}-${entry.id}`,
    category: categoryLabels[entry.category] || entry.category || 'Cache',
    title: post.caption || authorName || 'Cached post',
    description: authorName ? `Postingan dari ${authorName}` : 'Tersimpan untuk mode offline.',
    imageUrl: post.imageUrl || null,
  };
}

function mapPendingAction(action) {
  const icons = {
    COMMENT: 'chatbubble-ellipses-outline',
    LIKE: 'heart-outline',
    UNLIKE: 'heart-dislike-outline',
    FOLLOW: 'person-add-outline',
    UNFOLLOW: 'person-remove-outline',
  };

  return {
    id: action.id,
    title: `${action.actionType || 'Action'} pending`,
    meta: action.createdAt ? `Queued ${formatSavedAt(action.createdAt)}` : 'Waiting for sync',
    icon: icons[action.actionType] || 'sync-outline',
  };
}

function formatSavedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const cardShadow = {
  shadowColor: '#111827',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 14,
  elevation: 4,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 58,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 42,
  },
  content: {
    padding: 18,
    paddingBottom: 34,
  },
  statusCard: {
    borderRadius: 20,
    padding: 18,
    ...cardShadow,
  },
  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  statusTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },
  statusMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  lastSyncText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressText: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: '900',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: PURPLE,
  },
  progressQueued: {
    width: '64%',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 24,
    marginBottom: 12,
  },
  cachedItem: {
    borderRadius: 18,
    flexDirection: 'row',
    padding: 10,
    marginBottom: 12,
    ...cardShadow,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
  },
  thumbnailPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cachedBody: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    justifyContent: 'center',
  },
  categoryText: {
    color: PURPLE,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  itemDescription: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 4,
  },
  pendingItem: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    ...cardShadow,
  },
  pendingIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  pendingBody: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  emptyCard: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    ...cardShadow,
  },
  emptyText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 10,
  },
  tipsCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    ...cardShadow,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginLeft: 8,
  },
});
