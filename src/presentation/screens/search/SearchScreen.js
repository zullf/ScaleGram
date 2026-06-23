import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeStore } from '../../../store/themeStore';
import { useFeed } from '../../hooks/useFeed';
import { appThemes } from '../../theme/theme';

const PURPLE = '#6366F1';
const GRID_PADDING = 12;
const CARD_GAP = 8;
const GRID_COLUMNS = 3;
const logoImage = require('../../../../assets/logo.jpg');

const SearchPostCard = memo(function SearchPostCard({ post, cardWidth, colors, onPress }) {
  const hasImage = Boolean(post.imageUrl);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.postCard,
        {
          width: cardWidth,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {hasImage ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.postImage}
          contentFit="cover"
          transition={160}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={24} color={colors.mutedText} />
        </View>
      )}

      <View style={styles.cardContent}>
        <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
          {post.userName || 'Pengguna ScaleGram'}
        </Text>
        <Text style={[styles.caption, { color: colors.mutedText }]} numberOfLines={2}>
          {post.caption || 'Postingan tanpa caption'}
        </Text>

        <View style={styles.likesRow}>
          <Ionicons name="heart" size={11} color={PURPLE} />
          <Text style={[styles.likesText, { color: colors.text }]}>
            {post.likesCount || 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const SearchHeader = memo(function SearchHeader({
  colors,
  query,
  onQueryChange,
  onClearQuery,
}) {
  return (
    <View style={styles.headerContent}>
      <View style={[styles.brandHeader, { backgroundColor: colors.background }]}>
        <Image source={logoImage} style={styles.logo} contentFit="contain" />
      </View>

      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search-outline" size={20} color={colors.mutedText} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder="Cari pengguna atau postingan..."
          placeholderTextColor={colors.mutedText}
          selectionColor={PURPLE}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.searchInput, { color: colors.text }]}
        />

        {query ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClearQuery}
            accessibilityRole="button"
            accessibilityLabel="Hapus pencarian"
          >
            <Ionicons name="close-circle" size={20} color={colors.mutedText} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>For You</Text>
          <View style={styles.sectionAccent} />
        </View>
        <Text style={[styles.sectionMeta, { color: colors.mutedText }]}>Jelajahi karya terbaru</Text>
      </View>
    </View>
  );
});

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { width } = useWindowDimensions();
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const {
    posts,
    loading,
    refreshing,
    loadingMore,
    error,
    refetch,
    loadMore,
  } = useFeed(18);

  const cardWidth =
    (width - GRID_PADDING * 2 - CARD_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const filteredPosts = useMemo(() => {
    const keyword = debouncedQuery.toLowerCase();

    if (!keyword) return posts;

    return posts.filter((post) => {
      const userName = post.userName?.toLowerCase() || '';
      const caption = post.caption?.toLowerCase() || '';
      return userName.includes(keyword) || caption.includes(keyword);
    });
  }, [debouncedQuery, posts]);

  const handleQueryChange = useCallback((text) => {
    setQuery(text);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const openPost = useCallback(
    (post) => {
      navigation.getParent()?.navigate('PostDetail', { post });
    },
    [navigation]
  );

  const renderPost = useCallback(
    ({ item }) => (
      <SearchPostCard
        post={item}
        cardWidth={cardWidth}
        colors={colors}
        onPress={() => openPost(item)}
      />
    ),
    [cardWidth, colors, openPost]
  );

  const listHeader = useMemo(
    () => (
      <SearchHeader
        colors={colors}
        query={query}
        onQueryChange={handleQueryChange}
        onClearQuery={clearQuery}
      />
    ),
    [clearQuery, colors, handleQueryChange, query]
  );

  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={[styles.stateMessage, { color: colors.mutedText }]}>Memuat postingan...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateContainer}>
          <Ionicons name="cloud-offline-outline" size={34} color={PURPLE} />
          <Text style={[styles.stateTitle, { color: colors.text }]}>Gagal memuat postingan</Text>
          <Text style={[styles.stateMessage, { color: colors.mutedText }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} activeOpacity={0.78} onPress={refetch}>
            <Text style={styles.retryButtonText}>Coba lagi</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const hasSearchQuery = Boolean(query.trim());

    return (
      <View style={styles.stateContainer}>
        <Ionicons
          name={hasSearchQuery ? 'search-outline' : 'images-outline'}
          size={34}
          color={PURPLE}
        />
        <Text style={[styles.stateTitle, { color: colors.text }]}>
          {hasSearchQuery ? 'Postingan tidak ditemukan' : 'Belum ada postingan'}
        </Text>
        <Text style={[styles.stateMessage, { color: colors.mutedText }]}>
          {hasSearchQuery
            ? 'Coba gunakan nama pengguna atau kata kunci lainnya.'
            : 'Postingan terbaru akan muncul di sini.'}
        </Text>
      </View>
    );
  }, [colors, error, loading, query, refetch]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={filteredPosts}
        keyExtractor={keyExtractor}
        renderItem={renderPost}
        numColumns={GRID_COLUMNS}
        columnWrapperStyle={styles.cardRow}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footerLoader} color={PURPLE} />
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        onRefresh={refetch}
        refreshing={refreshing}
        onEndReached={loadMore}
        onEndReachedThreshold={0.45}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 112,
  },
  headerContent: {
    marginHorizontal: -GRID_PADDING,
  },
  brandHeader: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 148,
    height: 44,
  },
  searchBar: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 13,
    paddingHorizontal: 11,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 27,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sectionAccent: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: PURPLE,
    marginTop: 7,
  },
  sectionMeta: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardRow: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  postCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 1,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#EDE9FE',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE9FE',
  },
  cardContent: {
    minHeight: 76,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  userName: {
    fontSize: 10,
    fontWeight: '800',
  },
  caption: {
    minHeight: 26,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 4,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  likesText: {
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 4,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 56,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  stateMessage: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: PURPLE,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footerLoader: {
    paddingVertical: 18,
  },
});
