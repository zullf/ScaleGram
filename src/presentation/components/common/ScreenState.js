import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PURPLE = '#6366F1';

export default function ScreenState({
  loading = false,
  icon = 'images-outline',
  title,
  message,
  actionLabel,
  onAction,
}) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={34} color={PURPLE} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel ? (
        <TouchableOpacity style={styles.button} activeOpacity={0.75} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 72,
  },
  title: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  message: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
  },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
