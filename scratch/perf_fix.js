const fs = require('fs');
const path = 'src/screens/HistoryScreen.tsx';
let code = fs.readFileSync(path, 'utf8');
let changeCount = 0;

function safeReplace(target, replacement, label) {
  if (!code.includes(target)) {
    console.error(`FAILED: "${label}" — target not found`);
    // Show nearby context for debugging
    const partial = target.split('\n')[0];
    const idx = code.indexOf(partial);
    if (idx !== -1) {
      console.error(`  Partial match found at index ${idx}`);
      console.error(`  Context: ${JSON.stringify(code.substring(idx, idx + 80))}`);
    }
    process.exit(1);
  }
  const count = code.split(target).length - 1;
  if (count > 1) {
    console.error(`FAILED: "${label}" — found ${count} matches, expected 1`);
    process.exit(1);
  }
  code = code.replace(target, replacement);
  changeCount++;
  console.log(`OK: ${label}`);
}

// Helper to create strings with \r\n
function rn(...lines) {
  return lines.join('\r\n');
}

// ═══════════════════════════════════════════════════════════════════
// 1. Fix React import — remove useDeferredValue, useTransition
// ═══════════════════════════════════════════════════════════════════
safeReplace(
  `import React, { useDeferredValue, useEffect, useMemo, useState, useCallback, useRef, useTransition } from 'react';`,
  `import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';`,
  'Fix React imports'
);

// ═══════════════════════════════════════════════════════════════════
// 2. Add InteractionManager to RN imports
// ═══════════════════════════════════════════════════════════════════
safeReplace(
  rn('  FlatList,', `} from 'react-native';`),
  rn('  FlatList,', '  InteractionManager,', `} from 'react-native';`),
  'Add InteractionManager import'
);

// ═══════════════════════════════════════════════════════════════════
// 3. Replace useTransition/useDeferredValue state with manual deferred state
// ═══════════════════════════════════════════════════════════════════
safeReplace(
  rn(
    `  const [isFilterTransitionPending, startFilterTransition] = useTransition();`,
    `  const activeTimeFilter = useDeferredValue(timeFilter);`,
    `  const activeParameter = useDeferredValue(selectedParameter);`,
    `  const isChartUpdating = isFilterTransitionPending || activeTimeFilter !== timeFilter || activeParameter !== selectedParameter;`
  ),
  rn(
    `  // Deferred values — InteractionManager updates these AFTER animations finish`,
    `  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilter>('30 Days');`,
    `  const [activeParameter, setActiveParameter] = useState<ParameterName>('Nitrogen');`,
    `  const isChartUpdating = activeTimeFilter !== timeFilter || activeParameter !== selectedParameter;`
  ),
  'Replace useTransition/useDeferredValue with manual deferred state'
);

// ═══════════════════════════════════════════════════════════════════
// 4. Fix handleSelectTimeFilter
// ═══════════════════════════════════════════════════════════════════
safeReplace(
  rn(
    `    startFilterTransition(() => setTimeFilter(filter));`,
    `    setIsTimeMenuVisible(false);`,
    `    setChartTooltip(null);`,
    `  }, [startFilterTransition]);`
  ),
  rn(
    `    setTimeFilter(filter);          // instant UI label update`,
    `    setIsTimeMenuVisible(false);`,
    `    setChartTooltip(null);`,
    `    // Defer the expensive chart/stats recomputation until after animations`,
    `    InteractionManager.runAfterInteractions(() => {`,
    `      setActiveTimeFilter(filter);`,
    `    });`,
    `  }, []);`
  ),
  'Fix handleSelectTimeFilter with InteractionManager'
);

// ═══════════════════════════════════════════════════════════════════
// 5. Fix handleSelectParam
// ═══════════════════════════════════════════════════════════════════
safeReplace(
  rn(
    `    startFilterTransition(() => setSelectedParameter(param));`,
    `    setIsParamMenuVisible(false);`,
    `    setChartTooltip(null);`,
    `  }, [startFilterTransition]);`
  ),
  rn(
    `    setSelectedParameter(param);    // instant UI label update`,
    `    setIsParamMenuVisible(false);`,
    `    setChartTooltip(null);`,
    `    // Defer the expensive chart/stats recomputation until after animations`,
    `    InteractionManager.runAfterInteractions(() => {`,
    `      setActiveParameter(param);`,
    `    });`,
    `  }, []);`
  ),
  'Fix handleSelectParam with InteractionManager'
);

// ═══════════════════════════════════════════════════════════════════
// 6. Add memoized chartConfig after chartData useMemo
// ═══════════════════════════════════════════════════════════════════
safeReplace(
  rn(
    `  }, [filteredLogs, activeParameter, theme]);`,
    ``,
    `  const handleExport = async () => {`
  ),
  rn(
    `  }, [filteredLogs, activeParameter, theme]);`,
    ``,
    `  // Memoize chart config — stops LineChart from rerendering SVG on every parent render`,
    `  const chartConfig = useMemo(() => ({`,
    `    backgroundColor: theme.surface,`,
    `    backgroundGradientFrom: theme.surface,`,
    `    backgroundGradientTo: theme.surface,`,
    `    decimalPlaces: activeParameter === 'pH Level' ? 1 : 0,`,
    `    color: (opacity = 1) => getParamColor(theme, activeParameter),`,
    `    labelColor: (opacity = 1) => isDark ? theme.textMuted : '#94A3B8',`,
    `    style: { borderRadius: 16 },`,
    `    propsForDots: { r: '6', strokeWidth: '2', stroke: theme.surface },`,
    `    propsForLabels: { fontFamily: 'Sora_400Regular', fontSize: 10 },`,
    `    propsForBackgroundLines: { strokeDasharray: '4,4', stroke: isDark ? theme.sep2 : '#F1F5F9', strokeWidth: 1 },`,
    `  }), [activeParameter, isDark, theme]);`,
    ``,
    `  const handleExport = async () => {`
  ),
  'Add memoized chartConfig'
);

// ═══════════════════════════════════════════════════════════════════
// 7. Replace inline chartConfig={{...}} with memoized chartConfig
// ═══════════════════════════════════════════════════════════════════
safeReplace(
  rn(
    `                  chartConfig={{`,
    `                    backgroundColor: theme.surface, backgroundGradientFrom: theme.surface, backgroundGradientTo: theme.surface,`,
    `                    decimalPlaces: activeParameter === 'pH Level' ? 1 : 0,`,
    `                    color: (opacity = 1) => getParamColor(theme, activeParameter),`,
    `                    labelColor: (opacity = 1) => isDark ? theme.textMuted : '#94A3B8',`,
    `                    style: { borderRadius: 16 },`,
    `                    propsForDots: { r: '6', strokeWidth: '2', stroke: theme.surface },`,
    `                    propsForLabels: { fontFamily: 'Sora_400Regular', fontSize: 10 },`,
    `                    propsForBackgroundLines: { strokeDasharray: '4,4', stroke: isDark ? theme.sep2 : '#F1F5F9', strokeWidth: 1 },`,
    `                  }}`
  ),
  `                  chartConfig={chartConfig}`,
  'Replace inline chartConfig with memoized reference'
);

// ═══════════════════════════════════════════════════════════════════
// 8. Replace nested FlatList inside ScrollView with simple .map()
// ═══════════════════════════════════════════════════════════════════
safeReplace(
  rn(
    `            <FlatList`,
    `              style={{ marginTop: 25, maxHeight: 450 }}`,
    `              nestedScrollEnabled={true}`,
    `              showsVerticalScrollIndicator={true}`,
    `              data={filteredLogs}`,
    `              keyExtractor={(log, index) => log.id || index.toString()}`,
    `              initialNumToRender={10}`,
    `              maxToRenderPerBatch={10}`,
    `              windowSize={5}`,
    `              renderItem={({ item: log, index }) => (`,
    `                <View style={styles.timelineRow}>`
  ),
  rn(
    `            <View style={{ marginTop: 25 }}>`,
    `              {filteredLogs.map((log, index) => (`,
    `                <View key={log.id || index.toString()} style={styles.timelineRow}>`
  ),
  'Replace nested FlatList with .map()'
);

safeReplace(
  rn(
    `                </View>`,
    `              )}`,
    `            />`
  ),
  rn(
    `                </View>`,
    `              ))}`,
    `            </View>`
  ),
  'Close .map() block'
);

// ═══════════════════════════════════════════════════════════════════
// Write result
// ═══════════════════════════════════════════════════════════════════
fs.writeFileSync(path, code);
console.log(`\n✅ All ${changeCount} changes applied successfully!`);
