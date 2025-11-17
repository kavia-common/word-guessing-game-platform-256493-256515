/**
 * Lightweight API client with robust base URL resolution.
 *
 * Order of resolution:
 * 1. REACT_APP_API_BASE env var (recommended)
 * 2. If current host ends with .kavia.ai and uses port 3000, switch to port 3001 with same scheme/host
 * 3. Fallback to http://localhost:3001
 *
 * All requests are made to paths relative to '/api'.
 *
 * PUBLIC_INTERFACE
 * getHealth(): Promise<{ message: string }>
 */
const detectBase = () => {
  // 1) Environment variable
  const envBase = process.env.REACT_APP_API_BASE;
  if (envBase && typeof envBase === 'string') {
    return envBase.replace(/\/+$/, '');
  }

  // 2) Infer from window.location for preview environments
  if (typeof window !== 'undefined' && window.location) {
    try {
      const { protocol, hostname } = window.location;
      // If served at 3000 we assume backend at 3001 on same host
      const backend = `${protocol}//${hostname}:3001`;
      return backend;
    } catch {
      // fallthrough to default
    }
  }

  // 3) Local fallback
  return 'http://localhost:3001';
};

const API_BASE = detectBase();

/**
 * PUBLIC_INTERFACE
 * Perform a JSON fetch to the backend under /api.
 * @param {string} path - path under /api, e.g. '/health/' or '/start-game'
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}/api${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const resp = await fetch(url, { ...options, headers, credentials: 'include' });
  const contentType = resp.headers.get('content-type') || '';
  const isJSON = contentType.includes('application/json');
  const body = isJSON ? await resp.json().catch(() => null) : await resp.text();
  if (!resp.ok) {
    const err = new Error(`API error ${resp.status}`);
    err.status = resp.status;
    err.body = body;
    throw err;
  }
  return body;
}

/**
 * PUBLIC_INTERFACE
 * Health check convenience call
 */
export function getHealth() {
  // Note: backend health endpoint is '/health/' (with trailing slash)
  return apiFetch('/health/', { method: 'GET' });
}

export default {
  apiFetch,
  getHealth,
};
