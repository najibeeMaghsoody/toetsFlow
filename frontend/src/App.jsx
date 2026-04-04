// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Dashboard pages
import StudentDashboard from "./pages/student/Dashboard";
import TeacherDashboard from "./pages/teacher/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardRouter />} />

            {/* Student routes */}
            <Route
              path="/student"
              element={<Navigate to="/student/dashboard" />}
            />
            <Route path="/student/dashboard" element={<StudentDashboard />} />

            {/* Teacher routes */}
            <Route
              path="/teacher"
              element={<Navigate to="/teacher/dashboard" />}
            />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

            {/* Admin routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  console.log("🔵 [DashboardRouter] User role:", user.role);

  switch (user.role) {
    case "student":
      console.log("✅ [DashboardRouter] Redirecting to /student/dashboard");
      return <Navigate to="/student/dashboard" />;
    case "teacher":
      console.log("✅ [DashboardRouter] Redirecting to /teacher/dashboard");
      return <Navigate to="/teacher/dashboard" />;
    case "admin":
      console.log("✅ [DashboardRouter] Redirecting to /admin/dashboard");
      return <Navigate to="/admin/dashboard" />;
    default:
      console.warn("🔴 [DashboardRouter] Unknown role:", user.role);
      return <Navigate to="/login" />;
  }
}

export default App;
