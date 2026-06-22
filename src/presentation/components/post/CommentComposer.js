import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import UserAvatar from '../common/UserAvatar';

const PURPLE = '#6366F1';

export default function CommentComposer({ user, value, loading, onChangeText, onSubmit, colors = {} }) {
  const disabled = loading || !value.trim();

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
      <UserAvatar name={user?.displayName || user?.email} uri={user?.photoURL} size={38} />
      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.input, { color: colors.text || '#111827' }]}
          placeholder="Write your reply"
          placeholderTextColor={colors.mutedText || '#9CA3AF'}
          value={value}
          onChangeText={onChangeText}
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.replyButton, disabled && styles.replyButtonDisabled]}
          activeOpacity={0.78}
          disabled={disabled}
          onPress={onSubmit}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.replyButtonText}>Reply</Text>
          )}
        </TouchableOpacity>
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
  inputWrap: {
    flex: 1,
    marginLeft: 12,
  },
  input: {
    minHeight: 42,
    fontSize: 15,
    lineHeight: 21,
    paddingTop: 7,
    paddingBottom: 10,
  },
  replyButton: {
    alignSelf: 'flex-end',
    backgroundColor: PURPLE,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyButtonDisabled: {
    opacity: 0.45,
  },
  replyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
