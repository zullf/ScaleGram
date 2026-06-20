import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { useDependencies } from '../../../app/DependencyProvider';
import { useAuthStore } from '../../../store/authStore';
import ScreenHeader from '../../components/common/ScreenHeader';
import CaptionInput from '../../components/post/CaptionInput';
import FormNoticeModal from '../../components/post/FormNoticeModal';
import FormSection from '../../components/post/FormSection';
import MediaUploadBox from '../../components/post/MediaUploadBox';
import PostFormActions from '../../components/post/PostFormActions';
import TagEditor from '../../components/post/TagEditor';
import UploadSuccessModal from '../../components/post/UploadSuccessModal';
import { useThemeStore } from '../../../store/themeStore';
import { appThemes } from '../../theme/theme';

export default function CreatePostScreen({ navigation }) {
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const {
    repositories: { postRepository },
  } = useDependencies();
  const user = useAuthStore((state) => state.user);

  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [imageResult, setImageResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successPreview, setSuccessPreview] = useState(null);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const maxCaptionLength = 2200;
  const maxTags = 5;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Izin dibutuhkan', 'Izinkan akses galeri untuk memilih gambar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageResult(result.assets[0]);
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim().replace(/^#/, '');

    if (tag && tags.length < maxTags && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const handlePublish = async () => {
    if (!imageResult) {
      setNoticeVisible(true);
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Gagal', 'Caption tidak boleh kosong.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Gagal', 'Silakan login terlebih dahulu untuk membuat postingan.');
      return;
    }

    setLoading(true);

    try {
      const postPreview = {
        imageUri: imageResult.uri,
        caption: caption.trim(),
      };

      await postRepository.uploadPost(createPostPayload(), createFilePayload());

      setSuccessPreview(postPreview);
      resetForm();
      setSuccessVisible(true);
    } catch (error) {
      Alert.alert('Gagal', error.message || 'Postingan gagal diunggah.');
    } finally {
      setLoading(false);
    }
  };

  const createPostPayload = () => ({
    caption: caption.trim(),
    tags,
    userId: user.id,
    userName: user.displayName || user.email || 'User',
    userAvatar: user.photoURL || null,
  });

  const createFilePayload = () => ({
    base64: imageResult.base64,
    fileName: imageResult.fileName || `foto_${Date.now()}.jpg`,
    mimeType: imageResult.mimeType || 'image/jpeg',
  });

  const resetForm = () => {
    setCaption('');
    setTags([]);
    setNewTag('');
    setImageResult(null);
  };

  const handleCloseSuccess = () => {
    setSuccessVisible(false);
    navigation.navigate('Home');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScreenHeader title="Create Post" centered colors={colors} />

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
      >
        <MediaUploadBox
          imageUri={imageResult?.uri}
          colors={colors}
          disabled={loading}
          onPress={pickImage}
        />

        <FormSection label="Caption" colors={colors}>
          <CaptionInput
            value={caption}
            maxLength={maxCaptionLength}
            colors={colors}
            disabled={loading}
            onChangeText={setCaption}
          />
        </FormSection>

        <FormSection label="Tags" hint={`Add up to ${maxTags}`} colors={colors}>
          <TagEditor
            tags={tags}
            newTag={newTag}
            maxTags={maxTags}
            colors={colors}
            disabled={loading}
            onChangeNewTag={setNewTag}
            onAddTag={handleAddTag}
            onRemoveTag={(tagToRemove) => setTags(tags.filter((tag) => tag !== tagToRemove))}
          />
        </FormSection>

        <View style={styles.buttonContainer}>
          <PostFormActions
            colors={colors}
            loading={loading}
            onCancel={resetForm}
            onPublish={handlePublish}
          />
        </View>
      </ScrollView>

      <UploadSuccessModal
        visible={successVisible}
        postPreview={successPreview}
        colors={colors}
        onClose={handleCloseSuccess}
      />
      <FormNoticeModal
        visible={noticeVisible}
        title="Gambar belum dipilih"
        message="Tambahkan satu gambar terlebih dahulu sebelum postingan dipublikasikan."
        icon="image-outline"
        colors={colors}
        onClose={() => setNoticeVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
  },
});
