// components/docent/Header.jsx
import { Button } from "../ui/button";
import { LogOut, GraduationCap } from "lucide-react";

export function Header({ user, onLogout }) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-purple-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-linear-to-br from-purple-600 to-violet-700 p-2 rounded-xl shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-linear-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent">
              Teacher Dashboard
            </h1>
            <p className="text-sm text-gray-700">{user?.name}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onLogout}
          className="border-purple-300 hover:bg-purple-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
