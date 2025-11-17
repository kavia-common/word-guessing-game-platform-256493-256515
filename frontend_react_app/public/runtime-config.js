(function () {
  try {
    // PUBLIC_INTERFACE
    // This runtime configuration file lets you change API and Supabase settings without rebuilding.
    // Edit and redeploy this file to adjust environments.
    //
    // API base:
    // - Must include protocol, host, and port (if non-standard).
    // - Include /api segment. Example: "https://your-backend-host:3001/api"
    //
    // Supabase:
    // - Provide your public anon key (never use service role key on the client).
    // - SITE_URL is used for email redirect URLs on sign up.
    //
    // Defaults:
    // - API base defaults to http://localhost:3001/api when not supplied.
    // - Supabase remains disabled unless both URL and ANON KEY are supplied.

    window.__API_BASE__ = window.__API_BASE__ || ""; // e.g., "https://your-host:3001/api"
    window.__SUPABASE_URL__ = window.__SUPABASE_URL__ || ""; // e.g., "https://your-project.supabase.co"
    window.__SUPABASE_ANON_KEY__ = window.__SUPABASE_ANON_KEY__ || ""; // e.g., "eyJhbGciOiJIUzI1..."
    window.__SITE_URL__ = window.__SITE_URL__ || (window.location ? (window.location.protocol + "//" + window.location.host) : "");

    // Log what we resolved (non-sensitive)
    // eslint-disable-next-line no-console
    console.info("[runtime-config] Frontend origin:", (window.location ? (window.location.protocol + "//" + window.location.host) : "(unknown)"));
    // eslint-disable-next-line no-console
    console.info("[runtime-config] API_BASE:", window.__API_BASE__ || "(not set, client will fallback to env or default)");
    if (window.__SUPABASE_URL__) {
      // eslint-disable-next-line no-console
      console.info("[runtime-config] Supabase: configured (URL present).");
    } else {
      // eslint-disable-next-line no-console
      console.info("[runtime-config] Supabase: not configured (auth disabled).");
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[runtime-config] Initialization error:", e && (e.message || e));
  }
})();
