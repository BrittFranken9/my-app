// lib/relations.ts
import { api } from '@/lib/api';

/**
 * We try the endpoints you already mentioned/used in your app:
 *   GET /events/mine/list?userId=...&type=liked
 *   GET /events/mine/list?userId=...&type=going
 *
 * If your backend uses different paths, tweak the URLs below.
 */

async function getIdsFromList(resp: any): Promise<string[]> {
  if (!resp) return [];
  const arr = Array.isArray(resp) ? resp : Array.isArray(resp?.data) ? resp.data : [];
  return arr
    .map((e: any) => e?._id ?? e?.id)
    .filter((id: any) => typeof id === 'string' && id.length > 0);
}

export async function fetchLikedIds(userId: string): Promise<Set<string>> {
  try {
    const data = await api.get<any>(`/events/mine/list?userId=${encodeURIComponent(userId)}&type=liked`, undefined, 25000, 1);
    const ids = await getIdsFromList(data);
    return new Set(ids);
  } catch {
    // Fallbacks if your API exposes a different shape:
    try {
      const data = await api.get<any>(`/users/${encodeURIComponent(userId)}/likes`, undefined, 25000, 1);
      const ids = await getIdsFromList(data);
      return new Set(ids);
    } catch {
      return new Set();
    }
  }
}

export async function fetchGoingIds(userId: string): Promise<Set<string>> {
  try {
    const data = await api.get<any>(`/events/mine/list?userId=${encodeURIComponent(userId)}&type=going`, undefined, 25000, 1);
    const ids = await getIdsFromList(data);
    return new Set(ids);
  } catch {
    // Fallback if your API exposes a different shape:
    try {
      const data = await api.get<any>(`/users/${encodeURIComponent(userId)}/going`, undefined, 25000, 1);
      const ids = await getIdsFromList(data);
      return new Set(ids);
    } catch {
      return new Set();
    }
  }
}
