// src/config/api.config.ts
export enum Environment {
  LOCAL = 'local',
  PRODUCTION = 'production',
}

// Хранение текущего окружения
let currentEnvironment: Environment = Environment.LOCAL;

// Получить текущее окружение
export const getCurrentEnvironment = (): Environment => {
  // Пробуем загрузить сохраненное окружение из localStorage
  const savedEnv = localStorage.getItem('api_environment');
  if (savedEnv && Object.values(Environment).includes(savedEnv as Environment)) {
    currentEnvironment = savedEnv as Environment;
  }
  return currentEnvironment;
};

// Установить окружение
export const setEnvironment = (env: Environment): void => {
  currentEnvironment = env;
  localStorage.setItem('api_environment', env);
};

// Конфигурация для каждого окружения
const apiConfig = {
  [Environment.LOCAL]: {
    baseUrl: 'http://localhost:3000/api',
    wsUrl: 'ws://localhost:3000/ws',
  },
  [Environment.PRODUCTION]: {
    baseUrl: 'https://ai-assistant-back-zneh.onrender.com/api',
    wsUrl: 'wss://ai-assistant-back-zneh.onrender.com/ws',
  },
};

// Получение базового URL для API
export const getApiBaseUrl = () => {
  const env = getCurrentEnvironment();
  // Добавляем префикс /v1
  return `${apiConfig[env].baseUrl}/`;
};

// Получение URL для WebSocket
export const getWsUrl = () => {
  const env = getCurrentEnvironment();
  return apiConfig[env].wsUrl;
};