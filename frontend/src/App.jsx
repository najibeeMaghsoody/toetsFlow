import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
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
import TeacherResults from "./pages/teacher/Results";
import TeacherStudents from "./pages/teacher/Students";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/results" element={<TeacherResults />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/teacher/students" element={<TeacherStudents />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function DashboardRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
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
      console.log("[DashboardRouter] Rendering StudentDashboard");
      return <StudentDashboard />;
    case "teacher":
      return <Navigate to="/teacher/dashboard" />;
    case "admin":
      console.log("[DashboardRouter] Rendering AdminDashboard");
      return <AdminDashboard />;
    default:
      console.warn("[DashboardRouter] Unknown role:", user.role);
      return <Navigate to="/login" />;
  }
}

export default App;
