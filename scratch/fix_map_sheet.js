const fs = require('fs');

let code = fs.readFileSync('src/screens/HistoryScreen.tsx', 'utf8');

// 1. Add imports
if (!code.includes('@gorhom/bottom-sheet')) {
  code = code.replace(
    /import \{ Menu, Divider \} from 'react-native-paper';/,
    "import { Menu, Divider } from 'react-native-paper';\nimport BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';"
  );
}

// 2. State to Ref
code = code.replace(
  /const \[isMapFullscreen, setIsMapFullscreen\] = useState\(false\);/,
  "const mapSheetRef = useRef<BottomSheet>(null);"
);

// 3. Update expand button
code = code.replace(
  /onPress=\{\(\) => setIsMapFullscreen\(true\)\}/,
  "onPress={() => mapSheetRef.current?.expand()}"
);

// 4. Extract and remove old Modal
const modalStartRegex = /\{\/\* Partial Map Sheet \*\/\}\s*<Modal\s*visible=\{isMapFullscreen\}/;
const match = code.match(modalStartRegex);
if (!match) {
  console.log("Could not find Modal block!");
  process.exit(1);
}

const startIndex = match.index;
// Find the end of this modal by looking for the next UI comment: {/* 2. Premium Apple Style Dropdown Filters */}
const nextCommentRegex = /\{\/\* 2\. Premium Apple Style Dropdown Filters \*\/\}/;
const nextMatch = code.match(nextCommentRegex);
if (!nextMatch) {
  console.log("Could not find next comment!");
  process.exit(1);
}

const endIndex = nextMatch.index;

// Remove the Modal
code = code.slice(0, startIndex) + code.slice(endIndex);

// 5. Build the BottomSheet component
const bottomSheetCode = `
      {/* Partial Map Sheet Bottom Sheet */}
      <BottomSheet
        ref={mapSheetRef}
        index={-1}
        snapPoints={['66%', '90%']}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: isDark ? theme.sep2 : '#CBD5E1' }}
        backgroundStyle={{ backgroundColor: theme.surface, borderColor: COLORS_THEMED.border, borderWidth: 1 }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
        )}
      >
        <BottomSheetView style={{ flex: 1, paddingBottom: 20 }}>
          <View style={styles.mapSheetHeader}>
            <View>
              <Text style={[styles.mapSheetTitle, { color: COLORS_THEMED.title }]}>Field Locations</Text>
              <Text style={[styles.mapSheetSubtitle, { color: COLORS_THEMED.subtitle }]}>{mapMarkers.length} mapped tests</Text>
            </View>
            <Pressable
              onPress={() => mapSheetRef.current?.close()}
              style={({ pressed }) => [styles.mapSheetClose, { backgroundColor: pressed ? theme.surfaceAlt : isDark ? theme.bg1 : '#F1F5F9' }]}
            >
              <Ionicons name="contract-outline" size={18} color={COLORS_THEMED.title} />
            </Pressable>
          </View>
          <View style={[styles.mapSheetControls, { backgroundColor: isDark ? theme.bg1 : '#F8FAFC' }]}>
            {(['satellite', 'standard', 'osm'] as const).map(mode => (
              <Pressable
                key={mode}
                onPress={() => handleSetMapMode(mode)}
                style={({ pressed }) => [
                  styles.mapTypeBtn,
                  mapMode === mode && [styles.mapTypeBtnActive, { backgroundColor: isDark ? theme.surfaceAlt : '#FFF' }],
                  pressed && { opacity: 0.72 },
                ]}
              >
                <Text style={[styles.mapTypeLabel, { color: theme.textSecondary }, mapMode === mode && [styles.mapTypeLabelActive, { color: COLORS_THEMED.accent }]]}>
                  {mode === 'osm' ? 'OSM' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.mapSheetMapWrap, { borderColor: isDark ? theme.sep2 : '#E2E8F0', flex: 1, height: 'auto', marginBottom: 20 }]}>
            <MapView
              ref={fullMapRef}
              style={StyleSheet.absoluteFillObject}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={mapInitialRegion}
              mapType={
                mapMode === 'satellite'
                  ? 'satellite'
                  : (mapMode === 'standard'
                    ? 'standard'
                    : (Platform.OS === 'android' ? 'none' : 'standard'))
              }
              showsUserLocation={true}
              showsMyLocationButton={true}
              scrollEnabled={true}
              zoomEnabled={true}
              zoomControlEnabled={true}
              rotateEnabled={false}
              pitchEnabled={false}
              moveOnMarkerPress={false}
            >
              {mapMode === 'osm' && (
                <UrlTile
                  urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                  maximumZ={19}
                  tileSize={256}
                  zIndex={1}
                />
              )}
              {mapMarkers.map((marker) => (
                <Marker
                  key={\`sheet-\${marker.id}-\${activeParameter}\`}
                  coordinate={marker.coordinate}
                  title={\`Test on \${format(parseISO(marker.date), 'MMM d, yyyy')}\`}
                  tracksViewChanges={false}
                >
                  <View style={[styles.customMarker, { borderColor: getParamColor(theme, activeParameter), backgroundColor: isDark ? theme.surface : '#FFF' }]}>
                    <View style={[styles.markerDot, { backgroundColor: getParamColor(theme, activeParameter) }]} />
                  </View>
                </Marker>
              ))}
            </MapView>
          </View>
        </BottomSheetView>
      </BottomSheet>

`;

// 6. Insert BottomSheet before Details Modal
code = code.replace(
  /\{\/\* Details Modal \*\/\}/,
  bottomSheetCode + "\n      {/* Details Modal */}"
);

fs.writeFileSync('src/screens/HistoryScreen.tsx', code);
console.log('Successfully upgraded map to BottomSheet UX.');
