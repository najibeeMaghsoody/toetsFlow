import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ role }) => {
  const studentLinks = [
    { to: "/student/dashboard", icon: "🏠", label: "Dashboard" },
    { to: "/student/tests", icon: "📝", label: "Beschikbare Toetsen" },
    { to: "/student/transcript", icon: "📊", label: "Mijn Resultaten" },
  ];

  const teacherLinks = [
    { to: "/teacher/dashboard", icon: "🏠", label: "Dashboard" },
    { to: "/teacher/tests", icon: "📋", label: "Toetsen" },
    { to: "/teacher/groups", icon: "👥", label: "Groepen" },
    { to: "/teacher/results", icon: "📈", label: "Resultaten" },
    { to: "/teacher/statistics", icon: "📊", label: "Statistieken" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", icon: "🏠", label: "Dashboard" },
    { to: "/admin/users", icon: "👤", label: "Gebruikers" },
    { to: "/admin/import", icon: "📂", label: "CSV Import" },
    { to: "/admin/export", icon: "📎", label: "Export Resultaten" },
    { to: "/admin/statistics", icon: "📊", label: "Systeem Statistieken" },
  ];

  let links = [];
  if (role === "student") links = studentLinks;
  if (role === "teacher") links = teacherLinks;
  if (role === "admin") links = adminLinks;

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">ToetsSysteem</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700 text-gray-300"
                  }`
                }
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
