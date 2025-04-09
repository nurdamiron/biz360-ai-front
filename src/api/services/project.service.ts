// src/api/services/project.service.ts
import apiClient from '../axios-instance';
import { Project, ProjectFilterParams } from '../../types/project.types';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';

/**
 * Сервис для работы с проектами≠
 */
export const ProjectService = {
  /**
   * Получение списка проектов с фильтрацией
   * @param params Параметры фильтрации и пагинации
   * @returns Список проектов с пагинацией
   */
  async getProjects(params?: ProjectFilterParams): Promise<PaginatedResponse<Project>> {
    const { data } = await apiClient.get<PaginatedResponse<Project>>('/projects', { params });
    return data;
  },
  
  /**
   * Получение проекта по ID
   * @param id ID проекта
   * @returns Подробная информация о проекте
   */
  async getProjectById(id: number): Promise<Project> {
    const { data } = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return data.data as Project;
  },
  
  /**
   * Создание нового проекта
   * @param projectData Данные нового проекта
   * @returns Созданный проект
   */
  async createProject(projectData: Partial<Project>): Promise<Project> {
    const { data } = await apiClient.post<ApiResponse<Project>>('/projects', projectData);
    return data.data as Project;
  },
  
  /**
   * Обновление проекта
   * @param id ID проекта
   * @param projectData Данные для обновления
   * @returns Обновленный проект
   */
  async updateProject(id: number, projectData: Partial<Project>): Promise<Project> {
    const { data } = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, projectData);
    return data.data as Project;
  },
  
  /**
   * Удаление проекта
   * @param id ID проекта
   * @returns Результат операции
   */
  async deleteProject(id: number): Promise<boolean> {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/projects/${id}`);
    return data.success;
  },
  
  /**
   * Получение статистики по проекту
   * @param id ID проекта
   * @returns Статистические данные проекта
   */
  async getProjectStats(id: number): Promise<any> {
    const { data } = await apiClient.get<ApiResponse<any>>(`/projects/${id}/stats`);
    return data.data;
  },
  

  /**
 * Сохранение содержимого файла
 * @param projectId ID проекта
 * @param filePath Путь к файлу
 * @param content Содержимое файла
 * @returns Результат операции
 */
async saveFileContent(projectId: number, filePath: string, content: string): Promise<boolean> {
  try {
    const { data } = await apiClient.post<ApiResponse<any>>(`/projects/${projectId}/files/content`, {
      path: filePath,
      content
    });
    return data.success;
  } catch (error) {
    console.error('Error saving file content:', error);
    throw error;
  }
},

/**
 * Создание новой папки
 * @param projectId ID проекта
 * @param folderPath Путь к папке
 * @returns Результат операции
 */
async createFolder(projectId: number, folderPath: string): Promise<boolean> {
  try {
    const { data } = await apiClient.post<ApiResponse<any>>(`/projects/${projectId}/files/folder`, {
      path: folderPath
    });
    return data.success;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
},

/**
 * Удаление файла или папки
 * @param projectId ID проекта
 * @param path Путь к файлу или папке
 * @returns Результат операции
 */
async deleteFileOrFolder(projectId: number, path: string): Promise<boolean> {
  try {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/projects/${projectId}/files`, {
      params: { path }
    });
    return data.success;
  } catch (error) {
    console.error('Error deleting file or folder:', error);
    throw error;
  }
},
  /**
   * Получение списка файлов проекта
   * @param id ID проекта
   * @param path Путь к каталогу (опционально)
   * @returns Список файлов и каталогов
   */
  async getProjectFiles(id: number, path?: string): Promise<any> {
    try {
      const { data } = await apiClient.get<ApiResponse<any>>(`/projects/${id}/files`, {
        params: { path }
      });
      return data.data;
    } catch (error) {
      console.error('Error getting project files:', error);
      throw error;
    }
  },
  
  /**
   * Получение содержимого файла
   * @param projectId ID проекта
   * @param filePath Путь к файлу
   * @returns Содержимое файла
   */
  async getFileContent(projectId: number, filePath: string): Promise<any> {
    try {
      const { data } = await apiClient.get<ApiResponse<any>>(`/projects/${projectId}/files/content`, {
        params: { path: filePath }
      });
      return data.data;
    } catch (error) {
      console.error('Error getting file content:', error);
      throw error;
    }
  },

  
};

export default ProjectService;