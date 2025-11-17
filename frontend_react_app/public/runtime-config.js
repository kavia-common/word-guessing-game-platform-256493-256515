(function () {
  /**
   * PUBLIC_INTERFACE
   * Runtime configuration bridge for the frontend.
   * You can set the following globals at deployment time without rebuilding:
   * - window.__API_BASE__
   * - window.__SUPABASE_URL__
   * - window.__SUPABASE_ANON_KEY__
   * - window.__SITE_URL__ (used for email redirect during sign-up)
   *
   * Example:
   *   <script src="/runtime-config.js"></script>
   *   <script>
   *     window.__API_BASE__ = "https://your-backend:3001/api";
   *     window.__SUPABASE_URL__ = "https://your-project.supabase.co";
   *     window.__SUPABASE_ANON_KEY__ = "public-anon-key";
   *     window.__SITE_URL__ = window.location.origin;
   *   </script>
   */
  try {
    if (typeof window !== 'undefined') {
      // Keep values as-is if already set by deployer; otherwise leave undefined.
      window.__RUNTIME_CONFIG_LOADED__ = true;

      // Minimal console hints for operators
      // eslint-disable-next-line no-console
      console.info(
        '[runtime-config] Frontend origin:',
        window.location ? `${window.location.protocol}//${window.location.host}` : '-'
      );
      if (window.__API_BASE__) {
        // eslint-disable-next-line no-console
        console.info('[runtime-config] API base set via runtime:', window.__API_BASE__);
      }
      if (window.__SUPABASE_URL__) {
        // eslint-disable-next-line no-console
        console.info('[runtime-config] Supabase URL is provided at runtime.');
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[runtime-config] Unable to initialize runtime hints:', e && e.message);
  }
})();
