import api from './api';

export const analyticsService = {
  getPlatformAnalytics: async () => {
    const response = await api.get('/analytics/');
    return response.data;
  },

  getUserAnalytics: async () => {
    const response = await api.get('/analytics/user/');
    return response.data;
  },

  getAdminDeepAnalytics: async () => {
    const response = await api.get('/analytics/admin-deep/');
    return response.data;
  },
};

