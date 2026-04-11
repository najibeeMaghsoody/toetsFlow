// components/Header.jsx (of Navbar.jsx)
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { GraduationCap, LogOut, Menu, Search, X, Bell } from "lucide-react";
import { Sheet, SheetContent } from "../ui/sheet";
import Sidebar from "../Sidebar";
import { Avatar, AvatarFallback } from "../ui/avatar";

const Header = () => {
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
      <nav className="sticky top-0 z-50 shadow-sm" style={navbarStyle}>
        {/* Decorative floating elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 flex items-center justify-between">
          {/* Left section - Logo en hamburger menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile menu button - nu actief! */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="text-sm sm:text-base font-bold text-white hidden xs:inline">
                ToetsFlow
              </span>
            </Link>
          </div>

          {/* Center - Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/70" />
                <input
                  type="text"
                  placeholder="Zoeken..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 border border-white/20 rounded-md focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>
            </form>
          </div>

          {/* Right section - User info */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search button (mobile) */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

            {/* Notification bell */}
            <button className="hidden sm:block p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative">
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 ml-1 bg-white/10 backdrop-blur-sm rounded-md px-2 sm:px-2.5 py-1">
                {/* Avatar */}
                <Avatar className="w-6 h-6 sm:w-7 sm:h-7">
                  <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs">
                    {firstName.charAt(0)}
                    {lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* User info */}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-white leading-tight">
                    {firstName} {lastName}
                  </p>
                  <p className="text-[10px] text-white/80 leading-tight">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                  title="Uitloggen"
                >
                  <LogOut className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 text-xs h-7 sm:h-8 px-2 sm:px-3"
                  >
                    Inloggen
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 text-xs h-7 sm:h-8 px-2 sm:px-3"
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
          <div className="md:hidden px-3 pb-2 pt-1 border-t border-white/10">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60" />
                <input
                  type="text"
                  placeholder="Zoeken..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 rounded-md focus:outline-none focus:border-white/40"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5 text-white/60" />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Sidebar Menu - nu actief! */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <Sidebar isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;
