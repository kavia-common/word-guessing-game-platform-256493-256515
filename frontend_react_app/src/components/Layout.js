import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../context/AuthContext';

/**
 * Layout component providing header navigation, container and theme toggle.
 * Props:
 * - theme: 'light' | 'dark'
 * - onToggleTheme: () => void
 */
export default function Layout({ children, theme, onToggleTheme }) {
  const location = useLocation();
  const { user, signOut, supabaseConfigured } = useAuth() || {};

  const handleSignOut = async () => {
    try {
      await signOut?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[auth] signOut error:', e?.message || e);
    }
  };

  return (
    <div className="App">
      <header className="navbar-classic" role="navigation" aria-label="Top Navigation">
        <div className="navbar-inner">
          <Link className="brand" to="/">Word Guess</Link>
          <nav className="nav-links">
            <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">Home</Link>
            <Link className={`nav-link ${location.pathname.startsWith('/leaderboard') ? 'active' : ''}`} to="/leaderboard">Leaderboard</Link>
            <Link className={`nav-link ${location.pathname.startsWith('/diagnostics') ? 'active' : ''}`} to="/diagnostics">Diagnostics</Link>
            {supabaseConfigured && !user && (
              <>
                <Link className={`nav-link ${location.pathname.startsWith('/signin') ? 'active' : ''}`} to="/signin">Sign In</Link>
                <Link className={`nav-link ${location.pathname.startsWith('/signup') ? 'active' : ''}`} to="/signup">Sign Up</Link>
              </>
            )}
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {supabaseConfigured && user && (
              <>
                <span className="muted" title={user.email} style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </span>
                <button className="btn btn-secondary" onClick={handleSignOut}>Sign Out</button>
              </>
            )}
            <button
              className="theme-toggle btn"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </header>
      <main className="container-classic" role="main">{children}</main>
      <footer className="footer-classic">
        <span>© {new Date().getFullYear()} Word Guessing Game</span>
      </footer>
    </div>
  );
}
