import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { postRepository } from '../../../data/repositories/postRepositoryImpl';

export default function FeedScreen() {
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Halaman Feed ScaleGram</Text>
    </View>
  );
}