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

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
     const user = useAuthStore.getState().user;
     const tests = user ? await fetchSoilHistory<any[]>(user.id) : [];
     const totalTests = Array.isArray(tests) ? tests.length : 0;
     
     return { farms: 1, soilTests: totalTests, aiTips: totalTests };
  } catch {
     return { farms: 1, soilTests: 0, aiTips: 0 };
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
