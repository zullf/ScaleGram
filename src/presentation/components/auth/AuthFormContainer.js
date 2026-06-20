import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import AuthHeader from './AuthHeader';

export default function AuthFormContainer({ title, subtitle, loading, error, children }) {
  return (
    <View style={styles.content}>
      <AuthHeader title={title} subtitle={subtitle} />
      {loading ? <ActivityIndicator size="large" color="#4D49DF" style={styles.loader} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.formContainer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 48,
  },
  loader: {
    marginBottom: 12,
  },
  formContainer: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});
