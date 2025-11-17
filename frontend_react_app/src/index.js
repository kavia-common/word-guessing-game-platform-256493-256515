import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { getSupabaseClient } from './supabaseClient';

/**
 * Application entry. App contains the router and layout.
 * Also exposes a safe global async accessor to get the Supabase access token so non-React modules can attach it to requests.
 */
if (typeof window !== 'undefined') {
  window.__getSupabaseAccessToken__ = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return null;
      const { data } = await supabase.auth.getSession();
      return data?.session?.access_token || null;
    } catch (_) {
      return null;
    }
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
