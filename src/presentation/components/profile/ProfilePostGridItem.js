import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const PURPLE = '#6366F1';

export default function ProfilePostGridItem({ post, onPress }) {
  return (
    <TouchableOpacity style={styles.gridCellWrap} activeOpacity={0.82} onPress={onPress}>
      <View style={styles.gridCell}>
        {post.imageUrl ? (
          <Image source={{ uri: post.imageUrl }} style={styles.thumbnailImage} contentFit="cover" />
        ) : (
          <Ionicons name="image-outline" size={24} color={PURPLE} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gridCellWrap: {
    width: '33.333%',
    aspectRatio: 1,
    padding: 1,
  },
  gridCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
