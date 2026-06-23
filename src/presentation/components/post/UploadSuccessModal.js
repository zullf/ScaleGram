import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const PURPLE = '#6366F1';

export default function UploadSuccessModal({
  visible,
  postPreview,
  colors = {},
  title = 'Postingan sudah tayang',
  message = 'Konten kamu berhasil diunggah dan sekarang sudah masuk ke feed ScaleGram.',
  previewLabel = 'Caption',
  primaryLabel = 'Lihat feed',
  primaryIcon = 'arrow-forward',
  onClose,
}) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      scale.setValue(0.92);
      opacity.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card || '#FFFFFF',
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <View style={styles.iconRing}>
            <Ionicons name="checkmark" size={34} color="#FFFFFF" />
          </View>

          <Text style={[styles.title, { color: colors.text || '#111827' }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: colors.mutedText || '#6B7280' }]}>
            {message}
          </Text>

          <View style={[styles.previewRow, { borderColor: colors.border || '#E5E7EB' }]}>
            {postPreview?.imageUri ? (
              <Image source={{ uri: postPreview.imageUri }} style={styles.previewImage} contentFit="cover" />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Ionicons name="image-outline" size={22} color={PURPLE} />
              </View>
            )}
            <View style={styles.previewTextWrap}>
              <Text style={[styles.previewLabel, { color: colors.mutedText || '#6B7280' }]}>
                {previewLabel}
              </Text>
              <Text style={[styles.previewCaption, { color: colors.text || '#111827' }]} numberOfLines={2}>
                {postPreview?.caption || 'Postingan baru'}
              </Text>
            </View>
          </View>

          <Pressable style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
            <Ionicons name={primaryIcon} size={17} color="#FFFFFF" />
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
    backgroundColor: 'rgba(17, 24, 39, 0.42)',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  iconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  title: {
    fontSize: 21,
    fontWeight: '900',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  previewRow: {
    width: '100%',
    minHeight: 78,
    borderWidth: 1,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 18,
  },
  previewImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
  },
  previewPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  previewTextWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  previewCaption: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: PURPLE,
    marginTop: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
