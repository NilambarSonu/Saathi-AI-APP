import { useEffect } from 'react';
import { Tabs, Redirect, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { registerForPushNotifications } from '../../services/notifications';
import { registerDevice } from '../../services/auth';

const TAB_HEIGHT = Platform.OS === 'ios' ? 88 : 68;

function TabIcon({ name, focused, customIcon }: { name: string; focused: boolean; customIcon?: boolean }) {
  if (customIcon) {
    return (
      <View style={[styles.customIconContainer, focused && styles.customIconFocused]}>
        <Text style={{ fontSize: 24 }}>{name}</Text>
      </View>
    );
  }

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{name}</Text>
    </View>
  );
}

export default function AppLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user); // Get user object
  const router = useRouter();

  useEffect(() => {
    async function setupPushNotifications() {
      if (!user) return;
      try {
        const token = await registerForPushNotifications();
        if (token) {
          await registerDevice({
            expo_push_token: token,
            device_type: Platform.OS as 'ios' | 'android',
            device_name: `${Platform.OS} Device`,
          });
        }
      } catch (err) {
        console.warn('[Push Setup]', err);
      }
    }
    setupPushNotifications();
  }, [user?.id]);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="live-connect"
        options={{
          title: 'Connect',
          tabBarIcon: ({ focused }) => <TabIcon name="📡" focused={focused} customIcon />,
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ focused }) => <TabIcon name="🤖" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon name="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen name="about" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.lg,
    right: Spacing.lg,
    height: TAB_HEIGHT,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.xxl,
    borderTopWidth: 0,
    ...Spacing.shadows.md,
    elevation: 8,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tabLabel: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 10,
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
  customIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16, // Protrude out of the top of the tab bar
    ...Spacing.shadows.sm,
  },
  customIconFocused: {
    backgroundColor: Colors.primary,
  }
});
