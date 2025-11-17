import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * SignIn page for Supabase email/password authentication.
 * If redirected from a protected route, shows a subtle message and
 * returns to the intended destination on success.
 */
export default function SignIn() {
  const { signInWithEmail, supabaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';
  const redirectMsg = location.state?.msg;

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!supabaseConfigured) {
      setErr('Authentication is not configured.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      navigate(from, { replace: true });
    } catch (error) {
      setErr(error?.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h1 className="title">Sign In</h1>
      <p className="subtitle">Welcome back! Sign in to sync your scores.</p>
      {redirectMsg && (
        <div className="alert" style={{ borderColor: 'rgba(10,245,92,0.4)', background: 'rgba(10,245,92,0.15)', marginBottom: 12 }}>
          {redirectMsg}
        </div>
      )}
      <form className="form" onSubmit={handleSubmit}>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" className="input" type="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <label className="label" htmlFor="password">Password</label>
        <input id="password" className="input" type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        {err && <div className="alert error" role="alert">{err}</div>}
        <button className="btn btn-primary btn-large" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 12 }}>
        New here? <Link to="/signup" state={{ from }}>Create an account</Link>
      </p>
    </section>
  );
}
