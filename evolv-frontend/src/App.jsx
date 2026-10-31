
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { supabase } from "./lib/supabaseClient";

import AuthPage from "./pages/AuthPage";
import Understanding from "./pages/Understanding";
import Home from "./pages/Home";
import StudyMap from "./pages/StudyMap";
import LessonPage from "./pages/LessonPage";
import MyProgress from "./pages/MyProgress";
import Leaderboard from "./pages/Leaderboard";

// ==================================================
// AUTH CONTEXT
// ==================================================

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

// ==================================================
// AUTH PROVIDER
// ==================================================

function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Subscribe to authentication changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setLoading(false);
    });

    // Initialize the current authentication session.
    async function initializeAuth() {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (mounted) {
          setSession(currentSession);
        }
      } catch (error) {
        console.error(
          "Authentication initialization failed:",
          error
        );

        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==================================================
// LOADING SCREEN
// ==================================================

function LoadingScreen() {
  return (
    <div
      className="auth-loading"
      role="status"
      aria-live="polite"
    >
      <p>Loading EVOLV...</p>
    </div>
  );
}

// ==================================================
// PROTECTED ROUTE
// ==================================================

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}

// ==================================================
// PUBLIC ROUTE
// ==================================================

function PublicRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ==================================================
// APPLICATION ROUTES
// ==================================================

function AppRoutes() {
  return (
    <Routes>
      {/* Sign-in page */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      {/* Sign-up page */}
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      {/* Onboarding questionnaire */}
      <Route
        path="/understanding"
        element={
          <ProtectedRoute>
            <Understanding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Understanding />
          </ProtectedRoute>
        }
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* My Progress */}
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <MyProgress />
          </ProtectedRoute>
        }
      />

      {/* Leaderboard */}
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />

      {/* Study map */}
      <Route
        path="/study/:courseId"
        element={
          <ProtectedRoute>
            <StudyMap />
          </ProtectedRoute>
        }
      />

      {/* Individual lesson */}
      <Route
        path="/study/:courseId/lesson/:lessonId"
        element={
          <ProtectedRoute>
            <LessonPage />
          </ProtectedRoute>
        }
      />

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

// ==================================================
// ROOT APP
// ==================================================

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}