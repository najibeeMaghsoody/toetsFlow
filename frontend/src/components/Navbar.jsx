
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  GraduationCap,
  LogOut,
  User,
  Menu,
  Search,
  X,
  Bell,
  Settings,
} from "lucide-react";
import { Sheet, SheetContent } from "./ui/sheet";
import Sidebar from "./Sidebar";
import { Avatar, AvatarFallback } from "./ui/avatar";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "teacher":
        return "Docent";
      case "student":
        return "Student";
      case "admin":
        return "Admin";
      default:
        return role;
    }
  };

  // Haal voornaam en achternaam op
  const getFirstAndLastName = () => {
    if (!user?.name) return { firstName: "Gebruiker", lastName: "" };
    const nameParts = user.name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");
    return { firstName, lastName };
  };

  const { firstName, lastName } = getFirstAndLastName();

  const navbarStyle = {
    background:
      "linear-gradient(135deg, #7c3aed 0%, #6c2bd9 50%, #0ea5e9 100%)",
    backgroundImage:
      "radial-gradient(circle, rgba(255, 255, 255, 0.2) 2px, transparent 2px)",
    backgroundSize: "24px 24px",
    backgroundPosition: "0 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  };

  return (
    <>
      <nav
        className="bg-white border-b border-gray-200 shadow sticky top-0 z-50 overflow-hidden"
        style={navbarStyle}
      >
        {/* Decorative floating elements - zoals in Sidebar */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 px-6 py-3 flex items-center justify-between">
          {/* Left section - Logo */}
          <div className="flex items-center gap-4"></div>

          {/* Center - Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-8/12 mx-6">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800/70" />
                <input
                  type="text"
                  placeholder="Zoeken..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-purple-500/10 backdrop-blur-sm text-zinc-800 placeholder:text-zinc-800/50 border border-white/20 rounded-lg focus:outline-none focus:border-zinc-800/40 focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>
            </form>
          </div>

          {/* Right section - User info */}
          <div className="flex items-center gap-3">
            {/* Search button (mobile) */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-lg bg-purple-500/10 hover:bg-white/20 transition-colors"
            >
              <Search className="w-5 h-5 text-zinc-800/50" />
            </button>

            {/* Notification bell */}
            <button className="hidden sm:block p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative">
              <Bell className="w-5 h-5 text-zinc-800/50" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {user ? (
              <div className="flex items-center gap-3 ml-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-zinc-800/50">
                    {firstName} {lastName}
                  </p>
                  <p className="text-xs text-zinc-800/50">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Uitloggen"
                >
                  <LogOut className="w-4 h-4 text-zinc-800/50" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-800/50 hover:bg-white/20"
                  >
                    Inloggen
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm text-zinc-800/50 hover:bg-white/30"
                  >
                    Registreren
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden px-4 pb-3 pt-2 border-t border-white/10">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800/50" />
                <input
                  type="text"
                  placeholder="Zoeken..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white/10 backdrop-blur-sm text-zinc-800/50 placeholder:text-zinc-800/50 border border-white/20 rounded-lg focus:outline-none focus:border-white/40"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-zinc-800/50" />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Sidebar Menu */}
      {/* <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <Sidebar isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet> */}
    </>
  );
};

export default Navbar;
