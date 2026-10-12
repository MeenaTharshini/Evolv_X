
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import StudyMap from "./pages/StudyMap";

function ProtectedRoute({ children }) {
  const token =
    localStorage.getItem("evolv_token") ||
    sessionStorage.getItem("evolv_token");

  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const token =
    localStorage.getItem("evolv_token") ||
    sessionStorage.getItem("evolv_token");

  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Login and signup */}
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

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Home page after successful login or signup */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
  path="/study/:courseId"
  element={
    <ProtectedRoute>
      <StudyMap />
    </ProtectedRoute>
  }
/>
        {/* Unknown routes return to the appropriate page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}