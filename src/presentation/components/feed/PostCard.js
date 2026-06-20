import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { timeAgo } from '../../../utils/timeFormat';
import IconActionButton from '../common/IconActionButton';
import UserAvatar from '../common/UserAvatar';

const PURPLE = '#6366F1';

const PostCard = React.memo(function PostCard({
  post,
  isLiked,
  onLikePress,
  onOpenPost,
  onCommentPress,
}) {
  const hasImage = Boolean(post.imageUrl);
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <UserAvatar name={post.userName} uri={post.userAvatar} />

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.userName || 'User'}</Text>
          <Text style={styles.timeText}>{timeAgo(post.createdAt)}</Text>
        </View>

        <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      {post.caption ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onOpenPost}>
          <Text style={styles.caption} numberOfLines={5}>
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

      {hasImage ? (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} contentFit="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={28} color="#9CA3AF" />
        </View>
      )}

      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <IconActionButton
            icon={isLiked ? 'heart' : 'heart-outline'}
            label={post.likesCount || 0}
            color={isLiked ? PURPLE : '#374151'}
            onPress={onLikePress}
            style={styles.actionButton}
          />
          <IconActionButton
            icon="chatbubble-outline"
            label={post.commentsCount || 0}
            onPress={onCommentPress}
            style={styles.actionButton}
          />
          <IconActionButton icon="share-social-outline" style={styles.iconOnlyButton} />
        </View>

        <IconActionButton icon="bookmark-outline" style={styles.iconOnlyButton} />
      </View>
    </View>
  );
});

export default PostCard;

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
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
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  timeText: {
    color: '#6B7280',
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
    color: '#111827',
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
