import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log(" [AuthContext] Initializing");

  useEffect(() => {
    console.log(" [AuthContext] Running checkAuth");

    // Eerst herstellen uit localStorage
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log(" [AuthContext] Token found:", token ? "Yes" : "No");
    console.log(
      " [AuthContext] Stored user found:",
      storedUser ? "Yes" : "No",
    );

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log(
          "[AuthContext] Restored user from localStorage:",
          parsedUser,
        );
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsLoading(false);

        // Valideer token bij backend (async)
        authService
          .getCurrentUser()
          .then((userData) => {
            if (userData) {
              console.log("[AuthContext] Token validated, user:", userData);
              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
            } else {
              console.log(" [AuthContext] Token invalid, clearing");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser(null);
              setIsAuthenticated(false);
            }
          })
          .catch((error) => {
            console.error("[AuthContext] Error validating token:", error);
            // Blijf bij de localStorage user, maar log de error
          });
      } catch (e) {
        console.error(
          "[AuthContext] Error parsing user from localStorage",
          e,
        );
        setIsLoading(false);
      }
    } else {
      console.log(" [AuthContext] No stored credentials found");
      setIsLoading(false);
    }
  }, []);

  const register = async (userData) => {
    console.log(" [AuthContext] Register called with:", userData);
    const result = await authService.register(userData);
    console.log("[AuthContext] Register result:", result);

    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const login = async (email, password) => {
    console.log(" [AuthContext] Login called for:", email);
    const result = await authService.login(email, password);
    console.log(" [AuthContext] Login result:", result);

    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = async () => {
    console.log("[AuthContext] Logout called");
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    console.log(" [AuthContext] Logout complete");
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
