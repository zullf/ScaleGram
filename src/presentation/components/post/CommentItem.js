import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { timeAgo } from '../../../utils/timeFormat';
import UserAvatar from '../common/UserAvatar';

export default function CommentItem({ comment }) {
  return (
    <View style={styles.container}>
      <UserAvatar name={comment.userName} uri={comment.userAvatar} size={38} />
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.userName}>{comment.userName || 'User'}</Text>
          <Text style={styles.timeText}>{timeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.body}>{comment.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
    marginRight: 8,
  },
  timeText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});
