import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useDependencies } from '../../../app/DependencyProvider';
import { createPostUsecases } from '../../../domain/usecases/postUsecases';
import { socialUsecases } from '../../../domain/usecases/socialUsecases';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import PostCard from '../../components/feed/PostCard';
import { appThemes } from '../../theme/theme';

const PURPLE = '#6366F1';

export default function SearchScreen({ navigation }) {
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const {
    repositories: { postRepository },
  } = useDependencies();
  const postUsecases = useMemo(() => createPostUsecases(postRepository), [postRepository]);
  const user = useAuthStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleChangeSearchQuery = (value) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
    }
  };

  const handleSearch = async () => {
    const tag = searchQuery.trim().replace(/^#/, '');

    if (!tag) {
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    if (isLoading) return;

    Keyboard.dismiss();
    setIsLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const results = await postUsecases.searchPostsByTag(tag);
      setSearchResults(results);
    } catch (err) {
      setSearchResults([]);
      setError(err.message || 'Gagal mencari postingan.');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = (updatedPost) => {
    setSearchResults((currentPosts) =>
      currentPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handleLike = async (post) => {
    if (!user?.id || !post?.id) return;

    const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    const alreadyLiked = likedBy.includes(user.id);
    const nextLikedBy = alreadyLiked
      ? likedBy.filter((userId) => userId !== user.id)
      : [...likedBy, user.id];
    const nextLikesCount = Math.max((post.likesCount || 0) + (alreadyLiked ? -1 : 1), 0);

    updatePost({ ...post, likedBy: nextLikedBy, likesCount: nextLikesCount });

    try {
      if (alreadyLiked) {
        await socialUsecases.unlikePost(user.id, post.id);
      } else {
        await socialUsecases.likePost(user.id, post.id);
      }
    } catch (err) {
      console.error('Error updating like from search:', err);
      updatePost({ ...post, likedBy, likesCount: post.likesCount || 0 });
    }
  };

  const handleSave = async (post) => {
    if (!user?.id || !post?.id) return;

    const savedBy = Array.isArray(post.savedBy) ? post.savedBy : [];
    const alreadySaved = savedBy.includes(user.id);
    const nextSavedBy = alreadySaved
      ? savedBy.filter((userId) => userId !== user.id)
      : [...savedBy, user.id];

    updatePost({ ...post, savedBy: nextSavedBy });

    try {
      if (alreadySaved) {
        await postRepository.unsavePost(post.id, user.id);
      } else {
        await postRepository.savePost(post.id, user.id);
      }
    } catch (err) {
      console.error('Error updating save from search:', err);
      updatePost({ ...post, savedBy });
    }
  };

  const handleShare = async (post) => {
    if (!post?.id) return;

    try {
      const captionText = post.caption ? `\n\n"${post.caption}"` : '';
      const imageText = post.imageUrl ? `\n\n${post.imageUrl}` : '';

      await Share.share({
        message: `Cek postingan dari ${post.userName || 'seseorang'} di ScaleGram!${captionText}${imageText}`,
      });
    } catch (err) {
      console.error('Error sharing from search:', err?.message || err);
    }
  };

  const renderPost = ({ item }) => {
    const likedBy = Array.isArray(item.likedBy) ? item.likedBy : [];
    const isLiked = Boolean(user?.id && likedBy.includes(user.id));
    const savedBy = Array.isArray(item.savedBy) ? item.savedBy : [];
    const isSaved = Boolean(user?.id && savedBy.includes(user.id));

    const openPostDetail = (params = {}) => {
      navigation.getParent()?.navigate('PostDetail', {
        post: item,
        ...params,
        onPostUpdate: updatePost,
      });
    };

    const openPublicProfile = () => {
      if (item.userId === user?.id) {
        navigation.navigate('Profile');
        return;
      }

      navigation.getParent()?.navigate('PublicProfile', {
        user: {
          id: item.userId,
          displayName: item.userName,
          photoURL: item.userAvatar,
        },
      });
    };

    return (
      <PostCard
        post={item}
        isLiked={isLiked}
        isSaved={isSaved}
        colors={colors}
        onLikePress={() => handleLike(item)}
        onSavePress={() => handleSave(item)}
        onOpenPost={() => openPostDetail()}
        onCommentPress={() => openPostDetail({ focusComments: true })}
        onOpenAuthor={openPublicProfile}
        onSharePress={() => handleShare(item)}
      />
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={[styles.stateTitle, { color: colors.text }]}>Mencari postingan</Text>
        </View>
      );
    }

    if (error) {
      return (
        <SearchState
          icon="alert-circle-outline"
          title="Pencarian gagal"
          message={error}
          colors={colors}
        />
      );
    }

    if (!hasSearched || !searchQuery.trim()) {
      return (
        <SearchState
          icon="compass-outline"
          title="Cari berdasarkan tag"
          message="Ketik tag seperti travel, food, atau design lalu tekan Search."
          colors={colors}
        />
      );
    }

    return (
      <SearchState
        icon="search-outline"
        title="Tidak ada hasil"
        message={`Belum ada postingan dengan tag #${searchQuery.trim().replace(/^#/, '').toLowerCase()}.`}
        colors={colors}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border || '#E5E7EB',
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card || '#FFFFFF',
              borderColor: isFocused ? PURPLE : colors.border || '#E5E7EB',
            },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={isFocused ? PURPLE : '#9CA3AF'} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            placeholder="Search posts by tag"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onChangeText={handleChangeSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      <FlatList
        data={searchQuery.trim() ? searchResults : []}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.resultsContent,
          (!searchQuery.trim() || searchResults.length === 0) && styles.emptyResultsContent,
        ]}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

function SearchState({ icon, title, message, colors }) {
  return (
    <View style={styles.stateContainer}>
      <View style={styles.stateIcon}>
        <Ionicons name={icon} size={30} color={PURPLE} />
      </View>
      <Text style={[styles.stateTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.stateMessage, { color: colors.mutedText }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 14,
  },
  searchBar: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
    paddingVertical: 0,
  },
  resultsContent: {
    paddingBottom: 104,
  },
  emptyResultsContent: {
    flexGrow: 1,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  stateIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  stateMessage: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
  },
});
