import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, SIZING } from '../../constants';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('priya.sharma@gmail.com');
  const [password, setPassword] = useState('AVNS_H3pRC4OdTF' + '-qyYSutvZ');
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, isLoading, error } = useAuth();
  const { setGlobalLoading } = useUIStore();

  const validateEmailForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required';
    if (!password.trim()) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateOtpForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!otpEmail.trim()) errs.otpEmail = 'Email is required';
    if (!otp.trim()) errs.otp = 'OTP is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEmailLogin = async () => {
    if (!validateEmailForm()) return;
    try {
      await login({ email: email.trim(), password });
    } catch {
      // error handled by hook
    }
  };

  const handleOtpLogin = async () => {
    if (!validateOtpForm()) return;
    try {
      await login({ email: otpEmail.trim(), password: otp });
    } catch {
      // error handled by hook
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Social Login', 'Google login coming soon');
  };

  const handleLinkedInLogin = () => {
    Alert.alert('Social Login', 'LinkedIn login coming soon');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image source={require('../../../assets/logo.svg')} style={{ width: 64, height: 64, borderRadius: 16 }} resizeMode="contain" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue finding your perfect tech match
            </Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'email' && styles.activeTab]}
              onPress={() => setActiveTab('email')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'email' && styles.activeTabText,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'otp' && styles.activeTab]}
              onPress={() => setActiveTab('otp')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'otp' && styles.activeTabText,
                ]}
              >
                OTP
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'email' ? (
            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                keyboardType="email-address"
                autoComplete="email"
                error={errors.email}
              />
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
                isPassword
                error={errors.password}
              />
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </TouchableOpacity>
              <Button
                title="Sign In"
                onPress={handleEmailLogin}
                loading={isLoading}
                fullWidth
                size="lg"
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={otpEmail}
                onChangeText={setOtpEmail}
                icon="mail-outline"
                keyboardType="email-address"
                error={errors.otpEmail}
              />
              <Input
                label="OTP"
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                icon="key-outline"
                keyboardType="number-pad"
                maxLength={6}
                error={errors.otp}
              />
              <Button
                title="Verify & Sign In"
                onPress={handleOtpLogin}
                loading={isLoading}
                fullWidth
                size="lg"
              />
            </View>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
            >
              <Ionicons name="logo-google" size={22} color={COLORS.textPrimary} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleLinkedInLogin}
            >
              <Ionicons name="logo-linkedin" size={22} color="#0A66C2" />
              <Text style={styles.socialButtonText}>LinkedIn</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING.md,
    borderRadius: SIZING.borderRadius.lg,
    marginBottom: SPACING.md,
  },
  errorBannerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.borderLight,
    borderRadius: SIZING.borderRadius.lg,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: SIZING.borderRadius.md,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  forgotPassword: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
    textAlign: 'right',
    marginBottom: SPACING.lg,
    marginTop: -SPACING.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textTertiary,
    marginHorizontal: SPACING.md,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZING.buttonHeight,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZING.borderRadius.lg,
    gap: SPACING.sm,
  },
  socialButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
});
