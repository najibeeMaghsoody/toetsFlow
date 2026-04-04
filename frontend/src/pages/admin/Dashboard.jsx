// frontend/src/pages/admin/Dashboard.jsx
import React from "react";
import { useAuth } from "../../contexts/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-purple-900 mb-4">
        Welkom Admin, {user?.name}!
      </h1>
      <p className="text-gray-600">Dit is het admin dashboard.</p>
    </div>
  );
};

export default AdminDashboard;
