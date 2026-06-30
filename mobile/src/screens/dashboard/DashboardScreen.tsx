import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, SIZING } from '../../constants';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import type { DashboardStats, ActivityItem, Recommendation } from '../../types';
import api from '../../services/api';

interface DashboardScreenProps {
  navigation: any;
}

const QUICK_ACTIONS = [
  { id: 'edit', icon: 'create-outline', label: 'Edit Profile', color: '#1A73E8' },
  { id: 'premium', icon: 'star-outline', label: 'Go Premium', color: '#F59E0B' },
  { id: 'verify', icon: 'checkmark-circle-outline', label: 'Verify Profile', color: '#10B981' },
  { id: 'settings', icon: 'settings-outline', label: 'Settings', color: '#7C3AED' },
];

const ActivityIcon = ({ type }: { type: string }) => {
  const config: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
    view: { name: 'eye-outline', color: COLORS.info },
    interest: { name: 'heart-outline', color: COLORS.error },
    match: { name: 'people-outline', color: COLORS.success },
    message: { name: 'chatbubble-outline', color: COLORS.primary },
  };
  const c = config[type] || { name: 'notifications-outline', color: COLORS.textTertiary };
  return (
    <View style={[styles.activityIcon, { backgroundColor: c.color + '15' }]}>
      <Ionicons name={c.name} size={18} color={c.color} />
    </View>
  );
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, recsRes, notifsRes] = await Promise.all([
        api.get('/api/v1/users/me/stats'),
        api.get('/api/v1/recommendations/daily'),
        api.get('/api/v1/notifications?page=1&limit=5'),
      ]);
      setStats(statsRes.data.data || statsRes.data);
      setRecommendations(recsRes.data.data || recsRes.data);
      setActivities(notifsRes.data.notifications || notifsRes.data || []);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'edit':
        navigation.navigate('EditProfile');
        break;
      case 'premium':
        navigation.navigate('Subscriptions');
        break;
      case 'verify':
        Alert.alert('Verify Profile', 'Verification feature coming soon');
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
    }
  };

  const renderRecommendation = ({ item }: { item: Recommendation }) => (
    <TouchableOpacity
      style={styles.recommendationCard}
      onPress={() => navigation.navigate('MatchDetail', { user: item.profile })}
    >
      <Avatar name={item.profile.displayName} size="xl" isPremium={item.profile.isPremium} />
      <Text style={styles.recommendationName}>{item.profile.displayName}</Text>
      <Text style={styles.recommendationAge}>{item.profile.age} yrs</Text>
      <Text style={styles.recommendationWork}>{item.profile.occupation}</Text>
      <View style={styles.compatibilityBadge}>
        <Ionicons name="flash" size={14} color={COLORS.premium} />
        <Text style={styles.compatibilityText}>{item.compatibilityScore}%</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchDashboardData}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayStats = stats || { profileViews: 0, totalInterests: 0, totalMatches: 0, newLikes: 0 };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(' ')[0] || 'there'}
            </Text>
            <Text style={styles.greetingSub}>Find your perfect tech match</Text>
          </View>
          <TouchableOpacity style={styles.notificationBell} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
            {displayStats.newLikes > 0 && (
              <Badge count={displayStats.newLikes} style={styles.notifBadge} />
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileCardContent}>
            <Avatar name={user?.name} size="xl" isPremium />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Your Name'}</Text>
              <Text style={styles.profileDetail}>Software Engineer</Text>
              <Text style={styles.profileDetail}>Bangalore, India</Text>
              <View style={styles.profileStatusRow}>
                <Badge label="Premium" variant="premium" size="sm" />
                <Badge label="Verified" variant="success" size="sm" style={styles.statusBadge} />
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card variant="outlined" style={styles.statCard}>
            <Ionicons name="eye-outline" size={22} color={COLORS.primary} />
            <Text style={styles.statNumber}>{displayStats.profileViews}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Ionicons name="heart-outline" size={22} color={COLORS.error} />
            <Text style={styles.statNumber}>{displayStats.totalInterests}</Text>
            <Text style={styles.statLabel}>Interests</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Ionicons name="people-outline" size={22} color={COLORS.success} />
            <Text style={styles.statNumber}>{displayStats.totalMatches}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </Card>
        </View>

        {/* Daily Recommendations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Recommendations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAllLink}>See All</Text>
          </TouchableOpacity>
        </View>
        {recommendations.length > 0 ? (
          <FlatList
            data={recommendations}
            renderItem={renderRecommendation}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendationsList}
          />
        ) : (
          <Text style={styles.emptyText}>No recommendations yet</Text>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionItem}
              onPress={() => handleQuickAction(action.id)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon as any} size={22} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        {activities.length > 0 ? (
          activities.map((activity: any) => (
            <View key={activity.id || activity._id} style={styles.activityItem}>
              <ActivityIcon type={activity.type} />
              <View style={styles.activityContent}>
                <Text style={styles.activityMessage}>{activity.message || activity.description || activity.title}</Text>
                <Text style={styles.activityTime}>{activity.timestamp || activity.createdAt}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent activity</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
  emptyText: {
    paddingHorizontal: SPACING.lg,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textTertiary,
    marginBottom: SPACING.md,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  greetingSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notificationBell: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  profileCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  profileName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  profileDetail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profileStatusRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  statusBadge: {
    marginLeft: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statNumber: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  seeAllLink: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  recommendationsList: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.sm,
    marginBottom: SPACING.md,
  },
  recommendationCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: SIZING.borderRadius.xl,
    padding: SPACING.md,
    marginRight: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  recommendationName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  recommendationAge: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  recommendationWork: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 2,
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.premium + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: SIZING.borderRadius.full,
    marginTop: SPACING.sm,
    gap: 4,
  },
  compatibilityText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.premiumDark,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickActionItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZING.borderRadius.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: SPACING.sm,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  activityTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
});
