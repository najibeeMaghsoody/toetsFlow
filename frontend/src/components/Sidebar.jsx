// components/Sidebar.jsx
import React, { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

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
    setIsMobileMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const SidebarContent = ({
    onItemClick = () => {},
    showCloseButton = false,
    onClose = () => {},
  }) => (
    <div className="flex flex-col h-full relative overflow-hidden border-r border-purple-200 bg-white">
      <div className="absolute top-20 right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl float-animation"></div>
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl float-animation"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <div className="relative z-10 flex flex-col h-full">
        {showCloseButton && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-zinc-800/70 hover:text-purple-600"
              aria-label="Sluit menu"
            >
              <X className="size-5" />
            </button>
          </div>
        )}

        <div className="p-6 mb-12">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={onItemClick}
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

        <div className="px-6 pb-6 space-y-4 border-b border-white/10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onItemClick}
                className={`flex items-center gap-4 text-zinc-800/70 py-1 hover:text-purple-600 hover:bg-purple-600/10 rounded-sm px-2 -mx-2 transition-colors ${
                  isActive ? "text-purple-600 bg-purple-600/10" : ""
                }`}
              >
                <Icon className="size-4" />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-6 border-t border-white/10 mt-auto">
          <button
            onClick={() => {
              handleLogout();
              onItemClick();
            }}
            className="w-full flex items-center gap-4 text-zinc-800/70 hover:text-purple-600 hover:bg-purple-600/10 rounded-lg px-2 py-1 -mx-2 transition-colors"
          >
            <LogOut className="size-4" />
            <span className="text-sm">Uitloggen</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - altijd zichtbaar */}
      <div className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Hamburger button - ALLEEN zichtbaar als mobiel menu gesloten is */}
      {!isMobileMenuOpen && (
        <div className="md:hidden fixed top-4 left-4 z-60">
          <button
            onClick={openMenu}
            className="bg-purple-600 text-white p-2.5 rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      )}

      {/* Overlay - alleen zichtbaar als menu open is */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 z-45"
            : "opacity-0 pointer-events-none -z-10"
        }`}
        onClick={closeMenu}
      />

      {/* Mobiele Sidebar - met close button */}
      <div
        className={`fixed top-0 left-0 h-full w-64 transform transition-transform duration-300 ease-in-out md:hidden shadow-xl ${
          isMobileMenuOpen ? "translate-x-0 z-50" : "-translate-x-full z-50"
        }`}
      >
        <SidebarContent
          onItemClick={closeMenu}
          showCloseButton={true}
          onClose={closeMenu}
        />
      </div>
    </>
  );
};

export default Sidebar;
