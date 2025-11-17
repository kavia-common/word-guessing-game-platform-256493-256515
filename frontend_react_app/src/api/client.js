 /**
  * Lightweight API client with robust base URL resolution and CORS-friendly behavior.
  *
  * Base URL resolution precedence (highest to lowest):
  * 1) window.__API_BASE__ (runtime override, recommended). Example: "https://host:3001/api"
  * 2) process.env.REACT_APP_API_BASE (build-time). Example: "http://localhost:3001/api"
  * 3) Infer from window.location: same host, port 3001, with /api appended
  * 4) Fallback: "http://localhost:3001/api"
  *
  * All requests are made to paths relative to '/api'.
  *
  * When authenticated via Supabase, this client attaches:
  *   Authorization: Bearer <supabaseAccessToken>
  * obtained via window.__getSupabaseAccessToken__().
  *
  * Exports:
  * - getApiBase(): string
  * - apiFetch(path, options): Promise<any>
  * - getHealth(): Promise<{ message: string }>
  * - apiStartGame(playerName?): Promise<any>
  * - apiSubmitGuess(sessionId, guess): Promise<any>
  * - apiGetSession(sessionId): Promise<any>
  * - apiGetLeaderboard(): Promise<any>
  */

 // PUBLIC_INTERFACE
 export function getApiBase() {
   /**
    * Determine API base including /api. Ensures no trailing slash.
    * Returns a string like "https://host:3001/api".
    */
   const normalize = (v) => (typeof v === 'string' ? v.replace(/\/*$/, '') : '');

   // 1) runtime override
   try {
     if (typeof window !== 'undefined' && window.__API_BASE__) {
       return normalize(window.__API_BASE__);
     }
   } catch (_) {
     // ignore
   }

   // 2) build-time env
   try {
     const envBase = process?.env?.REACT_APP_API_BASE;
     if (envBase) return normalize(envBase);
   } catch (_) {
     // ignore
   }

   // 3) infer from window.location -> :3001/api
   try {
     if (typeof window !== 'undefined' && window.location) {
       const { protocol, hostname } = window.location;
       return `${protocol}//${hostname}:3001/api`;
     }
   } catch (_) {
     // ignore
   }

   // 4) default
   return 'http://localhost:3001/api';
 }

 const API_BASE = getApiBase();

 /**
  * Attempt to resolve a Supabase access token via the global helper set in src/index.js.
  * Returns empty object if unavailable or on error.
  */
 async function getAuthHeader() {
   try {
     if (typeof window !== 'undefined' && typeof window.__getSupabaseAccessToken__ === 'function') {
       const token = await window.__getSupabaseAccessToken__();
       if (token) {
         return { Authorization: `Bearer ${token}` };
       }
     }
   } catch (_) {
     // ignore
   }
   return {};
 }

 /**
  * PUBLIC_INTERFACE
  * Perform a JSON fetch to the backend under /api.
  * - Adds credentials: 'include' to support cookie-based CSRF if needed.
  * - Adds Authorization header with Supabase token when available.
  * - Normalizes errors to distinguish NETWORK_ERROR vs HTTP_ERROR.
  * @param {string} path - path under /api, e.g. '/health/' or '/start-game'
  * @param {RequestInit} [options]
  * @returns {Promise<any>}
  */
 export async function apiFetch(path, options = {}) {
   const subPath = path.startsWith('/') ? path : `/${path}`;
   const url = `${API_BASE}${subPath}`;
   const auth = await getAuthHeader();
   const headers = {
     'Content-Type': 'application/json',
     ...auth,
     ...(options.headers || {}),
   };

   let resp;
   try {
     resp = await fetch(url, { ...options, headers, credentials: 'include' });
   } catch (e) {
     const err = new Error('Failed to fetch (network/CORS).');
     err.code = 'NETWORK_ERROR';
     err.cause = e;
     throw err;
   }

   const contentType = resp.headers.get('content-type') || '';
   const isJSON = contentType.includes('application/json');
   const body = isJSON ? await resp.json().catch(() => null) : await resp.text();
   if (!resp.ok) {
     const err = new Error(`API error ${resp.status}`);
     err.code = 'HTTP_ERROR';
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
   // Accept trailing slash by default since Django often enforces it
   return apiFetch('/health/', { method: 'GET' });
 }

 /**
  * PUBLIC_INTERFACE
  * Start a new game session.
  * @param {string|undefined} playerName
  */
 export async function apiStartGame(playerName) {
   const body = playerName ? { player_name: playerName } : {};
   return apiFetch('/start-game', { method: 'POST', body: JSON.stringify(body) });
 }

 /**
  * PUBLIC_INTERFACE
  * Submit a guess for a given session.
  * @param {string|number} sessionId
  * @param {string} guess
  */
 export async function apiSubmitGuess(sessionId, guess) {
   return apiFetch('/guess', {
     method: 'POST',
     body: JSON.stringify({ session_id: Number(sessionId), guess }),
   });
 }

 /**
  * PUBLIC_INTERFACE
  * Fetch session details by ID.
  * @param {string|number} sessionId
  */
 export async function apiGetSession(sessionId) {
   return apiFetch(`/session/${encodeURIComponent(sessionId)}`, { method: 'GET' });
 }

 /**
  * PUBLIC_INTERFACE
  * Fetch leaderboard.
  */
 export async function apiGetLeaderboard() {
   return apiFetch('/leaderboard', { method: 'GET' });
 }

 export default {
   getApiBase,
   apiFetch,
   getHealth,
   apiStartGame,
   apiSubmitGuess,
   apiGetSession,
   apiGetLeaderboard,
 };
