(function () {
  /**
   * Runtime configuration for the frontend.
   * This file is loaded by index.html before the React bundle.
   * It allows setting deployment-specific values without rebuilding.
   *
   * IMPORTANT:
   * - Use the exact backend origin and include "/api" for API base.
   * - Ensure protocol (https) matches the frontend to avoid mixed-content.
   * - If you change the backend host/port, update it here.
   *
   * You can also set Supabase config here if using authentication:
   *   window.__SUPABASE_URL__ = "https://your-project.supabase.co";
   *   window.__SUPABASE_ANON_KEY__ = "your-public-anon-key";
   *   window.__SITE_URL__ = window.location.origin; // used for email redirect
   */

  try {
    var frontendOrigin = window.location.protocol + '//' + window.location.host;

    // Set the API base to the running backend's HTTPS origin and include /api
    // Adjust host/port if backend changes in your environment.
    window.__API_BASE__ = "https://vscode-internal-13306-beta.beta01.cloud.kavia.ai:3001/api";

    // Optional: set the SITE URL for auth redirects if Supabase is used.
    window.__SITE_URL__ = frontendOrigin;

    // eslint-disable-next-line no-console
    console.info(
      "[runtime-config] Frontend origin =", frontendOrigin,
      "| API_BASE =", window.__API_BASE__ || "(unset)"
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[runtime-config] Unable to set runtime variables:", e && e.message ? e.message : e);
  }
})();
