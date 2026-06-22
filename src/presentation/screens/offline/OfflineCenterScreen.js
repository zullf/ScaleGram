import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

const PURPLE = '#6366F1';

const cachedContent = [
  {
    id: 'cached-1',
    category: 'Feed cache',
    title: 'Campus life photo drop',
    description: 'Saved thumbnail and caption for offline browsing.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
  },
  {
    id: 'cached-2',
    category: 'Saved post',
    title: 'Design inspiration board',
    description: 'Compressed preview available without connection.',
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400',
  },
  {
    id: 'cached-3',
    category: 'Profile media',
    title: 'Offline profile snapshot',
    description: 'Recent profile grid data stored locally.',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
  },
];

const pendingSync = [
  { id: 'pending-1', title: 'Comment pending', meta: 'Waiting for stable connection', icon: 'chatbubble-ellipses-outline' },
  { id: 'pending-2', title: 'Like pending', meta: 'Queued in optimistic update queue', icon: 'heart-outline' },
  { id: 'pending-3', title: 'Draft post pending', meta: 'Ready for background sync', icon: 'cloud-upload-outline' },
];

const tips = [
  'Images are automatically compressed for offline viewing.',
  'Syncing prioritizes text and small files first.',
  'Low battery mode may pause synchronization.',
];

export default function OfflineCenterScreen({ navigation }) {
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
                    All data up to date
                  </Text>
                </View>
              </View>
              <View style={styles.statusMetaRow}>
                <Text style={[styles.lastSyncText, { color: colors.mutedText || '#6B7280' }]}>
                  Last Sync: 2 mins ago
                </Text>
                <Text style={styles.progressText}>100%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text || '#111827' }]}>
              Cached Content
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={[styles.cachedItem, { backgroundColor: colors.card || '#FFFFFF' }]}>
            <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} contentFit="cover" />
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
        ListFooterComponent={
          <>
            <Text style={[styles.sectionTitle, { color: colors.text || '#111827' }]}>
              Pending Sync
            </Text>
            {pendingSync.map((item) => (
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
            ))}

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
