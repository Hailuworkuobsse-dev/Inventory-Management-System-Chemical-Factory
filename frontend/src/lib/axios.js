import axios from 'axios';
import { refreshAuthToken, isAuthEndpoint } from './authRefresh';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - refresh token on 401, then retry once; hard logout after
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Expired/invalid access token → try refreshing once per request.
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      const newToken = await refreshAuthToken(); // dispatches logout on failure
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 403) {
      // Forbidden
      window.location.href = '/unauthorized';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
