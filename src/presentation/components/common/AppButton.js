import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

const PRIMARY = '#4D49DF';

export default function AppButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  color = PRIMARY,
  textColor,
  style,
  textStyle,
  children,
}) {
  const isOutline = variant === 'outline';
  const resolvedTextColor = textColor || (isOutline ? color : '#FFFFFF');

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isOutline ? styles.outlineButton : styles.primaryButton,
        isOutline ? { borderColor: color } : { backgroundColor: disabled ? '#A5B4FC' : color },
        disabled && styles.disabledButton,
        style,
      ]}
      activeOpacity={0.78}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={resolvedTextColor} />
      ) : (
        children || <Text style={[styles.text, { color: resolvedTextColor }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.75,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
});
