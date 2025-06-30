import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're already handling a 401 error to prevent multiple redirects
let isHandlingAuthError = false;

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors if we're not already handling one
    if (error.response?.status === 401 && !isHandlingAuthError) {
      isHandlingAuthError = true;
      
      // Check if user is actually logged in before redirecting
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (token && user) {
        // Clear auth data from both storage types
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        // Only redirect if we're not already on the login page and not on the register page
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
      }
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isHandlingAuthError = false;
      }, 1000);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string; rememberMe?: boolean }) => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  upgradePlan: async () => {
    const response = await api.post('/auth/upgrade-plan');
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  analyze: async (documentId: number) => {
    const response = await api.post(`/documents/${documentId}/analyze`);
    return response.data;
  },

  getResults: async (documentId: number) => {
    const response = await api.get(`/documents/${documentId}/results`);
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  createCheckoutSession: async () => {
    const response = await api.post('/payments/create-checkout-session');
    return response.data;
  },

  createPortalSession: async () => {
    const response = await api.post('/payments/create-portal-session');
    return response.data;
  },

  verifyPaymentStatus: async (sessionId: string) => {
    const response = await api.post('/payments/verify-payment-status', { sessionId });
    return response.data;
  },
};

// Contact API
export const contactAPI = {
  submit: async (data: { name: string; email: string; message: string }) => {
    const response = await api.post('/contact/submit', data);
    return response.data;
  },
};

export default api; 