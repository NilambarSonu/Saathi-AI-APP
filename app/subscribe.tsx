import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

// Mock Razorpay Integration
const mockRazorpayCheckout = async (options: any) => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      "Razorpay Checkout Mock",
      `Opening payment gateway for ₹${options.amount / 100}\nPlan: ${options.description}`,
      [
        { text: "Simulate Failure", onPress: () => reject({ error: { description: "Payment cancelled by user" } }) },
        { 
          text: "Simulate Success", 
          onPress: () => resolve({ razorpay_payment_id: `pay_${Date.now()}` }) 
        }
      ]
    );
  });
};

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    period: 'Free forever',
    features: ['10 Soil Tests / month', 'Basic AI Insights', '7-Day History'],
    popular: false,
    color: Colors.textSecondary,
  },
  {
    id: 'pro',
    name: 'Pro Planner',
    price: 499,
    period: '₹499 / month',
    features: ['Unlimited Soil Tests', 'Advanced AI Analysis', 'API Access', 'Export to PDF', 'Priority Support'],
    popular: true,
    color: '#F57F17',
  },
  {
    id: 'premium',
    name: 'Enterprise',
    price: 2499,
    period: '₹2499 / year',
    features: ['All Pro Features', 'Multi-farm Management', 'Agronomist Consultation', 'Custom Reporting'],
    popular: false,
    color: Colors.primary,
  }
];

export default function SubscribeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return;
    if (plan.price === 0) {
      Alert.alert("Basic Plan", "You are already on the free Basic plan.");
      return;
    }

    setIsProcessing(true);
    
    const options = {
      description: `Saathi AI ${plan.name} Subscription`,
      image: 'https://saathiai.org/logo.png',
      currency: 'INR',
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY || 'rzp_test_mock_key',
      amount: plan.price * 100, // in paise
      name: 'Mitti-AI Innovations',
      prefill: {
        email: 'user@example.com',
        contact: user?.phone || '9999999999',
        name: user?.name || 'Saathi User'
      },
      theme: { color: Colors.primary }
    };

    try {
      const data: any = await mockRazorpayCheckout(options);
      Alert.alert("Success", `Payment successful! Payment ID: ${data.razorpay_payment_id}`);
      router.back();
    } catch (error: any) {
      Alert.alert("Payment Failed", error.error?.description || "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <Text style={styles.title}>Unlock Premium Features</Text>
      <Text style={styles.subtitle}>Supercharge your farm yields with advanced AI analytics and unlimited tests.</Text>

      <View style={styles.cardsContainer}>
        {PLANS.map(plan => (
          <Pressable 
            key={plan.id} 
            style={[
              styles.planCard, 
              selectedPlan === plan.id && { borderColor: plan.color, borderWidth: 2 }
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
              <View style={[styles.radio, selectedPlan === plan.id && { borderColor: plan.color }]}>
                {selectedPlan === plan.id && <View style={[styles.radioDot, { backgroundColor: plan.color }]} />}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.featureList}>
              {plan.features.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={plan.color} style={{ marginRight: 8 }} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable 
        style={[styles.checkoutBtn, isProcessing && { opacity: 0.7 }]} 
        onPress={handleSubscribe}
        disabled={isProcessing}
      >
        <Text style={styles.checkoutBtnText}>
          {isProcessing ? 'Processing...' : `Continue with ${PLANS.find(p => p.id === selectedPlan)?.name}`}
        </Text>
      </Pressable>

      <Text style={styles.termsText}>
        By subscribing, you agree to our Terms of Service & Privacy Policy. Subscriptions auto-renew unless cancelled.
      </Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingTop: 60, paddingHorizontal: Spacing.xl },
  header: { alignItems: 'flex-end', marginBottom: Spacing.md },
  backBtn: { padding: 4 },
  
  title: { fontFamily: 'Sora_800ExtraBold', fontSize: 28, color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: 'Sora_400Regular', fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xxl },

  cardsContainer: { gap: Spacing.lg, marginBottom: Spacing.xxl },
  
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.xl,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Spacing.shadows.sm,
    position: 'relative'
  },
  popularBadge: {
    position: 'absolute',
    top: -12, left: '50%',
    transform: [{ translateX: -50 }],
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: { fontFamily: 'Sora_700Bold', fontSize: 10, color: '#FFF' },
  
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontFamily: 'Sora_700Bold', fontSize: 18, color: Colors.textPrimary, marginBottom: 4 },
  planPeriod: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: Colors.textSecondary },
  
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },

  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md },

  featureList: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureText: { fontFamily: 'Sora_400Regular', fontSize: 13, color: Colors.textPrimary },

  checkoutBtn: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: Spacing.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Spacing.shadows.sm,
    marginBottom: Spacing.lg
  },
  checkoutBtnText: { fontFamily: 'Sora_700Bold', fontSize: 16, color: '#FFF' },
  
  termsText: { fontFamily: 'Sora_400Regular', fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16 }
});
