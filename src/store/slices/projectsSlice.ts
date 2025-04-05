// src/store/slices/projectsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/axios-instance';
import { PaginatedResponse } from '../../types/api.types';

// Интерфейсы для работы с проектами
export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  tasksCount: number;
  activeTasks: number;
  completedTasks: number;
  codeStats?: {
    totalFiles: number;
    totalLines: number;
    languages: {
      name: string;
      percentage: number;
    }[];
  };
}

export interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

// Параметры для получения списка проектов
export interface ProjectFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Начальное состояние
const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
};

// Асинхронный экшен для получения списка проектов
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params: ProjectFilterParams = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<PaginatedResponse<Project>>('/projects', { params });
      return data.items;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения проектов');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

// Асинхронный экшен для получения проекта по ID
export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (projectId: number, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ data: Project }>(`/projects/${projectId}`);
      return data.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения проекта');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

// Асинхронный экшен для создания проекта
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (project: { name: string; description: string }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<{ data: Project }>('/projects', project);
      return data.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка создания проекта');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

// Создаем слайс
const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Очистка выбранного проекта
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
    
    // Очистка ошибок
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Получение списка проектов
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Получение проекта по ID
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Создание проекта
    builder
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.projects.push(action.payload);
        state.selectedProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedProject, clearError } = projectsSlice.actions;
export default projectsSlice.reducer;