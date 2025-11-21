import axios from 'axios';
import type { 
  Payment, 
  Merchant,
  MerchantDetail,
  PageResponse, 
  PaymentFilter, 
  MerchantFilter,
  StatusCode,
  PayTypeCode
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://recruit.paysbypays.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Payment APIs
export const paymentApi = {
  getPayments: async (params?: PaymentFilter): Promise<Payment[]> => {
    const response = await apiClient.get('/payments/list', { params });
    return response.data.data || [];
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data.data;
  },

  getRecentPayments: async (limit: number = 5): Promise<Payment[]> => {
    const response = await apiClient.get('/payments/list');
    const allPayments = response.data.data || [];
    // Sort by payment date descending (most recent first)
    const sortedPayments = allPayments.sort((a: Payment, b: Payment) => 
      new Date(b.paymentAt).getTime() - new Date(a.paymentAt).getTime()
    );
    return sortedPayments.slice(0, limit);
  },
};

// Merchant APIs
export const merchantApi = {
  getMerchants: async (params?: MerchantFilter): Promise<Merchant[]> => {
    const response = await apiClient.get('/merchants/list', { params });
    return response.data.data || [];
  },

  getMerchantById: async (mchtCode: string): Promise<MerchantDetail> => {
    const response = await apiClient.get(`/merchants/details/${mchtCode}`);
    return response.data.data;
  },

  getMerchantDetails: async (): Promise<MerchantDetail[]> => {
    const response = await apiClient.get('/merchants/details');
    return response.data.data || [];
  },

  getAllMerchants: async (): Promise<Merchant[]> => {
    const response = await apiClient.get('/merchants/list');
    return response.data.data || [];
  },
};

// Common APIs
export const commonApi = {
  getPaymentStatusCodes: async (): Promise<StatusCode[]> => {
    const response = await apiClient.get('/common/payment-status/all');
    return response.data.data || [];
  },

  getPaymentTypeCodes: async (): Promise<PayTypeCode[]> => {
    const response = await apiClient.get('/common/paymemt-type/all');
    return response.data.data || [];
  },

  getMerchantStatusCodes: async (): Promise<StatusCode[]> => {
    const response = await apiClient.get('/common/mcht-status/all');
    return response.data.data || [];
  },
};

export default apiClient;

