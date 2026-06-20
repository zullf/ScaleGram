import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PURPLE = '#6366F1';

export default function TagEditor({
  tags,
  newTag,
  maxTags,
  colors = {},
  disabled,
  onChangeNewTag,
  onAddTag,
  onRemoveTag,
}) {
  return (
    <>
      <View style={styles.tagsContainer}>
        {tags.map((tag) => (
          <View
            key={tag}
            style={[styles.tagChip, { backgroundColor: colors.tagBg || '#EEF2FF' }]}
          >
            <Text style={styles.tagText}>#{tag}</Text>
            <TouchableOpacity
              onPress={() => onRemoveTag(tag)}
              style={styles.tagRemove}
              activeOpacity={0.7}
              disabled={disabled}
            >
              <Ionicons name="close-circle" size={16} color={PURPLE} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {tags.length < maxTags ? (
        <View
          style={[
            styles.addTagContainer,
            {
              borderColor: colors.border || '#D1D5DB',
              backgroundColor: colors.card || '#FFFFFF',
            },
          ]}
        >
          <TextInput
            style={[styles.addTagInput, { color: colors.text || '#111827' }]}
            placeholder="Add tag"
            placeholderTextColor={colors.mutedText || '#6B7280'}
            value={newTag}
            onChangeText={onChangeNewTag}
            onSubmitEditing={onAddTag}
            editable={!disabled}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.addTagButton}
            onPress={onAddTag}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <Ionicons name="add" size={16} color={colors.mutedText || '#6B7280'} />
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    color: PURPLE,
    fontSize: 14,
    fontWeight: '500',
  },
  tagRemove: {
    marginLeft: 4,
    padding: 2,
  },
  addTagContainer: {
    minHeight: 44,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingLeft: 12,
  },
  addTagInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 8,
  },
  addTagButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
