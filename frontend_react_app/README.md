# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify
- **Auth**: Supabase email/password authentication integrated (optional at runtime)

## Getting Started

In the project directory, you can run:

### `npm install`
Installs dependencies, including `@supabase/supabase-js`.

### `npm start`
Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Configuration

- Backend API base:
  - Default: `http://localhost:3001/api`
  - Configure at runtime by editing `public/runtime-config.js` to set `window.__API_BASE__ = "https://your-backend:3001/api"`.
  - Or set `REACT_APP_API_BASE` in `.env`.

- Supabase:
  - Runtime (recommended): set in `public/runtime-config.js`
    ```
    window.__SUPABASE_URL__ = "https://your-project.supabase.co";
    window.__SUPABASE_ANON_KEY__ = "your-public-anon-key";
    window.__SITE_URL__ = window.location.origin;
    ```
  - Build-time: set in `.env`
    - `REACT_APP_SUPABASE_URL`
    - `REACT_APP_SUPABASE_ANON_KEY`
    - `REACT_APP_SITE_URL`
  - If not configured, the app still works for guest gameplay. Auth pages will inform that auth is not configured.

## Notes on Auth & Gameplay

- Guest play is allowed. You can play without signing in.
- When signed in, the frontend will attach `Authorization: Bearer <supabaseAccessToken>` to API calls, enabling the backend to associate scores if supported.
- The header shows the logged-in user email and a Sign Out button.
- Navigate to `/signin` or `/signup` to authenticate.

## Customization

See `README_ROUTING.md` for more on routes, API, CORS, and diagnostics.

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting
This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size
This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App
This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration
This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment
This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify
This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
