import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, Alert, PermissionsAndroid, Platform, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { IconSymbol } from "../../components/ui/IconSymbol";
import { useState, useEffect } from "react";
import { BleManager, Device } from "react-native-ble-plx";
import { useLanguage, Language } from "../context/LanguageContext";
import { getAllSoilRecords, SoilData } from "../../database/datastorage";
import LanguageDropdown from "../../components/Languageselector";
import { startAgniSession, stopAgniSession, setLogListener, setRefreshTrigger, setSessionEndCallback } from "../connect";

const manager = new BleManager();

async function requestPermissions() {
  if (Platform.OS === "android") {
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }
  return true;
}

export default function LiveConnectScreen() {
  const colorScheme = useColorScheme();
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { t } = useLanguage();
  const [transferLogs, setTransferLogs] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLogListener((msg) => {
      setTransferLogs(prev => [msg, ...prev]);
    });
    retriveData();

    setRefreshTrigger((val) => {
      if (val) {
        retriveData()
      };
    });

    setSessionEndCallback(() => {
      setIsScanning(false);
      addTransferLog('🏁 Data transfer completed - scanning stopped automatically');
    });

    return () => {
      setRefreshTrigger(null)
      setLogListener(null)
      setSessionEndCallback(null);
    };
  }, []);


  const retriveData = () => {
    getAllSoilRecords().then((record) => {
      setSoilData(record[0]?.data);
      if (record.length < 1) setSoilData(null)
    });
  };

  const addTransferLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTransferLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const scanForDevices = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      Alert.alert('Error', 'Bluetooth permissions are required');
      return;
    }

    const state = await manager.state();
    if (state !== 'PoweredOn') {
      Alert.alert('Error', 'Please turn on Bluetooth to scan for devices');
      return;
    }

    setIsScanning(true);
    setDevices([]);
    addTransferLog(`🔍 Scanning for devices...`);

    await startAgniSession();
  };

  const stopScanning = () => {
    stopAgniSession();
    setIsScanning(false);
    addTransferLog(`⏹️ Scanning stopped`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await retriveData(); // Refresh the data from storage
      // Optional: stop scanning if it's running
      if (isScanning) {
        stopScanning();
      }
    } finally {
      setRefreshing(false); // Stop the spinner
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background, paddingBottom: -40 }}>
        <ThemedView style={styles.container}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={[Colors[colorScheme ?? "light"].primary]} // Android spinner color
                tintColor={Colors[colorScheme ?? "light"].primary} // iOS spinner color
              />
            }
          >
            <LanguageDropdown />
            <ThemedText style={styles.title}>{t('Live Connect')}</ThemedText>
            <ThemedText style={styles.subtitle}>
              {t('Connect your Agni device to analyze soil data in real-time')}
            </ThemedText>

            <View style={styles.connectionSection}>
              <View
                style={[
                  styles.connectionCard,
                  { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                ]}
              >
                <IconSymbol
                  size={64}
                  name="antenna.radiowaves.left.and.right"
                  color={Colors[colorScheme ?? "light"].primary}
                />
                
                {isScanning && devices.length === 0 && (
                  <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.scanningText}>{transferLogs[0]}</Text>
                  </View>
                )}
              </View>

              <View style={styles.controls}>
                <TouchableOpacity
                  style={[
                    styles.scanButton,
                    { backgroundColor: Colors[colorScheme ?? "light"].primary },
                    (isScanning) && styles.buttonDisabled
                  ]}
                  onPress={isScanning ? stopScanning : scanForDevices}
                >
                  <Text style={styles.scanButtonText}>
                    {isScanning ? t('Stop Scanning') : t('Scan for Devices')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {soilData && (
              <View style={styles.dataSection}>
                <ThemedText style={styles.dataTitle}>{t('Soil Analysis Data')}</ThemedText>
                <View style={styles.dataGrid}>
                  <View
                    style={[
                      styles.dataCard,
                      { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                    ]}
                  >
                    <ThemedText style={styles.dataLabel}>pH Level</ThemedText>
                    <ThemedText style={styles.dataValue}>{soilData.ph}</ThemedText>
                  </View>
                  <View
                    style={[
                      styles.dataCard,
                      { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                    ]}
                  >
                    <ThemedText style={styles.dataLabel}>Nitrogen</ThemedText>
                    <ThemedText style={styles.dataValue}>
                      {soilData.nitrogen} ppm
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.dataCard,
                      { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                    ]}
                  >
                    <ThemedText style={styles.dataLabel}>Phosphorus</ThemedText>
                    <ThemedText style={styles.dataValue}>
                      {soilData.phosphorus} ppm
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.dataCard,
                      { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                    ]}
                  >
                    <ThemedText style={styles.dataLabel}>Potassium</ThemedText>
                    <ThemedText style={styles.dataValue}>
                      {soilData.potassium} ppm
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.dataCard,
                      { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                    ]}
                  >
                    <ThemedText style={styles.dataLabel}>Moisture</ThemedText>
                    <ThemedText style={styles.dataValue}>
                      {soilData.moisture}%
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.dataCard,
                      { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                    ]}
                  >
                    <ThemedText style={styles.dataLabel}>Temperature</ThemedText>
                    <ThemedText style={styles.dataValue}>
                      {soilData.temp}°C
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.dataCard,
                      { backgroundColor: Colors[colorScheme ?? "light"].lightGray },
                    ]}
                  >
                    <ThemedText style={styles.dataLabel}>Conductivity</ThemedText>
                    <ThemedText style={styles.dataValue}>
                      {soilData.conductivity}
                    </ThemedText>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  connectionSection: {
    alignItems: "center",
    marginBottom: 32,
    flex: 1,
  },
  connectionCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  buttonDisabled: {
    backgroundColor: '#AAAAAA',
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dataSection: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dataCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  dataLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scanningText: {
    marginTop: 10,
    color: '#666',
  },
});
