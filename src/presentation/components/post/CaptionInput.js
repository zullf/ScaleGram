import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function CaptionInput({
  value,
  maxLength,
  colors = {},
  disabled,
  onChangeText,
}) {
  return (
    <View style={[styles.inputContainer, { backgroundColor: colors.card || '#FFFFFF' }]}>
      <TextInput
        style={[styles.captionInput, { color: colors.text || '#111827' }]}
        placeholder="What's on your mind? Share your creative process..."
        placeholderTextColor={colors.mutedText || '#9CA3AF'}
        multiline
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
        textAlignVertical="top"
        editable={!disabled}
      />
      <Text style={[styles.charCounter, { color: colors.mutedText || '#9CA3AF' }]}>
        {value.length}/{maxLength}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  captionInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
});
