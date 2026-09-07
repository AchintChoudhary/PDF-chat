import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);

        // Support common token property names
        const token = user.token || user.accessToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Invalid userInfo in localStorage:', error);
        localStorage.removeItem('userInfo');
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Authentication required');

      // Don't immediately delete userInfo here.
      // The AuthContext controls logout/session state.
    }

    console.error(
      'API Error:',
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;