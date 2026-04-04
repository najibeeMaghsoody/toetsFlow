// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log("🔵 [AuthContext] Initializing");

  useEffect(() => {
    console.log("🔵 [AuthContext] Running checkAuth");
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log("🔵 [AuthContext] Checking authentication...");
    const token = localStorage.getItem("token");
    console.log("🔵 [AuthContext] Token found:", token ? "Yes" : "No");

    if (token) {
      const userData = await authService.getCurrentUser();
      if (userData) {
        console.log("✅ [AuthContext] User authenticated:", userData);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log("🔴 [AuthContext] Invalid token, removing");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
    console.log("✅ [AuthContext] Initialization complete");
  };

  const register = async (userData) => {
    console.log("🔵 [AuthContext] Register called with:", userData);
    const result = await authService.register(userData);
    console.log("✅ [AuthContext] Register result:", result);

    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const login = async (email, password) => {
    console.log("🔵 [AuthContext] Login called for:", email);
    const result = await authService.login(email, password);
    console.log("✅ [AuthContext] Login result:", result);

    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = async () => {
    console.log("🔵 [AuthContext] Logout called");
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    console.log("✅ [AuthContext] Logout complete");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
