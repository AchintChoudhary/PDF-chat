import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Invalid userInfo in localStorage:', error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      'API Error:',
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;