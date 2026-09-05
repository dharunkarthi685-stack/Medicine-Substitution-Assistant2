import api from './api';

export const orderService = {
  getOrders: async (params = {}) => {
    const response = await api.get('/orders/', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}/`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await api.post('/orders/', orderData);
    return response.data;
  },

  updateOrderStatus: async (id, data) => {
    const response = await api.patch(`/orders/${id}/`, data);
    return response.data;
  },

  validateCart: async (items) => {
    const response = await api.post('/orders/cart/validate/', { items });
    return response.data;
  },

  downloadInvoicePDF: async (orderId) => {
    const response = await api.get(`/invoices/${orderId}/pdf/`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
