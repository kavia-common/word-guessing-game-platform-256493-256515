import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import Play from './pages/Play';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import Diagnostics from './pages/Diagnostics';

// PUBLIC_INTERFACE
function App() {
  /**
   * Root application that sets up theming and client-side routing.
   * Routes:
   * - / -> Home
   * - /play/:sessionId -> Play screen for an existing session
   * - /results/:sessionId -> Results screen
   * - /leaderboard -> Leaderboard screen
   */
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <BrowserRouter>
      <Layout theme={theme} onToggleTheme={toggleTheme}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play/:sessionId" element={<Play />} />
          <Route path="/results/:sessionId" element={<Results />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
