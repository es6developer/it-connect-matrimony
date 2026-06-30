import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { colors, typography, spacing, shadows } from '../../theme';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';

const { width } = Dimensions.get('window');

export default function MatchDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'ProfileView'>>();
  const { userId } = route.params || {};

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingInterest, setSendingInterest] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/api/v1/profiles/${userId}`);
      setProfile(data.profile ?? data);
    } catch {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async () => {
    setSendingInterest(true);
    try {
      await api.post('/api/v1/interests', { profileId: userId });
      Alert.alert('Success', 'Interest sent successfully!');
    } catch {
      Alert.alert('Error', 'Failed to send interest. Please try again.');
    } finally {
      setSendingInterest(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Ionicons name="person-outline" size={64} color={colors.textTertiary} />
        <Text style={styles.notFoundText}>Profile not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} style={styles.notFoundBtn} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="person" size={80} color={colors.white} />
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profile.name}, {profile.age}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} /> {profile.location}
          </Text>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{profile.about}</Text>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Occupation</Text>
            <Text style={styles.detailValue}>{profile.occupation}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Education</Text>
            <Text style={styles.detailValue}>{profile.education}</Text>
          </View>
        </Card>

        <View style={styles.gallery}>
          {(profile.photos || []).map((_: any, i: number) => (
            <View key={i} style={styles.galleryItem}>
              <Ionicons name="image-outline" size={24} color={colors.textTertiary} />
            </View>
          ))}
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsRow}>
            {(profile.interests || []).map((interest: string) => (
              <View key={interest} style={styles.interestChip}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Message"
          onPress={() => navigation.navigate('ChatDetail', { recipientId: userId, recipientName: profile?.name })}
          style={styles.footerBtn}
        />
        <Button
          title="Send Interest"
          onPress={handleSendInterest}
          variant="outline"
          loading={sendingInterest}
          style={styles.footerBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  notFoundText: { ...typography.h3, color: colors.textTertiary, marginTop: spacing.md },
  notFoundBtn: { marginTop: spacing.lg },
  content: { paddingBottom: 100 },
  imageHeader: { height: 300, backgroundColor: colors.primaryLight },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { padding: spacing.lg, alignItems: 'center' },
  name: { ...typography.h2, color: colors.text },
  location: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { ...typography.label, color: colors.text, marginBottom: spacing.sm, fontWeight: '600' },
  aboutText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: { ...typography.bodySmall, color: colors.textTertiary },
  detailValue: { ...typography.bodySmall, color: colors.text, fontWeight: '500' },
  gallery: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  galleryItem: {
    width: (width - spacing.lg * 2 - spacing.sm * 2) / 3,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  interestChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 9999,
    backgroundColor: colors.primary + '10',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  interestText: { ...typography.caption, color: colors.primary },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: 34,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: { flex: 1, marginHorizontal: spacing.xs },
});
