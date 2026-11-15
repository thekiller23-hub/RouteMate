
import axios from 'axios';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'https://routemate-backend-o36t.onrender.com'
).replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rm_access_token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('rm_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/api/auth/token/refresh/`,
            { refresh: refreshToken }
          );

          if (res.status === 200) {
            localStorage.setItem('rm_access_token', res.data.access);

            originalRequest.headers['Authorization'] =
              `Bearer ${res.data.access}`;

            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('rm_access_token');
          localStorage.removeItem('rm_refresh_token');
          localStorage.removeItem('rm_user');

          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
