(function () {
  /**
   * PUBLIC_INTERFACE
   * Runtime configuration for the frontend application.
   * This file is loaded before the React bundle and can set global values that the app reads:
   *  - window.__API_BASE__           e.g. "https://your-backend.example.com:3001/api"
   *  - window.__SUPABASE_URL__       e.g. "https://your-project.supabase.co"
   *  - window.__SUPABASE_ANON_KEY__  e.g. "public-anon-key"
   *  - window.__SITE_URL__           e.g. window.location.origin
   *
   * Notes:
   * - Do not commit secrets; anon key is public by design for Supabase client usage.
   * - Ensure API_BASE includes the exact backend origin and the /api prefix.
   * - If frontend and backend are on different origins, backend CORS must allow the frontend origin and include "Authorization" in allowed headers.
   */

  // Example: uncomment and set exact values for your deployment
  // window.__API_BASE__ = "https://vscode-internal-13306-beta.beta01.cloud.kavia.ai:3001/api";
  // window.__SUPABASE_URL__ = "https://your-project.supabase.co";
  // window.__SUPABASE_ANON_KEY__ = "your-public-anon-key";
  // window.__SITE_URL__ = window.location.origin;

  try {
    var fOrigin = window.location ? (window.location.protocol + "//" + window.location.host) : "(unknown)";
    // eslint-disable-next-line no-console
    console.info(
      "[runtime-config] Frontend origin =", fOrigin,
      "| window.__API_BASE__ =", (typeof window.__API_BASE__ !== "undefined" ? window.__API_BASE__ : "(unset)")
    );
  } catch (_) {
    // ignore
  }
})();
