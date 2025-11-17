import React, { useEffect, useState } from 'react';
import { getApiBase } from '../api/client';

/**
 * Diagnostics page: shows resolved API base and a live health probe.
 * Useful to quickly verify backend reachability and CORS behavior.
 */
export default function Diagnostics() {
  const [apiBase, setApiBase] = useState('');
  const [probe, setProbe] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    const base = getApiBase();
    setApiBase(base);
    (async () => {
      setProbe({ status: 'loading', message: 'Probing /health and /health/…' });
      const url1 = `${base}/health`;
      const url2 = `${base}/health/`;
      try {
        // eslint-disable-next-line no-console
        console.info('[diagnostics] Probing', url1, 'then', url2);
        const res1 = await fetch(url1, { method: 'GET', headers: { Accept: 'application/json' } });
        if (res1.ok) {
          setProbe({ status: 'ok', message: `OK (${res1.status}) at ${url1}` });
          return;
        }
        const res2 = await fetch(url2, { method: 'GET', headers: { Accept: 'application/json' } });
        if (res2.ok) {
          setProbe({ status: 'ok', message: `OK (${res2.status}) at ${url2}` });
          return;
        }
        setProbe({ status: 'fail', message: `HTTP ${res1.status} and then ${res2.status}` });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[diagnostics] Health probes failed.', { url1, url2, error: e?.message || String(e) });
        setProbe({ status: 'error', message: e?.message || 'Failed to fetch (likely CORS/network).' });
      }
    })();
  }, []);

  return (
    <section className="card">
      <h1 className="title">Diagnostics</h1>
      <p className="subtitle">Connectivity details for troubleshooting.</p>

      <div className="meta">
        <span>Resolved API base: <strong>{apiBase || '-'}</strong></span>
        <span>Frontend origin: <strong>{typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '-'}</strong></span>
      </div>

      {probe.status === 'loading' && <div className="skeleton">Checking health…</div>}
      {probe.status === 'ok' && <div className="alert" style={{ borderColor: 'rgba(10,245,92,0.4)', background: 'rgba(10,245,92,0.15)' }}>Health: {probe.message}</div>}
      {probe.status === 'fail' && <div className="alert error">Health failed: {probe.message}</div>}
      {probe.status === 'error' && <div className="alert error">{probe.message}</div>}

      <p className="muted" style={{ marginTop: 12 }}>
        If you see a network TypeError here, the backend likely rejected the origin (CORS). Ensure the Django backend CORS_ALLOWED_ORIGINS includes the frontend origin above.
      </p>
    </section>
  );
}
