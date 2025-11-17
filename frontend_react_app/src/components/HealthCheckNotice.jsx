/**
 * Simple component to verify backend connectivity by calling /api/health/.
 *
 * Use this temporarily during debugging. Remove from production UI as needed.
 */
// PUBLIC_INTERFACE
import React from 'react';
import { getHealth } from '../api/client';

export default function HealthCheckNotice() {
  const [status, setStatus] = React.useState('checking...');
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    getHealth()
      .then((res) => {
        if (!mounted) return;
        setStatus(res?.message || 'OK');
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.body || e?.message || 'Request failed');
        setStatus('failed');
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ padding: '8px 12px', margin: '8px 0', border: '1px solid #eee', borderRadius: 6, background: '#fff' }}>
      <strong>Backend health:</strong>{' '}
      <span style={{ color: status === 'failed' ? '#b91c1c' : '#065f46' }}>{status}</span>
      {error && (
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 6, color: '#6b7280' }}>
{typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
        </pre>
      )}
    </div>
  );
}
