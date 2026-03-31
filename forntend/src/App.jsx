import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
//public pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Student pages
//import StudentDashboard from "./pages/student/Dashboard";
//import AvailableTests from "./pages/student/AvailableTests";
//import TakeTest from "./pages/student/TakeTest";
//import TestResult from "./pages/student/TestResult";
//import Transcript from "./pages/student/Transcript";

// Teacher pages
//import TeacherDashboard from "./pages/teacher/Dashboard";
//import TestManagement from "./pages/teacher/TestManagement";
//import CreateTest from "./pages/teacher/CreateTest";
//import EditTest from "./pages/teacher/EditTest";
//import GroupManagement from "./pages/teacher/GroupManagement";
//import StudentResults from "./pages/teacher/StudentResults";
//import Statistics from "./pages/teacher/Statistics";

// Admin pages
//import AdminDashboard from "./pages/admin/Dashboard";
//import UserManagement from "./pages/admin/UserManagement";
//import ImportStudents from "./pages/admin/ImportStudents";
//import ExportResults from "./pages/admin/ExportResults";
//import SystemStatistics from "./pages/admin/SystemStatistics";

// Other pages
//import Unauthorized from "./pages/Unauthorized";
//import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              {/* <Route path="/student">
                <Route index element={<Navigate to="/student/dashboard" />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="tests" element={<AvailableTests />} />
                <Route path="test/:id" element={<TakeTest />} />
                <Route path="result/:attemptId" element={<TestResult />} />
                <Route path="transcript" element={<Transcript />} />
              </Route> */}

              {/* <Route path="/teacher">
                <Route index element={<Navigate to="/teacher/dashboard" />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="tests" element={<TestManagement />} />
                <Route path="tests/create" element={<CreateTest />} />
                <Route path="tests/edit/:id" element={<EditTest />} />
                <Route path="groups" element={<GroupManagement />} />
                <Route path="results" element={<StudentResults />} />
                <Route path="statistics" element={<Statistics />} />
              </Route> */}

              {/* <Route path="/admin">
                <Route index element={<Navigate to="/admin/dashboard" />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="import" element={<ImportStudents />} />
                <Route path="export" element={<ExportResults />} />
                <Route path="statistics" element={<SystemStatistics />} />
              </Route> */}

              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardRouter />} />
            </Route>
          </Route>

          {/* <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Laden...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case "student":
      return <Navigate to="/student/dashboard" />;
    case "teacher":
      return <Navigate to="/teacher/dashboard" />;
    case "admin":
      return <Navigate to="/admin/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
}

export default App;
