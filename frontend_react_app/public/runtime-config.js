(function () {
  try {
    // Determine frontend origin for diagnostics
    var frontendOrigin = (typeof window !== 'undefined' && window.location)
      ? (window.location.protocol + '//' + window.location.host)
      : '(unknown-frontend-origin)';

    // If already defined (e.g., injected by hosting), keep it but log it.
    if (typeof window !== 'undefined' && typeof window.__API_BASE__ !== 'undefined') {
      // eslint-disable-next-line no-console
      console.info('[runtime-config] window.__API_BASE__ already set to:', window.__API_BASE__);
      // Also remind about trailing /api requirement
      if (!/\/api\/?$/.test(String(window.__API_BASE__))) {
        // eslint-disable-next-line no-console
        console.warn('[runtime-config] window.__API_BASE__ does not include /api. The frontend client will auto-append it.');
      }
    } else {
      // Default to the known backend origin for this environment.
      // IMPORTANT: Update this if your backend host/port changes.
      var defaultBackend = 'https://vscode-internal-13306-beta.beta01.cloud.kavia.ai:3001/api';
      window.__API_BASE__ = defaultBackend;
      // eslint-disable-next-line no-console
      console.info('[runtime-config] window.__API_BASE__ initialized to:', window.__API_BASE__);
    }

    // Final diagnostics
    // eslint-disable-next-line no-console
    console.info('[runtime-config] Frontend origin:', frontendOrigin);
    // eslint-disable-next-line no-console
    console.info('[runtime-config] Backend API base (target):', window.__API_BASE__);

    // Additional guidance: if the frontend runs on a different port than 3000 in local/preview,
    // make sure CORS on the backend allows the exact origin.
    try {
      var fePort = (frontendOrigin.split(':')[2] || '').replace(/\\/.*/, '');
      if (fePort && fePort !== '3000') {
        // eslint-disable-next-line no-console
        console.warn('[runtime-config] Frontend is not on port 3000. Ensure backend CORS allows:', frontendOrigin);
      }
    } catch (_) {
      // ignore
    }

  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[runtime-config] Failed to initialize runtime API base:', e && e.message ? e.message : e);
  }
})();
