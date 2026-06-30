import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, SIZING } from '../../constants';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Profile, FilterOptions } from '../../types';
import api from '../../services/api';

interface SearchScreenProps {
  navigation: any;
}

const FILTER_CHIPS = [
  { id: 'location', label: 'Location', icon: 'location-outline' },
  { id: 'age', label: 'Age Range', icon: 'calendar-outline' },
  { id: 'tech', label: 'Tech Stack', icon: 'code-slash-outline' },
  { id: 'occupation', label: 'Occupation', icon: 'briefcase-outline' },
];

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    ageRange: [21, 40],
    gender: [],
    location: [],
    occupation: [],
    education: [],
    techStack: [],
    interests: [],
    maritalStatus: [],
    incomeRange: [0, 10000000],
    sortBy: 'relevance',
  });

  const fetchSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        q: searchQuery,
        page: 1,
        limit: 20,
      };
      if (filters.gender.length === 1) {
        params.gender = filters.gender[0];
      }
      if (filters.ageRange[0] > 21) {
        params.ageMin = filters.ageRange[0];
      }
      if (filters.ageRange[1] < 40) {
        params.ageMax = filters.ageRange[1];
      }
      if (filters.sortBy !== 'relevance') {
        params.sortBy = filters.sortBy;
      }
      const response = await api.get('/api/v1/search', { params });
      setResults(response.data.results || response.data);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Search failed';
      setError(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  const sendInterest = useCallback(async (profileId: string) => {
    try {
      await api.post('/api/v1/interests', { profileId });
      Alert.alert('Interest Sent', 'Your interest has been sent successfully.');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to send interest';
      Alert.alert('Error', message);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSearch(), 300);
    return () => clearTimeout(timer);
  }, [fetchSearch]);

  const renderResult = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('Profile', { profileId: item.id })}
    >
      <Avatar name={item.displayName} size="lg" isPremium={item.isPremium} />
      <View style={styles.resultInfo}>
        <View style={styles.resultNameRow}>
          <Text style={styles.resultName}>{item.displayName}</Text>
          {item.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
          )}
        </View>
        <Text style={styles.resultDetail}>
          {item.occupation}{item.company ? ` at ${item.company}` : ''}
        </Text>
        <Text style={styles.resultDetail}>
          {item.age} yrs | {item.location.city}
        </Text>
        {item.compatibilityScore && (
          <View style={styles.resultCompatibility}>
            <Ionicons name="flash" size={12} color={COLORS.premium} />
            <Text style={styles.resultCompatibilityText}>
              {item.compatibilityScore}% Match
            </Text>
          </View>
        )}
        <View style={styles.resultTags}>
          {item.interests.slice(0, 3).map((interest) => (
            <View key={interest} style={styles.resultTag}>
              <Text style={styles.resultTagText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity onPress={() => sendInterest(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="heart-outline" size={22} color={COLORS.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search-outline" size={20} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, skill, company..."
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {FILTER_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={styles.chip}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name={chip.icon as any} size={16} color={COLORS.textSecondary} />
            <Text style={styles.chipText}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
              <Text style={styles.emptyTitle}>Something went wrong</Text>
              <Text style={styles.emptyMessage}>{error}</Text>
              <Button title="Retry" onPress={fetchSearch} style={{ marginTop: SPACING.md }} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyMessage}>
                Try adjusting your search or filters
              </Text>
            </View>
          )
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.filterSectionTitle}>Age Range</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.filterInput}
                  value={String(filters.ageRange[0])}
                  placeholder="Min"
                  keyboardType="number-pad"
                />
                <Text style={styles.filterSeparator}>to</Text>
                <TextInput
                  style={styles.filterInput}
                  value={String(filters.ageRange[1])}
                  placeholder="Max"
                  keyboardType="number-pad"
                />
              </View>

              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                {['relevance', 'age', 'lastActive', 'newest'].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.sortOption,
                      filters.sortBy === opt && styles.sortOptionActive,
                    ]}
                    onPress={() => setFilters({ ...filters, sortBy: opt as any })}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        filters.sortBy === opt && styles.sortOptionTextActive,
                      ]}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <Button
                title="Reset"
                variant="outline"
                onPress={() => setFilters({
                  ageRange: [21, 40], gender: [], location: [],
                  occupation: [], education: [], techStack: [],
                  interests: [], maritalStatus: [], incomeRange: [0, 10000000],
                  sortBy: 'relevance',
                })}
                style={styles.modalFooterButton}
              />
              <Button
                title="Apply Filters"
                onPress={() => setShowFilters(false)}
                style={styles.modalFooterButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZING.borderRadius.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    height: '100%',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: SIZING.borderRadius.lg,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZING.borderRadius.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
    marginRight: SPACING.sm,
  },
  chipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  resultsList: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  resultInfo: {
    flex: 1,
  },
  resultNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  resultDetail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  resultCompatibility: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  resultCompatibilityText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.premiumDark,
  },
  resultTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.sm,
  },
  resultTag: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZING.borderRadius.full,
  },
  resultTagText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  emptyMessage: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  filterSectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZING.borderRadius.lg,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  filterSeparator: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  sortOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZING.borderRadius.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  sortOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  sortOptionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  sortOptionTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  modalFooterButton: {
    flex: 1,
  },
});
