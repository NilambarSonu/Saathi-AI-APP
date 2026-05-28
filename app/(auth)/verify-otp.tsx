import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { verifyOtp, resendOTP } from '@/features/auth/services/auth';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { OtpInput } from '@/components/auth/OtpInput';

export default function VerifyOTPScreen() {
  const { theme } = useTheme();
  // Get both contact (email/phone) and provider
  const { contact, provider } = useLocalSearchParams<{ contact: string; provider: 'EMAIL' | 'TEXTBEE' }>();
  
  const { setSession } = useAuthStore();
  const { t } = useTranslation();
  
  const [otp, setOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleVerify(otpCode: string) {
    if (otpCode.length !== 6) {
      Alert.alert('Incomplete', 'Please enter the 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyOtp(otpCode, contact, provider);
      if (response.success && response.token && response.user) {
        await setSession(response.user, response.token, response.refreshToken ?? null);
        router.replace('/(app)');
      } else {
        Alert.alert(t('auth.verify.errorTitle'), 'Could not verify code. Please try again.');
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.error || err.message || 'The code is incorrect or expired.';
      Alert.alert(t('auth.verify.errorTitle'), serverMessage);
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setCanResend(false);
    setCountdown(15);
    try {
      await resendOTP(contact, provider);
      Alert.alert('OTP Sent', 'A new verification code has been sent.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend OTP.');
    }
  }

  // Masking based on provider type
  const maskedContact = provider === 'EMAIL' 
    ? contact?.replace(/(.{2})(.*)(@.*)/, '$1***$3') 
    : contact?.replace(/(\d{2})(\d+)(\d{2})/, '$1******$3');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={[styles.backText, { color: theme.textSecondary }]}>← {t('common.goBack')}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={[styles.icon, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={{ fontSize: 32 }}>{provider === 'EMAIL' ? '📧' : '📱'}</Text>
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>{t('auth.verify.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('auth.verify.subtitle')}
          {'\n'}
          <Text style={[styles.contactHighlight, { color: theme.textPrimary }]}>{maskedContact || contact}</Text>
        </Text>

        {/* OTP boxes */}
        <OtpInput 
          length={6} 
          value={otp} 
          onChange={setOtp} 
          onComplete={handleVerify}
        />

        {/* Countdown / Resend */}
        <Text style={[styles.timer, { color: theme.textSecondary }]}>
          {canResend ? (
            <Text style={[styles.resendLink, { color: theme.primary }]} onPress={handleResend}>
              {t('auth.verify.resendCode')}
            </Text>
          ) : (
            <>{t('auth.verify.timerText', { seconds: countdown.toString() })}</>
          )}
        </Text>

        {/* Verify button */}
        <TouchableOpacity
          style={[styles.btnPrimary, isLoading && { opacity: 0.7 }]}
          onPress={() => handleVerify(otp)}
          disabled={isLoading || otp.length < 6}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>✓ {t('auth.verify.verifyBtn')}</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  back: { padding: 20, paddingTop: 56 },
  backText: { fontFamily: 'Sora_600SemiBold', fontSize: 16 },
  content: { flex: 1, paddingHorizontal: 28, alignItems: 'center' },
  icon: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  title: {
    fontFamily: 'Sora_800ExtraBold', fontSize: 24,
    textAlign: 'center', marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Sora_400Regular', fontSize: 14,
    textAlign: 'center', lineHeight: 22, marginBottom: 36,
  },
  contactHighlight: { fontFamily: 'Sora_700Bold' },
  timer: { fontFamily: 'Sora_400Regular', fontSize: 14, marginBottom: 28 },
  resendLink: { fontFamily: 'Sora_700Bold' },
  btnPrimary: {
    width: '100%', height: 54, backgroundColor: Colors.primary,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#fff' },
});
