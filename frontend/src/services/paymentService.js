import api from './api';

export const paymentService = {
  createRazorpayOrder: async (orderId) => {
    const response = await api.post('/payments/razorpay/create/', { order_id: orderId });
    return response.data;
  },

  verifyRazorpayPayment: async (paymentData) => {
    const response = await api.post('/payments/razorpay/verify/', paymentData);
    return response.data;
  },

  confirmCOD: async (orderId) => {
    const response = await api.post('/payments/cod/', { order_id: orderId });
    return response.data;
  },
};
