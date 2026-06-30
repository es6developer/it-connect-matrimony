import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

const faqs = [
  { q: 'How do I update my profile?', a: 'Go to Profile > Edit Profile to update your personal information, photos, and preferences.' },
  { q: 'How do I get verified?', a: 'Submit your government ID through Settings > Verification. Our team reviews and verifies within 24-48 hours.' },
  { q: 'How does matching work?', a: 'Our algorithm suggests compatible profiles based on your preferences, location, education, and interests.' },
  { q: 'Can I delete my account?', a: 'Yes, go to Settings > Account > Delete Account. Your data will be permanently removed within 30 days.' },
];

export default function SupportScreen() {
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in subject and message');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/v1/support/tickets', {
        subject: subject.trim(),
        message: message.trim(),
        category: 'general',
      });
      Alert.alert('Success', 'Your ticket has been submitted. We will get back to you soon.');
      setSubject('');
      setMessage('');
    } catch {
      Alert.alert('Error', 'Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.contactCard}>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email Us</Text>
              <Text style={styles.contactValue}>support@itconnectmatrimony.com</Text>
            </View>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Live Chat</Text>
              <Text style={styles.contactValue}>Available 9 AM - 6 PM IST</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, i) => (
          <TouchableOpacity key={i} style={styles.faqItem} onPress={() => toggleFaq(i)}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Ionicons
                name={expandedFaq === i ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </View>
            {expandedFaq === i && (
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Submit a Ticket</Text>
        <View style={styles.ticketForm}>
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Brief description of your issue"
            placeholderTextColor={colors.textTertiary}
            value={subject}
            onChangeText={setSubject}
          />
          <Text style={styles.inputLabel}>Message</Text>
          <TextInput
            style={[styles.textInput, styles.messageInput]}
            placeholder="Describe your issue in detail..."
            placeholderTextColor={colors.textTertiary}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Button title="Submit Ticket" onPress={handleSubmitTicket} loading={loading} style={styles.submitBtn} />
        </View>
      </ScrollView>
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  contactCard: { marginBottom: spacing.lg },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactInfo: { marginLeft: spacing.md },
  contactLabel: { ...typography.bodySmall, color: colors.textSecondary },
  contactValue: { ...typography.body, color: colors.text, fontWeight: '500' },
  sectionTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.md, marginTop: spacing.md },
  faqItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: { ...typography.body, color: colors.text, flex: 1, marginRight: spacing.sm },
  faqAnswer: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  ticketForm: { marginBottom: spacing.lg },
  inputLabel: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  messageInput: { height: 120, paddingTop: spacing.md },
  submitBtn: { marginTop: spacing.sm },
});
