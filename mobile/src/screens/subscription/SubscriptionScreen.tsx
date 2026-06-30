import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/api/v1/subscriptions/plans');
      const plansData = data.plans ?? data;
      setPlans(plansData);
      if (plansData.length > 0) {
        const popular = plansData.find((p: any) => p.isPopular);
        setSelectedPlan(popular?.id ?? plansData[0].id);
      }
    } catch {
      Alert.alert('Error', 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return;
    setSubscribing(true);
    try {
      await api.post('/api/v1/subscriptions/create', { planId: selectedPlan });
      Alert.alert('Success', `Subscribed to ${plan.name} plan!`);
    } catch {
      Alert.alert('Error', 'Subscription failed. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Subscription</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Choose Your Plan</Text>
        <Text style={styles.subheading}>
          Unlock premium features to find your perfect match faster
        </Text>

        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planSelected,
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            {plan.isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planDuration}>{plan.duration}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radio,
                  selectedPlan === plan.id && styles.radioSelected,
                ]}
              >
                {selectedPlan === plan.id && (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                )}
              </View>
            </View>

            {plan.features.map((feature: string, i: number) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </TouchableOpacity>
        ))}

        <Button
          title={`Subscribe to ${plans.find((p) => p.id === selectedPlan)?.name || 'Premium'}`}
          onPress={handleSubscribe}
          loading={subscribing}
          style={styles.subscribeBtn}
        />

        <Text style={styles.footerText}>
          No hidden charges. Cancel anytime.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  subheading: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
  },
  planSelected: { borderColor: colors.primary },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  popularText: { ...typography.caption, color: colors.white, fontWeight: '600', fontSize: 10 },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  planName: { ...typography.h3, color: colors.text },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs },
  planPrice: { ...typography.h1, color: colors.text, fontSize: 32 },
  planDuration: { ...typography.bodySmall, color: colors.textSecondary, marginLeft: spacing.xs },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: { ...typography.bodySmall, color: colors.text, marginLeft: spacing.sm },
  subscribeBtn: { marginTop: spacing.md },
  footerText: { ...typography.caption, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.md },
});
