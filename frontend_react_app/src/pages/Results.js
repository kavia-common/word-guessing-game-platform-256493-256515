import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiGetSession } from '../api/client';

/**
 * Results page: shows outcome for a session without revealing target until completion.
 */
export default function Results() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGetSession(sessionId);
        setSession(data);
      } catch (e) {
        setErr(e?.message || 'Failed to load results.');
      }
    })();
  }, [sessionId]);

  const isFinished = session?.status === 'won' || session?.status === 'lost';

  return (
    <section className="card">
      <h1 className="title">Results</h1>
      {err && <div className="alert error">{err}</div>}
      {!session && !err && <div className="skeleton">Loading...</div>}
      {session && (
        <>
          <p className={`status-badge ${session.status}`}>
            Status: <strong className="uppercase">{String(session.status || 'unknown')}</strong>
          </p>
          {typeof session.attempts === 'number' && (
            <p>Attempts used: <strong>{session.attempts}</strong>{session.max_attempts ? ` / ${session.max_attempts}` : ''}</p>
          )}
          {isFinished && session.target_word && (
            <p>Target word: <strong className="word-reveal">{String(session.target_word).toUpperCase()}</strong></p>
          )}
          {!isFinished && <p className="muted">Game is not finished yet. Keep guessing!</p>}
        </>
      )}
      <div className="actions">
        <button className="btn btn-primary" onClick={() => navigate('/')}>Play again</button>
        <Link to="/leaderboard" className="btn btn-secondary">View Leaderboard</Link>
      </div>
    </section>
  );
}
