import { apiCall } from './api';

export interface DashboardStats {
  farms: number;
  soilTests: number;
  aiTips: number;
}

export interface ParameterTrend {
  parameter: string;
  averageValue: number;
  totalTests: number;
  improvementPercentage: number;
}

export interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  ph: number;
  npk: string;
}

/**
 * Normalise ANY shape the backend might return into a clean DashboardStats object.
 * The server may return snake_case, camelCase, or abbreviated keys.
 */
function normaliseDashboardStats(raw: Record<string, any>): DashboardStats {
  const n = (v: any): number => {
    const num = Number(v);
    return isNaN(num) ? 0 : num;
  };

  return {
    // Accept: farms | total_farms | totalFarms | farm_count | farmCount
    farms: n(
      raw.farms ??
      raw.total_farms ??
      raw.totalFarms ??
      raw.farm_count ??
      raw.farmCount ??
      raw.farm
    ),

    // Accept: soilTests | soil_tests | tests | soil_test_count | total_tests
    soilTests: n(
      raw.soilTests ??
      raw.soil_tests ??
      raw.tests ??
      raw.soil_test_count ??
      raw.total_tests ??
      raw.soilTestCount ??
      raw.testCount
    ),

    // Accept: aiTips | ai_tips | tips | ai_tip_count | recommendations | aiRecommendations
    aiTips: n(
      raw.aiTips ??
      raw.ai_tips ??
      raw.tips ??
      raw.ai_tip_count ??
      raw.recommendations ??
      raw.aiRecommendations ??
      raw.tipCount
    ),
  };
}

/**
 * Fetch summary stats for the dashboard data cards.
 * Tries multiple endpoints and response shapes gracefully.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // ── 1. Try the primary dashboard endpoint ──────────────────────────────
  try {
    const raw = await apiCall<Record<string, any>>('/analytics/dashboard');
    console.log('[Dashboard Stats] Raw API response:', JSON.stringify(raw));

    if (raw && typeof raw === 'object') {
      const stats = normaliseDashboardStats(raw);
      console.log('[Dashboard Stats] Normalised:', stats);

      // If at least one stat is non-zero, trust the result
      if (stats.farms > 0 || stats.soilTests > 0 || stats.aiTips > 0) {
        return stats;
      }
    }
  } catch (apiError) {
    console.warn('[Dashboard Stats] Primary endpoint failed:', apiError);
  }

  // ── 2. Try alternative stats endpoint ─────────────────────────────────
  try {
    const raw = await apiCall<Record<string, any>>('/stats');
    console.log('[Dashboard Stats] /stats response:', JSON.stringify(raw));

    if (raw && typeof raw === 'object') {
      const stats = normaliseDashboardStats(raw);
      if (stats.farms > 0 || stats.soilTests > 0 || stats.aiTips > 0) {
        return stats;
      }
    }
  } catch {
    // ignore — try next
  }

  // ── 3. Fetch counts from individual endpoints in parallel ──────────────
  try {
    const [farmsRes, testsRes, tipsRes] = await Promise.allSettled([
      apiCall<any>('/farms/count'),
      apiCall<any>('/soil-tests/count'),
      apiCall<any>('/ai-recommendations/count'),
    ]);

    const getCount = (r: PromiseSettledResult<any>): number => {
      if (r.status !== 'fulfilled') return 0;
      const v = r.value;
      if (typeof v === 'number') return v;
      if (v && typeof v === 'object') {
        return Number(
          v.count ?? v.total ?? v.value ?? Object.values(v)[0] ?? 0
        );
      }
      return 0;
    };

    const stats = {
      farms:     getCount(farmsRes),
      soilTests: getCount(testsRes),
      aiTips:    getCount(tipsRes),
    };

    console.log('[Dashboard Stats] Individual endpoints result:', stats);

    if (stats.farms > 0 || stats.soilTests > 0 || stats.aiTips > 0) {
      return stats;
    }
  } catch {
    // ignore
  }

  // ── 4. Try Neon HTTP SQL API as last resort ─────────────────────────────
  const dbUrl =
    process.env.EXPO_PUBLIC_DATABASE_URL ||
    'postgresql://neondb_owner:npg_gkDJd7iY4Pzc@ep-soft-paper-a13ldkor-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

  if (dbUrl) {
    try {
      const match = dbUrl.match(/@([^\/]+)\//);
      if (match) {
        const host = match[1];
        const neonUrl = `https://${host}/sql`;

        const runQuery = async (query: string): Promise<number> => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000);
          try {
            const res = await fetch(neonUrl, {
              method: 'POST',
              headers: {
                'Neon-Connection-String': dbUrl,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ query }),
              signal: controller.signal as RequestInit['signal'],
            });
            clearTimeout(timeout);
            const json = await res.json();
            console.log('[Neon SQL] Query result:', query, json?.rows?.[0]);
            return Number(json?.rows?.[0]?.count ?? json?.rows?.[0]?.[Object.keys(json?.rows?.[0] || {})[0]] ?? 0);
          } catch (e) {
            clearTimeout(timeout);
            throw e;
          }
        };

        const [farms, soilTests, aiTips] = await Promise.all([
          runQuery('SELECT COUNT(*) AS count FROM users'),
          runQuery('SELECT COUNT(*) AS count FROM soil_tests'),
          runQuery('SELECT COUNT(*) AS count FROM ai_recommendations'),
        ]);

        const stats = { farms, soilTests, aiTips };
        console.log('[Dashboard Stats] Direct Neon DB result:', stats);
        return stats;
      }
    } catch (e) {
      console.error('[Dashboard Stats] Neon DB direct fetch failed:', e);
    }
  }

  // ── 5. All methods exhausted ───────────────────────────────────────────
  console.warn('[Dashboard Stats] All methods failed — returning zero fallback.');
  return { farms: 0, soilTests: 0, aiTips: 0 };
}

/**
 * Fetch trend data for a specific parameter (e.g. Nitrogen, pH)
 */
export async function getParameterTrend(parameterName: string, days: number = 30): Promise<ParameterTrend> {
  return apiCall<ParameterTrend>(`/analytics/trend?parameter=${encodeURIComponent(parameterName)}&days=${days}`);
}

/**
 * Fetch geographic locations of all tests for the Map
 */
export async function getTestLocations(): Promise<MapLocation[]> {
  return apiCall<MapLocation[]>('/analytics/locations');
}
