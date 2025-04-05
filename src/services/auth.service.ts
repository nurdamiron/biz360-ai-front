// src/services/auth.service.ts
import apiClient from '../api/axios-instance';
import { User } from '../types/user.types';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export const AuthService = {
  /**
   * Авторизация пользователя
   * @param credentials данные для входа
   * @returns данные пользователя и токен
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Сохраняем токен в localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    return data;
  },
  
  /**
   * Выход из системы
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    // Можно добавить запрос на backend для инвалидации токена
    // apiClient.post('/auth/logout');
  },
  
  /**
   * Получение данных текущего пользователя
   * @returns данные пользователя
   */
  async getUser(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
  
  /**
   * Проверка аутентификации пользователя
   * @returns статус аутентификации
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
  
  /**
   * Обновление токена
   * @returns новый токен
   */
  async refreshToken(): Promise<string> {
    const { data } = await apiClient.post<{ token: string }>('/auth/refresh-token');
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    return data.token;
  }
};

export default AuthService;