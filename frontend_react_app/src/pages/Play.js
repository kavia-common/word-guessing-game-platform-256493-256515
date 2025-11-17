import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiGetSession, apiSubmitGuess } from '../api/client';
import GuessRow from '../components/GuessRow';

/**
 * Play page: input guesses, submit to backend, render feedback and attempts.
 * Redirect to results on win/lose.
 */
export default function Play() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [wordLength, setWordLength] = useState(null);
  const [maxAttempts, setMaxAttempts] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [history, setHistory] = useState([]); // [{guess, feedback}]
  const [status, setStatus] = useState('in_progress'); // in_progress | won | lost
  const [guess, setGuess] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const metaFromNav = location.state?.meta;

  const canSubmit = useMemo(() => {
    if (!guess || !guess.trim()) return false;
    if (wordLength && guess.trim().length !== wordLength) return false;
    return true;
  }, [guess, wordLength]);

  useEffect(() => {
    // Initialize using nav state if provided
    if (metaFromNav) {
      if (metaFromNav.word_length) setWordLength(metaFromNav.word_length);
      if (metaFromNav.max_attempts) setMaxAttempts(metaFromNav.max_attempts);
    }
    // Fetch session to ensure latest state
    (async () => {
      try {
        const s = await apiGetSession(sessionId);
        // Expected to include: status, attempts, max_attempts, word_length, guesses?
        if (s.word_length) setWordLength(s.word_length);
        if (s.max_attempts) setMaxAttempts(s.max_attempts);
        if (typeof s.attempts === 'number') setAttempts(s.attempts);
        if (Array.isArray(s.history)) setHistory(s.history);
        if (s.status) setStatus(s.status);
        if (s.status === 'won' || s.status === 'lost') {
          navigate(`/results/${encodeURIComponent(sessionId)}`);
        }
      } catch (e) {
        setErr(e?.message || 'Failed to load session.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!canSubmit) {
      if (!guess || !guess.trim()) setErr('Please enter a guess.');
      else if (wordLength && guess.trim().length !== wordLength) setErr(`Word must be ${wordLength} letters.`);
      return;
    }
    setLoading(true);
    try {
      const res = await apiSubmitGuess(sessionId, guess.trim().toLowerCase());
      // res: { feedback: [...], attempts, max_attempts, status }
      if (!res || !Array.isArray(res.feedback)) {
        throw new Error('Invalid response.');
      }
      setHistory((h) => [...h, { guess: guess.trim(), feedback: res.feedback }]);
      if (typeof res.attempts === 'number') setAttempts(res.attempts);
      if (res.max_attempts) setMaxAttempts(res.max_attempts);
      if (res.status) setStatus(res.status);

      setGuess('');
      if (res.status === 'won' || res.status === 'lost') {
        navigate(`/results/${encodeURIComponent(sessionId)}`);
      }
    } catch (error) {
      setErr(error?.message || 'Failed to submit guess.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h1 className="title">Play</h1>
      <div className="meta">
        {wordLength ? <span>Word length: <strong>{wordLength}</strong></span> : null}
        {maxAttempts ? <span>Max attempts: <strong>{maxAttempts}</strong></span> : null}
        <span>Used attempts: <strong>{attempts}</strong></span>
      </div>

      <form className="form inline" onSubmit={handleSubmit}>
        <label htmlFor="guess" className="label">Your guess</label>
        <input
          id="guess"
          className="input"
          type="text"
          placeholder={wordLength ? `Enter ${wordLength} letters` : 'Enter a word'}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          maxLength={wordLength || 50}
        />
        <button className="btn btn-primary" type="submit" disabled={!canSubmit || loading}>
          {loading ? 'Checking...' : 'Submit'}
        </button>
      </form>
      {err && <div className="alert error" role="alert">{err}</div>}

      <div className="history" role="list" aria-label="Guess history">
        {history.map((h, idx) => (
          <GuessRow
            key={`${idx}-${h.guess}`}
            letters={h.guess.split('')}
            feedback={h.feedback}
          />
        ))}
      </div>
    </section>
  );
}
