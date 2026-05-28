import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert,
  ImageBackground, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useDarkModeTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import {
  forgotPassword,
  resetPassword,
} from '@/features/auth/services/auth';
import { FontAwesome } from '@expo/vector-icons';

type Step = 'contact' | 'reset';

export default function ForgotPasswordScreen() {
  const { theme, isDark } = useDarkModeTheme();
  
  const [provider, setProvider] = useState<'EMAIL' | 'TEXTBEE'>('EMAIL');
  const [contact, setContact] = useState('');
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [step, setStep] = useState<Step>('contact');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: theme.textSecondary });
  const [countdown, setCountdown] = useState(15);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (step !== 'reset') return;
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const checkStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    let label = '';
    let color = theme.error;
    if (pass.length === 0) {
      label = '';
      color = theme.textSecondary;
    } else if (score <= 2) {
      label = 'Weak';
      color = theme.error;
    } else if (score <= 4) {
      label = 'Fair';
      color = theme.warning;
    } else {
      label = 'Strong';
      color = theme.success;
    }
    setPasswordStrength({ score, label, color });
  };

  const handlePasswordChange = (text: string) => {
    setNewPassword(text);
    checkStrength(text);
  };

  // ── Step 1: Send OTP to email/phone ──────────────────────────────
  async function handleSendOtp() {
    if (!contact.trim()) {
      Alert.alert('Missing Contact', 'Please enter your email or phone number.');
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword(contact.trim(), provider);
      Alert.alert('OTP Sent', 'Please check your messages for the 6-digit verification code.');
      setStep('reset');
      setCountdown(15);
      setCanResend(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendOtp() {
    setCanResend(false);
    setCountdown(15);
    try {
      await forgotPassword(contact.trim(), provider);
      Alert.alert('OTP Sent', 'A new verification code has been sent.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend OTP.');
    }
  }

  // ── Step 2: Reset password ──────────────────────────────────────
  async function handleResetPassword() {
    if (!otp.trim() || otp.trim().length !== 6) {
      Alert.alert('Missing Code', 'Please enter the 6-digit code from your email or SMS.');
      return;
    }
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing Fields', 'Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(contact.trim(), provider, otp.trim(), newPassword.trim(), confirmPassword.trim());

      Alert.alert(
        '✅ Password Reset!',
        'Your password has been changed successfully. Please log in with your new password.',
        [{ text: 'Log In', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Dynamic hero copy
  const heroTitle = step === 'contact' ? t('auth.forgot.title') : 'Set New Password';
  const heroSub = step === 'contact' ? t('auth.forgot.subtitle') : 'Enter the security code & choose a strong password.';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.keyboardRoot, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Header */}
        <ImageBackground
          source={require('assets/images/auth_screen_mobile.png')}
          style={styles.hero}
          resizeMode="cover"
        >
          <View style={[styles.heroOverlay, isDark && styles.heroOverlayDark]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={{ fontSize: 24, color: '#fff' }}>←</Text>
            </TouchableOpacity>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🔐</Text>
            </View>
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroSub}>{heroSub}</Text>
          </View>
        </ImageBackground>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>

          {/* ── Step 1: Contact ── */}
          {step === 'contact' && (
            <>
              {/* Provider Selector */}
              <Text style={[styles.label, { color: theme.textSecondary }]}>RECOVERY METHOD</Text>
              <View style={[styles.providerRow, { backgroundColor: theme.surfaceAlt }]}>
                <TouchableOpacity 
                  style={[styles.providerTab, provider === 'EMAIL' && [styles.providerTabActive, { backgroundColor: theme.surface }]]}
                  onPress={() => { setProvider('EMAIL'); setContact(''); }}
                >
                  <FontAwesome name="envelope" size={14} color={provider === 'EMAIL' ? theme.primary : theme.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={[styles.providerTabText, { color: provider === 'EMAIL' ? theme.primary : theme.textSecondary }]}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.providerTab, provider === 'TEXTBEE' && [styles.providerTabActive, { backgroundColor: theme.surface }]]}
                  onPress={() => { setProvider('TEXTBEE'); setContact(''); }}
                >
                  <FontAwesome name="phone" size={14} color={provider === 'TEXTBEE' ? theme.primary : theme.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={[styles.providerTabText, { color: provider === 'TEXTBEE' ? theme.primary : theme.textSecondary }]}>SMS</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {provider === 'EMAIL' ? t('auth.register.email').toUpperCase() : t('auth.register.phone').toUpperCase()}
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: isDark ? theme.sep2 : Colors.border }]}>
                <FontAwesome name={provider === 'EMAIL' ? 'envelope' : 'phone'} size={16} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputField, { color: theme.textPrimary }]}
                  value={contact}
                  onChangeText={setContact}
                  placeholder={provider === 'EMAIL' ? "ramesh@gmail.com" : "+91 9876543210"}
                  placeholderTextColor={isDark ? theme.textMuted : '#B0C4B8'}
                  keyboardType={provider === 'EMAIL' ? 'email-address' : 'phone-pad'}
                  autoCapitalize="none"
                  autoComplete={provider === 'EMAIL' ? 'email' : 'tel'}
                />
              </View>

              <TouchableOpacity
                style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnPrimaryText}>{t('auth.forgot.sendBtn')} →</Text>}
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 2: Reset Password ── */}
          {step === 'reset' && (
            <>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                Check your messages for a <Text style={[styles.contactHighlight, { color: theme.textPrimary }]}>security code</Text>, then enter it below with your new password.
              </Text>

              <Text style={[styles.label, { color: theme.textSecondary }]}>SECURITY CODE (from {provider === 'EMAIL' ? 'email' : 'SMS'})</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: isDark ? theme.sep2 : Colors.border }]}>
                <FontAwesome name="shield" size={16} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputField, { color: theme.textPrimary }]}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={isDark ? theme.textMuted : '#B0C4B8'}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <Text style={[styles.timer, { color: theme.textSecondary, marginBottom: 16 }]}>
                {canResend ? (
                  <Text style={[styles.resendLink, { color: theme.primary }]} onPress={handleResendOtp}>
                    Resend Code
                  </Text>
                ) : (
                  <>Resend code in 00:{countdown.toString().padStart(2, '0')}</>
                )}
              </Text>

              <Text style={[styles.label, { color: theme.textSecondary }]}>NEW PASSWORD</Text>>
              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: isDark ? theme.sep2 : Colors.border }]}>
                <FontAwesome name="lock" size={16} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputField, { color: theme.textPrimary }]}
                  value={newPassword}
                  onChangeText={handlePasswordChange}
                  placeholder="Enter new password (min 8 chars)"
                  placeholderTextColor={isDark ? theme.textMuted : '#B0C4B8'}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={18} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {newPassword.length > 0 && (
                <>
                  <View style={styles.strengthContainer}>
                    <View style={[styles.strengthBarBackground, { backgroundColor: isDark ? theme.sep2 : Colors.border }]}>
                      <View style={[styles.strengthBar, { width: `${(passwordStrength.score / 5) * 100}%`, backgroundColor: passwordStrength.color }]} />
                    </View>
                    <Text style={[styles.strengthText, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
                  </View>

                  <View style={styles.requirementsContainer}>
                    <View style={styles.requirementItem}>
                      <FontAwesome
                        name={newPassword.length >= 8 ? 'check-circle' : 'circle-o'}
                        size={12}
                        color={newPassword.length >= 8 ? theme.success : theme.textMuted}
                      />
                      <Text style={[styles.requirementText, { color: theme.textMuted }, newPassword.length >= 8 && { color: theme.success, fontFamily: 'Sora_600SemiBold' }]}>
                        At least 8 characters
                      </Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <FontAwesome
                        name={/[A-Z]/.test(newPassword) ? 'check-circle' : 'circle-o'}
                        size={12}
                        color={/[A-Z]/.test(newPassword) ? theme.success : theme.textMuted}
                      />
                      <Text style={[styles.requirementText, { color: theme.textMuted }, /[A-Z]/.test(newPassword) && { color: theme.success, fontFamily: 'Sora_600SemiBold' }]}>
                        Contains uppercase letter
                      </Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <FontAwesome
                        name={/[0-9]/.test(newPassword) ? 'check-circle' : 'circle-o'}
                        size={12}
                        color={/[0-9]/.test(newPassword) ? theme.success : theme.textMuted}
                      />
                      <Text style={[styles.requirementText, { color: theme.textMuted }, /[0-9]/.test(newPassword) && { color: theme.success, fontFamily: 'Sora_600SemiBold' }]}>
                        Contains a number
                      </Text>
                    </View>
                  </View>
                </>
              )}

              <Text style={[styles.label, { color: theme.textSecondary }]}>CONFIRM PASSWORD</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: isDark ? theme.sep2 : Colors.border }]}>
                <FontAwesome name="lock" size={16} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputField, { color: theme.textPrimary }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={isDark ? theme.textMuted : '#B0C4B8'}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                  <FontAwesome name={showConfirmPassword ? 'eye-slash' : 'eye'} size={18} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {confirmPassword.length > 0 && (
                <View style={styles.matchContainer}>
                  <FontAwesome
                    name={newPassword === confirmPassword ? 'check-circle' : 'times-circle'}
                    size={14}
                    color={newPassword === confirmPassword ? theme.success : theme.error}
                  />
                  <Text style={[styles.matchText, { color: newPassword === confirmPassword ? theme.success : theme.error }]}>
                    {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnPrimaryText}>Reset Password ✓</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setStep('contact')} style={styles.backLink}>
                <Text style={[styles.backLinkText, { color: theme.primary }]}>← Change contact method</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            style={styles.loginLink}
          >
            <Text style={[styles.loginLinkText, { color: theme.primary }]}>
              {t('auth.forgot.backToLogin')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1 },
  hero: { minHeight: 340, position: 'relative', overflow: 'hidden' },
  heroOverlay: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 48,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
  },
  heroOverlayDark: {
    backgroundColor: 'rgba(0,0,0,0.56)',
  },
  backBtn: {
    position: 'absolute', top: 48, left: 20,
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
  },
  heroBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-end', marginBottom: 12,
  },
  heroBadgeText: { fontSize: 20 },
  heroTitle: {
    fontSize: 28, fontFamily: 'Sora_800ExtraBold',
    color: '#fff', lineHeight: 36, marginTop: 75,
  },
  heroSub: {
    fontSize: 13, fontFamily: 'Sora_400Regular',
    color: 'rgba(255,255,255,0.7)', marginTop: 8,
  },
  card: {
    backgroundColor: Colors.surface, borderRadius: 28,
    flexGrow: 1,
    margin: 0, marginTop: -20, padding: 24, paddingBottom: 40, minHeight: 300,
  },
  infoText: {
    fontFamily: 'Sora_400Regular', fontSize: 13,
    color: Colors.textSecondary, marginBottom: 20, lineHeight: 20,
  },
  contactHighlight: { fontFamily: 'Sora_700Bold', color: Colors.textPrimary },
  providerRow: { flexDirection: 'row', borderRadius: 10, padding: 4, marginBottom: 16 },
  providerTab: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, flexDirection: 'row' },
  providerTabActive: { elevation: 1 },
  providerTabText: { fontFamily: 'Sora_600SemiBold', fontSize: 12 },
  label: {
    fontFamily: 'Sora_600SemiBold', fontSize: 11,
    color: Colors.textSecondary, letterSpacing: 0.6,
    marginBottom: 6, textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 12 },
  inputField: {
    flex: 1,
    fontFamily: 'Sora_400Regular',
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  eyeBtn: { padding: 8, marginRight: -8 },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -12,
    marginBottom: 12,
    gap: 8,
  },
  strengthBarBackground: {
    height: 4,
    borderRadius: 2,
    flex: 1,
    overflow: 'hidden',
  },
  strengthBar: { height: '100%', borderRadius: 2 },
  strengthText: { fontFamily: 'Sora_600SemiBold', fontSize: 10, minWidth: 40, textAlign: 'right' },
  matchContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -12, marginBottom: 12 },
  matchText: { fontFamily: 'Sora_600SemiBold', fontSize: 10 },
  requirementsContainer: { marginBottom: 16, paddingLeft: 4 },
  requirementItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  requirementText: { fontFamily: 'Sora_400Regular', fontSize: 11 },
  timer: { fontFamily: 'Sora_600SemiBold', fontSize: 13, marginTop: 4, textAlign: 'right' },
  resendLink: { fontFamily: 'Sora_700Bold' },
  btnPrimary: {
    height: 54, backgroundColor: Colors.primary,
    borderRadius: 16, alignItems: 'center',
    justifyContent: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryText: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#fff' },
  backLink: { marginTop: 16, alignSelf: 'center' },
  backLinkText: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: Colors.primary },
  loginLink: { marginTop: 24, alignSelf: 'center' },
  loginLinkText: { fontFamily: 'Sora_400Regular', fontSize: 13, color: Colors.textSecondary },
});
