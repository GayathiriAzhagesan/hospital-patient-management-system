import axios from "axios";

// Centralized production API configuration
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return "https://medicare-backend-lqem.onrender.com/api";
  }
  const cleanUrl = envUrl.trim().replace(/\/+$/, "");
  if (cleanUrl.endsWith("/api")) {
    return cleanUrl;
  }
  return `${cleanUrl}/api`;
};

export const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 25000, // 25s timeout for cloud services (Render cold-starts)
});

// Request Interceptor: Attach JWT Token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("medicare_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 Unauthorized globally & handle server downtime
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error or backend cold start
      console.error("Network / Server connection error:", error.message);
      return Promise.reject(
        new Error(
          "Unable to connect to the Medicare server. If the backend is waking up, please wait a few seconds and try again."
        )
      );
    }

    if (error.response.status === 401) {
      if (localStorage.getItem("medicare_token")) {
        console.warn("Session expired or unauthorized. Logging out...");
        localStorage.removeItem("medicare_token");
        localStorage.removeItem("medicare_user");
        if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
