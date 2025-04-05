// src/api/services/task.service.ts
import apiClient from '../axios-instance';
import { 
  Task, 
  CreateTaskRequest, 
  TaskFilterParams, 
  TaskLogParams, 
  TaskLogsResponse,
  CodeReviewRequest,
  ProcessTaskRequest,
  ProcessTaskResponse
} from '../../types/task.types';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';

/**
 * Сервис для работы с задачами
 */
export const TaskService = {
  /**
   * Получение списка задач с фильтрацией
   * @param params Параметры фильтрации и пагинации
   * @returns Список задач с пагинацией
   */
  async getTasks(params?: TaskFilterParams): Promise<PaginatedResponse<Task>> {
    const { data } = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params });
    return data;
  },
  
  /**
   * Получение задачи по ID
   * @param id ID задачи
   * @returns Подробная информация о задаче
   */
  async getTaskById(id: number): Promise<Task> {
    const { data } = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data.data as Task;
  },
  
  /**
   * Создание новой задачи
   * @param taskData Данные для создания задачи
   * @returns Созданная задача
   */
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const { data } = await apiClient.post<ApiResponse<Task>>('/tasks', taskData);
    return data.data as Task;
  },
  
  /**
   * Обновление задачи
   * @param id ID задачи
   * @param taskData Данные для обновления
   * @returns Обновленная задача
   */
  async updateTask(id: number, taskData: Partial<Task>): Promise<Task> {
    const { data } = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, taskData);
    return data.data as Task;
  },
  
  /**
   * Удаление задачи
   * @param id ID задачи
   * @returns Результат операции
   */
  async deleteTask(id: number): Promise<boolean> {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/tasks/${id}`);
    return data.success;
  },
  
  /**
   * Декомпозиция задачи на подзадачи
   * @param id ID задачи
   * @returns Результат декомпозиции с созданными подзадачами
   */
  async decomposeTask(id: number): Promise<any> {
    const { data } = await apiClient.post<ApiResponse<any>>(`/tasks/${id}/decompose`);
    return data.data;
  },
  
  /**
   * Получение логов задачи
   * @param params Параметры запроса логов
   * @returns Логи задачи с пагинацией
   */
  async getTaskLogs(params: TaskLogParams): Promise<TaskLogsResponse> {
    const { data } = await apiClient.get<TaskLogsResponse>('/logs/task/' + params.taskId, {
      params: {
        limit: params.limit,
        offset: params.offset,
        logType: params.logType
      }
    });
    return data;
  },
  
  /**
   * Генерация кода для задачи
   * @param taskId ID задачи
   * @returns Результат генерации кода
   */
  async generateCode(taskId: number): Promise<any> {
    const { data } = await apiClient.post<ApiResponse<any>>(`/tasks/${taskId}/generate`);
    return data.data;
  },
  
  /**
   * Проверка сгенерированного кода
   * @param reviewData Данные для проверки
   * @returns Результат проверки
   */
  async reviewCode(reviewData: CodeReviewRequest): Promise<any> {
    const { data } = await apiClient.put<ApiResponse<any>>(
      `/tasks/generations/${reviewData.generationId}`, 
      {
        status: reviewData.status,
        feedback: reviewData.feedback
      }
    );
    return data.data;
  },
  
  /**
   * Создание тестов для сгенерированного кода
   * @param generationId ID генерации кода
   * @returns Результат создания тестов
   */
  async createTests(generationId: number): Promise<any> {
    const { data } = await apiClient.post<ApiResponse<any>>(`/tasks/generations/${generationId}/tests`);
    return data.data;
  },
  
  /**
   * Запуск обработки задачи AI-ассистентом
   * @param taskId ID задачи
   * @returns Статус запуска обработки
   */
  async processTask(taskId: number): Promise<ProcessTaskResponse> {
    const requestData: ProcessTaskRequest = { taskId };
    const { data } = await apiClient.post<ProcessTaskResponse>('/ai-assistant/process-task', requestData);
    return data;
  }
};

export default TaskService;