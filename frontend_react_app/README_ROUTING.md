# Frontend Routing and API Notes

- Routes:
  - `/` Home: start game (optional player name)
  - `/play/:sessionId` Play: submit guesses, per-letter feedback
  - `/results/:sessionId` Results: shows outcome and (if finished) target word
  - `/leaderboard` Leaderboard: top results
  - `/signin` and `/signup` for authentication (Supabase)

- API base URL detection:
  - Default: `http://localhost:3001/api`
  - Runtime override (recommended for cross-origin deployments): define `window.__API_BASE__ = "https://your-host:3001/api"` before the app bundle is loaded. Example snippet to place before the app script:
    ```
    <script>
      // Use exact backend origin (protocol, host, port) and include /api
      window.__API_BASE__ = "https://vscode-internal-13306-beta.beta01.cloud.kavia.ai:3001/api";
    </script>
    ```
    In this template, `public/runtime-config.js` is automatically included by `public/index.html` to set `window.__API_BASE__` at runtime and log both frontend and backend origins.
  - Build-time override: set `REACT_APP_API_BASE=https://your-host:3001/api` in `.env` (CRA inlines this on build).
  - Precedence:
    1) `window.__API_BASE__` (runtime, highest)
    2) `process.env.REACT_APP_API_BASE` (build-time)
    3) Default

- Supabase Auth configuration:
  - Runtime (preferred for deployments without rebuild):
    ```
    <script src="/runtime-config.js"></script>
    <script>
      window.__SUPABASE_URL__ = "https://your-project.supabase.co";
      window.__SUPABASE_ANON_KEY__ = "your-public-anon-key";
      window.__SITE_URL__ = window.location.origin; // used for emailRedirectTo on sign-up
    </script>
    ```
  - Build-time (CRA env):
    - `REACT_APP_SUPABASE_URL=...`
    - `REACT_APP_SUPABASE_ANON_KEY=...`
    - `REACT_APP_SITE_URL=https://your-frontend-origin`
  - If not configured, auth UI will show but actions will warn that auth is not configured.

- Token forwarding to backend:
  - When logged in, the frontend attaches `Authorization: Bearer <supabaseAccessToken>` to API requests automatically.

- Connectivity diagnostics:
  - On startup, the client logs: `[api/client] Resolved API_BASE = ...`
  - It then probes `GET {API_BASE}/health` and logs OK or FAILED(status). If you see "Failed to fetch" or a CORS TypeError:
    - Verify backend reachability at the exact origin shown in the log.
    - Ensure the API base includes `/api` and the backend serves `/api/health` (or `/api/health/`).
    - If frontend and backend are on different origins, set `window.__API_BASE__` to the backend origin including protocol and port.
    - Verify CORS configuration on the backend allows the frontend origin.

- Endpoints expected by the client (all under `/api`):
  - `POST /api/start-game`
  - `POST /api/guess`
  - `GET /api/session/:sessionId`
  - `GET /api/leaderboard`

- Django backend CORS note:
  - Ensure `CORS_ALLOWED_ORIGINS` (or `CORS_ALLOWED_ORIGIN_REGEXES`) includes your frontend origin (e.g., `http://localhost:3000` or the preview host URL).
  - If using Django-CORS-Headers and CSRF is enforced, also verify `CSRF_TRUSTED_ORIGINS`.
  - Health endpoint should be available at `/api/health`.

- Error handling improvements:
  - Network errors surface with `.code = "NETWORK_ERROR"` and a clear message.
  - HTTP errors surface with `.code = "HTTP_ERROR"`, `.status`, and `.data` when available.

- Styling:
  - Classic theme with the provided palette applied in `src/App.css`.
