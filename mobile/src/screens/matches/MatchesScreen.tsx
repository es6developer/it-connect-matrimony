import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, SIZING } from '../../constants';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import { Profile } from '../../types';

interface MatchesScreenProps {
  navigation: any;
}

type MatchTab = 'new' | 'all' | 'mutual';

const TABS: { key: MatchTab; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'all', label: 'All' },
  { key: 'mutual', label: 'Mutual' },
];

interface MatchedUser {
  uuid: string;
  firstName: string;
  lastName: string;
  profile: {
    age: number;
    city: string;
  };
  professionalDetail: {
    jobTitle: string;
    companyName: string;
    techStack: string[];
  };
}

interface MatchData {
  matchedUser: MatchedUser;
  matchedAt: string;
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<MatchTab>('new');
  const [matches, setMatches] = useState<(Profile & { matchedAt: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingInterest, setSendingInterest] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/matches', {
        params: { page: 1, limit: 20 },
      });
      const data: MatchData[] = response.data.data;
      const mapped = data.map((match) => ({
        id: match.matchedUser.uuid,
        userId: match.matchedUser.uuid,
        displayName: `${match.matchedUser.firstName} ${match.matchedUser.lastName}`,
        age: match.matchedUser.profile.age,
        gender: 'female' as const,
        occupation: match.matchedUser.professionalDetail.jobTitle,
        company: match.matchedUser.professionalDetail.companyName,
        education: '',
        location: { city: match.matchedUser.profile.city, state: '', country: '' },
        bio: '',
        photos: [],
        interests: match.matchedUser.professionalDetail.techStack || [],
        maritalStatus: 'never_married' as const,
        isVerified: false,
        isPremium: false,
        lastActive: match.matchedAt,
        matchedAt: match.matchedAt,
      }));
      setMatches(mapped);
    } catch {
      Alert.alert('Error', 'Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleSendInterest = useCallback(async (toUserId: string) => {
    try {
      setSendingInterest(toUserId);
      await api.post('/api/v1/interests', { toUserId });
      Alert.alert('Success', 'Interest sent successfully!');
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to send interest. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSendingInterest(null);
    }
  }, []);

  const renderMatchItem = ({ item }: { item: Profile & { matchedAt: string } }) => (
    <TouchableOpacity
      style={styles.matchItem}
      onPress={() => navigation.navigate('MatchDetail', { user: item })}
    >
      <Avatar
        name={item.displayName}
        size="lg"
        isPremium={item.isPremium}
        isOnline={false}
      />
      <View style={styles.matchInfo}>
        <View style={styles.matchNameRow}>
          <Text style={styles.matchName}>{item.displayName}</Text>
          {item.isVerified && (
            <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
          )}
        </View>
        <Text style={styles.matchDetail}>{item.occupation}</Text>
        <Text style={styles.matchDetail}>{item.location.city}</Text>
      </View>
      <View style={styles.matchActions}>
        <TouchableOpacity
          style={styles.matchActionButton}
          onPress={() => handleSendInterest(item.userId)}
          disabled={sendingInterest === item.userId}
        >
          {sendingInterest === item.userId ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (loading) return null;
    const config = {
      new: { icon: 'heart-outline' as const, title: 'No new matches', message: 'New matches will appear here' },
      all: { icon: 'people-outline' as const, title: 'No matches yet', message: 'Start connecting with people' },
      mutual: { icon: 'hand-left-outline' as const, title: 'No mutual matches', message: 'Mutual interests will appear here' },
    };
    const c = config[activeTab];
    return (
      <EmptyState
        icon={c.icon}
        title={c.title}
        message={c.message}
        actionLabel="Discover People"
        onAction={() => navigation.navigate('Search')}
      />
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
      </View>

      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
            {tab.key === 'new' && (
              <Badge count={0} size="sm" style={styles.tabBadge} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={matches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SIZING.borderRadius.full,
    backgroundColor: COLORS.borderLight,
    gap: 6,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabBadge: {},
  listContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZING.borderRadius.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: SPACING.md,
  },
  matchInfo: {
    flex: 1,
  },
  matchNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  matchDetail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  matchActions: {
    gap: SPACING.sm,
  },
  matchActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
