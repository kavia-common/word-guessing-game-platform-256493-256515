/**
 * Simple API client for the Word Guessing Game frontend.
 * BASE_URL defaults to http://localhost:3001/api, but can be overridden at runtime
 * via window.__API_BASE__ if it exists or via REACT_APP_API_BASE at build time.
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

// PUBLIC_INTERFACE
export function getApiBase() {
  /**
   * Returns the effective API base URL.
   * Precedence:
   * 1) window.__API_BASE__ (runtime override)
   * 2) process.env.REACT_APP_API_BASE (build-time for CRA)
   * 3) DEFAULT_BASE
   */
  try {
    if (typeof window !== 'undefined' && window.__API_BASE__) {
      return String(window.__API_BASE__);
    }
  } catch (_) {
    // ignore window access issues
  }

  const fromEnv = safeEnv('REACT_APP_API_BASE');
  if (fromEnv) {
    return String(fromEnv);
  }

  return DEFAULT_BASE;
}

async function doJson(url, options = {}) {
  const merged = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };
  const res = await fetch(url, merged);
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const message = isJson && data && data.error ? data.error : res.statusText;
    const error = new Error(message || 'Request failed');
    error.status = res.status;
    error.data = data;
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
  return doJson(`${getApiBase()}/start-game`, {
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
  return doJson(`${getApiBase()}/guess`, {
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
  return doJson(`${getApiBase()}/session/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
  });
}

// PUBLIC_INTERFACE
export async function apiGetLeaderboard() {
  /**
   * Gets leaderboard entries.
   * @returns {Promise<Array<{player_name:string, attempts:number, duration:number, finished_at:string}>>}
   */
  return doJson(`${getApiBase()}/leaderboard`, {
    method: 'GET',
  });
}
