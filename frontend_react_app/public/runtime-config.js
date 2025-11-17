(function () {
  // This file can be edited/deployed without rebuilding to configure API base and Supabase.
  // Example (uncomment and fill):
  // window.__API_BASE__ = "https://your-backend-host:3001/api";
  // window.__SUPABASE_URL__ = "https://your-project.supabase.co";
  // window.__SUPABASE_ANON_KEY__ = "public-anon-key";
  // window.__SITE_URL__ = window.location.origin;

  if (typeof window !== 'undefined') {
    const frontendOrigin = `${window.location.protocol}//${window.location.host}`;
    // eslint-disable-next-line no-console
    console.info('[runtime-config] Frontend origin:', frontendOrigin);
    if (window.__API_BASE__) {
      // eslint-disable-next-line no-console
      console.info('[runtime-config] Using API base from runtime:', window.__API_BASE__);
    }
    if (window.__SUPABASE_URL__) {
      // eslint-disable-next-line no-console
      console.info('[runtime-config] Supabase URL provided at runtime.');
    }
  }
})();
