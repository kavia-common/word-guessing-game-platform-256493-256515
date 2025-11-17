import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute enforces that a user is authenticated before accessing children.
 * - If allowGuest is true, guests are allowed even when not authenticated.
 * - If Supabase is configured and allowGuest is false, redirect unauthenticated users to /signin.
 * - If Supabase is not configured and allowGuest is false, we still redirect to /signin to make intent explicit.
 */
// PUBLIC_INTERFACE
export default function ProtectedRoute({ children, allowGuest = false }) {
  const { user, loading, supabaseConfigured } = useAuth() || {};
  const location = useLocation();

  // While auth state is loading, show a lightweight skeleton
  if (supabaseConfigured && loading) {
    return (
      <div className="skeleton" role="status" aria-live="polite">
        Checking your session…
      </div>
    );
  }

  if (allowGuest) {
    // Guest access permitted for this route (e.g., gameplay and results)
    return children;
  }

  // Require authentication. If missing, redirect to signin and preserve location
  if (!user) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{
          from: location.pathname + location.search,
          msg: 'Please sign in to continue.',
        }}
      />
    );
  }

  // Authenticated -> allow
  return children;
}
