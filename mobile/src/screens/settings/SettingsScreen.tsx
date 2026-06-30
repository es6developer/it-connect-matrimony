import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [showOnline, setShowOnline] = useState(true);
  const [hideProfile, setHideProfile] = useState(false);

  const updateSetting = async (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    try {
      await api.patch('/api/v1/users/me/settings', { [key]: value });
    } catch {
      setter(!value);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'A password reset link will be sent to your registered email.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/api/v1/users/me');
              Alert.alert('Account Deleted', 'Your account has been permanently removed.');
            } catch {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://itconnectmatrimony.com/terms');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://itconnectmatrimony.com/privacy');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Notifications</Text>
        <Card variant="outlined" style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={(v) => updateSetting('pushNotifications', v, setPushEnabled)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={pushEnabled ? colors.primary : colors.textTertiary}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Email Notifications</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={(v) => updateSetting('emailNotifications', v, setEmailEnabled)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={emailEnabled ? colors.primary : colors.textTertiary}
            />
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Privacy</Text>
        <Card variant="outlined" style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="globe-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Show Online Status</Text>
            </View>
            <Switch
              value={showOnline}
              onValueChange={(v) => updateSetting('showOnlineStatus', v, setShowOnline)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={showOnline ? colors.primary : colors.textTertiary}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="eye-off-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Hide Profile from Search</Text>
            </View>
            <Switch
              value={hideProfile}
              onValueChange={(v) => updateSetting('hideProfile', v, setHideProfile)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={hideProfile ? colors.primary : colors.textTertiary}
            />
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Account</Text>
        <Card variant="outlined" style={styles.section}>
          <TouchableOpacity style={styles.settingRow} onPress={handleChangePassword}>
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={handleDeleteAccount}>
            <View style={styles.settingInfo}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={[styles.settingLabel, { color: colors.error }]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionLabel}>About</Text>
        <Card variant="outlined" style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <TouchableOpacity style={styles.settingRow} onPress={handleTermsOfService}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={handlePrivacyPolicy}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </Card>
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
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  section: { marginBottom: spacing.md },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingLabel: { ...typography.body, color: colors.text, marginLeft: spacing.md },
  settingValue: { ...typography.bodySmall, color: colors.textTertiary },
});
