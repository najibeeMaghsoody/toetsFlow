import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { GraduationCap, LogOut, User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Mobile menu button - alleen zichtbaar op mobiel */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-purple-50 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="size-6 text-purple-600" />
          </button>

          {/* Logo - gecentreerd op mobiel */}
          <Link to="/" className="flex items-center gap-3 ml-12 lg:ml-0">
            <div className="bg-linear-to-br from-purple-600 to-violet-700 p-2 rounded-xl shadow-lg">
              <GraduationCap className="size-8 text-zinc-800" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-linear-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent">
                ToetsFlow
              </h1>
              <p className="text-xs text-gray-600">Online toetsplatform</p>
            </div>
          </Link>

          {/* Desktop user info - verborgen op mobiel */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="size-4 text-purple-600" />
                  <span className="text-sm text-gray-700">{user.name}</span>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                    {user.role === "docent" ? "Docent" : "Student"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-purple-300 hover:bg-purple-50"
                >
                  <LogOut className="size-4 mr-2" />
                  Uitloggen
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="outline" className="border-purple-300">
                    Inloggen
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-linear-to-r from-purple-600 to-violet-600">
                    Registreren
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile placeholder voor balans */}
          <div className="lg:hidden w-10"></div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-70 sm:w-[320px] p-0 bg-transparent"
        >
          <Sidebar isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Navbar;
