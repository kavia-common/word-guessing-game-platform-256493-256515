import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '../supabaseClient';

/**
 * AuthContext manages Supabase auth state (session/user), exposes auth actions,
 * and provides a way to get the current access token to attach to backend requests.
 */

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Get the current auth context (user, session, methods). */
  return useContext(AuthContext);
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * React provider that wires Supabase auth events into React state.
   * Exposes:
   * - user, session, loading
   * - signInWithEmail, signUpWithEmail, signOut
   * - getAccessToken
   */
  const supabase = getSupabaseClient();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!supabase); // if not configured, keep false

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (mounted) {
        if (error) {
          // eslint-disable-next-line no-console
          console.warn('[auth] getSession error:', error.message);
        }
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
        setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  const signInWithEmail = useCallback(
    async (email, password) => {
      if (!supabase) throw new Error('Auth is not configured.');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    [supabase]
  );

  const signUpWithEmail = useCallback(
    async (email, password) => {
      if (!supabase) throw new Error('Auth is not configured.');
      // Use SITE_URL/REACT_APP_SITE_URL to set email redirect if provided
      const siteUrl = (typeof window !== 'undefined' && window.__SITE_URL__) || process.env.REACT_APP_SITE_URL;
      const options = siteUrl ? { emailRedirectTo: siteUrl } : {};
      const { data, error } = await supabase.auth.signUp({ email, password, options });
      if (error) throw error;
      return data;
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [supabase]);

  const getAccessToken = useCallback(async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  }, [supabase]);

  const value = useMemo(
    () => ({
      supabaseConfigured: !!supabase,
      user,
      session,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      getAccessToken,
    }),
    [supabase, user, session, loading, signInWithEmail, signUpWithEmail, signOut, getAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
