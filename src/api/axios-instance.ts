// src/api/axios-instance.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getApiBaseUrl } from '../config/api.config';
import { store } from '../store';
import { logout, setToken } from '../store/slices/authSlice';
import { enqueueSnackbar } from 'notistack';

// Создаем глобальный state для индикатора загрузки
let requestCount = 0;

// Функция для управления глобальным индикатором загрузки
const updateLoadingState = (isLoading: boolean) => {
  // Увеличиваем или уменьшаем счетчик запросов
  requestCount = isLoading ? requestCount + 1 : requestCount - 1;
  
  // Отображаем или скрываем глобальный индикатор загрузки
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

    console.log('API Request:', {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      token: localStorage.getItem('auth_token') ? 'Present' : 'Missing'
    });
    
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
    const originalRequest = error.config;
    
    // Если ошибка 401 (Unauthorized) и это не запрос на обновление токена
    if (error.response?.status === 401 && 
        originalRequest && 
        originalRequest.url !== '/auth/refresh-token' &&
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      
      try {
        // Пытаемся обновить токен
        const { data } = await apiClient.post<{ token: string }>('/auth/refresh-token');
        
        if (data.token) {
          // Сохраняем новый токен
          localStorage.setItem('auth_token', data.token);
          // Обновляем токен в Redux
          store.dispatch(setToken(data.token));
          
          // Обновляем заголовок в текущем запросе
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${data.token}`
          };
          
          // Повторяем запрос с новым токеном
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Не удалось обновить токен:', refreshError);
        
        // Выход из системы при неудачном обновлении токена
        store.dispatch(logout());
        
        // Показываем уведомление
        enqueueSnackbar('Сессия истекла. Пожалуйста, войдите снова.', { 
          variant: 'warning',
          autoHideDuration: 3000
        });
        
        return Promise.reject(refreshError);
      }
    }
    
    // Формируем сообщение об ошибке
    let errorMessage = 'Произошла ошибка при обращении к серверу';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Если не режим silent, показываем уведомление об ошибке
    if (!(originalRequest?.headers?.['silent'] === true)) {
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 5000
      });
    }
    
    // Создаем улучшенный объект ошибки
    const enhancedError = {
      ...error,
      message: errorMessage,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    };
    
    return Promise.reject(enhancedError);
  }
);

export default apiClient;