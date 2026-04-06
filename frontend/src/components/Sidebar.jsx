import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  BarChart3,
  Users,
  Briefcase,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({ isMobile = false, onClose = () => {} }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div
      className="flex flex-col h-full relative overflow-hidden border-r border-purple-200 "
      style={{
        background:
          "linear-gradient(135deg, #7c3aed 0%, #6c2bd9 50%, #0ea5e9 100%)",
        backgroundImage:
          "radial-gradient(circle, rgba(255, 255, 255, 0.2) 2px, transparent 2px)",
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0",
      }}
    >
      <div className="absolute top-20 right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl float-animation"></div>
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl float-animation"
        style={{ animationDelay: "1.5s" }}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full ">
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

        <div className="px-6 pb-6 space-y-4 border-b border-white/10">
          <div className="flex items-center gap-4 text-zinc-800/70 py-1 hover:text-purple-600 hover:bg-purple-600/10 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
            <Calendar className="size-4" />
            <span className="text-sm">Schedule</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-800/70 py-1 hover:text-purple-600 hover:bg-purple-600/10 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
            <BarChart3 className="size-4" />
            <span className="text-sm">Report</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-800/70 py-1 hover:text-purple-600 hover:bg-purple-600/10 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
            <Users className="size-4" />
            <span className="text-sm">Teams</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-800/70 py-1 hover:text-purple-600 hover:bg-purple-600/10 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
            <Briefcase className="size-4" />
            <span className="text-sm">Clients</span>
          </div>
        </div>

        {/* Alleen logout button - User Footer is verwijderd */}
        {/* <div className="p-6 border-t border-white/10 mt-auto">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-zinc-800/70 hover:text-purple-600 hover:bg-white/10"
          >
            <LogOut className="size-4 mr-2" />
            Uitloggen
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default Sidebar;
