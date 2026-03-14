import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert } from 'react-native';
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
      `Opening payment gateway for ₹${options.amount / 100}\nItem: ${options.description}`,
      [
        { text: "Simulate Failure", onPress: () => reject({ error: { description: "Payment cancelled by user" } }) },
        { 
          text: "Simulate Success", 
          onPress: () => resolve({ razorpay_payment_id: `pay_hardware_${Date.now()}` }) 
        }
      ]
    );
  });
};

export default function BuyAgniScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const PRICE_PER_UNIT = 8999;
  const SHIPPING = 150;
  
  const handlePurchase = async () => {
    setIsProcessing(true);
    
    const amount = (PRICE_PER_UNIT * quantity) + SHIPPING;
    const options = {
      description: `Agni Soil Sensor (x${quantity})`,
      image: 'https://saathiai.org/logo.png',
      currency: 'INR',
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY || 'rzp_test_mock_key',
      amount: amount * 100, // in paise
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
      Alert.alert(
        "Order Confirmed!", 
        `Your Agni Soil Sensor is being prepared for shipment.\nOrder ID: ${data.razorpay_payment_id}`,
        [{ text: "OK", onPress: () => router.push('/(app)/dashboard') }]
      );
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
          <Ionicons name="arrow-back" size={28} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.productImageContainer}>
        {/* Placeholder for real hardware image */}
        <View style={styles.imagePlaceholder}>
          <Ionicons name="hardware-chip-outline" size={80} color={Colors.primary} />
          <Text style={styles.imageText}>AGNI V1.0</Text>
        </View>
      </View>

      <Text style={styles.title}>Agni Soil Sensor</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>₹8,999</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>In Stock</Text>
        </View>
      </View>
      
      <Text style={styles.description}>
        The ultimate IoT soil testing tool. Get lab-grade NPK, pH, moisture, and temperature readings instantly on your smartphone via Bluetooth. Includes a 1-year Saathi Pro subscription.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="bluetooth" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>Instant BLE 5.0 Sync</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="battery-charging" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>6-Month Battery Life (Type-C)</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="water" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>IP67 Weather & Dust Proof</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="flask" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>Advanced 7-in-1 Sensor Probes</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.checkoutBox}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
        <View style={styles.quantityRow}>
          <Text style={styles.summaryText}>Quantity</Text>
          <View style={styles.qtyControl}>
            <Pressable style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Ionicons name="remove" size={16} color={Colors.textPrimary} />
            </Pressable>
            <Text style={styles.qtyText}>{quantity}</Text>
            <Pressable style={styles.qtyBtn} onPress={() => setQuantity(Math.min(10, quantity + 1))}>
              <Ionicons name="add" size={16} color={Colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{(PRICE_PER_UNIT * quantity).toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Shipping</Text>
          <Text style={styles.summaryValue}>₹{SHIPPING}</Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.md }]}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalValue}>₹{(PRICE_PER_UNIT * quantity + SHIPPING).toLocaleString()}</Text>
        </View>

        <Pressable 
          style={[styles.checkoutBtn, isProcessing && { opacity: 0.7 }]} 
          onPress={handlePurchase}
          disabled={isProcessing}
        >
          <Text style={styles.checkoutBtnText}>
            {isProcessing ? 'Processing Secure Payment...' : 'Buy Now'}
          </Text>
        </Pressable>
        <Text style={styles.guaranteeText}>
          <Ionicons name="shield-checkmark" size={12} /> 30-Day Money Back Guarantee + 1 Year Warranty
        </Text>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingTop: 60, paddingHorizontal: Spacing.xl },
  header: { marginBottom: Spacing.md },
  backBtn: { padding: 4, marginLeft: -4 },
  
  productImageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#E8F7ED',
    borderRadius: Spacing.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imageText: { fontFamily: 'Sora_700Bold', fontSize: 20, color: Colors.primary, marginTop: Spacing.md, letterSpacing: 2 },

  title: { fontFamily: 'Sora_800ExtraBold', fontSize: 26, color: Colors.textPrimary, marginBottom: 4 },
  
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  price: { fontFamily: 'Sora_700Bold', fontSize: 22, color: Colors.primary, marginRight: Spacing.md },
  badge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: Colors.primaryDark },
  
  description: { fontFamily: 'Sora_400Regular', fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xl },

  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontFamily: 'Sora_700Bold', fontSize: 16, color: Colors.textPrimary, marginBottom: Spacing.md },
  featureList: { gap: Spacing.md },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
  featureText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: Colors.textPrimary, marginLeft: Spacing.md },

  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.xl },

  checkoutBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Spacing.radius.xl,
    ...Spacing.shadows.sm,
  },
  
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderRadius: 8, padding: 4 },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 6, ...Spacing.shadows.sm },
  qtyText: { fontFamily: 'Sora_700Bold', fontSize: 14, width: 30, textAlign: 'center' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  summaryText: { fontFamily: 'Sora_400Regular', fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: Colors.textPrimary },
  
  totalText: { fontFamily: 'Sora_700Bold', fontSize: 16, color: Colors.textPrimary },
  totalValue: { fontFamily: 'Sora_800ExtraBold', fontSize: 18, color: Colors.primary },

  checkoutBtn: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: Spacing.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Spacing.shadows.sm,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md
  },
  checkoutBtnText: { fontFamily: 'Sora_700Bold', fontSize: 16, color: '#FFF' },
  guaranteeText: { fontFamily: 'Sora_600SemiBold', fontSize: 10, color: Colors.textMuted, textAlign: 'center' }

});
