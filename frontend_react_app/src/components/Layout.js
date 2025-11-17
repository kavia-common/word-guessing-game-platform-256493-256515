import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';

/**
 * Layout component providing header navigation, container and theme toggle.
 * Props:
 * - theme: 'light' | 'dark'
 * - onToggleTheme: () => void
 */
export default function Layout({ children, theme, onToggleTheme }) {
  const location = useLocation();

  return (
    <div className="App">
      <header className="navbar-classic" role="navigation" aria-label="Top Navigation">
        <div className="navbar-inner">
          <Link className="brand" to="/">Word Guess</Link>
          <nav className="nav-links">
            <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">Home</Link>
            <Link className={`nav-link ${location.pathname.startsWith('/leaderboard') ? 'active' : ''}`} to="/leaderboard">Leaderboard</Link>
          </nav>
          <button
            className="theme-toggle btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>
      <main className="container-classic" role="main">{children}</main>
      <footer className="footer-classic">
        <span>© {new Date().getFullYear()} Word Guessing Game</span>
      </footer>
    </div>
  );
}
