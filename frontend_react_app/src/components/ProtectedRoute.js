import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute enforces that a user is authenticated before accessing children.
 * - If Supabase is not configured, we currently allow access (to avoid blocking guest play in environments without auth).
 * - If Supabase is configured and the user is not signed in, redirect to /signin and preserve intended destination in state.
 * - While redirecting, optionally render a minimal UX hint.
 */
// PUBLIC_INTERFACE
export default function ProtectedRoute({ children }) {
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

  // Always require authentication for protected routes regardless of Supabase configuration.
  // If Supabase is not configured, user will effectively be unauthenticated and redirected to /signin.

  // If configured but user is not authenticated, redirect to signin and preserve location
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
