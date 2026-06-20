import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CommentComposer from '../../components/post/CommentComposer';
import CommentItem from '../../components/post/CommentItem';
import PostDetailCard from '../../components/post/PostDetailCard';
import { useAuthStore } from '../../../store/authStore';

const PURPLE = '#6366F1';

export default function PostDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const commentsTopRef = useRef(0);
  const post = route.params?.post || {};
  const focusComments = route.params?.focusComments;
  const user = useAuthStore((state) => state.user);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const commentsCount = (post.commentsCount || 0) + comments.length;
  const displayPost = { ...post, commentsCount };

  useEffect(() => {
    if (!focusComments) return;

    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: commentsTopRef.current, animated: true });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [focusComments]);

  const handleAddComment = () => {
    const text = commentText.trim();
    if (!text) return;

    setComments((currentComments) => [
      {
        id: `local-${Date.now()}`,
        text,
        userName: user?.displayName || user?.email || 'User',
        userAvatar: user?.photoURL || null,
        createdAt: new Date(),
      },
      ...currentComments,
    ]);
    setCommentText('');
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
        <PostDetailCard post={displayPost} />

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
            onChangeText={setCommentText}
            onSubmit={handleAddComment}
          />

          {comments.length > 0 ? (
            comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
          ) : (
            <View style={styles.emptyComments}>
              <Ionicons name="chatbubble-ellipses-outline" size={30} color={PURPLE} />
              <Text style={styles.emptyTitle}>Belum ada komentar</Text>
              <Text style={styles.emptyMessage}>Jadilah yang pertama membalas postingan ini.</Text>
            </View>
          )}
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
