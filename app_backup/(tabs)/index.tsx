import { StyleSheet, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useState } from 'react';
import { router } from 'expo-router';
import { useLanguage, Language } from '../context/LanguageContext';
import useCountUp from '../assets/animation/useCountUp.js';
import LanguageDropdown from '../../components/Languageselector';
import { WebView } from 'react-native-webview';


export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const { t } = useLanguage();

  const [stats, setStats] = useState({
    farmsAnalyzed: 127,
    soilTests: 284,
    aiRecommendations: 195
  });

  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleConnectDevice = () => {
    router.push('/(tabs)/live-connect');
  };

  const handleViewDemo = () => {
    setShowDemoModal(true);
  };

  const benefits = [
    {
      icon: 'trending-up',
      color: 'green',
      backgroundColor: 'rgb(0, 128, 0, 0.2)',
      title: t('Instant Analysis'), 
      description: t('Get comprehensive soil health data in seconds with our Agni device.')
    },
    {
      icon: 'brain',
      color: 'blue',
      backgroundColor: 'rgb(0, 0, 255, 0.2)',
      title: t('Local Language'),
      description: t('Receive recommendations in Odia, Hindi, or English with voice support.')
    },
    {
      icon: 'microscope',
      color: 'yellow',
      backgroundColor: 'rgb(255, 255, 0, 0.2)',
      title: t('Sustainable Farming'),
      description: t('AI-powered organic fertilizer recommendations for better crop yield.')
    },
    {
      icon: 'map',
      color: 'rgb(128, 0, 128) ',
      backgroundColor: 'rgb(128, 0, 128, 0.2)',
      title: t('Expert Support'),
      description: t('Connect with agricultural experts for personalized advice.')
    }
  ];

  const steps = [
    {
      number: 1,
      icon: 'microscope',
      title: t('Connect Device'),
      description: t('Pair and connect your Agni soil sensor device via Bluetooth.'),
      color: '#169344',
    },
    {
      number: 2,
      icon: 'bluetooth',
      title: t('Connect to Saathi'),
      description: t('Seamlessly transfer data to our AI platform via Bluetooth connectivity.'),
      color: '#2563eb', // Amber
    },
    {
      number: 3,
      icon: 'brain',
      title: t('Get AI Recommendations'),
      description: t('Receive personalized fertilizer suggestions and farming advice in your language.'),
      color: '#ca8903', // Green
    },
  ];

  const languages: Language[] = ['English', 'Odia', 'Hindi'];

  return (
    <SafeAreaView style={{ padding: 20, flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background, paddingBottom: -40 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <LanguageDropdown />
        
        {/* Hero Text Section */}
        <ThemedText style={styles.heroTitle}>
          {/* Split the translation key for the colored text */}
          {t('The')} <ThemedText style={{ color: Colors[colorScheme ?? 'light'].primary, fontSize: 48, fontWeight: 'bold' }}>{t('Organic ')}</ThemedText>
          {t('Intelligence ')}
          {t('Platform')}
        </ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          {t(`Empower your farming with AI-driven soil analysis. Connect your Agni device, get instant soil health insights, and receive personalized recommendations in your local language.`)}
        </ThemedText>
        
        {/* Buttons Section */}
        <View style={styles.heroButtons}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={handleConnectDevice}
          >
            <IconSymbol name="link" size={25} color="white" />
            <ThemedText style={styles.primaryButtonText} lightColor="white" darkColor="white">{t('Connect Agni')}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={handleViewDemo}
          >
            <IconSymbol size={25} name="play.circle" color={Colors[colorScheme ?? 'light'].primary} />
            <ThemedText style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              {t('View Demo')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Live Stats */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: 'rgb(0, 125, 0, 0.2)'}]}>
            <ThemedText style={styles.statNumber}>{useCountUp(stats.farmsAnalyzed).toLocaleString()}</ThemedText>
            <ThemedText style={styles.statLabel}>{t('Farms Analyzed')}</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgb(0, 125, 0, 0.2)'}]}>
            <ThemedText style={styles.statNumber}>{useCountUp(stats.soilTests).toLocaleString()}</ThemedText>
            <ThemedText style={styles.statLabel}>{t('Soil Tests')}</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgb(0, 125, 0, 0.2)' }]}>
            <ThemedText style={styles.statNumber}>{useCountUp(stats.aiRecommendations).toLocaleString()}</ThemedText>
            <ThemedText style={styles.statLabel}>{t('AI Recommendations')}</ThemedText>
          </View>
        </View>

        {/* Why Choose Saathi AI */}
        <View>
          <ThemedText style={styles.sectionTitle}>{t('Why Choose Saathi AI?')}</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            {t('Advanced technology meets traditional farming wisdom to maximize your harvest potential.')}
          </ThemedText>
          
          <View style={styles.benefitsGrid}>
            {/* NOTE: benefits.map already uses t(benefit.title) and t(benefit.description) because the data is defined in the component, but we keep the structure here. */}
            {benefits.map((benefit, index) => (
              <View key={index} style={[styles.benefitCard, { backgroundColor: benefit.backgroundColor }]}>
                <View style={styles.benefitIcon}>
                  <MaterialCommunityIcons name={benefit.icon as any} size={50} color={benefit.color} />
                </View>
                <ThemedText style={styles.benefitTitle}>{t(benefit.title)}</ThemedText>
                <ThemedText style={styles.benefitDescription}>{t(benefit.description)}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.stepsSection}>
          <ThemedText style={styles.sectionTitle}>{t('How It Works')}</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            {t('Simple 3-step process to transform your farming approach')}
          </ThemedText>
          
          <View>
            {steps.map((step, index) => (
              <View key={index} style={[styles.stepCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <View style={[styles.stepNumber, { backgroundColor: step.color, opacity: 0.5}]}>
                  <ThemedText style={[styles.stepNumberText, { color: step.color, opacity: 2}]}>{step.number}</ThemedText>
                </View>
                <View style={[styles.stepIcon]}>
                  <MaterialCommunityIcons name={step.icon as any} size={32} color={step.color} />
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>{t(step.title)}</ThemedText>
                  <ThemedText style={styles.stepDescription}>{t(step.description)}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Demo Video Modal */}
      <Modal
        visible={showDemoModal}
        animationType="slide"
        onRequestClose={() => setShowDemoModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowDemoModal(false)}
              style={styles.closeButton}
            >
              <IconSymbol name="xmark" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Product Demo</ThemedText>
          </View>
          <WebView
            source={{ uri: 'https://drive.google.com/file/d/1tBXFsxUW56PWFOuRvl-3ZHhvm3CHVXIk/view?usp=drive_link' }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsFullscreenVideo={true}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    padding: 24,
    gap: 24,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 44,
    marginBottom: 16,
  },
  heroSubtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
    marginBottom: 32,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceStatus: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  deviceStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  deviceStatusSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 24,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  benefitCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  benefitDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  stepsSection: {
    paddingVertical: 24,
  },
  stepCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#169344', // Primary green color
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
  },
});
