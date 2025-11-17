import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * SignUp page for Supabase email/password registration.
 */
export default function SignUp() {
  const { signUpWithEmail, supabaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setInfo('');
    if (!supabaseConfigured) {
      setErr('Authentication is not configured.');
      return;
    }
    setLoading(true);
    try {
      const res = await signUpWithEmail(email.trim(), password);
      if (res?.user) {
        setInfo('Account created. Please check your email for confirmation if required.');
        setTimeout(()=>navigate('/'), 800);
      } else {
        setInfo('Check your email to confirm your account.');
      }
    } catch (error) {
      setErr(error?.message || 'Failed to sign up.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h1 className="title">Create Account</h1>
      <p className="subtitle">Sign up to track and submit your scores.</p>
      <form className="form" onSubmit={handleSubmit}>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" className="input" type="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <label className="label" htmlFor="password">Password</label>
        <input id="password" className="input" type="password" autoComplete="new-password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        {err && <div className="alert error" role="alert">{err}</div>}
        {info && <div className="alert" style={{ borderColor: 'rgba(10,245,92,0.4)', background: 'rgba(10,245,92,0.15)' }}>{info}</div>}
        <button className="btn btn-primary btn-large" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 12 }}>
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </section>
  );
}
