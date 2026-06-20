import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AuthLinkRow({ prompt, linkText, onPress }) {
  return (
    <View style={styles.row}>
      <Text style={styles.prompt}>{prompt}</Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.72}>
        <Text style={styles.link}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prompt: {
    color: '#5D596C',
    fontSize: 12,
    marginRight: 8,
  },
  link: {
    color: '#4D49DF',
    fontSize: 14,
    fontWeight: '700',
  },
});
