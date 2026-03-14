import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';
import LottieView from 'lottie-react-native';

export default function AboutScreen() {
  const router = useRouter();

  const LinkItem = ({ title, border = true }: { title: string, border?: boolean }) => (
    <Pressable style={[styles.linkItem, border && styles.borderBottom]}>
      <Text style={styles.linkTitle}>{title}</Text>
      <Text style={styles.linkArrow}>›</Text>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ fontSize: 24, color: Colors.textPrimary }}>‹</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <LottieView
          source={require('../animations/Order-now.json')}
          autoPlay
          loop={false}
          style={{ width: 120, height: 120, marginBottom: Spacing.md }}
        />
        <Text style={styles.appName}>Saathi AI</Text>
        <Text style={styles.appVersion}>Version 1.0.0 (Build 42)</Text>
        
        <Text style={styles.appDescription}>
          The smart companion for modern farmers. Powered by Agni Soil Sensors and advanced AI to provide real-time agricultural insights, tailored exactly to your land.
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <LinkItem title="Terms of Service" />
          <LinkItem title="Privacy Policy" />
          <LinkItem title="Open Source Libraries" border={false} />
        </View>

        <View style={styles.card}>
          <LinkItem title="Rate us on App Store" />
          <LinkItem title="Follow us on X" />
          <LinkItem title="Visit saathi.farm" border={false} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for Indian Farmers</Text>
        <Text style={styles.footerCopright}>© 2026 Saathi Agritech Pvt. Ltd.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  
  hero: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.xl,
  },
  appName: { fontFamily: 'Sora_800ExtraBold', fontSize: 28, color: Colors.textPrimary, marginBottom: 4 },
  appVersion: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.xl },
  appDescription: { fontFamily: 'Sora_400Regular', fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  content: { paddingHorizontal: Spacing.xl, gap: Spacing.lg, marginTop: Spacing.xl },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.xl,
    ...Spacing.shadows.sm,
    paddingHorizontal: Spacing.lg,
  },
  linkItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.lg },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  linkTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: Colors.textPrimary },
  linkArrow: { fontSize: 24, color: Colors.textMuted, fontFamily: 'Sora_400Regular' },
  
  footer: { alignItems: 'center', marginTop: 60, paddingBottom: 40 },
  footerText: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  footerCopright: { fontFamily: 'Sora_400Regular', fontSize: 11, color: Colors.textMuted }
});
