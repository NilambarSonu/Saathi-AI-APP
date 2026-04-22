import apiClient from '@/api/axiosConfig';

export interface SoilTest {
  id: string;
  userId: string;
  n: number;
  p: number;
  k: number;
  ph: number;
  moisture: number;
  temperature: number;
  latitude?: number | null;
  longitude?: number | null;
  deviceId?: string;
  locationDetails?: string;
  createdAt: string;
}

/**
 * GET /api/soil-tests/:userId — Get soil tests for a user.
 * Falls back to /api/soil-tests if no userId given.
 * Requires Authorization header.
 */
export async function getSoilTests(userId?: string): Promise<SoilTest[]> {
  const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
  const endpoint = normalizedUserId.length > 0
    ? `/soil-tests/${encodeURIComponent(normalizedUserId)}`
    : '/soil-tests';
  const { data } = await apiClient.get<SoilTest[]>(endpoint);
  return Array.isArray(data) ? data : (data as any)?.tests ?? [];
}

/**
 * GET /api/soil-tests/:id — Get a specific soil test.
 * Requires Authorization header.
 */
export async function getSoilTest(id: string): Promise<SoilTest> {
  const { data } = await apiClient.get<SoilTest>(`/soil-tests/${id}`);
  return (data as any)?.test ?? data;
}

/**
 * POST /api/soil-tests — Save a new soil test record.
 * Requires Authorization header.
 */
export async function saveSoilTest(data: Omit<SoilTest, 'id' | 'userId' | 'createdAt'>): Promise<SoilTest> {
  const { data: res } = await apiClient.post<any>('/soil-tests', data);
  return res?.test ?? res;
}

// ─── Soil Pipeline Helpers ────────────────────────────────────────────────────

type SoilPipelinePayload = {
  deviceId?: string;
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  moisture?: number;
  temperature?: number;
  ec?: number;
  latitude?: number;
  longitude?: number;
  location?: string;
  rawData?: any;
};

function toNum(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeSoilPayload(input: SoilPipelinePayload): Record<string, any> {
  return {
    deviceId: input.deviceId || 'AGNI-SOIL-SENSOR',
    ph: toNum(input.ph),
    nitrogen: toNum(input.nitrogen),
    phosphorus: toNum(input.phosphorus),
    potassium: toNum(input.potassium),
    moisture: toNum(input.moisture),
    temperature: toNum(input.temperature),
    ec: toNum(input.ec),
    latitude: input.latitude,
    longitude: input.longitude,
    location: input.location,
    rawData: input.rawData,
  };
}

/**
 * POST /api/soil-tests — Full pipeline: normalize → save.
 * Requires Authorization header (handled by apiClient interceptor).
 */
export async function sendSoilDataToPipeline(input: SoilPipelinePayload): Promise<SoilTest> {
  const payload = normalizeSoilPayload(input);
  const { data } = await apiClient.post<any>('/soil-tests', payload);
  return data?.test ?? data;
}
