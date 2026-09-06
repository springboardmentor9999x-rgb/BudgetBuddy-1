import axios from 'axios';

// When running Vite dev server or production preview, /api proxies to localhost:5000
// Fallback to explicit localhost:5000/api if needed
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.origin.includes('localhost')
    ? '/api'
    : 'http://localhost:5000/api');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT Token to every request automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('budgetbuddy_jwt_token_v1');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const currentUserId = localStorage.getItem('budgetbuddy_user_id_v1') || 'user_1';
    config.headers['x-user-id'] = currentUserId;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler with direct backend fallback
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If request failed with network error on /api, try direct localhost:5000/api
    const config = error.config;
    if (
      (!error.response || error.code === 'ERR_NETWORK') &&
      config &&
      !config._retryDirect &&
      typeof config.baseURL === 'string' &&
      config.baseURL.startsWith('/api')
    ) {
      config._retryDirect = true;
      config.baseURL = 'http://localhost:5000/api';
      return axios(config);
    }

    if (error.response?.status === 401) {
      console.warn('[API Client] Unauthorized request - checking credentials');
    }
    return Promise.reject(error);
  }
);
