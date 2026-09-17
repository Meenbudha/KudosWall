import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Always send cookies (accessToken, refreshToken)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response Interceptor for automatic Token Rotation & Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not retry refresh route or auth routes to prevent loops
    if (
      originalRequest.url.includes('/auth/refresh') ||
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/signup')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API Service exports
export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  getSimulatedInbox: () => api.get('/auth/simulated-inbox')
};

export const kudosService = {
  giveKudos: (data) => api.post('/kudos', data),
  getKudosFeed: (params) => api.get('/kudos', { params }),
  getKudosById: (id) => api.get(`/kudos/${id}`),
  toggleReaction: (id, emoji) => api.post(`/kudos/${id}/react`, { emoji })
};

export const userService = {
  getUsersDirectory: (params) => api.get('/users', { params }),
  getUserProfile: (id) => api.get(`/users/${id}/profile`),
  updateProfile: (data) => api.put('/users/profile', data)
};

export const analyticsService = {
  getLeaderboard: (params) => api.get('/analytics/leaderboard', { params }),
  getAnalyticsSummary: () => api.get('/analytics/summary'),
  resetMonthlyAllowance: () => api.post('/analytics/reset-monthly-allowance')
};

export default api;
