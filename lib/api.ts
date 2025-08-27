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
  if (parentSignal) parentSignal.addEventListener('abort', () => ctrl.abort(), { once: true });
  return { signal: ctrl.signal, cancel: () => clearTimeout(id) };
}

async function requestOnce(url: string, init: RequestInit | undefined, timeoutMs: number) {
  const { signal, cancel } = withTimeout(timeoutMs, init?.signal as AbortSignal | undefined);
  try {
    const res = await fetch(url, { ...init, signal, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} – ${text || res.statusText}`);
    }
    const text = await res.text();
    try { return text ? JSON.parse(text) : {}; } catch { return text; }
  } finally {
    cancel();
  }
}

async function request(path: string, init?: RequestInit, timeoutMs = 25000, retries = 1) {
  const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  try {
    return await requestOnce(url, init, timeoutMs);
  } catch (e) {
    if (retries <= 0) throw e;
    await new Promise(r => setTimeout(r, 1200)); // simple backoff
    return await requestOnce(url, init, timeoutMs);
  }
}

export const api = {
  baseUrl: BASE,
  get:  <T=unknown>(path: string, init?: RequestInit, timeoutMs?: number, retries?: number) =>
    request(path, { ...(init||{}), method:'GET' }, timeoutMs, retries) as Promise<T>,
  post: <T=unknown>(path: string, body?: any, timeoutMs?: number, retries?: number) =>
    request(path, { method:'POST', body: body!=null ? JSON.stringify(body) : undefined }, timeoutMs, retries) as Promise<T>,
  patch:<T=unknown>(path: string, body?: any, timeoutMs?: number, retries?: number) =>
    request(path, { method:'PATCH', body: body!=null ? JSON.stringify(body) : undefined }, timeoutMs, retries) as Promise<T>,
  put:  <T=unknown>(path: string, body?: any, timeoutMs?: number, retries?: number) =>
    request(path, { method:'PUT', body: body!=null ? JSON.stringify(body) : undefined }, timeoutMs, retries) as Promise<T>,
  del:  <T=unknown>(path: string, timeoutMs?: number, retries?: number) =>
    request(path, { method:'DELETE' }, timeoutMs, retries) as Promise<T>,
};
