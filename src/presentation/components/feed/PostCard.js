import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { TapGestureHandler } from 'react-native-gesture-handler';

import { timeAgo } from '../../../utils/timeFormat';
import IconActionButton from '../common/IconActionButton';
import UserAvatar from '../common/UserAvatar';

const PURPLE = '#6366F1';

const PostCard = React.memo(function PostCard({
  post,
  index = 0,
  isLiked,
  isSaved,
  onLikePress,
  onSavePress,
  onOpenPost,
  onCommentPress,
  onOpenAuthor,
  onSharePress,
  colors = {},
}) {
  const hasImage = Boolean(post.imageUrl);
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const authorName = [post.userName, post.displayName, post.userEmail?.split('@')?.[0]]
    .find((name) => name && !['Pengguna', 'User', 'ScaleGram User'].includes(String(name).trim())) || 'ScaleGram User';
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(18)).current;
  const likeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 260,
        delay: Math.min(index * 45, 240),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 260,
        delay: Math.min(index * 45, 240),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, cardTranslateY, index]);

  const playLikeFeedback = useCallback(() => {
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.24,
        friction: 4,
        tension: 160,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        friction: 5,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [likeScale]);

  const handleLikeInteraction = useCallback(() => {
    playLikeFeedback();
    onLikePress?.();
  }, [onLikePress, playLikeFeedback]);

  const handleMediaDoubleTap = useCallback(() => {
    playLikeFeedback();

    if (!isLiked) {
      onLikePress?.();
    }
  }, [isLiked, onLikePress, playLikeFeedback]);

  return (
    <Animated.View
      style={[
        styles.postCard,
        {
          backgroundColor: colors.card || '#FFFFFF',
          borderBottomColor: colors.border || '#E5E7EB',
          opacity: cardOpacity,
          transform: [{ translateY: cardTranslateY }],
        },
      ]}
    >
      <View style={styles.postHeader}>
        <TouchableOpacity activeOpacity={0.78} onPress={onOpenAuthor}>
          <UserAvatar name={authorName} uri={post.userAvatar} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.userInfo} activeOpacity={0.78} onPress={onOpenAuthor}>
          <Text style={[styles.userName, { color: colors.text || '#111827' }]}>
            {authorName}
          </Text>
          <Text style={[styles.timeText, { color: colors.mutedText || '#6B7280' }]}>
            {timeAgo(post.createdAt)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.text || '#111827'} />
        </TouchableOpacity>
      </View>

      {post.caption ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onOpenPost}>
          <Text style={[styles.caption, { color: colors.text || '#111827' }]} numberOfLines={5}>
            {post.caption}
          </Text>
        </TouchableOpacity>
      ) : null}

      {tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <Text key={tag} style={styles.tagText}>
              #{tag}
            </Text>
          ))}
        </View>
      ) : null}

      <TapGestureHandler numberOfTaps={2} maxDelayMs={240} onActivated={handleMediaDoubleTap}>
        <Animated.View>
          {hasImage ? (
            <Image source={{ uri: post.imageUrl }} style={styles.postImage} contentFit="cover" />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.background || '#F3F4F6' }]}>
              <Ionicons name="image-outline" size={28} color={colors.mutedText || '#9CA3AF'} />
            </View>
          )}
        </Animated.View>
      </TapGestureHandler>

      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <IconActionButton
              icon={isLiked ? 'heart' : 'heart-outline'}
              label={post.likesCount || 0}
              color={isLiked ? PURPLE : colors.text || '#374151'}
              onPress={handleLikeInteraction}
              style={styles.actionButton}
            />
          </Animated.View>
          <IconActionButton
            icon="chatbubble-outline"
            label={post.commentsCount || 0}
            onPress={onCommentPress}
            style={styles.actionButton}
          />
          <IconActionButton
            icon="share-social-outline"
            onPress={onSharePress}
            style={styles.iconOnlyButton}
          />
        </View>

        <IconActionButton 
          icon={isSaved ? "bookmark" : "bookmark-outline"} 
          color={isSaved ? PURPLE : colors.text || '#374151'}
          onPress={onSavePress}
          style={styles.iconOnlyButton} 
        />
      </View>
    </Animated.View>
  );
});

export default PostCard;

const styles = StyleSheet.create({
  postCard: {
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
  },
  timeText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  moreButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tagText: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: '700',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1.35,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    marginTop: 14,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1.35,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  actionBar: {
    height: 36,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  iconOnlyButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
