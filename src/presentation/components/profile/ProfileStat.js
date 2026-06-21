import { StyleSheet, Text, View } from 'react-native';

export default function ProfileStat({ value, label, colors = {} }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.text || '#111827' }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedText || '#6B7280' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
});
