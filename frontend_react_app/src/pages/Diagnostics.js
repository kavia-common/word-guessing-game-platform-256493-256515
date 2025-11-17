import React, { useEffect, useState } from 'react';
import { getApiBase } from '../api/client';
import { getSupabaseClient } from '../supabaseClient';

/**
 * Diagnostics page: shows resolved API base and a live health probe.
 * Also shows Supabase client configuration and current auth/session state.
 * Useful to quickly verify backend reachability, CORS behavior, and auth.
 */
export default function Diagnostics() {
  const [apiBase, setApiBase] = useState('');
  const [probe, setProbe] = useState({
    status: 'idle',
    message: '',
    details: {
      urlNoSlash: { url: '', ok: null, status: null, error: '' },
      urlSlash: { url: '', ok: null, status: null, error: '' },
    },
  });
  const [resolved, setResolved] = useState({
    frontendOrigin: '',
    healthNoSlash: '',
    healthSlash: '',
  });

  // Supabase diagnostics
  const [sb, setSb] = useState({ configured: false, url: '', hasKey: false });
  const [authState, setAuthState] = useState({ loading: true, userEmail: '', hasSession: false, tokenPreview: '' });

  useEffect(() => {
    const base = getApiBase();
    setApiBase(base);

    const frontendOrigin =
      typeof window !== 'undefined' && window.location
        ? `${window.location.protocol}//${window.location.host}`
        : '';

    const url1 = `${base}/health`;
    const url2 = `${base}/health/`;
    setResolved({ frontendOrigin, healthNoSlash: url1, healthSlash: url2 });

    // Supabase check
    const supabase = getSupabaseClient();
    const runtimeUrl = (typeof window !== 'undefined' && window.__SUPABASE_URL__) || '';
    const runtimeKey = (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__) || '';
    setSb({
      configured: !!supabase,
      url: runtimeUrl || (process?.env?.REACT_APP_SUPABASE_URL || ''),
      hasKey: Boolean(runtimeKey || process?.env?.REACT_APP_SUPABASE_ANON_KEY),
    });

    (async () => {
      // Health probes
      setProbe({
        status: 'loading',
        message: 'Probing /health and /health/…',
        details: {
          urlNoSlash: { url: url1, ok: null, status: null, error: '' },
          urlSlash: { url: url2, ok: null, status: null, error: '' },
        },
      });
      try {
        // eslint-disable-next-line no-console
        console.info('[diagnostics] Probing', url1, 'then', url2);
        let res1, res2;
        try {
          res1 = await fetch(url1, { method: 'GET', headers: { Accept: 'application/json' } });
        } catch (e1) {
          setProbe(prev => ({
            ...prev,
            details: {
              ...prev.details,
              urlNoSlash: { url: url1, ok: false, status: null, error: e1?.message || String(e1) },
              urlSlash: prev.details.urlSlash,
            },
          }));
        }
        if (res1 && res1.ok) {
          setProbe({
            status: 'ok',
            message: `OK (${res1.status}) at ${url1}`,
            details: {
              urlNoSlash: { url: url1, ok: true, status: res1.status, error: '' },
              urlSlash: { url: url2, ok: null, status: null, error: '' },
            },
          });
        } else {
          try {
            res2 = await fetch(url2, { method: 'GET', headers: { Accept: 'application/json' } });
          } catch (e2) {
            setProbe(prev => ({
              status: 'error',
              message: e2?.message || 'Failed to fetch (likely CORS/network).',
              details: {
                urlNoSlash: {
                  url: url1,
                  ok: res1 ? res1.ok : false,
                  status: res1 ? res1.status : null,
                  error: res1 ? '' : (prev.details.urlNoSlash.error || 'Failed to fetch'),
                },
                urlSlash: { url: url2, ok: false, status: null, error: e2?.message || String(e2) },
              },
            }));
            return;
          }
          if (res2 && res2.ok) {
            setProbe({
              status: 'ok',
              message: `OK (${res2.status}) at ${url2}`,
              details: {
                urlNoSlash: {
                  url: url1,
                  ok: res1 ? res1.ok : false,
                  status: res1 ? res1.status : null,
                  error: res1 && !res1.ok ? `HTTP ${res1.status}` : (res1 ? '' : (''))
                },
                urlSlash: { url: url2, ok: true, status: res2.status, error: '' },
              },
            });
          } else {
            setProbe({
              status: 'fail',
              message: `HTTP ${res1 ? res1.status : 'ERR'} and then ${res2 ? res2.status : 'ERR'}`,
              details: {
                urlNoSlash: { url: url1, ok: res1 ? res1.ok : false, status: res1 ? res1.status : null, error: res1 ? '' : 'Failed to fetch' },
                urlSlash: { url: url2, ok: res2 ? res2.ok : false, status: res2 ? res2.status : null, error: res2 ? '' : 'Failed to fetch' },
              },
            });
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[diagnostics] Health probes failed.', { base, error: e?.message || String(e) });
        setProbe(prev => ({
          status: 'error',
          message: e?.message || 'Failed to fetch (likely CORS/network).',
          details: prev.details,
        }));
      }

      // Auth inspection
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          const token = data?.session?.access_token || '';
          setAuthState({
            loading: false,
            userEmail: data?.session?.user?.email || '',
            hasSession: !!data?.session,
            tokenPreview: token ? `${token.substring(0, 8)}…${token.substring(token.length - 6)}` : '',
          });
        } else {
          setAuthState({ loading: false, userEmail: '', hasSession: false, tokenPreview: '' });
        }
      } catch (e) {
        setAuthState({ loading: false, userEmail: '', hasSession: false, tokenPreview: '' });
      }
    })();
  }, []);

  const fOrigin = resolved.frontendOrigin || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '-');

  return (
    <section className="card">
      <h1 className="title">Diagnostics</h1>
      <p className="subtitle">Connectivity and auth details for troubleshooting.</p>

      <div className="meta">
        <span>Resolved API base: <strong>{apiBase || '-'}</strong></span>
        <span>Frontend origin: <strong>{fOrigin}</strong></span>
      </div>

      <div className="meta" style={{ marginTop: 8 }}>
        <span>GET: <code>{resolved.healthNoSlash || '-'}</code></span>
        <span>GET: <code>{resolved.healthSlash || '-'}</code></span>
      </div>

      {probe.status === 'loading' && <div className="skeleton">Checking health…</div>}
      {probe.status === 'ok' && <div className="alert" style={{ borderColor: 'rgba(10,245,92,0.4)', background: 'rgba(10,245,92,0.15)' }}>Health: {probe.message}</div>}
      {probe.status === 'fail' && <div className="alert error">Health failed: {probe.message}</div>}
      {probe.status === 'error' && <div className="alert error">{probe.message}</div>}

      <div style={{ marginTop: 16 }}>
        <h3 style={{ margin: 0 }}>Supabase</h3>
        <ul className="muted" style={{ marginTop: 8 }}>
          <li>Configured: <strong>{sb.configured ? 'yes' : 'no'}</strong></li>
          <li>URL: <code>{sb.url || '-'}</code></li>
          <li>Anon key present: <strong>{sb.hasKey ? 'yes' : 'no'}</strong></li>
          <li>Session: <strong>{authState.loading ? 'checking…' : (authState.hasSession ? 'active' : 'none')}</strong></li>
          <li>User email: <strong>{authState.userEmail || '-'}</strong></li>
          <li>Token (preview): <code>{authState.tokenPreview || '-'}</code></li>
        </ul>
      </div>

      <p className="muted" style={{ marginTop: 12 }}>
        If you see a network TypeError here, the backend likely rejected the origin (CORS). Ensure the Django backend CORS_ALLOWED_ORIGINS includes the frontend origin above and that "Authorization" is in CORS allowed headers if you are signed in.
      </p>
    </section>
  );
}
