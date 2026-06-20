import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function IconActionButton({
  icon,
  label,
  color = '#374151',
  onPress,
  style,
}) {
  return (
    <TouchableOpacity style={[styles.button, style]} activeOpacity={0.72} onPress={onPress}>
      <Ionicons name={icon} size={22} color={color} />
      {label !== undefined ? <Text style={[styles.text, { color }]}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
});
