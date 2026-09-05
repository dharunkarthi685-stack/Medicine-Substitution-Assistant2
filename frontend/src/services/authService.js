import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  },

  getAdminUsers: async () => {
    const response = await api.get('/auth/admin/users/');
    return response.data;
  },

  updateAdminUser: async (id, data) => {
    const response = await api.patch(`/auth/admin/users/${id}/`, data);
    return response.data;
  },
};
