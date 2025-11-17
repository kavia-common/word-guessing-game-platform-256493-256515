import React, { useEffect, useState } from 'react';
import { apiGetLeaderboard } from '../api/client';

/**
 * Leaderboard page: shows top players/results.
 */
export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr('');
      try {
        const data = await apiGetLeaderboard();
        if (Array.isArray(data)) {
          setRows(data);
        } else if (Array.isArray(data?.results)) {
          setRows(data.results);
        } else {
          setRows([]);
        }
      } catch (e) {
        setErr(e?.message || 'Unable to load leaderboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="card">
      <h1 className="title">Leaderboard</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: 8 }}>
        You can play as a guest. Sign in to have your scores recorded.
      </p>
      {err && <div className="alert error">{err}</div>}
      {loading && <div className="skeleton">Loading...</div>}

      {!loading && !err && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Attempts</th>
                <th>Duration</th>
                <th>Finished</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan="5" className="muted center">No results yet.</td>
                </tr>
              )}
              {rows.map((r, idx) => (
                <tr key={`${idx}-${r.player_name || 'anon'}`}>
                  <td>{idx + 1}</td>
                  <td>{r.player_name || 'Anonymous'}</td>
                  <td>{r.attempts ?? '-'}</td>
                  <td>{formatDuration(r.duration)}</td>
                  <td>{r.finished_at ? new Date(r.finished_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function formatDuration(d) {
  if (!d && d !== 0) return '-';
  // Accept seconds or ms; if > 1000 treat as ms
  const ms = d > 1000 ? d : d * 1000;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
}
