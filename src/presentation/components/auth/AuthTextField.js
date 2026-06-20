import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function AuthTextField({ label, style, ...inputProps }) {
  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#B8B4C7"
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#282433',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    height: 44,
    borderColor: '#C7C0E1',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 14,
    backgroundColor: '#FAF8FF',
    fontSize: 13,
    color: '#1D1B26',
  },
});
