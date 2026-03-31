import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen gradient-hero pattern-dots relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl float-animation"></div>
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl float-animation"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-md mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
