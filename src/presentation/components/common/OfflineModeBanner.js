import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function OfflineModeBanner({ message = 'Offline mode aktif.', colors = {} }) {
  return (
    <View style={[styles.bannerWrapper, { backgroundColor: colors.background || 'transparent' }]}> 
      <View style={[styles.banner, { borderColor: colors.border || 'rgba(0,0,0,0.08)', backgroundColor: colors.card || '#F9FAFB' }]}> 
        <Text style={[styles.bannerText, { color: colors.text || '#111827' }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  banner: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '96%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
