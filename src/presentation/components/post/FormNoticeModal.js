import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const PURPLE = '#6366F1';

export default function FormNoticeModal({
  visible,
  title = 'Gagal',
  message,
  icon = 'image-outline',
  colors = {},
  onClose,
}) {
  const translateY = useRef(new Animated.Value(18)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      translateY.setValue(18);
      opacity.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card || '#FFFFFF',
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={28} color={PURPLE} />
          </View>

          <Text style={[styles.title, { color: colors.text || '#111827' }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.mutedText || '#6B7280' }]}>
            {message}
          </Text>

          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Mengerti</Text>
          </Pressable>
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
    backgroundColor: 'rgba(17, 24, 39, 0.36)',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    marginTop: 14,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 7,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE,
    marginTop: 18,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
