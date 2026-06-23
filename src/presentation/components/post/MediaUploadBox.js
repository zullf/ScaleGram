import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PURPLE = '#6366F1';

export default function MediaUploadBox({ imageUri, colors = {}, disabled, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.uploadArea, { borderColor: colors.border || '#D1D5DB' }]}
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onPress}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      ) : (
        <View style={styles.uploadContent}>
          <Ionicons name="cloud-upload-outline" size={40} color={PURPLE} />
          <Text style={[styles.uploadTitle, { color: colors.text || '#111827' }]}>
            Upload Media
          </Text>
          <Text style={[styles.uploadSubtitle, { color: colors.mutedText || '#9CA3AF' }]}>
            Klik untuk upload media
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  uploadArea: {
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  uploadSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});
