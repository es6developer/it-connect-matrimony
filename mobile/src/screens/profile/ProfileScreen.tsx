import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, SIZING } from '../../constants';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { Profile } from '../../types';

interface ProfileScreenProps {
  navigation: any;
}

const SectionRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.sectionRow}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <Text style={styles.sectionValue}>{value}</Text>
  </View>
);

const buildSections = (profile: Profile) => [
  {
    title: 'About',
    icon: 'information-circle-outline',
    content: [
      { label: 'Age', value: String(profile.age) },
      {
        label: 'Gender',
        value: profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1),
      },
      {
        label: 'Marital Status',
        value: profile.maritalStatus
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      },
      ...(profile.religion ? [{ label: 'Religion', value: profile.religion }] : []),
      ...(profile.motherTongue ? [{ label: 'Mother Tongue', value: profile.motherTongue }] : []),
    ],
  },
  {
    title: 'Career & Education',
    icon: 'briefcase-outline',
    content: [
      { label: 'Occupation', value: profile.occupation },
      ...(profile.company ? [{ label: 'Company', value: profile.company }] : []),
      { label: 'Education', value: profile.education },
      ...(profile.annualIncome ? [{ label: 'Annual Income', value: profile.annualIncome }] : []),
    ],
  },
  {
    title: 'Tech Stack',
    icon: 'code-slash-outline',
    content: profile.techStack?.length
      ? [{ label: 'Languages', value: profile.techStack.join(', ') }]
      : [],
  },
  {
    title: 'Interests',
    icon: 'heart-outline',
    content: profile.interests?.length
      ? [{ label: 'Interests', value: profile.interests.join(', ') }]
      : [],
  },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/v1/profiles/me');
        const { data } = response.data;
        setProfile(data.profile);
        setError(null);
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Failed to load profile';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={() => setError(null)} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const sections = profile ? buildSections(profile) : [];
  const displayName = profile?.displayName || user?.name || 'User Name';
  const memberSince = user?.createdAt ? formatDate(user.createdAt) : '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <View style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileCardContent}>
            <Avatar name={user?.name} size="xxl" isPremium={profile?.isPremium} />
            <Text style={styles.profileName}>{displayName}</Text>
            <View style={styles.profileBadges}>
              {profile?.isPremium && <Badge label="Premium" variant="premium" size="sm" />}
              {profile?.isVerified && <Badge label="Verified" variant="success" size="sm" />}
            </View>
            <View style={styles.profileMeta}>
              <View style={styles.profileMetaItem}>
                <Ionicons name="briefcase-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.profileMetaText}>{profile?.occupation || 'N/A'}</Text>
              </View>
              <View style={styles.profileMetaItem}>
                <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.profileMetaText}>
                  {profile?.location ? `${profile.location.city}, ${profile.location.country}` : 'N/A'}
                </Text>
              </View>
              {memberSince ? (
                <View style={styles.profileMetaItem}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.profileMetaText}>Member since {memberSince}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </Card>

        {/* Bio */}
        {profile?.bio ? (
          <Card variant="outlined" padded style={styles.bioCard}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </Card>
        ) : null}

        {/* Sections */}
        {sections.map((section) =>
          section.content.length > 0 ? (
            <Card key={section.title} variant="outlined" padded style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name={section.icon as any} size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionContent}>
                {section.content.map((item) => (
                  <SectionRow key={item.label} label={item.label} value={item.value} />
                ))}
              </View>
            </Card>
          ) : null
        )}

        {/* Logout */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          fullWidth
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZING.borderRadius.full,
    gap: 6,
  },
  editButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.primary,
  },
  profileCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  profileCardContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  profileName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  profileMeta: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
    width: '100%',
    paddingHorizontal: SPACING.md,
  },
  profileMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  profileMetaText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  bioCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  bioText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  sectionCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  sectionContent: {
    gap: SPACING.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    flex: 0.4,
  },
  sectionValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
    flex: 0.6,
    textAlign: 'right',
  },
  logoutButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
});
