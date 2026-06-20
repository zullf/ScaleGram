import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function FormSection({ label, hint, colors = {}, children }) {
  return (
    <View style={styles.section}>
      <View style={hint ? styles.headerRow : null}>
        <Text style={[styles.sectionLabel, { color: colors.mutedText || '#6B7280' }]}>
          {label}
        </Text>
        {hint ? (
          <Text style={[styles.hint, { color: colors.mutedText || '#9CA3AF' }]}>
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: 12,
  },
});
