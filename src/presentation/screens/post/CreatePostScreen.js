import { StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

export default function CreatePostScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Create Post</Text>
      <Text style={[styles.description, { color: colors.mutedText }]}>
        Placeholder upload foto/caption.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
  },
});
