import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';

import { timeAgo } from '../../../utils/timeFormat';
import IconActionButton from '../common/IconActionButton';
import UserAvatar from '../common/UserAvatar';

const PURPLE = '#6366F1';

export default function PostDetailCard({ post, isLiked, onLikePress, onOpenAuthor }) {
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <View style={styles.container}>
      <View style={styles.authorRow}>
        <TouchableOpacity activeOpacity={0.78} onPress={onOpenAuthor}>
          <UserAvatar name={post.userName} uri={post.userAvatar} size={48} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.authorInfo} activeOpacity={0.78} onPress={onOpenAuthor}>
          <Text style={styles.userName}>{post.userName || 'User'}</Text>
          <Text style={styles.userHandle}>@{createHandle(post.userName || post.userId)}</Text>
        </TouchableOpacity>
      </View>

      {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}

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

      <Text style={styles.timestamp}>{timeAgo(post.createdAt)}</Text>

      <View style={styles.statsRow}>
        <Text style={styles.statText}>
          <Text style={styles.statValue}>{post.likesCount || 0}</Text> Likes
        </Text>
        <Text style={styles.statText}>
          <Text style={styles.statValue}>{post.commentsCount || 0}</Text> Comments
        </Text>
      </View>

      <View style={styles.actionRow}>
        <IconActionButton icon="chatbubble-outline" label={post.commentsCount || 0} style={styles.actionButton} />
        <IconActionButton
          icon={isLiked ? 'heart' : 'heart-outline'}
          label={post.likesCount || 0}
          color={isLiked ? PURPLE : '#374151'}
          onPress={onLikePress}
          style={styles.actionButton}
        />
        <IconActionButton icon="share-social-outline" style={styles.iconOnlyButton} />
        <IconActionButton icon="bookmark-outline" style={styles.iconOnlyButton} />
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
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
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
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
  },
  userHandle: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  caption: {
    color: '#111827',
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
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 18,
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginTop: 16,
  },
  statText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    color: '#111827',
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
