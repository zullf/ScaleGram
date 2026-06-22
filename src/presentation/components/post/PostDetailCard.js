import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';

import { timeAgo } from '../../../utils/timeFormat';
import IconActionButton from '../common/IconActionButton';
import UserAvatar from '../common/UserAvatar';

const PURPLE = '#6366F1';

export default function PostDetailCard({
  post,
  isLiked,
  isSaved,
  onLikePress,
  onOpenAuthor,
  onSharePress,
  onCommentPress,
  onSavePress,
  colors = {},
}) {
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card || '#FFFFFF',
          borderBottomColor: colors.border || '#E5E7EB',
        },
      ]}
    >
      <View style={styles.authorRow}>
        <TouchableOpacity activeOpacity={0.78} onPress={onOpenAuthor}>
          <UserAvatar name={post.userName} uri={post.userAvatar} size={48} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.authorInfo} activeOpacity={0.78} onPress={onOpenAuthor}>
          <Text style={[styles.userName, { color: colors.text || '#111827' }]}>
            {post.userName || 'User'}
          </Text>
          <Text style={[styles.userHandle, { color: colors.mutedText || '#6B7280' }]}>
            @{createHandle(post.userName || post.userId)}
          </Text>
        </TouchableOpacity>
      </View>

      {post.caption ? (
        <Text style={[styles.caption, { color: colors.text || '#111827' }]}>{post.caption}</Text>
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

      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} contentFit="cover" />
      ) : null}

      <Text style={[styles.timestamp, { color: colors.mutedText || '#6B7280' }]}>
        {timeAgo(post.createdAt)}
      </Text>

      <View
        style={[
          styles.statsRow,
          {
            borderTopColor: colors.border || '#E5E7EB',
            borderBottomColor: colors.border || '#E5E7EB',
          },
        ]}
      >
        <Text style={[styles.statText, { color: colors.mutedText || '#6B7280' }]}>
          <Text style={[styles.statValue, { color: colors.text || '#111827' }]}>{post.likesCount || 0}</Text> Likes
        </Text>
        <Text style={[styles.statText, { color: colors.mutedText || '#6B7280' }]}>
          <Text style={[styles.statValue, { color: colors.text || '#111827' }]}>{post.commentsCount || 0}</Text> Comments
        </Text>
      </View>

      <View style={styles.actionRow}>
        <IconActionButton 
          icon="chatbubble-outline" 
          label={post.commentsCount || 0} 
          color={colors.text || '#374151'}
          style={styles.actionButton} 
          onPress={onCommentPress} 
        />
 
        <IconActionButton
          icon={isLiked ? 'heart' : 'heart-outline'}
          label={post.likesCount || 0}
          color={isLiked ? PURPLE : colors.text || '#374151'}
          onPress={onLikePress}
          style={styles.actionButton}
        />
  
        <IconActionButton
          icon="share-social-outline"
          color={colors.text || '#374151'}
          style={styles.iconOnlyButton}
          onPress={onSharePress}
        />
    
        <IconActionButton 
          icon={isSaved ? 'bookmark' : 'bookmark-outline'}
          color={isSaved ? PURPLE : colors.text || '#374151'}
          style={styles.iconOnlyButton} 
          onPress={onSavePress} 
        />
      </View>
    </View>
  );
}

function createHandle(value) {
  return String(value || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 18) || 'user';
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
  },
  userHandle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  caption: {
    fontSize: 20,
    lineHeight: 29,
    marginTop: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tagText: {
    color: PURPLE,
    fontSize: 14,
    fontWeight: '700',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1.15,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    marginTop: 16,
  },
  timestamp: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginTop: 16,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    fontWeight: '800',
  },
  actionRow: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  actionButton: {
    minWidth: 58,
    justifyContent: 'center',
  },
  iconOnlyButton: {
    width: 42,
    justifyContent: 'center',
  },
});
