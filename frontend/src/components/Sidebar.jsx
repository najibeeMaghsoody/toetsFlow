// components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  BarChart3,
  Users,
  Briefcase,
  LogOut,
  GraduationCap,
  FileText,
  ClipboardList,
  Settings,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({ isMobile = false, onClose = () => {} }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    switch (user?.role) {
      case "teacher":
        return [
          { name: "Toetsen", path: "/teacher/dashboard", icon: Calendar },
          { name: "Resultaten", path: "/teacher/results", icon: BarChart3 },
          { name: "Groepen", path: "/teacher/groups", icon: Users },
          { name: "Studenten", path: "/teacher/students", icon: Briefcase },
        ];
      case "student":
        return [
          { name: "Mijn Toetsen", path: "/student/dashboard", icon: Calendar },
          { name: "Resultaten", path: "/student/results", icon: BarChart3 },
          { name: "Mijn Groepen", path: "/student/groups", icon: Users },
        ];
      case "admin":
        return [
          { name: "Dashboard", path: "/admin/dashboard", icon: BarChart3 },
          { name: "Gebruikers", path: "/admin/users", icon: Users },
          {
            name: "Statistieken",
            path: "/admin/statistics",
            icon: ClipboardList,
          },
          { name: "Instellingen", path: "/admin/settings", icon: Settings },
        ];
      default:
        return [
          { name: "Toetsen", path: "/teacher/dashboard", icon: Calendar },
          { name: "Resultaten", path: "/teacher/results", icon: BarChart3 },
          { name: "Groepen", path: "/teacher/groups", icon: Users },
          { name: "Studenten", path: "/teacher/students", icon: Briefcase },
        ];
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden border-r border-purple-200">
      {/* Decorative floating elements - blijven exact hetzelfde */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl float-animation"></div>
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl float-animation"
        style={{ animationDelay: "1.5s" }}
      ></div>

      {/* Content - styling blijft exact hetzelfde */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo - blijft hetzelfde */}
        <div className="p-6 mb-12">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => isMobile && onClose()}
          >
            <div className="bg-linear-to-br from-purple-600 to-violet-700 p-2 rounded-xl shadow-lg">
              <GraduationCap className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-800/60">ToetsFlow</h1>
              <p className="text-xs text-zinc-800/70">Online toetsplatform</p>
            </div>
          </Link>
        </div>

        {/* Menu items - styling exact hetzelfde, maar nu met echte links */}
        <div className="px-6 pb-6 space-y-4 border-b border-white/10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && onClose()}
                className={`flex items-center gap-4 text-zinc-800/70 py-1 hover:text-purple-600 hover:bg-purple-600/10 rounded-lg px-2 -mx-2 transition-colors ${
                  isActive ? "text-purple-600 bg-purple-600/10" : ""
                }`}
              >
                <Icon className="size-4" />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout button - styling blijft hetzelfde, nu actief */}
        {/* <div className="p-6 border-t border-white/10 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 text-zinc-800/70 hover:text-purple-600 hover:bg-purple-600/10 rounded-lg px-2 py-1 -mx-2 transition-colors"
          >
            <LogOut className="size-4" />
            <span className="text-sm">Uitloggen</span>
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Sidebar;
