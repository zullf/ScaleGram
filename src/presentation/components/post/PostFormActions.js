import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '../common/AppButton';

const PURPLE = '#6366F1';

export default function PostFormActions({ colors = {}, loading, onCancel, onPublish }) {
  return (
    <>
      <AppButton
        title="Cancel"
        variant="outline"
        color={colors.border || '#D1D5DB'}
        textColor={colors.text || '#111827'}
        onPress={onCancel}
        disabled={loading}
        style={styles.cancelButton}
      />
      <AppButton
        color={PURPLE}
        onPress={onPublish}
        disabled={loading}
        loading={loading}
        style={styles.publishButton}
      >
        <Ionicons name="send" size={16} color="#FFFFFF" style={styles.publishIcon} />
        <Text style={styles.publishButtonText}>Publish</Text>
      </AppButton>
    </>
  );
}

const styles = StyleSheet.create({
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  publishButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    shadowColor: PURPLE,
  },
  publishIcon: {
    marginRight: 6,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
