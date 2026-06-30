import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, SIZING } from '../../constants';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

interface EditProfileScreenProps {
  navigation: any;
}

const PERSONAL_FIELDS = [
  { key: 'displayName', label: 'Display Name', icon: 'person-outline' },
  { key: 'occupation', label: 'Occupation', icon: 'briefcase-outline' },
  { key: 'company', label: 'Company', icon: 'business-outline' },
  { key: 'education', label: 'Education', icon: 'school-outline' },
  { key: 'annualIncome', label: 'Annual Income', icon: 'cash-outline' },
  { key: 'height', label: 'Height (cm)', icon: 'resize-outline', keyboardType: 'numeric' },
];

const LOCATION_FIELDS = [
  { key: 'city', label: 'City', icon: 'location-outline' },
  { key: 'state', label: 'State', icon: 'map-outline' },
  { key: 'country', label: 'Country', icon: 'globe-outline' },
];

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);

  const [form, setForm] = useState<Record<string, string>>({
    displayName: '',
    occupation: '',
    company: '',
    education: '',
    annualIncome: '',
    height: '',
    bio: '',
    city: '',
    state: '',
    country: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/v1/profiles/me');
        const { profile } = response.data.data;
        const loc = profile.location || {};
        setForm({
          displayName: profile.displayName || '',
          occupation: profile.occupation || '',
          company: profile.company || '',
          education: profile.education || '',
          annualIncome: profile.annualIncome || '',
          height: profile.height ? String(profile.height) : '',
          bio: profile.bio || '',
          city: loc.city || '',
          state: loc.state || '',
          country: loc.country || '',
        });
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Failed to load profile';
        Alert.alert('Error', message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const basicPayload = {
        displayName: form.displayName,
        occupation: form.occupation,
        company: form.company,
        education: form.education,
        annualIncome: form.annualIncome,
        height: form.height ? Number(form.height) : undefined,
      };
      const locationPayload = {
        city: form.city,
        state: form.state,
        country: form.country,
      };

      await Promise.all([
        api.put('/api/v1/profiles/me/basic', basicPayload),
        api.put('/api/v1/profiles/me/location', locationPayload),
        ...(form.bio ? [api.put('/api/v1/profiles/me/bio', { bio: form.bio })] : []),
      ]);

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to update profile';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (
    title: string,
    fields: { key: string; label: string; icon: any; keyboardType?: any }[]
  ) => (
    <Card variant="outlined" padded style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {fields.map((field) => (
        <Input
          key={field.key}
          label={field.label}
          value={form[field.key] || ''}
          onChangeText={(val) => updateField(field.key, val)}
          icon={field.icon}
          keyboardType={field.keyboardType}
        />
      ))}
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Button title="Save" onPress={handleSave} loading={saving} size="sm" />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <Avatar name={user?.name || form.displayName} size="xxl" isPremium />
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={() => Alert.alert('Change Photo', 'Photo picker coming soon')}
            >
              <Ionicons name="camera" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>Tap to change photo</Text>
          </View>

          {/* Bio */}
          <Card variant="outlined" padded style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Input
              label="About Yourself"
              value={form.bio}
              onChangeText={(val) => updateField('bio', val)}
              multiline
              numberOfLines={4}
              placeholder="Write a short bio..."
            />
          </Card>

          {renderSection('Personal Information', PERSONAL_FIELDS)}
          {renderSection('Location', LOCATION_FIELDS)}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 30,
    right: '38%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  changePhotoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
    marginTop: SPACING.sm,
  },
  sectionCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
});
