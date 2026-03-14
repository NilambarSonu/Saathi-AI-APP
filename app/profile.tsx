import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';
import { useAuthStore } from '../store/authStore';
import LottieView from 'lottie-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            try {
              const { logout: authLogout } = await import('../services/auth');
              await authLogout();
              clearUser();
              router.replace('/(auth)/login');
            } catch (err) {
              console.error('Logout failed', err);
              clearUser();
              router.replace('/(auth)/login');
            }
          }
        }
      ]
    );
  };

  const ListItem = ({ icon, title, subtitle, onPress, destructive = false }: any) => (
    <Pressable style={styles.listItem} onPress={onPress}>
      <View style={[styles.listIconBox, destructive && { backgroundColor: '#FFEBEE' }]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={styles.listContent}>
        <Text style={[styles.listTitle, destructive && { color: Colors.error }]}>{title}</Text>
        {subtitle && <Text style={styles.listSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.listArrow}>›</Text>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={{ fontSize: 24, color: '#FFF' }}>‹</Text>
          </Pressable>
          <Text style={styles.heroTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.profileCard}>
          <Image 
            source={require('../public/founder.png')} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{user?.name || 'Farmer Name'}</Text>
          <Text style={styles.phone}>{user?.phone || '+91 98765 43210'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Verified User</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Subscription Upgrade Card */}
        <Pressable style={styles.proCard}>
          <View style={styles.proCardContent}>
            <Text style={styles.proTitle}>Saathi AI Pro ⚡</Text>
            <Text style={styles.proSubtitle}>Get unlimited soil tests, API access, and priority AI analysis.</Text>
            <View style={styles.upgradeBtn}>
              <Text style={styles.upgradeBtnText}>Upgrade Plan</Text>
            </View>
          </View>
          <View style={styles.proAnimation}>
            <LottieView
              source={require('../animations/Order-now.json')}
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
          </View>
        </Pressable>

        {/* Settings Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Setup</Text>
          <View style={styles.listContainer}>
            <ListItem icon="⚙️" title="Settings" subtitle="Preferences & Sync" onPress={() => router.push('/settings')} />
            <ListItem icon="🌾" title="Farm Details" subtitle="Manage crops and acreage" />
            <ListItem icon="📍" title="Saved Locations" subtitle="GPS coordinates of tested fields" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & About</Text>
          <View style={styles.listContainer}>
            <ListItem icon="🎧" title="Help Center" subtitle="Contact support" />
            <ListItem icon="ℹ️" title="About Saathi AI" subtitle="Version 1.0.0" onPress={() => router.push('/about')} />
            <ListItem icon="📖" title="Tutorials" subtitle="How to use Agni Sensor" />
          </View>
        </View>

        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.listContainer}>
            <ListItem 
              icon="🚪" 
              title="Sign Out" 
              destructive 
              onPress={handleLogout} 
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    backgroundColor: Colors.primaryDark,
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80, // Extra padding because profile card overlaps
  },
  heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  heroTitle: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#FFF' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Spacing.shadows.md,
    marginTop: 20,
    marginBottom: -100, // Pull down over the hero bottom
    zIndex: 10,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: Spacing.md, borderWidth: 4, borderColor: '#F4FBF6' },
  name: { fontFamily: 'Sora_800ExtraBold', fontSize: 22, color: Colors.textPrimary, marginBottom: 4 },
  phone: { fontFamily: 'Sora_400Regular', fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.md },
  badge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: Colors.primaryDark },

  content: { paddingTop: 120, paddingHorizontal: Spacing.xl },

  proCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: Spacing.radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: '#FFE082',
    overflow: 'hidden',
  },
  proCardContent: { flex: 1, zIndex: 10 },
  proTitle: { fontFamily: 'Sora_800ExtraBold', fontSize: 16, color: '#F57F17', marginBottom: 4 },
  proSubtitle: { fontFamily: 'Sora_400Regular', fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: Spacing.md },
  upgradeBtn: { backgroundColor: '#F57F17', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  upgradeBtnText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: '#FFF' },
  proAnimation: { position: 'absolute', right: -10, top: -10, opacity: 0.9 },

  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontFamily: 'Sora_700Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: Spacing.md, marginLeft: 4 },
  listContainer: { backgroundColor: Colors.surface, borderRadius: Spacing.radius.xl, ...Spacing.shadows.sm, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  listIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  listContent: { flex: 1 },
  listTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: Colors.textPrimary, marginBottom: 2 },
  listSubtitle: { fontFamily: 'Sora_400Regular', fontSize: 12, color: Colors.textSecondary },
  listArrow: { fontSize: 24, color: Colors.textMuted, fontFamily: 'Sora_400Regular' }
});
