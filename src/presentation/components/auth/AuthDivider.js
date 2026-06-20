import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AuthDivider({ text = 'atau lanjut dengan' }) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E7E1F0',
  },
  dividerText: {
    color: '#514D60',
    fontSize: 10,
    fontWeight: '600',
    marginHorizontal: 16,
  },
});
