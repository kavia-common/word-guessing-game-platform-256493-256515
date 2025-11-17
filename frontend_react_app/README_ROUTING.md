# Frontend Routing and API Notes

- Routes:
  - `/` Home: start game (optional player name)
  - `/play/:sessionId` Play: submit guesses, per-letter feedback
  - `/results/:sessionId` Results: shows outcome and (if finished) target word
  - `/leaderboard` Leaderboard: top results

- API base URL:
  - Defaults to `http://localhost:3001/api`
  - Can be overridden at runtime by defining `window.__API_BASE__ = "https://your-host/api"` before the app bundle is loaded.
  - Or via build-time env: set `REACT_APP_API_BASE=https://your-host/api` in `.env`. Precedence:
    1) `window.__API_BASE__` (runtime)
    2) `process.env.REACT_APP_API_BASE` (build-time; inlined by CRA)
    3) `http://localhost:3001/api` (default)
  - Note: Client code avoids direct `process` usage at runtime; CRA replaces `process.env.REACT_APP_*` at build time. If you are not using CRA, prefer the `window.__API_BASE__` runtime override.

- Endpoints expected by the client:
  - `POST /api/start-game`
  - `POST /api/guess`
  - `GET /api/session/:sessionId`
  - `GET /api/leaderboard`

- Styling:
  - Classic theme with the provided palette applied in `src/App.css`.

