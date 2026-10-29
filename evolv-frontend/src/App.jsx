import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import StudyMap from "./pages/StudyMap";
import LessonPage from "./pages/LessonPage";
import MyProgress from "./pages/MyProgress";

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
        {/* Login */}
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

        {/* Signup */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
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

        {/* Study Map */}
        <Route
          path="/study/:courseId"
          element={
            <ProtectedRoute>
              <StudyMap />
            </ProtectedRoute>
          }
        />

        {/* Individual lesson and stage */}
        <Route
          path="/study/:courseId/lesson/:lessonId"
          element={
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}