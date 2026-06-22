import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Share} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CommentComposer from '../../components/post/CommentComposer';
import CommentItem from '../../components/post/CommentItem';
import PostDetailCard from '../../components/post/PostDetailCard';
import { useDependencies } from '../../../app/DependencyProvider';
import { useAuthStore } from '../../../store/authStore';
import { appThemes } from '../../theme/theme';
import { useThemeStore } from '../../../store/themeStore';

import { socialUsecases } from '../../../domain/usecases/socialUsecases';

const PURPLE = '#6366F1';

function getCurrentUserName(user = {}) {
  return [user.displayName, user.userName, user.username, user.email?.split('@')?.[0]]
    .find((name) => name && !['Pengguna', 'User', 'ScaleGram User'].includes(String(name).trim())) || 'ScaleGram User';
}

function getPostAuthorName(post = {}) {
  return [post.userName, post.displayName, post.userEmail?.split('@')?.[0]]
    .find((name) => name && !['Pengguna', 'User', 'ScaleGram User'].includes(String(name).trim())) || 'ScaleGram User';
}

export default function PostDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const commentsTopRef = useRef(0);
  const post = route.params?.post || {};
  const focusComments = route.params?.focusComments;
  const { repositories: { postRepository } } = useDependencies();
  const user = useAuthStore((state) => state.user);
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [saveSubmitting, setSaveSubmitting] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const commentsCount = comments.length;
  const [localPost, setLocalPost] = useState(post);
  const postAuthorName = getPostAuthorName(localPost);
  const isLiked = Array.isArray(localPost.likedBy) && localPost.likedBy.includes(user?.id);
  const isSaved = Array.isArray(localPost.savedBy) && localPost.savedBy.includes(user?.id);

  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const handleLikeToggle = async () => {
    if (!user?.id || !localPost.id) return;

    const likedBy = Array.isArray(localPost.likedBy) ? localPost.likedBy : [];
    const alreadyLiked = likedBy.includes(user.id);
    
    const nextLikedBy = alreadyLiked
      ? likedBy.filter((id) => id !== user.id)
      : [...likedBy, user.id];
    const nextLikesCount = Math.max((localPost.likesCount || 0) + (alreadyLiked ? -1 : 1), 0);

    const updatedPost = { ...localPost, likedBy: nextLikedBy, likesCount: nextLikesCount };
    
    setLocalPost(updatedPost);

    if (route.params?.onPostUpdate) {
      route.params.onPostUpdate(updatedPost);
    }

    try {
      if (alreadyLiked) {
        await socialUsecases.unlikePost(user.id, localPost.id);
      } else {
        await socialUsecases.likePost(user.id, localPost.id);
      }
    } catch (err) {
      console.error('Error toggle like:', err);
      setLocalPost((prev) => ({ ...prev, likedBy, likesCount: localPost.likesCount }));

      if (route.params?.onPostUpdate) {
        route.params.onPostUpdate(localPost); 
      }
    }
  };

  const handleCommentPress = () => {
    scrollRef.current?.scrollTo({ y: commentsTopRef.current, animated: true });
  };

  const handleSavePress = async () => {
    if (!user?.id || !localPost.id || saveSubmitting) return;

    const savedBy = Array.isArray(localPost.savedBy) ? localPost.savedBy : [];
    const alreadySaved = savedBy.includes(user.id);
    const nextSavedBy = alreadySaved
      ? savedBy.filter((savedUserId) => savedUserId !== user.id)
      : [...savedBy, user.id];
    const updatedPost = { ...localPost, savedBy: nextSavedBy };

    setSaveSubmitting(true);
    setLocalPost(updatedPost);

    if (route.params?.onPostUpdate) {
      route.params.onPostUpdate(updatedPost);
    }

    try {
      if (alreadySaved) {
        await postRepository.unsavePost(localPost.id, user.id);
      } else {
        await postRepository.savePost(localPost.id, user.id);
      }
    } catch (err) {
      setLocalPost((prev) => ({ ...prev, savedBy }));
      if (route.params?.onPostUpdate) {
        route.params.onPostUpdate(localPost);
      }
      Alert.alert('Gagal', err.message || 'Gagal memperbarui saved post.');
    } finally {
      setSaveSubmitting(false);
    }
  };

  const loadComments = useCallback(async () => {
    if (!localPost.id) {
      setComments([]);
      setCommentsLoading(false);
      return;
    }

    setCommentsLoading(true);
    setCommentsError(null);

    try {
      const result = await postRepository.getComments(localPost.id);
      setComments(result);
    } catch (err) {
      setCommentsError(err.message || 'Gagal memuat komentar.');
      console.log('Gagal memuat komentar:', err?.message || err);
    } finally {
      setCommentsLoading(false);
    }
  }, [localPost.id, postRepository]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    if (!focusComments) return;

    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: commentsTopRef.current, animated: true });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [focusComments]);

  const handleAddComment = async () => {
    const text = commentText.trim();
    if (!text || !localPost.id || commentSubmitting) return;

    const localComment = {
      id: `local-${Date.now()}`,
      text,
      userId: user?.id || null,
      userName: getCurrentUserName(user),
      userAvatar: user?.photoURL || null,
      createdAt: new Date(),
    };

    setCommentSubmitting(true);
    setCommentsError(null);
    setComments((currentComments) => [localComment, ...currentComments]);
    setCommentText('');

    try {
      const commentId = await socialUsecases.addComment(localPost.id, {
        text,
        userId: user?.id || null,
        userName: getCurrentUserName(user),
        userAvatar: user?.photoURL || null,
      });

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment.id === localComment.id ? { ...localComment, id: commentId } : comment
        )
      );
    } catch (err) {
      setComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== localComment.id)
      );
      setCommentText(text);
      setCommentsError(err.message || 'Gagal mengirim komentar.');
      console.log('Gagal mengirim komentar:', err?.message || err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const openPublicProfile = () => {
    if (localPost.userId === user?.id) {
      navigation.navigate('MainTabs', { screen: 'Profile' });
      return;
    }

    navigation.navigate('PublicProfile', {
      user: {
        id: localPost.userId,
        displayName: postAuthorName,
        photoURL: localPost.userAvatar,
      },
    });
  };

  const handleShare = async () => {
    try {
      const captionText = localPost.caption ? `\n\n"${localPost.caption}"` : '';
      const shareMessage = `Cek postingan dari ${postAuthorName} di aplikasi kita!${captionText}`;

      const result = await Share.share({
        message: shareMessage,
      });

      if (result.action === Share.sharedAction) {
        console.log('Berhasil membagikan postingan');
      } else if (result.action === Share.dismissedAction) {
        console.log('Batal membagikan');
      }
    } catch (error) {
      console.error('Error saat membagikan:', error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#FFFFFF' }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card || '#FFFFFF'}
      />
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            height: 56 + insets.top,
            backgroundColor: colors.card || '#FFFFFF',
            borderBottomColor: colors.border || '#E5E7EB',
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} activeOpacity={0.72} onPress={navigation.goBack}>
          <Ionicons name="arrow-back" size={22} color={colors.text || '#111827'} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text || '#111827' }]}>Post</Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedText || '#6B7280' }]}>
            {postAuthorName}
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

      <PostDetailCard 
        post={{ ...localPost, commentsCount }}  
        isLiked={isLiked} 
        isSaved={isSaved}
        onLikePress={handleLikeToggle} 
        onOpenAuthor={openPublicProfile} 
        onSharePress={handleShare} 
        onCommentPress={handleCommentPress} 
        onSavePress={handleSavePress} 
        colors={colors}
      />

      <View
        style={[styles.commentsSection, { backgroundColor: colors.card || '#FFFFFF' }]}
        onLayout={(event) => {
          commentsTopRef.current = event.nativeEvent.layout.y;
        }}
      >

      <View style={[styles.commentsHeader, { borderBottomColor: colors.border || '#E5E7EB' }]}>
        <Text style={[styles.commentsTitle, { color: colors.text || '#111827' }]}>Comments</Text>
        <Text style={[styles.commentsCount, { color: colors.mutedText || '#6B7280' }]}>{commentsCount}</Text>
      </View>

      <CommentComposer
        user={user}
        value={commentText}
        loading={commentSubmitting}
        onChangeText={setCommentText}
        onSubmit={handleAddComment}
        colors={colors}
      />

      {commentsLoading ? (
        <View style={styles.loadingComments}>
          <ActivityIndicator size="small" color={PURPLE} />
        </View>
      ) : comments.length > 0 ? (
        comments.map((comment) => <CommentItem key={comment.id} comment={comment} colors={colors} />)
      ) : (
        <View style={styles.emptyComments}>
          <Ionicons name="chatbubble-ellipses-outline" size={30} color={PURPLE} />
          <Text style={[styles.emptyTitle, { color: colors.text || '#111827' }]}>Belum ada komentar</Text>
          <Text style={[styles.emptyMessage, { color: colors.mutedText || '#6B7280' }]}>
            Jadilah yang pertama membalas postingan ini.
          </Text>
        </View>
    )}

      {commentsError ? <Text style={styles.commentsError}>{commentsError}</Text> : null}
        </View>
      </ScrollView>
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
    paddingHorizontal: 12,
    zIndex: 5,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  commentsSection: {
  },
  commentsHeader: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  commentsCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyComments: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 44,
  },
  loadingComments: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  commentsError: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingVertical: 12,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyMessage: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    textAlign: 'center',
  },
});
