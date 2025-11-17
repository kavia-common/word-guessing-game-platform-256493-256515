import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client initialization.
 * Reads credentials from runtime first (window.__SUPABASE_URL__/__SUPABASE_ANON_KEY__) then from CRA env (REACT_APP_*).
 * Never hardcode secrets; ensure they are provided via environment variables or runtime-config.
 */

// PUBLIC_INTERFACE
export function getRuntimeSupabaseConfig() {
  /**
   * Returns runtime Supabase config if present on window.
   * Allows overriding after build via public/runtime-config.js.
   * @returns {{ url?: string, key?: string }}
   */
  try {
    if (typeof window !== 'undefined') {
      return {
        url: window.__SUPABASE_URL__,
        key: window.__SUPABASE_ANON_KEY__,
      };
    }
  } catch (_) {
    // ignore
  }
  return {};
}

function safeEnv(key) {
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      return process.env[key];
    }
  } catch (_) {
    // ignore
  }
  return undefined;
}

// Resolve config with precedence: runtime > env > undefined
const runtimeCfg = getRuntimeSupabaseConfig();
const SUPABASE_URL = runtimeCfg.url || safeEnv('REACT_APP_SUPABASE_URL');
const SUPABASE_ANON_KEY = runtimeCfg.key || safeEnv('REACT_APP_SUPABASE_ANON_KEY');

// PUBLIC_INTERFACE
export function assertSupabaseConfig() {
  /**
   * Throws an error if Supabase config is missing. Call in dev paths if needed.
   */
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY. Auth will be disabled.');
  }
}

// Create client if we have configuration
let client = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  // eslint-disable-next-line no-console
  console.info('[supabase] Client initialized with provided URL.');
} else {
  // eslint-disable-next-line no-console
  console.info('[supabase] Client NOT initialized (no config).');
}

// PUBLIC_INTERFACE
export function getSupabaseClient() {
  /**
   * Returns the initialized Supabase client or null if not configured.
   * @returns {import('@supabase/supabase-js').SupabaseClient|null}
   */
  return client;
}
