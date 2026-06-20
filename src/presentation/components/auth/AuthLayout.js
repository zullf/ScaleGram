import React from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

const logoImage = require('../../../../assets/logo.jpg');

export default function AuthLayout({ children }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <View style={styles.container}>
        <Image source={logoImage} style={styles.logo} resizeMode="contain" />
        {children}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FCF8FF',
    paddingHorizontal: 14,
    paddingTop: 24,
    paddingBottom: 14,
  },
  logo: {
    width: 132,
    height: 42,
    marginTop: 30,
  },
});
