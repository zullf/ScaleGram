import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function GoogleSignInButton({ loading, disabled, onPress }) {
  return (
    <TouchableOpacity
      style={styles.googleButton}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.78}
    >
      <Text style={styles.googleIcon}>G</Text>
      <Text style={styles.googleButtonText}>
        {loading ? 'Menghubungkan...' : 'Google Sign In'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    backgroundColor: '#FFFFFF',
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: '#C9C5D8',
    borderWidth: 1,
    marginBottom: 24,
  },
  googleIcon: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 14,
  },
  googleButtonText: {
    color: '#282433',
    fontSize: 14,
    fontWeight: '700',
  },
});
