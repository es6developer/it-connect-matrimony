import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';
import { Button } from '../../components/ui/Button';
import { MAX_PROFILE_PHOTOS } from '../../constants';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - spacing.lg * 2 - spacing.md * 2) / 3;

export default function PhotoManagerScreen() {
  const navigation = useNavigation();
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null, null]);

  const pickImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...photos];
      newPhotos[index] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  const takePhoto = async (index: number) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...photos];
      newPhotos[index] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  const handleAddPress = (index: number) => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Camera', onPress: () => takePhoto(index) },
      { text: 'Gallery', onPress: () => pickImage(index) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const [saving, setSaving] = useState(false);
  const filledCount = photos.filter(Boolean).length;

  const handleSave = async () => {
    const filledPhotos = photos.filter(Boolean) as string[];
    if (filledPhotos.length === 0) {
      navigation.goBack();
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      filledPhotos.forEach((uri, i) => {
        formData.append('photos', {
          uri,
          type: 'image/jpeg',
          name: `photo_${i}.jpg`,
        } as any);
      });
      await api.post('/api/v1/profiles/me/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Photos uploaded successfully');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to upload photos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Photos</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.count}>
        {filledCount} / {MAX_PROFILE_PHOTOS} photos added
      </Text>
      <Text style={styles.hint}>
        Add at least 2 photos to increase your profile visibility
      </Text>

      <View style={styles.grid}>
        {photos.map((photo, i) => (
          <TouchableOpacity
            key={i}
            style={styles.photoSlot}
            onPress={() => (photo ? removePhoto(i) : handleAddPress(i))}
            onLongPress={() => photo && removePhoto(i)}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="camera-outline" size={28} color={colors.textTertiary} />
                <Text style={styles.placeholderText}>Add</Text>
              </View>
            )}
            {photo && (
              <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(i)}>
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            )}
            {i === 0 && photo && (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>Main</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Save Photos" onPress={handleSave} loading={saving} style={styles.saveBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { ...typography.h3, color: colors.text },
  count: { ...typography.body, color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
  hint: { ...typography.bodySmall, color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
  },
  photoSlot: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    marginRight: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  placeholderText: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs },
  removeBtn: { position: 'absolute', top: 4, right: 4 },
  mainBadge: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainBadgeText: { ...typography.caption, color: colors.white, fontSize: 10 },
  saveBtn: { margin: spacing.lg },
});
