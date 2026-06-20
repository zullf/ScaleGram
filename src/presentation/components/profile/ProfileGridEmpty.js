import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const PURPLE = '#6366F1';

export default function ProfileGridEmpty({
  loading,
  error,
  colors = {},
  title = 'Belum ada postingan',
  message = 'Postingan user ini akan tampil di sini.',
}) {
  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="small" color={PURPLE} />
      </View>
    );
  }

  return (
    <View style={styles.emptyState}>
      <Ionicons name="images-outline" size={34} color={PURPLE} />
      <Text style={[styles.emptyTitle, { color: colors.text || '#111827' }]}>{title}</Text>
      <Text style={[styles.emptyMessage, { color: colors.mutedText || '#6B7280' }]}>
        {error || message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 52,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyMessage: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
  },
});
