import api from './api';

export const medicineService = {
  getMedicines: async (params = {}) => {
    const response = await api.get('/medicines/', { params });
    return response.data;
  },

  getMedicineById: async (id) => {
    const response = await api.get(`/medicines/${id}/`);
    return response.data;
  },

  getSubstitutes: async (id) => {
    const response = await api.get(`/medicines/${id}/substitutes/`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/medicines/categories/');
    return response.data;
  },

  getDosageForms: async () => {
    const response = await api.get('/medicines/dosage-forms/');
    return response.data;
  },

  createMedicine: async (data) => {
    const response = await api.post('/medicines/', data);
    return response.data;
  },

  updateMedicine: async (id, data) => {
    const response = await api.put(`/medicines/${id}/`, data);
    return response.data;
  },

  deleteMedicine: async (id) => {
    const response = await api.delete(`/medicines/${id}/`);
    return response.data;
  },

  importCSV: async (formData) => {
    const response = await api.post('/medicines/import-csv/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  importCSVRaw: async (csvData) => {
    const response = await api.post('/medicines/import-csv/', { csv_data: csvData });
    return response.data;
  },
};
