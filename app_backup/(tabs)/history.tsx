import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { WebView } from 'react-native-webview';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SoilTestRecord, deleteSoilRecordById, getAllSoilRecords } from '../../database/datastorage';
import { useLanguage } from "../context/LanguageContext";
import LanguageDropdown from '../../components/Languageselector';
import { setRefreshTrigger } from '../connect';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation<any>();
  const [historyRecords, setHistoryRecords] = useState<SoilTestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  const webViewRef = useRef<WebView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const lastRefreshTime = useRef<number>(0);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    const records = await getAllSoilRecords();
    setHistoryRecords(records);
    setIsLoading(false);
  };

  useEffect(() => {
    const refreshCallback = (val: boolean) => {
      if (val) {
        fetchHistory();
      }
    };
    setRefreshTrigger(refreshCallback);
    return () => setRefreshTrigger(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastRefreshTime.current > 2000) {
        lastRefreshTime.current = now;
        fetchHistory();
      }
    }, [])
  );

  const totalTests = historyRecords.length;
  const avgPH = totalTests > 0
    ? (historyRecords.reduce((sum, rec) => sum + rec.data.ph, 0) / totalTests).toFixed(1)
    : 'N/A';

  const stats = {
    totalTests: totalTests,
    avgPH: avgPH,
    improvement: '+0.3'
  };

  const getPHCategory = (pH: number): string => {
    if (pH < 6.0) return 'Acidic';
    if (pH >= 6.0 && pH < 7.0) return 'Slightly Acidic';
    if (pH >= 7.0 && pH <= 7.5) return 'Optimal';
    return 'Alkaline';
  };

  const getMarkerColor = (pH: number): string => {
    if (pH < 6.0) return '#FF6B6B';
    if (pH >= 6.0 && pH < 7.0) return '#FFA500';
    if (pH >= 7.0 && pH <= 7.5) return '#4CAF50';
    return '#2196F3';
  };

  const generateMapHTML = () => {
    const centerLat = 21.06525;
    const centerLng = 86.4885;

    const markers = historyRecords.map((test, index) => {
      const latitude = test.data.location.latitude || (centerLat + (Math.random() - 0.5) * 0.05);
      const longitude = test.data.location.longitude || (centerLng + (Math.random() - 0.5) * 0.05);
      const color = getMarkerColor(test.data.ph);

      return {
        lat: latitude,
        lng: longitude,
        color: color,
        pH: test.data.ph,
        location: test.data.location,
        status: getPHCategory(test.data.ph)
      };
    });

    const tileLayerURL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

    const attribution = 'Tiles © Esri'

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
    .custom-marker {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([${centerLat}, ${centerLng}], 13);

    L.tileLayer('${tileLayerURL}', {
      attribution: '${attribution}',
      maxZoom: 19
    }).addTo(map);

    const markers = ${JSON.stringify(markers)};

    markers.forEach(marker => {
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: \`<div class="custom-marker" style="background-color: \${marker.color}">\${marker.pH}</div>\`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker([marker.lat, marker.lng], { icon: icon })
        .addTo(map)
        .bindPopup(\`
          <strong>\${marker.location}</strong><br/>
          pH: \${marker.pH}<br/>
          Status: \${marker.status}
        \`);
    });

    if (markers.length > 0) {
      if (markers.length === 1) {
        map.setView([markers[0].lat, markers[0].lng], 15);
      } else {
        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  </script>
</body>
</html>
    `;
  };

  const deleteRecord = async (id: string) => {
    await deleteSoilRecordById(id);
    fetchHistory();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
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
            <ThemedText style={styles.title}>{t('History & Analytics')}</ThemedText>
            <ThemedText style={styles.subtitle}>
              {t('Track your soil health trends and field performance over time')}
            </ThemedText>

            {/* Filter Controls */}
            <View style={styles.filterSection}>
              <TouchableOpacity style={[styles.filterButton, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <IconSymbol size={16} name="calendar" color={Colors[colorScheme ?? 'light'].text} />
                <ThemedText style={styles.filterText}>{t('Last 30 Days')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterButton, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <IconSymbol size={16} name="slider.horizontal.3" color={Colors[colorScheme ?? 'light'].text} />
                <ThemedText style={styles.filterText}>{t('pH Level')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.exportButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                <IconSymbol size={16} name="square.and.arrow.up" color="white" />
                <ThemedText style={styles.exportText}>{t('Export')}</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsSection}>
              <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <ThemedText style={styles.statValue}>{stats.totalTests}</ThemedText>
                <ThemedText style={styles.statLabel}>{t('Total Tests')}</ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <ThemedText style={styles.statValue}>{stats.avgPH}</ThemedText>
                <ThemedText style={styles.statLabel}>{t('Avg pH')}</ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                <ThemedText style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  {stats.improvement}
                </ThemedText>
                <ThemedText style={styles.statLabel}>{t('Improvement')}</ThemedText>
              </View>
            </View>

            {/* Interactive Map */}
            <View style={styles.mapSection}>
              <View style={styles.mapHeader}>
                <ThemedText style={styles.mapTitle}>{t('Field Test Locations')}</ThemedText>
                <TouchableOpacity
                  style={[styles.fullscreenButton, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}
                  onPress={() => setIsMapFullscreen(true)}
                >
                  <IconSymbol size={20} name="arrow.up.left.and.arrow.down.right" color={Colors[colorScheme ?? 'light'].text} />
                </TouchableOpacity>
              </View>
              <View style={styles.mapContainer}>
                <WebView
                  ref={webViewRef}
                  originWhitelist={['*']}
                  source={{ html: generateMapHTML() }}
                  style={styles.map}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  startInLoadingState={true}
                  renderLoading={() => (
                    <View style={styles.mapLoading}>
                      <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
                    </View>
                  )}
                />
              </View>
              
              {/* Map Legend */}
              {historyRecords.length > 0 && (
                <View style={[styles.mapLegend, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
                    <ThemedText style={styles.legendText}>Acidic ({"<"}6.0)</ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FFA500' }]} />
                    <ThemedText style={styles.legendText}>Sl. Acidic (6.0-7.0)</ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                    <ThemedText style={styles.legendText}>Optimal (7.0-7.5)</ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
                    <ThemedText style={styles.legendText}>Alkaline ({">"}7.5)</ThemedText>
                  </View>
                </View>
              )}
            </View>

            {/* Test History Log */}
            <View style={styles.historySection}>
              <ThemedText style={styles.historyTitle}>{t('Test History Log')}</ThemedText>
              <View style={styles.historyList}>
                {isLoading ? (
                  <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
                ) : historyRecords.length === 0 ? (
                  <View style={[styles.emptyState, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}>
                    <ThemedText style={styles.emptyStateText}>
                      {t('No test records yet. Start your first soil test!')}
                    </ThemedText>
                  </View>
                ) : (
                  historyRecords.map((test) => (
                    <TouchableOpacity
                      key={test.id}
                      style={[styles.historyItem, { backgroundColor: Colors[colorScheme ?? 'light'].lightGray }]}
                      onPress={() => navigation.navigate('ai-chat', { recordId: test.id })}
                    >
                      <View style={[styles.statusIndicator, { backgroundColor: getMarkerColor(test.data.ph) }]} />
                      <View style={styles.historyContent}>
                        <ThemedText style={styles.historyDetails}>
                          pH: {test.data.ph} - {getPHCategory(test.data.ph)} | {test.data.timestamp}
                        </ThemedText>
                      </View>
                      <TouchableOpacity 
                        style={[styles.deleteButton, { backgroundColor: Colors[colorScheme ?? 'light'].danger || '#FF6B6B' }]}
                        onPress={(e) => { 
                          e.stopPropagation();
                          deleteRecord(test.id); 
                        }}
                      >
                        <IconSymbol size={16} name="trash.fill" color="white" />
                      </TouchableOpacity>
                      <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].icon} />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>


          </ScrollView>

          {/* Fullscreen Map Overlay */}
          {isMapFullscreen && (
            <View style={styles.fullscreenOverlay}>
              <View style={styles.fullscreenHeader}>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                  onPress={() => setIsMapFullscreen(false)}
                >
                  <IconSymbol size={24} name="xmark" color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.fullscreenMapContainer}>
                <WebView
                  source={{ html: generateMapHTML() }}
                  style={styles.fullscreenMap}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  startInLoadingState={true}
                  renderLoading={() => (
                    <View style={styles.fullscreenMapLoading}>
                      <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
                    </View>
                  )}
                />
              </View>
            </View>
          )}
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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  filterSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },
  filterText: {
    fontSize: 14,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  exportText: {
    fontSize: 14,
    color: 'white',
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  mapSection: {
    marginBottom: 24,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  fullscreenButton: {
    padding: 8,
    borderRadius: 8,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  emptyMapState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 12,
  },
  emptyMapText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.7,
  },
  mapLegend: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
  },
  historySection: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1000,
  },
  fullscreenHeader: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1001,
  },
  closeButton: {
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenMapContainer: {
    flex: 1,
    marginTop: 100,
  },
  fullscreenMap: {
    flex: 1,
  },
  fullscreenMapLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});
