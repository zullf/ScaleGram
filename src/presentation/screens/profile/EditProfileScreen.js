import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEditProfile } from '../../../domain/usecases/userUsecases';
import { useAuthStore } from '../../../store/authStore';

export default function EditProfileScreen({ navigation, route }) {
  const { currentUser } = route.params || {};
  const existingPhotoUrl = currentUser?.photoURL || currentUser?.photoUrl || null;

  const [name, setName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [photoUri, setPhotoUri] = useState(existingPhotoUrl);
  const [base64Photo, setBase64Photo] = useState(null);
  const [photoFileData, setPhotoFileData] = useState(null);

  const { editProfile, isLoading } = useEditProfile();
  const updateUser = useAuthStore((state) => state.updateUser);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, 
      base64: true, 
    });

    if (!result.canceled) {
      const selectedPhoto = result.assets[0];
      setPhotoUri(selectedPhoto.uri);
      setBase64Photo(selectedPhoto.base64);
      setPhotoFileData({
        fileName: selectedPhoto.fileName || `profile_${Date.now()}.jpg`,
        mimeType: selectedPhoto.mimeType || 'image/jpeg',
      });
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Oops!', 'Nama gak boleh kosong bro.');
      return;
    }

    const payload = {
      displayName: name,
      bio: bio,
      existingPhotoUrl,
      newPhotoBase64: base64Photo,
      newPhotoFileName: photoFileData?.fileName,
      newPhotoMimeType: photoFileData?.mimeType,
    };

    const result = await editProfile(currentUser.id, payload);

    if (result.success) {
      updateUser({
        ...result.data,
        displayName: result.data.displayName,
        bio: result.data.bio,
        photoURL: result.data.photoURL ?? result.data.photoUrl ?? null,
      });

      Alert.alert('Sukses!', 'Profil berhasil di-update.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Gagal', result.error);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Batal</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.saveText}>Simpan</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.photoContainer}>
          <Image
            source={photoUri ? { uri: photoUri } : require('../../../../assets/logo.jpg')} 
            style={styles.profilePhoto}
            contentFit="cover"
            transition={200} 
          />
          <TouchableOpacity onPress={handlePickImage}>
            <Text style={styles.changePhotoText}>Ganti Foto Profil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nama</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Masukkan nama"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Ceritakan tentang diri lu..."
            placeholderTextColor="#C7C7CC"
            multiline
            maxLength={150}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    borderBottomWidth: 0.5,
    borderBottomColor: '#C7C7CC',
  },
  cancelText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  content: {
    padding: 16,
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5EA',
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  formGroup: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 4,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});
