import React, { useEffect, useState } from 'react';
import { getApiBase } from '../api/client';

/**
 * Diagnostics page: shows resolved API base and a live health probe.
 * Useful to quickly verify backend reachability and CORS behavior.
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

    (async () => {
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
          return;
        }
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
          return;
        }
        setProbe({
          status: 'fail',
          message: `HTTP ${res1 ? res1.status : 'ERR'} and then ${res2 ? res2.status : 'ERR'}`,
          details: {
            urlNoSlash: { url: url1, ok: res1 ? res1.ok : false, status: res1 ? res1.status : null, error: res1 ? '' : 'Failed to fetch' },
            urlSlash: { url: url2, ok: res2 ? res2.ok : false, status: res2 ? res2.status : null, error: res2 ? '' : 'Failed to fetch' },
          },
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[diagnostics] Health probes failed.', { base, error: e?.message || String(e) });
        setProbe(prev => ({
          status: 'error',
          message: e?.message || 'Failed to fetch (likely CORS/network).',
          details: prev.details,
        }));
      }
    })();
  }, []);

  const fOrigin = resolved.frontendOrigin || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '-');

  return (
    <section className="card">
      <h1 className="title">Diagnostics</h1>
      <p className="subtitle">Connectivity details for troubleshooting (probes both /health and /health/).</p>

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

      <div style={{ marginTop: 12 }}>
        <div className="muted">Health probe details:</div>
        <ul style={{ marginTop: 6 }}>
          <li>
            <code>{probe.details.urlNoSlash.url || '-'}</code> → {probe.details.urlNoSlash.ok === null ? '—' : (probe.details.urlNoSlash.ok ? 'OK' : 'FAIL')}
            {probe.details.urlNoSlash.status ? ` (status ${probe.details.urlNoSlash.status})` : ''}
            {probe.details.urlNoSlash.error ? ` — ${probe.details.urlNoSlash.error}` : ''}
          </li>
          <li>
            <code>{probe.details.urlSlash.url || '-'}</code> → {probe.details.urlSlash.ok === null ? '—' : (probe.details.urlSlash.ok ? 'OK' : 'FAIL')}
            {probe.details.urlSlash.status ? ` (status ${probe.details.urlSlash.status})` : ''}
            {probe.details.urlSlash.error ? ` — ${probe.details.urlSlash.error}` : ''}
          </li>
        </ul>
      </div>

      <p className="muted" style={{ marginTop: 12 }}>
        If you see a network TypeError here, the backend likely rejected the origin (CORS). Ensure the Django backend CORS_ALLOWED_ORIGINS includes the frontend origin above and that "Authorization" is in CORS allowed headers if you are signed in.
      </p>
    </section>
  );
}
