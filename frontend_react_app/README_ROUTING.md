# Frontend Routing and API Notes

- Routes:
  - `/` Home: start game (optional player name)
  - `/play/:sessionId` Play: submit guesses, per-letter feedback
  - `/results/:sessionId` Results: shows outcome and (if finished) target word
  - `/leaderboard` Leaderboard: top results

- API base URL:
  - Defaults to `http://localhost:3001/api`
  - Can be overridden at runtime by defining `window.__API_BASE__ = "https://your-host:3001/api"` before the app bundle is loaded (e.g. embed a small script tag ahead of the app bundle).
  - Or via build-time env: set `REACT_APP_API_BASE=https://your-host:3001/api` in `.env`. Precedence:
    1) `window.__API_BASE__` (runtime)
    2) `process.env.REACT_APP_API_BASE` (build-time; inlined by CRA)
    3) `http://localhost:3001/api` (default)
  - Important: Include the `/api` path segment. Example: `https://my-backend.example.com:3001/api`.

- Connectivity diagnostics:
  - The client logs the resolved API base at startup (see console: "[api/client] Resolved API_BASE = ...") and probes `GET {API_BASE}/health`. If you see "Failed to fetch", verify:
    - The backend is reachable at the specified host:port
    - CORS allows the frontend origin (see CORS note below)
    - The base includes `/api` and the backend serves `/api/health`

- Endpoints expected by the client (all under `/api`):
  - `POST /api/start-game`
  - `POST /api/guess`
  - `GET /api/session/:sessionId`
  - `GET /api/leaderboard`

- Django backend CORS note:
  - Ensure `CORS_ALLOWED_ORIGINS` (or `CORS_ALLOWED_ORIGIN_REGEXES`) includes your frontend origin, e.g. `http://localhost:3000` or your preview host URL.
  - If using Django-CORS-Headers, also verify `CSRF_TRUSTED_ORIGINS` if CSRF is enforced.
  - Health endpoint should be available at `/api/health` as exposed by the backend.

- Styling:
  - Classic theme with the provided palette applied in `src/App.css`.

