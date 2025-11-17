 /**
  * Simple API client for the Word Guessing Game frontend.
  * BASE_URL defaults to http://localhost:3001/api, but can be overridden at runtime
  * via window.__API_BASE__ if it exists or via REACT_APP_API_BASE at build time.
  *
  * Also performs a lightweight connectivity check to `${API_BASE}/health` at module load
  * to help diagnose "Failed to fetch" errors early.
  */

const DEFAULT_BASE = 'http://localhost:3001/api';

/**
 * Safely read a value from process.env in CRA builds without throwing in browsers
 * where "process" might not exist under certain bundlers or execution contexts.
 * @param {string} key environment variable name (e.g., 'REACT_APP_API_BASE')
 * @returns {string|undefined}
 */
function safeEnv(key) {
  try {
    // In CRA (react-scripts) process.env is inlined at build time,
    // but guard anyway to avoid "process is not defined" if executed
    // in atypical environments.
    if (typeof process !== 'undefined' && process && process.env) {
      return process.env[key];
    }
  } catch (_) {
    // ignore
  }
  return undefined;
}

/**
 * Normalize an API base by removing trailing slashes and ensuring `/api` prefix exists.
 * @param {string} base
 * @returns {string}
 */
function normalizeBaseEnsureApi(base) {
  if (!base) return '';
  let b = String(base).replace(/\/*$/, '');
  // Ensure we include `/api` path segment exactly once.
  if (!/\/api$/.test(b)) {
    b = `${b}/api`;
  }
  return b;
}

/**
 * Normalize without forcing /api; used to detect if user already passed /api.
 * @param {string} base
 */
function normalizeBase(base) {
  if (!base) return '';
  return String(base).replace(/\/*$/, '');
}

// PUBLIC_INTERFACE
export function getApiBase() {
  /**
   * Returns the effective API base URL (including `/api`).
   * Precedence:
   * 1) window.__API_BASE__ (runtime override) — may be with or without `/api`
   * 2) process.env.REACT_APP_API_BASE (build-time for CRA) — may be with or without `/api`
   * 3) DEFAULT_BASE
   */
  try {
    if (typeof window !== 'undefined' && window.__API_BASE__) {
      const val = String(window.__API_BASE__);
      // Accept either with or without /api and normalize to include /api.
      return /\/api\/?$/.test(val) ? normalizeBase(val) : normalizeBaseEnsureApi(val);
    }
  } catch (_) {
    // ignore window access issues
  }

  const fromEnv = safeEnv('REACT_APP_API_BASE');
  if (fromEnv) {
    const val = String(fromEnv);
    return /\/api\/?$/.test(val) ? normalizeBase(val) : normalizeBaseEnsureApi(val);
  }

  return normalizeBase(DEFAULT_BASE);
}

/**
 * Compose a full URL from a path (with or without leading slash) using the API base.
 * Guarantees a single slash between base and path.
 * @param {string} path
 * @returns {string}
 */
function withBase(path) {
  const base = getApiBase();
  const clean = String(path).replace(/^\/+/, '');
  return `${base}/${clean}`;
}

/**
 * Log the resolved API base and try a quick GET /health to verify connectivity.
 * This runs once at module import time.
 */
(async function logAndProbeApiBase() {
  const base = getApiBase();
  const frontendOrigin =
    typeof window !== 'undefined' && window.location
      ? `${window.location.protocol}//${window.location.host}`
      : '(frontend-origin)';
  // eslint-disable-next-line no-console
  console.info('[api/client] Resolved API_BASE =', base, '| Frontend origin =', frontendOrigin);

  // Probe both /health and /health/ to handle backends requiring trailing slashes (Django default)
  const url1 = withBase('/health');
  const url2 = withBase('/health/');
  try {
    // eslint-disable-next-line no-console
    console.info('[api/client] Probing health (no slash):', url1);
    let res = await fetch(url1, { method: 'GET', headers: { Accept: 'application/json' } });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(`[api/client] Health (no slash) returned ${res.status}. Retrying with trailing slash: ${url2}`);
      const res2 = await fetch(url2, { method: 'GET', headers: { Accept: 'application/json' } });
      res = res2;
    }

    // eslint-disable-next-line no-console
    console.info(
      '[api/client] Health check result:',
      res.ok ? `OK (${res.status})` : `FAILED (${res.status})`,
      '| URL =',
      res?.url || '(n/a)'
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/client] Health check failed to fetch:', err?.message || err);
    // Provide CORS/Origin guidance with exact values and full URLs tested
    console.error(
      `[api/client] Connectivity hint:
- Frontend origin: ${frontendOrigin}
- API base (target): ${base}
- Probed URLs: 
  1) ${url1}
  2) ${url2}
Checklist:
1) Ensure window.__API_BASE__ is set to the EXACT backend origin INCLUDING protocol, port, and /api.
2) Django CORS: CORS_ALLOWED_ORIGINS must include "${frontendOrigin}" and CSRF_TRUSTED_ORIGINS may be required.
3) If using Authorization header, ensure django-cors-headers allows Authorization in Access-Control-Allow-Headers.
4) Avoid mixed content: if frontend is HTTPS, backend must be HTTPS too.`
    );
  }
})();

/**
 * Centralized JSON fetch with better network error surfacing.
 * Ensures JSON content-type by default and parses response body.
 * Converts network errors into a standardized Error with .code = 'NETWORK_ERROR'.
 * Surfaces HTTP errors distinctly with .status and .data.
 */
async function doJson(url, options = {}) {
  const merged = {
    // Start without headers to avoid forcing preflight unless needed
    ...options,
  };
  merged.headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };
  // Only set Content-Type for bodies we send; GETs without body won’t include it
  if (merged.body && !merged.headers['Content-Type']) {
    merged.headers['Content-Type'] = 'application/json';
  }

  // Attach Supabase access token if available (for endpoints that accept JWT)
  try {
    // Dynamic import to avoid circular deps
    const mod = await import('../context/AuthContext');
    if (mod && typeof mod.useAuth === 'function') {
      // Note: We cannot call hooks outside React. Instead, try reading token via window accessor set by index.js (optional),
      // or fallback to reading from Supabase client directly if available.
    }
  } catch (_) {
    // ignore
  }

  // Try get token from a window accessor first (set in index.js below).
  // This ensures the Supabase access token (JWT) is attached to API calls when available.
  if (typeof window !== 'undefined' && window.__getSupabaseAccessToken__) {
    try {
      const token = await window.__getSupabaseAccessToken__();
      if (token) {
        merged.headers = { ...(merged.headers || {}), Authorization: `Bearer ${token}` };
      }
    } catch (_) {
      // ignore token errors
    }
  }

  let res;
  try {
    res = await fetch(url, merged);
  } catch (networkErr) {
    const e = new Error(`Network error calling API: ${networkErr?.message || 'Failed to fetch'}`);
    e.code = 'NETWORK_ERROR';
    e.cause = networkErr;
    throw e;
  }

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const message = (isJson && data && (data.error || data.message)) || res.statusText || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    error.code = 'HTTP_ERROR';
    throw error;
  }
  return data;
}

// PUBLIC_INTERFACE
export async function apiStartGame(playerName) {
  /**
   * Starts a new game session.
   * @param {string|undefined} playerName Optional player name.
   * @returns {Promise<{session_id:string, word_length:number, max_attempts:number}>}
   */
  const body = playerName ? { player_name: String(playerName) } : {};
  return doJson(withBase('/start-game'), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// PUBLIC_INTERFACE
export async function apiSubmitGuess(sessionId, guess) {
  /**
   * Submits a guess to the backend.
   * @param {string} sessionId
   * @param {string} guess
   * @returns {Promise<{feedback:Array<'correct'|'present'|'absent'>, attempts:number, max_attempts:number, status:string}>}
   */
  return doJson(withBase('/guess'), {
    method: 'POST',
    body: JSON.stringify({ session_id: String(sessionId), guess: String(guess) }),
  });
}

// PUBLIC_INTERFACE
export async function apiGetSession(sessionId) {
  /**
   * Gets session details including current status and past attempts.
   * @param {string} sessionId
   * @returns {Promise<any>}
   */
  return doJson(withBase(`/session/${encodeURIComponent(sessionId)}`), {
    method: 'GET',
  });
}

// PUBLIC_INTERFACE
export async function apiGetLeaderboard() {
  /**
   * Gets leaderboard entries.
   * @returns {Promise<Array<{player_name:string, attempts:number, duration:number, finished_at:string}>>}
   */
  return doJson(withBase('/leaderboard'), {
    method: 'GET',
  });
}
