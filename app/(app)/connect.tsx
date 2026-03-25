import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, Dimensions, Linking,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useBLE } from '../../hooks/useBLE';
import { sendSoilDataToPipeline } from '../../services/soil';

const { width } = Dimensions.get('window');

// ─── Metric Card ──────────────────────────────────────────────────────────────
type MetricCardProps = {
  icon: string; label: string; value: string | number; unit: string; color: string;
};
function MetricCard({ icon, label, value, unit, color }: MetricCardProps) {
  return (
    <View style={[s.metricCard, { borderLeftColor: color }]}>
      <Text style={[s.metricIcon, { color }]}>{icon}</Text>
      <View style={s.metricBody}>
        <Text style={s.metricLabel}>{label}</Text>
        <Text style={[s.metricValue, { color }]}>
          {value} <Text style={s.metricUnit}>{unit}</Text>
        </Text>
      </View>
    </View>
  );
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; colors: [string, string, ...string[]] }> = {
  idle:             { label: 'Scan for Agni Device',      colors: ['#C77DEF', '#7B2CBF', '#5A189A'] },
  scanning:         { label: 'Scanning…',                 colors: ['#6EA8FE', '#3B82F6']            },
  connecting:       { label: 'Connecting…',               colors: ['#FCD34D', '#F59E0B']            },
  connected:        { label: 'Connected — Starting…',     colors: ['#70E000', '#38B000']            },
  transferring:     { label: 'Receiving Soil Data…',      colors: ['#34D399', '#059669']            },
  complete:         { label: 'Transfer Complete ✓',        colors: ['#70E000', '#38B000']            },
  error:            { label: 'Retry Connection',          colors: ['#F87171', '#DC2626']            },
  bluetooth_off:    { label: 'Waiting for Bluetooth…',    colors: ['#9CA3AF', '#6B7280']            },
  permission_denied:{ label: 'Grant BT Permissions',      colors: ['#FCD34D', '#D97706']            },
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ConnectScreen() {
  const {
    status, bluetoothState, soilData, logs,
    permissionDenied, connect, disconnect, retryPermission,
  } = useBLE();

  const [activeTab, setActiveTab] = useState<'soil' | 'guide'>('soil');
  const [showLogs, setShowLogs] = useState(false);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState('');
  const [pipelineMessage, setPipelineMessage] = useState<string | null>(null);

  const cfg     = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
  const isBusy  = status === 'scanning' || status === 'connecting' || status === 'transferring';
  const isActive= status === 'connected' || status === 'transferring' || status === 'complete';

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (status === 'connected' || status === 'complete') {
      await disconnect();
    } else if (status === 'permission_denied') {
      await retryPermission();
    } else if (!isBusy) {
      await connect();
    }
  };

  const runSoilPipeline = async () => {
    if (!soilData || pipelineLoading) return;

    setPipelineLoading(true);
    setPipelineMessage(null);
    setPipelineStage('Analyzing soil...');

    try {
      const t1 = setTimeout(() => setPipelineStage('Checking nutrients...'), 900);
      const t2 = setTimeout(() => setPipelineStage('Generating recommendations...'), 1900);

      const result = await sendSoilDataToPipeline({
        deviceId: 'AGNI-SOIL-SENSOR',
        ph: soilData.ph,
        nitrogen: soilData.nitrogen,
        phosphorus: soilData.phosphorus,
        potassium: soilData.potassium,
        moisture: soilData.moisture,
        temperature: soilData.temp,
        ec: soilData.conductivity,
        latitude: soilData.location?.latitude,
        longitude: soilData.location?.longitude,
        rawData: soilData,
      });

      clearTimeout(t1);
      clearTimeout(t2);

      if ((result as any)?.queued) {
        setPipelineMessage('No internet. Soil data saved locally and will auto-sync.');
      } else {
        setPipelineMessage('Soil data sent successfully. AI recommendations are ready.');
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setPipelineMessage('Could not submit soil data right now. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setPipelineLoading(false);
      setPipelineStage('');
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  const renderSoilContent = () => {
    if (!soilData) {
      return (
        <View style={s.soilContent}>
          <LottieView
            source={require('../../animations/soil-analysis-data.json')}
            autoPlay loop style={s.lottieSoil}
          />
          <Text style={s.contentTitle}>Soil Analysis Real-time</Text>
          <View style={s.waitingBox}>
            <MaterialCommunityIcons name="timer-sand" size={24} color="#6B8A72" />
            <Text style={s.waitingText}>
              {status === 'idle' || status === 'error'
                ? 'Scan and connect to your Agni device to begin.'
                : 'Waiting for soil data from sensor…'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <Animated.View entering={FadeIn.duration(500)}>
        <Text style={s.contentTitle}>Live Soil Reading</Text>
        <View style={s.metricsGrid}>
          <MetricCard icon="🧪" label="pH Level"     value={soilData.ph.toFixed(1)}          unit=""      color="#8B5CF6" />
          <MetricCard icon="💧" label="Moisture"     value={soilData.moisture.toFixed(1)}     unit="%"     color="#3B82F6" />
          <MetricCard icon="🌡️"  label="Temperature"  value={soilData.temp.toFixed(1)}         unit="°C"    color="#F97316" />
          <MetricCard icon="🟢" label="Nitrogen"     value={soilData.nitrogen.toFixed(1)}     unit="mg/kg" color="#22C55E" />
          <MetricCard icon="🔵" label="Phosphorus"   value={soilData.phosphorus.toFixed(1)}   unit="mg/kg" color="#6366F1" />
          <MetricCard icon="🟡" label="Potassium"    value={soilData.potassium.toFixed(1)}    unit="mg/kg" color="#EAB308" />
          <MetricCard icon="⚡" label="Conductivity" value={soilData.conductivity.toFixed(2)} unit="dS/m"  color="#14B8A6" />
        </View>

        <TouchableOpacity
          style={[s.pipelineBtn, pipelineLoading && { opacity: 0.7 }]}
          disabled={pipelineLoading}
          onPress={runSoilPipeline}
        >
          <Text style={s.pipelineBtnText}>{pipelineLoading ? (pipelineStage || 'Processing...') : 'Send To AI Pipeline'}</Text>
        </TouchableOpacity>

        {pipelineMessage && (
          <Text style={s.pipelineMessage}>{pipelineMessage}</Text>
        )}

        <TouchableOpacity style={s.logToggle} onPress={() => setShowLogs(v => !v)}>
          <Feather name={showLogs ? 'chevron-up' : 'chevron-down'} size={14} color="#6B8A72" />
          <Text style={s.logToggleText}>{showLogs ? 'Hide' : 'Show'} session log</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View>
            <Text style={s.pageTitle}>Live Connect</Text>
            <Text style={s.pageSub}>Pair With Your Agni Soil Sensor</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: isActive ? '#DCFCE7' : '#F3F4F6' }]}>
            <View style={[s.statusDot, { backgroundColor: isActive ? '#22C55E' : isBusy ? '#F59E0B' : '#D1D5DB' }]} />
            <Text style={[s.statusBadgeText, { color: isActive ? '#15803D' : '#6B7280' }]}>
              {isActive ? 'Online' : isBusy ? 'Busy' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* ── PERMISSION DENIED BANNER (Enhancement 2) ── */}
        {permissionDenied && (
          <Animated.View entering={FadeInDown.duration(400)} style={[s.alertBanner, { borderLeftColor: '#D97706' }]}>
            <Ionicons name="shield-outline" size={22} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={[s.alertTitle, { color: '#92400E' }]}>Permissions Denied</Text>
              <Text style={s.alertBody}>Go to Settings → Apps → Saathi AI → Permissions and enable Bluetooth.</Text>
            </View>
            <TouchableOpacity onPress={() => Linking.openSettings()}>
              <Text style={s.alertAction}>Open →</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── HERO ── */}
        <View style={s.heroContainer}>
          <View style={[s.radarCircle, isActive && s.radarCircleActive]}>
            <LottieView
              source={require('../../animations/Bluetooth.json')}
              autoPlay loop style={s.lottieMain}
            />
          </View>

          <TouchableOpacity
            style={s.connectBtnContainer}
            onPress={handlePress}
            disabled={isBusy}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={cfg.colors}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[s.connectBtn, isBusy && { opacity: 0.65 }]}
            >
              <Text style={s.connectBtnText}>{cfg.label}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {isActive && (
            <TouchableOpacity style={s.disconnectLink} onPress={disconnect}>
              <Text style={s.disconnectLinkText}>Disconnect</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── TABS ── */}
        <View style={s.tabContainer}>
          {(['soil', 'guide'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[s.tab, activeTab === tab && s.tabActive]}
              onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                {tab === 'soil' ? 'Soil Data' : 'Quick Start'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── CONTENT CARD ── */}
        <Animated.View entering={FadeInDown.duration(600)} style={s.contentCardWrapper}>
          <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
          <View style={s.contentCard}>
            {activeTab === 'soil' ? (
              renderSoilContent()
            ) : (
              <View style={s.guideContent}>
                <View style={s.guideHeader}>
                  <View style={s.sparkleBox}><Text style={s.sparkleIcon}>✨</Text></View>
                  <Text style={s.guideHeaderText}>Quick Start Guide</Text>
                </View>
                <View style={s.stepList}>
                  {[
                    { id: 1, text: 'Ensure Bluetooth is ON and location permission is granted.' },
                    { id: 2, text: 'Power on your Agni sensor — the LED should blink blue.' },
                    { id: 3, text: 'Tap "Scan for Agni Device" — the app auto-detects AGNI-SOIL-SENSOR.' },
                    { id: 4, text: 'Stay within 5 m. Soil files transfer automatically over BLE.' },
                    { id: 5, text: 'Switch to "Soil Data" tab to see live readings.' },
                  ].map(step => (
                    <View key={step.id} style={s.stepItem}>
                      <View style={s.stepBadge}>
                        <Text style={s.stepBadgeText}>{step.id}</Text>
                      </View>
                      <Text style={s.stepText}>{step.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── SESSION LOG ── */}
        {showLogs && logs.length > 0 && (
          <Animated.View entering={FadeInDown.duration(300)} style={s.logCard}>
            <Text style={s.logTitle}>Session Log</Text>
            {logs.map((entry, i) => (
              <View key={i} style={s.logRow}>
                <Text style={[s.logLevel, {
                  color: entry.level === 'error' ? '#F87171'
                       : entry.level === 'warn'  ? '#FCD34D' : '#86EFAC',
                }]}>
                  {entry.level.toUpperCase().padEnd(5)}
                </Text>
                <Text style={s.logLine}>{entry.time}  {entry.message}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {!soilData && logs.length > 0 && !showLogs && (
          <TouchableOpacity style={s.logToggleOuter} onPress={() => setShowLogs(true)}>
            <Feather name="terminal" size={14} color="#6B8A72" />
            <Text style={s.logToggleText}>Show session log ({logs.length} entries)</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F0FBF4' },
  scroll: { paddingHorizontal: 20, paddingBottom: 140 },

  header: { paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontFamily: 'Sora_800ExtraBold', fontSize: 32, color: '#0D1F12', letterSpacing: -0.5 },
  pageSub:   { fontFamily: 'Sora_400Regular',   fontSize: 14, color: '#6B8A72', marginTop: 2 },

  statusBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot:       { width: 8, height: 8, borderRadius: 4 },
  statusBadgeText: { fontFamily: 'Sora_600SemiBold', fontSize: 13 },

  // ── Alert banners ──
  alertBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16,
    marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#DC2626',
  },
  alertTitle: { fontFamily: 'Sora_700Bold', fontSize: 14, color: '#991B1B', marginBottom: 2 },
  alertBody:  { fontFamily: 'Sora_400Regular', fontSize: 13, color: '#7F1D1D', lineHeight: 18 },
  alertAction:{ fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#D97706', marginTop: 6 },

  heroContainer: { alignItems: 'center', marginVertical: 30 },
  radarCircle:      { width: 260, height: 260, borderRadius: 130, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  radarCircleActive:{ shadowOpacity: 0.15 },
  lottieMain: { width: 220, height: 220 },

  connectBtnContainer: { marginTop: 20, width: 260, height: 58, borderRadius: 29, shadowColor: '#C77DFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  connectBtn:          { width: '100%', height: '100%', borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  connectBtnText:      { fontFamily: 'Sora_700Bold', fontSize: 16, color: '#FFFFFF' },

  disconnectLink:     { marginTop: 14, paddingVertical: 6, paddingHorizontal: 20 },
  disconnectLinkText: { fontFamily: 'Sora_500Medium', fontSize: 13, color: '#DC2626', textDecorationLine: 'underline' },

  tabContainer: { flexDirection: 'row', backgroundColor: '#E8F5EE', borderRadius: 16, padding: 6, marginVertical: 20 },
  tab:          { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabActive:    { backgroundColor: '#C77DFF' },
  tabText:      { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#6B8A72' },
  tabTextActive:{ color: '#FFFFFF' },

  contentCardWrapper: { borderRadius: 32, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.45)', marginVertical: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 8 },
  contentCard:        { padding: 24, minHeight: 300 },

  soilContent: { alignItems: 'center' },
  lottieSoil:  { width: 180, height: 180 },
  contentTitle:{ fontFamily: 'Sora_700Bold', fontSize: 18, color: '#0D1F12', marginBottom: 10 },
  waitingBox:  { marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  waitingText: { fontFamily: 'Sora_500Medium', fontSize: 14, color: '#6B8A72', flex: 1, lineHeight: 20 },

  metricsGrid: { gap: 12, marginTop: 12, marginBottom: 8 },
  metricCard:  { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  metricIcon:  { fontSize: 24 },
  metricBody:  { flex: 1 },
  metricLabel: { fontFamily: 'Sora_400Regular', fontSize: 12, color: '#6B8A72', marginBottom: 2 },
  metricValue: { fontFamily: 'Sora_700Bold', fontSize: 20 },
  metricUnit:  { fontFamily: 'Sora_400Regular', fontSize: 13, color: '#9CA3AF' },

  pipelineBtn: {
    marginTop: 14,
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  pipelineBtnText: {
    fontFamily: 'Sora_600SemiBold',
    color: '#FFFFFF',
    fontSize: 13,
  },
  pipelineMessage: {
    marginTop: 8,
    fontFamily: 'Sora_400Regular',
    color: '#334155',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  logToggle:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, alignSelf: 'center' },
  logToggleOuter:{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'rgba(107,138,114,0.1)', borderRadius: 20 },
  logToggleText: { fontFamily: 'Sora_400Regular', fontSize: 12, color: '#6B8A72' },

  logCard:  { backgroundColor: '#0D1F12', borderRadius: 20, padding: 16, marginTop: 12, gap: 4 },
  logTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#70E000', marginBottom: 8 },
  logRow:   { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  logLevel: { fontFamily: 'Sora_700Bold', fontSize: 10, width: 40, paddingTop: 2 },
  logLine:  { fontFamily: 'Sora_400Regular', fontSize: 11, color: '#A3C49A', lineHeight: 18, flex: 1 },

  guideContent: { padding: 10 },
  guideHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  sparkleBox:   { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  sparkleIcon:  { fontSize: 24 },
  guideHeaderText: { fontFamily: 'Sora_700Bold', fontSize: 20, color: '#1E3A8A' },
  stepList:     { gap: 20 },
  stepItem:     { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBadge:    { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  stepBadgeText:{ fontFamily: 'Sora_700Bold', fontSize: 14, color: '#2563EB' },
  stepText:     { fontFamily: 'Sora_400Regular', fontSize: 15, color: '#334155', flex: 1, lineHeight: 22 },
});
