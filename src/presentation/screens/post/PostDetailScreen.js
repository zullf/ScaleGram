import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Share} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CommentComposer from '../../components/post/CommentComposer';
import CommentItem from '../../components/post/CommentItem';
import PostDetailCard from '../../components/post/PostDetailCard';
import { useDependencies } from '../../../app/DependencyProvider';
import { useAuthStore } from '../../../store/authStore';

import { socialUsecases } from '../../../domain/usecases/socialUsecases';

const PURPLE = '#6366F1';

export default function PostDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const commentsTopRef = useRef(0);
  const post = route.params?.post || {};
  const focusComments = route.params?.focusComments;
  const { repositories: { postRepository } } = useDependencies();
  const user = useAuthStore((state) => state.user);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const commentsCount = comments.length;
  const displayPost = { ...post, commentsCount };

  const [localPost, setLocalPost] = useState(displayPost);
  const isLiked = Array.isArray(localPost.likedBy) && localPost.likedBy.includes(user?.id);

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

  const handleSavePress = () => {
    alert("Fitur Save/Bookmark akan segera hadir!"); 
  };

  const loadComments = useCallback(async () => {
    if (!post.id) {
      setComments([]);
      setCommentsLoading(false);
      return;
    }

    setCommentsLoading(true);
    setCommentsError(null);

    try {
      const result = await postRepository.getComments(post.id);
      setComments(result);
    } catch (err) {
      setCommentsError(err.message || 'Gagal memuat komentar.');
      console.log('Gagal memuat komentar:', err?.message || err);
    } finally {
      setCommentsLoading(false);
    }
  }, [post.id, postRepository]);

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
    if (!text || !post.id || commentSubmitting) return;

    const localComment = {
      id: `local-${Date.now()}`,
      text,
      userId: user?.id || null,
      userName: user?.displayName || user?.email || 'User',
      userAvatar: user?.photoURL || null,
      createdAt: new Date(),
    };

    setCommentSubmitting(true);
    setCommentsError(null);
    setComments((currentComments) => [localComment, ...currentComments]);
    setCommentText('');

    try {
      const commentId = await socialUsecases.addComment(post.id, {
        text,
        userId: user?.id || null,
        userName: user?.displayName || user?.email || 'User',
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
    if (post.userId === user?.id) {
      navigation.navigate('MainTabs', { screen: 'Profile' });
      return;
    }

    navigation.navigate('PublicProfile', {
      user: {
        id: post.userId,
        displayName: post.userName,
        photoURL: post.userAvatar,
      },
    });
  };

  const handleShare = async () => {
    try {
      const captionText = post.caption ? `\n\n"${post.caption}"` : '';
      const shareMessage = `Cek postingan dari ${post.userName || 'seseorang'} di aplikasi kita!${captionText}`;

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.72} onPress={navigation.goBack}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Post</Text>
          <Text style={styles.headerSubtitle}>{post.userName || 'User'}</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

      <PostDetailCard 
        post={localPost}  
        isLiked={isLiked} 
        onLikePress={handleLikeToggle} 
        onOpenAuthor={openPublicProfile} 
        onSharePress={handleShare} 
        onCommentPress={handleCommentPress} 
        onSavePress={handleSavePress} 
      />

      <View
        style={styles.commentsSection}
        onLayout={(event) => {
          commentsTopRef.current = event.nativeEvent.layout.y;
        }}
      >

      <View style={styles.commentsHeader}>
        <Text style={styles.commentsTitle}>Comments</Text>
        <Text style={styles.commentsCount}>{commentsCount}</Text>
      </View>

      <CommentComposer
        user={user}
        value={commentText}
        loading={commentSubmitting}
        onChangeText={setCommentText}
        onSubmit={handleAddComment}
      />

      {commentsLoading ? (
        <View style={styles.loadingComments}>
          <ActivityIndicator size="small" color={PURPLE} />
        </View>
      ) : comments.length > 0 ? (
        comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
      ) : (
        <View style={styles.emptyComments}>
          <Ionicons name="chatbubble-ellipses-outline" size={30} color={PURPLE} />
          <Text style={styles.emptyTitle}>Belum ada komentar</Text>
          <Text style={styles.emptyMessage}>Jadilah yang pertama membalas postingan ini.</Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
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
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
  },
  commentsHeader: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  commentsTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  commentsCount: {
    color: '#6B7280',
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
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyMessage: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    textAlign: 'center',
  },
});
