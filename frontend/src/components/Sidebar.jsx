import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  StickyNote,
  Package,
  BarChart3,
  Users,
  Briefcase,
  Settings,
  LifeBuoy,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({ isMobile = false, onClose = () => {} }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navSections = [
    {
      title: "MAIN",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { name: "Schedule", icon: Calendar, href: "/schedule" },
        { name: "Note", icon: StickyNote, href: "/notes" },
        { name: "Products", icon: Package, href: "/products" },
        { name: "Report", icon: BarChart3, href: "/reports" },
      ],
    },
    {
      title: "RECORDS",
      items: [
        { name: "Team", icon: Users, href: "/team" },
        { name: "Clients", icon: Briefcase, href: "/clients" },
        { name: "Settings", icon: Settings, href: "/settings" },
        { name: "Support", icon: LifeBuoy, href: "/support" },
      ],
    },
  ];

  return (
    // Exact dezelfde gradient en pattern als AuthLayout
    <div
      className="flex flex-col h-full relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #7c3aed 0%, #6c2bd9 50%, #0ea5e9 100%)",
        backgroundImage:
          "radial-gradient(circle, rgba(255, 255, 255, 0.2) 2px, transparent 2px)",
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0",
      }}
    >
      {/* Decorative floating elements - OPTIONEEL, voor extra effect zoals in AuthLayout */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl float-animation"></div>
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl float-animation"
        style={{ animationDelay: "1.5s" }}
      ></div>

      {/* Content - relative z-index zodat het boven de overlay staat */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => isMobile && onClose()}
          >
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-white/30">
              <div className="size-8 text-zinc-800 font-bold text-xl flex items-center justify-center">
                T
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-800">ToetsFlow</h1>
              <p className="text-xs ttext-zinc-800">Online toetsplatform</p>
            </div>
          </Link>
        </div>

        {/* Welcome Section */}
        <div className="px-6 pb-4">
          <p className="text-sm text-zinc-800">Welcome,</p>
          <p className="text-xl font-semibold text-zinc-800/60">
            {user?.name || "Brooklyn Simmons"}
          </p>
          <div className="mt-3">
            <p className="text-xs font-semibold text-zinc-800/50 uppercase tracking-wide">
              Tasks
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1 h-1 text-zinc-800/70 rounded-full"></div>
              <p className="text-sm text-zinc-800/80">Activities</p>
            </div>
          </div>
        </div>

        {/* Quick links - Schedule, Report, Teams, Clients */}
        <div className="px-6 pb-6 space-y-2 border-b border-white/10">
          <div className="flex items-center gap-3 text-zinc-800/70 py-1 hover:text-zinc-800 hover:bg-zinc-800/10 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
            <Calendar className="size-4" />
            <span className="text-sm">Schedule</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-800/70 py-1 hover:text-zinc-800 hover:bg-zinc-800/10 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
            <BarChart3 className="size-4" />
            <span className="text-sm">Report</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-800/70 py-1 hover:text-zinc-800 hover:bg-zinc-800/10 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
            <Users className="size-4" />
            <span className="text-sm">Teams</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-800/70 py-1 hover:text-zinc-800 hover:bg-zinc-800/10 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
            <Briefcase className="size-4" />
            <span className="text-sm">Clients</span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="px-6 text-xs font-semibold text-zinc-800/50 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => isMobile && onClose()}
                      className={`
                        flex items-center gap-3 px-6 py-2 text-sm transition-all duration-200
                        ${
                          active
                            ? "text-zinc-800 bg-white/20 border-r-2 border-white"
                            : "text-zinc-800/70 hover:bg-white/10 hover:text-zinc-800"
                        }
                      `}
                    >
                      <Icon
                        className={`size-4 ${active ? "text-zinc-800" : "text-zinc-800/50"}`}
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
              <User className="size-5 text-zinc-800/50" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-800/50">
                {user?.name || "Brooklyn Simmons"}
              </p>
              <p className="text-xs text-zinc-800/50">
                {user?.email || "simmons@gmail.com"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-zinc-800/70 hover:text-indigo-700 hover:bg-white/10 px-0"
          >
            <LogOut className="size-4 mr-2" />
            Uitloggen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
