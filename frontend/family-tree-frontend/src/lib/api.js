import axios from 'axios';

// Базовый URL для API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Создаем экземпляр axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек или недействителен
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API функции для авторизации
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  refresh: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await api.post('/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// API функции для деревьев
export const treesAPI = {
  getUserTrees: async () => {
    const response = await api.get('/trees');
    return response.data;
  },

  createTree: async (treeData) => {
    const response = await api.post('/trees', treeData);
    return response.data;
  },

  createAnonymousTree: async (treeData) => {
    const response = await api.post('/trees/anonymous', treeData);
    return response.data;
  },

  getTree: async (treeId) => {
    const response = await api.get(`/trees/${treeId}`);
    return response.data;
  },

  updateTree: async (treeId, treeData) => {
    const response = await api.put(`/trees/${treeId}`, treeData);
    return response.data;
  },

  deleteTree: async (treeId) => {
    const response = await api.delete(`/trees/${treeId}`);
    return response.data;
  },
};

// Утилиты для работы с токенами
export const tokenUtils = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },

  getRefreshToken: () => {
    return localStorage.getItem('refresh_token');
  },

  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

// Утилиты для работы с пользователем
export const userUtils = {
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  clearUser: () => {
    localStorage.removeItem('user');
  },
};

export default api;

