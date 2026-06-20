import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PURPLE = '#6366F1';
const logoImage = require('../../../../assets/logo.jpg');

export default function ScreenHeader({
  title,
  showMenu = false,
  showLogo = false,
  centered = false,
  colors = {},
  onMenuPress,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerBar,
        centered && styles.centeredHeader,
        {
          height: 64 + insets.top,
          paddingTop: insets.top,
          borderBottomColor: colors.border || '#E5E7EB',
          shadowColor: colors.shadow || '#111827',
          backgroundColor: colors.card || '#FFFFFF',
        },
      ]}
    >
      <View style={[styles.headerBrandRow, centered && styles.centeredBrandRow]}>
        {showMenu ? (
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7} onPress={onMenuPress}>
            <Ionicons name="menu-outline" size={24} color={PURPLE} />
          </TouchableOpacity>
        ) : null}

        {showLogo ? <Image source={logoImage} style={styles.headerLogo} contentFit="contain" /> : null}
        {title ? <Text style={[styles.headerTitle, { color: colors.text || '#111827' }]}>{title}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    zIndex: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  centeredHeader: {
    justifyContent: 'center',
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centeredBrandRow: {
    justifyContent: 'center',
  },
  headerIconButton: {
    width: 34,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 126,
    height: 38,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
});
