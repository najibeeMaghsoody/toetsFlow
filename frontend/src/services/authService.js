
import api from "./api";

class AuthService {
  async register(userData) {
    console.log("[AuthService] Register called with:", userData);

    try {
      const response = await api.post("/register", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
      });

      console.log("[AuthService] Response:", response.data);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error("[AuthService] Register error:", error);
      if (error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: "Netwerkfout" };
    }
  }

  async login(email, password) {
    console.log("[AuthService] Login called for:", email);

    try {
      const response = await api.post("/login", { email, password });
      console.log("[AuthService] Login response:", response.data);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        console.log("[AuthService] Token saved:", response.data.token);
        console.log("[AuthService] User saved:", response.data.user);
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error("[AuthService] Login error:", error);
      if (error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: "Netwerkfout" };
    }
  }

  async logout() {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("[AuthService] Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("[AuthService] Token and user removed");
    }
  }

  async getCurrentUser() {
    console.log("[AuthService] Getting current user...");
    console.log("[AuthService] Token exists:", !!localStorage.getItem("token"));

    try {
      const response = await api.get("/me");
      console.log("[AuthService] Get user response:", response.data);

      if (response.data.success && response.data.user) {
    
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error("[AuthService] Get user error:", error);
      if (error.response?.status === 401) {
        console.log("[AuthService] Token invalid, clearing");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return null;
    }
  }
}

export default new AuthService();
