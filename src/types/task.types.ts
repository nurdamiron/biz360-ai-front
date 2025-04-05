// src/types/task.types.ts

export enum TaskStatus {
    NEW = 'new',
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELED = 'canceled',
  }
  
  export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
  }
  
  export enum LogType {
    INFO = 'info',
    ERROR = 'error',
    WARNING = 'warning',
    PROGRESS = 'progress',
  }
  
  export interface TaskLog {
    id: number;
    taskId: number;
    type: LogType;
    message: string;
    progress?: number; // 0-100%
    timestamp: string;
    data?: any; // Дополнительные данные
  }
  
  export interface Subtask {
    id: number;
    taskId: number;
    title: string;
    description?: string;
    status: TaskStatus;
    progress: number; // 0-100%
    startTime?: string;
    endTime?: string;
    dependsOn?: number[]; // ID зависимых подзадач
  }
  
  export interface CodeGeneration {
    id: number;
    taskId: number;
    subtaskId?: number;
    originalCode?: string;
    generatedCode: string;
    filePath: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
    feedback?: string;
  }
  
  export interface Task {
    id: number;
    projectId: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    progress: number; // 0-100%
    createdAt: string;
    updatedAt: string;
    startTime?: string;
    endTime?: string;
    createdBy: number; // ID пользователя
    assignedTo?: number; // ID пользователя
    subtasks?: Subtask[];
    codeGenerations?: CodeGeneration[];
    logs?: TaskLog[];
    estimatedTime?: number; // в минутах
    actualTime?: number; // в минутах
  }
  
  export interface TaskState {
    tasks: Task[];
    selectedTask: Task | null;
    isLoading: boolean;
    error: string | null;
  }
  
  // Интерфейс для запроса на создание задачи
  export interface CreateTaskRequest {
    projectId: number;
    title: string;
    description: string;
    priority: TaskPriority;
  }
  
  // Интерфейс для ответа с пагинацией логов
  export interface TaskLogsResponse {
    taskId: number;
    logs: TaskLog[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    }
  }