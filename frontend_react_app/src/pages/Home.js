import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiStartGame } from '../api/client';
import { useAuth } from '../context/AuthContext';

/**
 * Home page: allows optional player name entry and starts a game.
 */
export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const { user, supabaseConfigured } = useAuth() || {};

  async function handleStart(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await apiStartGame(playerName.trim() || undefined);
      // Expecting { session_id, word_length, max_attempts }
      if (!res || !res.session_id) {
        throw new Error('Invalid response from server.');
      }
      navigate(`/play/${encodeURIComponent(res.session_id)}`, { state: { meta: res } });
    } catch (error) {
      const details =
        error?.code === 'NETWORK_ERROR'
          ? `${error.message}. Check API base and CORS settings.`
          : error?.message;
      setErr(details || 'Failed to start game.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h1 className="title">Word Guessing Game</h1>
      <p className="subtitle">Try to guess the hidden word. You will get feedback after each guess.</p>
      {supabaseConfigured && !user && (
        <p className="muted" style={{ marginTop: 0 }}>
          Optional: <Link to="/signin">Sign in</Link> to submit scores to the leaderboard.
        </p>
      )}

      <form className="form" onSubmit={handleStart}>
        <label htmlFor="playerName" className="label">Player name (optional)</label>
        <input
          id="playerName"
          type="text"
          className="input"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        {err && <div className="alert error" role="alert">{err}</div>}
        <button className="btn btn-primary btn-large" type="submit" disabled={loading}>
          {loading ? 'Starting...' : 'Start Game'}
        </button>
      </form>
    </section>
  );
}
