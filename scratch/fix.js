const fs = require('fs');
let code = fs.readFileSync('src/screens/HistoryScreen.tsx', 'utf8');

// 1. Imports
code = code.replace(
  /import React, \{ useEffect, useMemo, useState, useCallback, useRef \} from 'react';/,
  "import React, { useEffect, useMemo, useState, useCallback, useRef, useTransition } from 'react';"
);

// 2. States
code = code.replace(
  /const \[isMapFullscreen, setIsMapFullscreen\] = useState\(false\);\s*const mapRef = useRef<MapView>\(null\);/,
  "const [isMapFullscreen, setIsMapFullscreen] = useState(false);\n  const [isPending, startTransition] = useTransition();\n  const [displayParam, setDisplayParam] = useState<ParameterName>('Nitrogen');\n  const [displayTime, setDisplayTime] = useState<TimeFilter>('30 Days');\n  const mapRef = useRef<MapView>(null);"
);

// 3. Handlers
code = code.replace(
  /setTimeFilter\(filter\);\s*setIsTimeMenuVisible\(false\);\s*setChartTooltip\(null\);/,
  "setDisplayTime(filter);\n    setIsTimeMenuVisible(false);\n    setChartTooltip(null);\n    setTimeout(() => {\n      startTransition(() => {\n        setTimeFilter(filter);\n      });\n    }, 0);"
);

code = code.replace(
  /setSelectedParameter\(param\);\s*setIsParamMenuVisible\(false\);\s*setChartTooltip\(null\);/,
  "setDisplayParam(param);\n    setIsParamMenuVisible(false);\n    setChartTooltip(null);\n    setTimeout(() => {\n      startTransition(() => {\n        setSelectedParameter(param);\n      });\n    }, 0);"
);

// 4. Dropdowns
code = code.replace(
  /numberOfLines=\{1\}>\{timeFilter\}<\/Text>/,
  "numberOfLines={1}>{displayTime}</Text>"
);

// First occurrence is the dropdown dot color, we'll just replace the whole View for safety
code = code.replace(
  /<View style=\{\[styles\.paramColorDot, \{ backgroundColor: getParamColor\(theme, selectedParameter\), marginRight: 8 \}\]\} \/>\s*<Text style=\{\[styles\.appleDropdownText, \{ color: COLORS_THEMED\.title \}\]\} numberOfLines=\{1\}>\{selectedParameter\}<\/Text>/,
  "<View style={[styles.paramColorDot, { backgroundColor: getParamColor(theme, displayParam), marginRight: 8 }]} />\n              <Text style={[styles.appleDropdownText, { color: COLORS_THEMED.title }]} numberOfLines={1}>{displayParam}</Text>"
);

// 5. useMemo for Map
code = code.replace(
  /\{\/\* 1\. Field Location - Map \*\/\}\s*<View style=\{\[styles\.card, \{ backgroundColor: COLORS_THEMED\.card, borderColor: COLORS_THEMED\.border \}\]\}>/g,
  "{/* 1. Field Location - Map */}\n        {useMemo(() => (\n        <View style={[styles.card, { backgroundColor: COLORS_THEMED.card, borderColor: COLORS_THEMED.border }]}>"
);

code = code.replace(
  /<\/View>\s*\{\/\* Fullscreen Map Modal \*\/\}/g,
  "</View>\n        ), [mapMode, mapMarkers, isMapReady, selectedParameter, theme, isDark, COLORS_THEMED])}\n\n        {/* Fullscreen Map Modal */}"
);

// 6. useMemo for Chart
code = code.replace(
  /\{\/\* 3\. Trend Chart \*\/\}\s*<View style=\{\[styles\.card, \{ backgroundColor: COLORS_THEMED\.card, borderColor: COLORS_THEMED\.border \}\]\}>/g,
  "{/* 3. Trend Chart */}\n        {useMemo(() => (\n        <View style={[styles.card, { backgroundColor: COLORS_THEMED.card, borderColor: COLORS_THEMED.border }]}>"
);

code = code.replace(
  /<\/View>\s*\{\/\* 4\. Stats \*\/\}/g,
  "</View>\n        ), [chartData, selectedParameter, timeFilter, chartTooltip, isPending, theme, isDark, COLORS_THEMED, SCREEN_WIDTH])}\n\n        {/* 4. Stats */}"
);

// 7. useMemo for Stats
code = code.replace(
  /\{\/\* 4\. Stats \*\/\}\s*<View style=\{\[styles\.statsBar/g,
  "{/* 4. Stats */}\n        {useMemo(() => (\n        <View style={[styles.statsBar"
);

code = code.replace(
  /<\/View>\s*\{\/\* 5\. History log title \*\/\}/g,
  "</View>\n        ), [stats, selectedParameter, timeFilter, theme, isDark, COLORS_THEMED])}\n\n        {/* 5. History log title */}"
);

// 8. useMemo for Logs
code = code.replace(
  /\{\/\* 5\. History log title \*\/\}\s*<View style=\{\[styles\.historyCard/g,
  "{/* 5. History log title */}\n        {useMemo(() => (\n        <View style={[styles.historyCard"
);

code = code.replace(
  /<\/ScrollView>\s*\)\}\s*<\/View>\s*<\/ScrollView>\s*\{\/\* Details Modal \*\/\}/g,
  "</ScrollView>\n          )}\n        </View>\n        ), [filteredLogs, loading, timeFilter, selectedParameter, theme, isDark, COLORS_THEMED])}\n      </ScrollView>\n\n      {/* Details Modal */}"
);


fs.writeFileSync('src/screens/HistoryScreen.tsx', code);
console.log('Applied fast replacements');
