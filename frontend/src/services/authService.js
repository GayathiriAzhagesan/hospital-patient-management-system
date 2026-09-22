import api from "./api";

export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },

  getPendingApprovals: async () => {
    const response = await api.get("/auth/pending-approvals");
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get("/auth/users", { params });
    return response.data;
  },

  updateUserStatus: async (id, status, rejectionReason = "") => {
    const response = await api.patch(`/auth/users/${id}/status`, { status, rejectionReason });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  },
};

export default authService;
