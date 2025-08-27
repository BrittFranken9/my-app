// lib/api.ts
import { Platform } from 'react-native';

const ENV_BASE =
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  process.env.API_URL?.trim() ||
  '';

function defaultBaseUrl() {
  if (ENV_BASE) return ENV_BASE.replace(/\/+$/, '');
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}

const BASE = defaultBaseUrl();

function withTimeout(ms: number, parentSignal?: AbortSignal) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);

  if (parentSignal) {
    const onAbort = () => ctrl.abort();
    parentSignal.addEventListener('abort', onAbort, { once: true });
  }

  return {
    signal: ctrl.signal,
    cancel: () => clearTimeout(id),
  };
}

async function requestOnce(url: string, init: RequestInit | undefined, timeoutMs: number) {
  const { signal, cancel } = withTimeout(timeoutMs, init?.signal as AbortSignal | undefined);
  try {
    const res = await fetch(url, { ...init, signal });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} – ${text || res.statusText}`);
    }
    // Accept both array and {data:[]} shapes
    const json = await res.json().catch(() => ({}));
    return json;
  } finally {
    cancel();
  }
}

async function request(path: string, init?: RequestInit, timeoutMs = 25000, retries = 1) {
  const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  // First try
  try {
    return await requestOnce(url, init, timeoutMs);
  } catch (e) {
    if (retries <= 0) throw e;

    // Exponential backoff: 1s, 2s, ...
    const backoffMs = 1200 * Math.pow(2, 1 - retries); // 1200ms for 1 retry
    await new Promise((r) => setTimeout(r, backoffMs));

    // Second (final) try, keep same timeout
    return await requestOnce(url, init, timeoutMs);
  }
}

export const api = {
  baseUrl: BASE,
  get: <T = unknown>(path: string, init?: RequestInit, timeoutMs?: number, retries?: number) =>
    request(path, { ...(init || {}), method: 'GET' }, timeoutMs, retries) as Promise<T>,
};
