// src/types/api.types.ts

// Общий интерфейс для ответов API
export interface ApiResponse<T = any> {
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

// src/types/project.types.ts

// Интерфейс для проекта
export interface Project {
  id: number;
  name: string;
  description: string;
  status: string; // 'active' | 'inactive' | 'archived'
  tasksCount: number;
  completedTasks: number;
  activeTasks: number;
  createdAt: string;
  updatedAt: string;
  codeStats?: {
    totalFiles: number;
    totalLines: number;
    languages: Array<{
      name: string;
      percentage: number;
    }>;
  };
}

// Параметры фильтрации проектов
export interface ProjectFilterParams extends PaginationParams {
  status?: string;
  search?: string;
}

// src/types/user.types.ts

// Перечисление ролей пользователя
export enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

// Интерфейс пользователя
export interface User {
  id: number;
  username: string;
  email?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Интерфейс для состояния аутентификации в Redux
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

// Интерфейс для учетных данных входа
export interface LoginCredentials {
  username: string;
  password: string;
}

// Интерфейс для ответа при входе
export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

// src/types/task.types.ts

// Перечисление статусов задачи
export enum TaskStatus {
  NEW = 'new',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

// Перечисление приоритетов задачи
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Перечисление типов логов
export enum LogType {
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning',
  PROGRESS = 'progress',
}

// Интерфейс для лога задачи
export interface TaskLog {
  id: number;
  taskId: number;
  type: LogType;
  message: string;
  progress?: number; // 0-100%
  timestamp: string;
  data?: any; // Дополнительные данные
}

// Интерфейс для подзадачи
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

// Интерфейс для генерации кода
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

// Интерфейс для задачи
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

// Интерфейс для Redux состояния задач
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