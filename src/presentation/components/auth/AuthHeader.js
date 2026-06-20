import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AuthHeader({ title, subtitle }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    color: '#1D1B26',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#5D596C',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
