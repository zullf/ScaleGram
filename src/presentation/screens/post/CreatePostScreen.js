import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';
import { useDependencies } from '../../../app/DependencyProvider';
import { useAuthStore } from '../../../store/authStore';

export default function CreatePostScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const { repositories: { postRepository } } = useDependencies();
  const user = useAuthStore((state) => state.user);
  
  const [caption, setCaption] = useState('');
  const [imageResult, setImageResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true, 
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageResult(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!imageResult) {
      Alert.alert('Error', 'Silakan pilih gambar terlebih dahulu');
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Error', 'Caption tidak boleh kosong');
      return;
    }

    setLoading(true);
    try {
      const fileData = {
        base64: imageResult.base64,
        fileName: "foto_" + Date.now() + ".jpg",
        mimeType: "image/jpeg"
      };

      const postData = {
        caption,
        userId: user?.id,
        userName: user?.displayName || user?.email
      };

      await postRepository.uploadPost(postData, fileData);
      
      Alert.alert('Sukses', 'Postingan berhasil diunggah!');
      setCaption('');
      setImageResult(null);
    } catch (error) {
      Alert.alert('Gagal', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Create Post</Text>
      
      <TouchableOpacity onPress={pickImage} style={[styles.imagePicker, { borderColor: colors.border }]}>
        {imageResult ? (
          <Image source={{ uri: imageResult.uri }} style={styles.imagePreview} />
        ) : (
          <Text style={{ color: colors.mutedText }}>Tap untuk memilih gambar</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        placeholder="Tulis caption di sini..."
        placeholderTextColor={colors.mutedText}
        value={caption}
        onChangeText={setCaption}
        multiline
      />
      {loading ? (
        <ActivityIndicator size="large" color="#4D49DF" />
      ) : (
        <Button title="Unggah Postingan" onPress={handleUpload} color="#4D49DF" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
