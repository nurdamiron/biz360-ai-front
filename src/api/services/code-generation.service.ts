// src/api/services/code-generation.service.ts
import apiClient from '../axios-instance';
import { ApiResponse } from '../../types/api.types';

/**
 * Сервис для работы с генерацией кода через AI-ассистент
 */
export const CodeGenerationService = {
  /**
   * Получение всех генераций кода для задачи
   * @param taskId ID задачи
   * @returns Список генераций кода
   */
  async getCodeGenerationsForTask(taskId: number): Promise<any[]> {
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/tasks/${taskId}/generations`);
    return data.data || [];
  },
  
  /**
   * Генерация кода для задачи/подзадачи
   * @param taskId ID задачи
   * @param subtaskId ID подзадачи (опционально)
   * @param options Дополнительные параметры для генерации
   * @returns Результат генерации кода
   */
  async generateCode(taskId: number, subtaskId?: number, options?: any): Promise<any> {
    const requestData = {
      subtaskId,
      ...options
    };
    
    const { data } = await apiClient.post<ApiResponse<any>>(`/tasks/${taskId}/generate`, requestData);
    return data.data;
  },
  
  /**
   * Проверка сгенерированного кода (утверждение/отклонение)
   * @param generationId ID генерации кода
   * @param status Статус проверки ('approved' или 'rejected')
   * @param feedback Обратная связь для AI
   * @returns Обновленная информация о генерации
   */
  async reviewCodeGeneration(generationId: number, status: 'approved' | 'rejected', feedback?: string): Promise<any> {
    const { data } = await apiClient.put<ApiResponse<any>>(`/tasks/generations/${generationId}`, {
      status,
      feedback
    });
    return data.data;
  },
  
  /**
   * Регенерация кода с учетом обратной связи
   * @param generationId ID предыдущей генерации
   * @param taskId ID задачи
   * @param feedback Обратная связь для улучшения
   * @returns Новая генерация кода
   */
  async regenerateCode(generationId: number, taskId: number, feedback: string): Promise<any> {
    const { data } = await apiClient.post<ApiResponse<any>>('/ai-assistant/regenerate-code', {
      generationId,
      taskId,
      feedback
    });
    return data.data;
  },
  
  /**
   * Создание тестов для сгенерированного кода
   * @param generationId ID генерации кода
   * @returns Сгенерированные тесты
   */
  async generateTests(generationId: number): Promise<any> {
    const { data } = await apiClient.post<ApiResponse<any>>(`/tasks/generations/${generationId}/tests`);
    return data.data;
  },
  
  /**
   * Анализ неудачной генерации кода
   * @param projectId ID проекта
   * @param generationId ID генерации кода
   * @returns Результат анализа
   */
  async analyzeFailedGeneration(projectId: number, generationId: number): Promise<any> {
    const { data } = await apiClient.post<ApiResponse<any>>('/ai-assistant/analyze-failed-generation', {
      projectId,
      generationId
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
   * Получение статистики по генерациям кода
   * @param projectId ID проекта (опционально)
   * @param timeframe Временной период ('day', 'week', 'month', 'year')
   * @returns Статистика генераций кода
   */
  async getCodeGenerationStats(projectId?: number, timeframe: string = 'week'): Promise<any> {
    const { data } = await apiClient.get<ApiResponse<any>>('/ai-assistant/code-stats', {
      params: {
        projectId,
        timeframe
      }
    });
    return data.data;
  },
  
  /**
   * Создание Pull Request на основе сгенерированного кода
   * @param generationIds ID генераций кода для включения в PR
   * @param options Дополнительные параметры для PR
   * @returns Информация о созданном PR
   */
  async createPullRequest(generationIds: number[], options: {
    title: string;
    description: string;
    branch: string;
  }): Promise<any> {
    const { data } = await apiClient.post<ApiResponse<any>>('/ai-assistant/create-pr', {
      generationIds,
      ...options
    });
    return data.data;
  }
};

export default CodeGenerationService;