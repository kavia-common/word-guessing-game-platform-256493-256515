(function () {
  // PUBLIC_INTERFACE
  /**
   * Runtime configuration for the frontend.
   * You can override API base and Supabase settings without rebuilding.
   * Set window.__API_BASE__ to your backend origin INCLUDING /api.
   * Example:
   *   window.__API_BASE__ = "https://your-backend.example.com:3001/api";
   *
   * For Supabase (optional):
   *   window.__SUPABASE_URL__ = "https://your-project.supabase.co";
   *   window.__SUPABASE_ANON_KEY__ = "<public-anon-key>";
   *   window.__SITE_URL__ = window.location.origin;
   */
  try {
    // If not set by operator, leave undefined and the app will fall back to env/defaults.
    // window.__API_BASE__ = "https://vscode-internal-13306-beta.beta01.cloud.kavia.ai:3001/api";
    // window.__SUPABASE_URL__ = "";
    // window.__SUPABASE_ANON_KEY__ = "";
    // window.__SITE_URL__ = window.location.origin;

    // Log current runtime values for easier diagnostics.
    // eslint-disable-next-line no-console
    console.info("[runtime-config] frontend origin =", window.location.origin, "| __API_BASE__ =", window.__API_BASE__ || "(unset)");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[runtime-config] Unable to read window/location:", e?.message || e);
  }
})();
