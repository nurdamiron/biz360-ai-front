// src/types/api.types.ts

// Общий интерфейс для ответов API
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }
  
  // Интерфейс для пагинированных ответов
  export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    }
  }
  
  // Параметры запроса с пагинацией
  export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  
  // Интерфейс для фильтрации задач
  export interface TaskFilterParams extends PaginationParams {
    status?: string | string[];
    priority?: string | string[];
    projectId?: number;
    assignedTo?: number;
    fromDate?: string;
    toDate?: string;
    search?: string;
  }
  
  // Интерфейс для запроса логов задачи
  export interface TaskLogParams {
    taskId: number;
    limit?: number;
    offset?: number;
    logType?: string | string[];
    fromDate?: string;
    toDate?: string;
  }
  
  // Интерфейс для запроса на обработку задачи ИИ-ассистентом
  export interface ProcessTaskRequest {
    taskId: number;
  }
  
  // Интерфейс для ответа о статусе обработки задачи
  export interface ProcessTaskResponse {
    success: boolean;
    message: string;
    status: string;
    taskId: number;
  }
  
  // Интерфейс для запроса на утверждение/отклонение кода
  export interface CodeReviewRequest {
    generationId: number;
    status: 'approved' | 'rejected';
    feedback?: string;
  }