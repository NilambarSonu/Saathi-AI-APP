const fs = require('fs');

const code = fs.readFileSync('scratch/orig_HistoryScreen.tsx', 'utf8');

const scrollStart = code.indexOf('<ScrollView');
const scrollEnd = code.indexOf('</ScrollView>') + '</ScrollView>'.length;

const beforeScroll = code.substring(0, scrollStart);
const scrollBlock = code.substring(scrollStart, scrollEnd);
const afterScroll = code.substring(scrollEnd);

const extractSection = (startMarker, endMarker) => {
    let startIdx = scrollBlock.indexOf(startMarker);
    if (startIdx === -1) return '';
    let endIdx = endMarker ? scrollBlock.indexOf(endMarker, startIdx) : scrollBlock.length;
    if (endIdx === -1) endIdx = scrollBlock.length;
    return scrollBlock.substring(startIdx, endIdx);
};

const errorSection = scrollBlock.match(/\{error && \([\s\S]*?\}\)/);
const errorJSX = errorSection ? errorSection[0] : '';

const mapBlockJSX = extractSection('{/* 1. Field Location - Map */}', '{/* 2. Premium Apple Style Dropdown Filters */}');
const filterBlockJSX = extractSection('{/* 2. Premium Apple Style Dropdown Filters */}', '{/* 3. Trend Graph */}');
const chartBlockJSX = extractSection('{/* 3. Trend Graph */}', '{/* 4. Statistics Grid */}');
const statsBlockJSX = extractSection('{/* 4. Statistics Grid */}', '{/* 5. History log title */}');

const historySectionStart = scrollBlock.indexOf('{/* 5. History log title */}');
const flatListStart = scrollBlock.indexOf('<FlatList', historySectionStart);
let historyTitleJSX = '';
if (historySectionStart !== -1 && flatListStart !== -1) {
    historyTitleJSX = scrollBlock.substring(historySectionStart, flatListStart);
    const ternaryIndex = historyTitleJSX.lastIndexOf(') : (');
    if (ternaryIndex !== -1) {
        historyTitleJSX = historyTitleJSX.substring(0, ternaryIndex) + `)}
        </View>
    `;
    }
    historyTitleJSX = historyTitleJSX.replace(/\{!loading && filteredLogs\.length === 0 \? \(/, '{!loading && filteredLogs.length === 0 && (');
    historyTitleJSX = historyTitleJSX.replace(
        /paddingBottom: 16 \]\}/,
        "paddingBottom: 16, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0 ]}"
    );
}

const renderItemMatch = scrollBlock.match(/renderItem=\{\(\{ item: log, index \}\) => \([\s\S]*?\}\)/);
let timelineRowJSX = '';
if (renderItemMatch) {
    const renderContent = renderItemMatch[0];
    const rowStart = renderContent.indexOf('<View style={styles.timelineRow}>');
    // Extract up to the matching closing tag of the root element (which is `</View>`)
    const viewClose = renderContent.lastIndexOf('</View>');
    if (viewClose !== -1) {
        timelineRowJSX = renderContent.substring(rowStart, viewClose + '</View>'.length).trim();
    }
}

// Wrap each in Fragments so comments don't break JS
const newJSX = `
  const mapBlock = useMemo(() => (
    <>
      ${mapBlockJSX.trim()}
    </>
  ), [mapMode, mapInitialRegion, mapMarkers, isDark, theme]);

  const filterBlock = useMemo(() => (
    <>
      ${filterBlockJSX.trim()}
    </>
  ), [timeFilter, activeParameter, isDark, theme]);

  const chartBlock = useMemo(() => (
    <>
      ${chartBlockJSX.trim()}
    </>
  ), [chartData, activeParameter, isChartUpdating, isDark, theme]);

  const statsBlock = useMemo(() => (
    <>
      ${statsBlockJSX.trim()}
    </>
  ), [stats, activeParameter, isDark, theme, getParamColor]);

  const historyTitleBlock = useMemo(() => (
    <>
      ${historyTitleJSX.trim()}
    </>
  ), [timeFilter, loading, filteredLogs.length, isDark, theme]);

  const listHeader = useMemo(() => (
    <View style={{ paddingBottom: 0 }}>
      ${errorJSX.trim()}
      {mapBlock}
      {filterBlock}
      {chartBlock}
      {statsBlock}
      {historyTitleBlock}
    </View>
  ), [${errorJSX ? 'error, ' : ''}mapBlock, filterBlock, chartBlock, statsBlock, historyTitleBlock]);

  <FlatList
    ListHeaderComponent={listHeader}
    data={!loading ? filteredLogs : []}
    keyExtractor={(log, index) => log.id || index.toString()}
    contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 }]}
    initialNumToRender={10}
    maxToRenderPerBatch={10}
    windowSize={5}
    showsVerticalScrollIndicator={true}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS_THEMED.accent} />}
    renderItem={({ item: log, index }) => (
      <View style={[{ backgroundColor: COLORS_THEMED.card, paddingHorizontal: 16 }, index === (!loading ? filteredLogs.length - 1 : -1) ? { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 24, marginBottom: 20 } : {}]}>
        ${timelineRowJSX}
      </View>
    )}
  />
`;

const mainReturnRegex = /return \(\s*<View style=\{\[styles\.container, \{ backgroundColor: theme\.background \}\]\}>/;
const returnMatch = beforeScroll.match(mainReturnRegex);
if (!returnMatch) {
    console.log("Could not find main return");
    process.exit(1);
}

const beforeReturn = beforeScroll.substring(0, returnMatch.index);
const theReturn = beforeScroll.substring(returnMatch.index);

let finalCode = beforeReturn + "\n" + newJSX.split('<FlatList')[0] + "\n" + theReturn + "<FlatList" + newJSX.split('<FlatList')[1] + "\n" + afterScroll;

fs.writeFileSync('scratch/new_HistoryScreen.tsx', finalCode);
console.log("Success! new_HistoryScreen.tsx generated.");
