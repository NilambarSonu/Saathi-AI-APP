import { apiCall } from '../../../core/services/api';

export interface UserProfile {
  id: string;
  name?: string;
  username?: string;
  email: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  profile_picture?: string;
  provider?: string;
  created_at: string;
}

/**
 * Fetch the current user's profile.
 * Backend contract: GET /api/user
 * Field mapping: username → name, email → email, profile_picture → avatar
 */
export async function getUserProfile(): Promise<UserProfile> {
  const raw = await apiCall<any>('/user');
  // Normalize field names from backend to our internal model
  return {
    id: raw?.id ?? raw?._id ?? raw?.userId ?? '',
    name: raw?.name ?? raw?.username ?? undefined,
    username: raw?.username ?? raw?.name ?? undefined,
    email: raw?.email ?? raw?.emailAddress ?? '',
    phone: raw?.phone ?? raw?.mobile ?? undefined,
    location: raw?.location ?? raw?.address ?? undefined,
    // profile_picture maps to our avatar field
    avatar_url: raw?.profile_picture ?? raw?.avatar_url ?? raw?.profile_image ?? raw?.picture ?? undefined,
    profile_picture: raw?.profile_picture ?? raw?.avatar_url ?? raw?.profile_image ?? undefined,
    provider: raw?.provider ?? 'local',
    created_at: raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
  };
}
