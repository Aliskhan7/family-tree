import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, tokenUtils, userUtils } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = tokenUtils.getAccessToken();
        const savedUser = userUtils.getUser();

        if (token && savedUser) {
          setUser(savedUser);
          setIsAuthenticated(true);
          
          // Проверяем актуальность токена
          try {
            const response = await authAPI.getCurrentUser();
            setUser(response.user);
            userUtils.setUser(response.user);
          } catch (error) {
            // Токен недействителен
            logout();
          }
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Устанавливаем токены синхронно
      tokenUtils.setTokens(response.access_token, response.refresh_token);
      userUtils.setUser(response.user);
      
      // Обновляем состояние
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Принудительно обновляем заголовки axios
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Ошибка входа:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Ошибка входа' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      tokenUtils.setTokens(response.access_token, response.refresh_token);
      userUtils.setUser(response.user);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Ошибка регистрации' 
      };
    }
  };

  const logout = () => {
    tokenUtils.clearTokens();
    userUtils.clearUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

