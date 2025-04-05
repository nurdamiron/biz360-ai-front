// src/api/axios-instance.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getApiBaseUrl } from '../config/api.config';

// Создаем глобальный state для индикатора загрузки
let requestCount = 0;

// Функция для управления глобальным индикатором загрузки
const updateLoadingState = (isLoading: boolean) => {
  // Увеличиваем или уменьшаем счетчик запросов
  requestCount = isLoading ? requestCount + 1 : requestCount - 1;
  
  // Отображаем или скрываем глобальный индикатор загрузки
  // Например, через событие или другой механизм
  const event = new CustomEvent('api-loading-state-changed', { 
    detail: { isLoading: requestCount > 0 } 
  });
  window.dispatchEvent(event);
};

// Создаем экземпляр Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 секунд
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Интерцептор запросов
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Добавляем авторизационный токен, если он есть
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    
    // Включаем индикатор загрузки, если запрос не помечен как silent
    if (!(config.headers?.['silent'] === true)) {
      updateLoadingState(true);
    }
    
    return config;
  },
  (error: AxiosError) => {
    // Обрабатываем ошибку запроса
    updateLoadingState(false);
    return Promise.reject(error);
  }
);

// Интерцептор ответов
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Выключаем индикатор загрузки для обычных запросов
    if (!(response.config.headers?.['silent'] === true)) {
      updateLoadingState(false);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    // Выключаем индикатор загрузки при ошибке
    updateLoadingState(false);
    
    // Получаем конфиг и ответ
    const { config, response } = error;
    
    // Если ошибка 401 (Unauthorized) и это не запрос на обновление токена
    if (response?.status === 401 && config?.url !== '/auth/refresh-token') {
      // Можно добавить логику для обновления токена
      // ...
      
      // Выход из системы при неудачном обновлении токена
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    // Обработка других ошибок
    // Можно добавить глобальную обработку ошибок и уведомления
    
    return Promise.reject(error);
  }
);

export default apiClient;