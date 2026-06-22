import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { timeAgo } from '../../../utils/timeFormat';
import UserAvatar from '../common/UserAvatar';

export default function CommentItem({ comment, colors = {} }) {
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
      <UserAvatar name={comment.userName} uri={comment.userAvatar} size={38} />
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={[styles.userName, { color: colors.text || '#111827' }]}>{comment.userName || 'User'}</Text>
          <Text style={[styles.timeText, { color: colors.mutedText || '#6B7280' }]}>{timeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={[styles.body, { color: colors.text || '#111827' }]}>{comment.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});
