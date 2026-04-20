import { apiCall, fetchSoilHistory } from './api';
import { useAuthStore } from '../../../store/authStore';

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
 * Dashboard stats.
 * Backend contract: GET /api/soil-tests/:userId
 * farms = response.length (each unique test = one farm record)
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const user = useAuthStore.getState().user;
    if (!user?.id) return { farms: 0, soilTests: 0, aiTips: 0 };

    const tests = await fetchSoilHistory<any[]>(user.id);
    const totalTests = Array.isArray(tests) ? tests.length : 0;

    // farms = number of soil test records returned by the API
    return { farms: totalTests, soilTests: totalTests, aiTips: totalTests };
  } catch {
    return { farms: 0, soilTests: 0, aiTips: 0 };
  }
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
