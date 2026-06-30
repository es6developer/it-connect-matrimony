import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FilterOptions } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
}

const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];
const EDUCATION_LEVELS = ['High School', 'Bachelor', 'Master', 'PhD', 'Other'];

export function FilterSheet({ visible, onClose, onApply }: FilterSheetProps) {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [ageMin, setAgeMin] = useState('22');
  const [ageMax, setAgeMax] = useState('38');
  const [location, setLocation] = useState('');
  const [religion, setReligion] = useState('');
  const [education, setEducation] = useState('');

  const handleApply = () => {
    onApply({
      ageRange: { min: parseInt(ageMin) || 22, max: parseInt(ageMax) || 38 },
      location: location || undefined,
      religion: religion || undefined,
      education: education || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setAgeMin('22');
    setAgeMax('38');
    setLocation('');
    setReligion('');
    setEducation('');
    setFilters({});
    onApply({});
  };

  const toggleOption = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => {
      if ((prev as any)[key] === value) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Age Range</Text>
            <View style={styles.rangeRow}>
              <Input
                placeholder="Min"
                value={ageMin}
                onChangeText={setAgeMin}
                keyboardType="number-pad"
                containerStyle={styles.rangeInput}
              />
              <Text style={styles.rangeSep}>-</Text>
              <Input
                placeholder="Max"
                value={ageMax}
                onChangeText={setAgeMax}
                keyboardType="number-pad"
                containerStyle={styles.rangeInput}
              />
            </View>

            <Text style={styles.sectionTitle}>Location</Text>
            <Input
              placeholder="City or state"
              value={location}
              onChangeText={setLocation}
              leftIcon="location-outline"
            />

            <Text style={styles.sectionTitle}>Religion</Text>
            <View style={styles.chipRow}>
              {RELIGIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, religion === r && styles.chipActive]}
                  onPress={() => setReligion(religion === r ? '' : r)}
                >
                  <Text style={[styles.chipText, religion === r && styles.chipTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.chipRow}>
              {EDUCATION_LEVELS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[styles.chip, education === e && styles.chipActive]}
                  onPress={() => setEducation(education === e ? '' : e)}
                >
                  <Text style={[styles.chipText, education === e && styles.chipTextActive]}>
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Reset" onPress={handleReset} variant="ghost" style={styles.footerBtn} />
            <Button title="Apply Filters" onPress={handleApply} style={styles.footerBtn} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { ...typography.h3, color: colors.text },
  content: { paddingHorizontal: spacing.lg },
  sectionTitle: { ...typography.label, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  rangeRow: { flexDirection: 'row', alignItems: 'center' },
  rangeInput: { flex: 1, marginBottom: 0 },
  rangeSep: { ...typography.body, color: colors.textTertiary, marginHorizontal: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: { flex: 1, marginHorizontal: spacing.xs },
});
