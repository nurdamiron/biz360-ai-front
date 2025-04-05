// src/api/services/ai-assistant.service.ts
import apiClient from '../axios-instance';
import { ApiResponse } from '../../types/api.types';

/**
 * Сервис для работы с AI-ассистентом
 */
export const AIAssistantService = {
  /**
   * Получение статуса AI-ассистента
   * @returns Текущий статус, использование токенов и очередь
   */
  async getStatus(): Promise<any> {
    const { data } = await apiClient.get<ApiResponse<any>>('/ai-assistant/status');
    return data.data;
  },
  
  /**
   * Анализ задачи и получение рекомендаций
   * @param projectId ID проекта
   * @param taskId ID задачи
   * @returns Результаты анализа и рекомендации
   */
  async analyzeTask(projectId: number, taskId: number): Promise<any> {
    const { data } = await apiClient.post<ApiResponse<any>>('/ai-assistant/analyze-task', {
      projectId,
      taskId
    });
    return data.data;
  },
  
  /**
   * Обработка задачи (декомпозиция, генерация кода, создание PR)
   * @param taskId ID задачи
   * @returns Статус обработки
   */
  async processTask(taskId: number): Promise<any> {
    const { data } = await apiClient.post<ApiResponse<any>>('/ai-assistant/process-task', {
      taskId
    });
    return data.data;
  },
  
  /**
   * Отправка обратной связи по сгенерированному коду
   * @param feedbackData Данные обратной связи
   * @returns Результат операции
   */
  async sendFeedback(feedbackData: {
    projectId: number;
    generationId: number;
    feedbackText: string;
    rating: number;
  }): Promise<boolean> {
    const { data } = await apiClient.post<ApiResponse<any>>('/ai-assistant/feedback', feedbackData);
    return data.success;
  },
  
  /**
   * Получение отчета о производительности системы
   * @param projectId ID проекта (опционально)
   * @param timeframe Временной диапазон (day, week, month, year)
   * @returns Отчет о производительности
   */
  async getPerformanceReport(projectId?: number, timeframe: string = 'week'): Promise<any> {
    const { data } = await apiClient.get<ApiResponse<any>>('/ai-assistant/performance-report', {
      params: {
        projectId,
        timeframe
      }
    });
    return data.data;
  },
  
  /**
   * Анализ неудачной генерации кода
   * @param projectId ID проекта
   * @param generationId ID генерации
   * @returns Результаты анализа
   */
  async analyzeFailedGeneration(projectId: number, generationId: number): Promise<any> {
    const { data } = await apiClient.post<ApiResponse<any>>('/ai-assistant/analyze-failed-generation', {
      projectId,
      generationId
    });
    return data.data;
  },
  
  /**
   * Повторная генерация кода с учетом обратной связи
   * @param regenerateData Данные для регенерации
   * @returns Результат регенерации
   */
  async regenerateCode(regenerateData: {
    generationId: number;
    taskId: number;
    feedback?: string;
  }): Promise<any> {
    const { data } = await apiClient.post<ApiResponse<any>>('/ai-assistant/regenerate-code', regenerateData);
    return data.data;
  }
};

export default AIAssistantService;