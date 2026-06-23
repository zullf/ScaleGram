import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  icon = 'help-circle-outline',
  isDestructive = true,
  colors: customColors,
}) {
  const themeMode = useThemeStore((state) => state.themeMode);
  const themeColors = appThemes[themeMode].colors;
  const colors = customColors || themeColors;

  const translateY = useRef(new Animated.Value(24)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      // Reset values
      translateY.setValue(24);
      opacity.setValue(0);
      scale.setValue(0.96);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, translateY, scale]);

  const confirmColor = isDestructive ? colors.danger : colors.primary;
  
  // Icon styling based on colors
  const iconWrapBg = isDestructive 
    ? (themeMode === 'light' ? '#FEE2E2' : 'rgba(239, 68, 68, 0.15)')
    : (themeMode === 'light' ? '#EEF2FF' : 'rgba(99, 102, 241, 0.15)');
    
  const renderedIconColor = isDestructive 
    ? (themeMode === 'light' ? '#EF4444' : '#F87171')
    : (themeMode === 'light' ? '#6366F1' : '#60A5FA');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card || '#FFFFFF',
              opacity,
              transform: [{ translateY }, { scale }],
            },
          ]}
        >
          {icon ? (
            <View style={[styles.iconWrap, { backgroundColor: iconWrapBg }]}>
              <Ionicons name={icon} size={28} color={renderedIconColor} />
            </View>
          ) : null}

          <Text style={[styles.title, { color: colors.text || '#111827', marginTop: icon ? 14 : 0 }]}>
            {title}
          </Text>
          
          <Text style={[styles.message, { color: colors.mutedText || '#6B7280' }]}>
            {message}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border || '#D9DEE8' }]}
              onPress={onCancel}
              activeOpacity={0.76}
            >
              <Text style={[styles.buttonText, { color: colors.mutedText || '#6B7280' }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
              activeOpacity={0.76}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 22,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  confirmButton: {
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '900',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});
