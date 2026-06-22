import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileHeaderBar({ title, subtitle, colors = {}, onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          height: 56 + insets.top,
          paddingTop: insets.top,
          borderBottomColor: colors.border || '#E5E7EB',
          backgroundColor: colors.card || '#FFFFFF',
        },
      ]}
    >
      <TouchableOpacity style={styles.backButton} activeOpacity={0.72} onPress={onBack}>
        <Ionicons name="arrow-back" size={22} color={colors.text || '#111827'} />
      </TouchableOpacity>
      <View style={styles.titleWrap}>
        <Text style={[styles.title, { color: colors.text || '#111827' }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedText || '#6B7280' }]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
});
