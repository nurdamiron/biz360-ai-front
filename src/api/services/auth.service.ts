// src/api/services/auth.service.ts
import apiClient from '../axios-instance';
import { User, LoginCredentials, LoginResponse } from '../../types/user.types';

/**
 * Сервис для работы с аутентификацией
 */
export const AuthService = {
  /**
   * Авторизация пользователя
   * @param credentials Данные для входа (логин/пароль)
   * @returns Данные пользователя и токен
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
    // Удаляем токен
    localStorage.removeItem('auth_token');
    
    // Можно добавить запрос на backend для инвалидации токена
    try {
      apiClient.post('/auth/logout', {}, {
        headers: { silent: true } // Не показывать ошибки этого запроса
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  },
  
  /**
   * Получение данных текущего пользователя
   * @returns Данные пользователя
   */
  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
  
  /**
   * Проверка аутентификации пользователя
   * @returns Статус аутентификации
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
  
  /**
   * Обновление токена
   * @returns Новый токен
   */
  async refreshToken(): Promise<string> {
    const { data } = await apiClient.post<{ token: string }>('/auth/refresh-token');
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    return data.token;
  },
  
  /**
   * Регистрация нового пользователя (только для администраторов)
   * @param userData Данные нового пользователя
   * @returns Результат операции
   */
  async registerUser(userData: any): Promise<any> {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },
  
  /**
   * Изменение пароля
   * @param passwordData Данные старого и нового пароля
   * @returns Результат операции
   */
  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<any> {
    const { data } = await apiClient.post('/auth/change-password', passwordData);
    return data;
  }
};

export default AuthService;