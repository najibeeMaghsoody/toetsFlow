// frontend/src/pages/student/Dashboard.jsx
import React from "react";
import { useAuth } from "../../contexts/AuthContext";

const StudentDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-purple-900 mb-4">
        Welkom Student, {user?.name}!
      </h1>
      <p className="text-gray-600">Dit is het student dashboard.</p>
      <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
        <p className="text-green-700">
          ✅ Je bent succesvol geregistreerd en ingelogd!
        </p>
        <p className="text-green-700 mt-2">
          Email: {user?.email}
        </p>
        <p className="text-green-700">
          Rol: {user?.role}
        </p>
      </div>
    </div>
  );
};

export default StudentDashboard;