import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Welkom, {user?.name}
        </h2>
        <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
          {user?.role === "student" && "Student"}
          {user?.role === "teacher" && "Docent"}
          {user?.role === "admin" && "Beheerder"}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        Uitloggen
      </button>
    </nav>
  );
};

export default Navbar;
