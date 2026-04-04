// frontend/src/services/authService.js
import api from "./api";

class AuthService {
  async register(userData) {
    console.log("🔵 [AuthService] Register called with:", userData);

    try {
      console.log("🔵 [AuthService] Sending POST request to /register");
      const response = await api.post("/register", userData);

      console.log("✅ [AuthService] Response received:", response);
      console.log("✅ [AuthService] Response data:", response.data);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        console.log("✅ [AuthService] Token stored in localStorage");
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error("🔴 [AuthService] Register error:", error);
      console.error("🔴 [AuthService] Error response:", error.response);
      console.error("🔴 [AuthService] Error message:", error.message);

      if (error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: "Netwerkfout" };
    }
  }

  async login(email, password) {
    console.log("🔵 [AuthService] Login called for:", email);

    try {
      const response = await api.post("/login", { email, password });
      console.log("✅ [AuthService] Login response:", response.data);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        console.log("✅ [AuthService] Token stored");
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error("🔴 [AuthService] Login error:", error);
      if (error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: "Netwerkfout" };
    }
  }

  async logout() {
    console.log("🔵 [AuthService] Logout called");
    try {
      await api.post("/logout");
      console.log("✅ [AuthService] Logout successful");
    } catch (error) {
      console.error("🔴 [AuthService] Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      console.log("✅ [AuthService] Token removed");
    }
  }

  async getCurrentUser() {
    console.log("🔵 [AuthService] Getting current user");
    try {
      const response = await api.get("/me");
      console.log("✅ [AuthService] Current user response:", response.data);

      if (response.data.success) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error("🔴 [AuthService] Get user error:", error);
      return null;
    }
  }
}

export default new AuthService();
