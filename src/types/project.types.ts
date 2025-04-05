// src/types/project.types.ts
import { PaginationParams } from './api.types';

/**
 * Интерфейс статистики кода проекта
 */
export interface CodeStats {
  totalFiles: number;
  totalLines: number;
  languages: Array<{
    name: string;
    percentage: number;
  }>;
}

/**
 * Интерфейс проекта
 */
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
  codeStats?: CodeStats;
}

/**
 * Параметры для фильтрации проектов
 */
export interface ProjectFilterParams extends PaginationParams {
  status?: string;
  search?: string;
}