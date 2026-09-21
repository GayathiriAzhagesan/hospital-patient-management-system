import api from "./api";

export const patientService = {
  getAll: async (params = {}) => {
    const response = await api.get("/patients", { params });
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get("/patients/me");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/patients", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },

  addPrescription: async (patientId, prescriptionData) => {
    const response = await api.post(`/patients/${patientId}/prescriptions`, prescriptionData);
    return response.data;
  },

  updatePrescriptionStatus: async (patientId, prescId, status) => {
    const response = await api.patch(`/patients/${patientId}/prescriptions/${prescId}`, { status });
    return response.data;
  },
};

export default patientService;
