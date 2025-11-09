import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Target from './pages/Target';
import Earnings from './pages/Earnings';
import More from './pages/More';
import Layout from './components/layout/Layout';
import SplashScreen from './components/shared/SplashScreen';
import { trackLogout } from './utils/analytics';
import { DataCacheProvider } from './contexts/DataCacheContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showSplash, setShowSplash] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const sessionTimeoutRef = useRef(null);

  // Session timeout duration: 6 hours in milliseconds
  const SESSION_TIMEOUT = 6 * 60 * 60 * 1000;

  // Update last activity timestamp
  const updateLastActivity = () => {
    const now = Date.now();
    localStorage.setItem('last_activity', now.toString());
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      const authToken = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      const lastActivity = localStorage.getItem('last_activity');

      if (authToken && userData && lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

        // If session is still valid (within 6 hours)
        if (timeSinceLastActivity <= SESSION_TIMEOUT) {
          setIsAuthenticated(true);
          setUser(JSON.parse(userData));
          updateLastActivity();
          console.log('Existing session restored');
        } else {
          // Session expired - clear everything
          console.log('Session expired on page load');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('last_activity');
        }
      }

      setIsInitialized(true);
    };

    checkExistingSession();
  }, [SESSION_TIMEOUT]);

  // Check if session has expired
  const checkSessionTimeout = () => {
    if (!isAuthenticated) return false;

    const lastActivity = localStorage.getItem('last_activity');
    if (!lastActivity) return false;

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    return timeSinceLastActivity > SESSION_TIMEOUT;
  };

  // Handle session timeout
  const handleSessionTimeout = () => {
    console.log('Session expired after 6 hours of inactivity');
    handleLogout();
  };

  // Handle app visibility change (when user returns to app)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        console.log('App resumed - checking session');

        // Check if session has expired
        if (checkSessionTimeout()) {
          handleSessionTimeout();
        } else {
          // Session still valid - just update activity timestamp
          // Data refresh will only happen on manual pull-to-refresh or refresh button
          updateLastActivity();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  // Update activity timestamp on user interactions
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleUserActivity = () => {
      updateLastActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated]);

  // Check session timeout periodically (every minute)
  useEffect(() => {
    if (!isAuthenticated) return;

    sessionTimeoutRef.current = setInterval(() => {
      if (checkSessionTimeout()) {
        handleSessionTimeout();
      }
    }, 60 * 1000); // Check every minute

    return () => {
      if (sessionTimeoutRef.current) {
        clearInterval(sessionTimeoutRef.current);
      }
    };
  }, [isAuthenticated]);

  const handleLogin = (userData) => {
    // Show splash screen first
    setShowSplash(true);
    // Set user data directly (already comes from Login.jsx with correct structure)
    setUser(userData);
    // Authentication will be set after splash screen completes
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    setIsAuthenticated(true);
    // Note: auth_token and user_data are already stored by Login.jsx
    // Just initialize session activity timestamp
    updateLastActivity();
  };

  const handleLogout = () => {
    // Track logout event before clearing user data
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (userData.employee_id) {
      trackLogout(userData.employee_id, userData.role);
    }

    // Clear user data and authentication state
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('last_activity');
    setUser(null);
    setIsAuthenticated(false);

    // Clear session timeout interval
    if (sessionTimeoutRef.current) {
      clearInterval(sessionTimeoutRef.current);
    }
  };

  // Show loading while checking for existing session
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DataCacheProvider>
      <Router>
        {/* Splash Screen */}
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

        <Routes>
        {/* Public Route - Login */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Public Route - Forgot Password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Public Route - Reset Password */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes - Main App */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route path="home" element={<Home />} />
          <Route path="target" element={<Target />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="more" element={<More />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
        </Routes>
      </Router>
    </DataCacheProvider>
  );
}

export default App;
