import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import Play from './pages/Play';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import Diagnostics from './pages/Diagnostics';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// PUBLIC_INTERFACE
function App() {
  /**
   * Root application that sets up theming and client-side routing.
   * Routes:
   * - / -> Home
   * - /play/:sessionId -> Play screen for an existing session (protected)
   * - /results/:sessionId -> Results screen (protected)
   * - /leaderboard -> Leaderboard screen (protected)
   * - /signin -> Sign In
   * - /signup -> Sign Up
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
      <AuthProvider>
        <Layout theme={theme} onToggleTheme={toggleTheme}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/play/:sessionId"
              element={
                <ProtectedRoute allowGuest>
                  <Play />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:sessionId"
              element={
                <ProtectedRoute allowGuest>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route path="/diagnostics" element={<Diagnostics />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
