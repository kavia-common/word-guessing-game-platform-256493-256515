(function () {
  // This file is intentionally simple and safe to include before the app bundle.
  // You can override these values at deploy-time without rebuilding the app.

  // PUBLIC_INTERFACE
  // window.__API_BASE__: Backend API base INCLUDING /api, e.g. "https://your-host:3001/api"
  // Leave undefined to let the client auto-detect (localhost:3001/api or preview host :3001/api).
  window.__API_BASE__ = window.__API_BASE__ || undefined;

  // PUBLIC_INTERFACE
  // Supabase runtime configuration (optional)
  window.__SUPABASE_URL__ = window.__SUPABASE_URL__ || undefined;
  window.__SUPABASE_ANON_KEY__ = window.__SUPABASE_ANON_KEY__ || undefined;

  // PUBLIC_INTERFACE
  // Site URL used for auth email redirect
  window.__SITE_URL__ = window.__SITE_URL__ || (typeof window !== 'undefined' ? window.location.origin : undefined);

  // Log resolved origins to help during diagnostics
  try {
    var frontendOrigin = window.location.protocol + '//' + window.location.host;
    // eslint-disable-next-line no-console
    console.info('[runtime-config] Frontend origin =', frontendOrigin, '| API_BASE =', window.__API_BASE__ || '(auto)');
  } catch (_) {
    // ignore
  }
})();
