// frontend/src/services/api.js
import axios from "axios";

console.log("🔵 [API] Initializing axios instance");

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

console.log("🔵 [API] Base URL:", api.defaults.baseURL);

// Interceptor voor token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log(
    `🔵 [API] ${config.method?.toUpperCase()} request to ${config.url}`,
  );
  console.log("🔵 [API] Token present:", token ? "Yes" : "No");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔵 [API] Authorization header added");
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ [API] Response from ${response.config.url}:`,
      response.status,
    );
    return response;
  },
  (error) => {
    console.error(
      `🔴 [API] Error from ${error.config?.url}:`,
      error.response?.status || error.message,
    );
    return Promise.reject(error);
  },
);

export default api;
