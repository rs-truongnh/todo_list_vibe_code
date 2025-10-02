import axios from 'axios';

// Base URL của API backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token vào headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý token hết hạn
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await refreshAccessToken(refreshToken);
          const { accessToken } = response.data.data.tokens;

          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token cũng hết hạn, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Đăng ký
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Đăng nhập
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Làm mới token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },

  // Đăng xuất
  logout: async (refreshToken) => {
    const response = await api.post('/api/auth/logout', { refreshToken });
    return response.data;
  },

  // Lấy thông tin user hiện tại
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Cập nhật profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    const response = await api.put('/api/auth/change-password', passwordData);
    return response.data;
  },
};

// Todo API functions
export const todoAPI = {
  // Lấy danh sách todos
  getTodos: async (params = {}) => {
    const response = await api.get('/api/todos', { params });
    return response.data;
  },

  // Lấy todo theo ID
  getTodo: async (id) => {
    const response = await api.get(`/api/todos/${id}`);
    return response.data;
  },

  // Tạo todo mới
  createTodo: async (todoData) => {
    const response = await api.post('/api/todos', todoData);
    return response.data;
  },

  // Cập nhật todo
  updateTodo: async (id, todoData) => {
    const response = await api.put(`/api/todos/${id}`, todoData);
    return response.data;
  },

  // Xóa todo
  deleteTodo: async (id) => {
    const response = await api.delete(`/api/todos/${id}`);
    return response.data;
  },

  // Lấy todos theo trạng thái
  getTodosByStatus: async (status) => {
    const response = await api.get(`/api/todos/status/${status}`);
    return response.data;
  },

  // Lấy todos trong khoảng thời gian
  getTodosByDateRange: async (startDate, endDate) => {
    const response = await api.get('/api/todos/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Lấy todos quá hạn
  getOverdueTodos: async () => {
    const response = await api.get('/api/todos/overdue');
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Helper function để refresh token
const refreshAccessToken = async (refreshToken) => {
  return await api.post('/api/auth/refresh', { refreshToken });
};

// Utility functions
export const apiUtils = {
  // Kiểm tra token có tồn tại
  hasToken: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Lưu tokens vào localStorage
  saveTokens: (tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },

  // Xóa tokens khỏi localStorage
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // Lưu user info
  saveUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Lấy user info
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Xóa user info
  clearUser: () => {
    localStorage.removeItem('user');
  },

  // Logout hoàn toàn
  logout: () => {
    apiUtils.clearTokens();
    apiUtils.clearUser();
  },
};

export default api;
