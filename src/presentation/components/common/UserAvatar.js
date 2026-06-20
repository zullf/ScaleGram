import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

const PURPLE = '#6366F1';

export default function UserAvatar({ name, uri, size = 42 }) {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (uri) {
    return <Image source={{ uri }} style={[styles.avatar, avatarStyle]} contentFit="cover" />;
  }

  return (
    <View style={[styles.fallback, avatarStyle]}>
      <Text style={styles.initial}>{getInitial(name)}</Text>
    </View>
  );
}

function getInitial(name) {
  return (name || 'U').trim().charAt(0).toUpperCase();
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#EDE9FE',
  },
  fallback: {
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: PURPLE,
    fontSize: 16,
    fontWeight: '800',
  },
});
