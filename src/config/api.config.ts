// src/config/api.config.ts
export enum Environment {
    LOCAL = 'local',
    PRODUCTION = 'production'
  }
  
  export const API_CONFIG = {
    baseUrl: {
      [Environment.LOCAL]: 'http://localhost:3000/api',
      [Environment.PRODUCTION]: 'https://ai-assistant-back-zneh.onrender.com/api'
    },
    wsUrl: {
      [Environment.LOCAL]: 'ws://localhost:3000',
      [Environment.PRODUCTION]: 'wss://ai-assistant-back-zneh.onrender.com'
    }
  }
  
  // Получение текущего окружения из localStorage или по умолчанию
  export const getCurrentEnvironment = (): Environment => {
    const savedEnv = localStorage.getItem('app_environment');
    
    if (savedEnv && Object.values(Environment).includes(savedEnv as Environment)) {
      return savedEnv as Environment;
    }
    
    // По умолчанию определяем по домену
    return window.location.hostname === 'localhost' 
      ? Environment.LOCAL 
      : Environment.PRODUCTION;
  }
  
  // Установка окружения
  export const setEnvironment = (env: Environment): void => {
    localStorage.setItem('app_environment', env);
  }
  
  // Получение базового URL API
  export const getApiBaseUrl = (): string => {
    return API_CONFIG.baseUrl[getCurrentEnvironment()];
  }
  
  // Получение URL WebSocket
  export const getWsUrl = (): string => {
    return API_CONFIG.wsUrl[getCurrentEnvironment()];
  }