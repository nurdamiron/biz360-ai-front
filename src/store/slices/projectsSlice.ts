// src/store/slices/projectsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectFilterParams } from '../../types/project.types';
import ProjectService from '../../api/services/project.service';
import { enqueueSnackbar } from 'notistack';

// Интерфейс состояния проектов
interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null
};

// Асинхронные действия
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params: ProjectFilterParams = {}, { rejectWithValue }) => {
    try {
      const response = await ProjectService.getProjects(params);
      return response.items;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке проектов');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id: number, { rejectWithValue }) => {
    try {
      const project = await ProjectService.getProjectById(id);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке проекта');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: Partial<Project>, { rejectWithValue }) => {
    try {
      const project = await ProjectService.createProject(projectData);
      enqueueSnackbar('Проект успешно создан', { variant: 'success' });
      return project;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при создании проекта');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: number; data: Partial<Project> }, { rejectWithValue }) => {
    try {
      const project = await ProjectService.updateProject(id, data);
      enqueueSnackbar('Проект успешно обновлен', { variant: 'success' });
      return project;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении проекта');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: number, { rejectWithValue }) => {
    try {
      const success = await ProjectService.deleteProject(id);
      if (success) {
        enqueueSnackbar('Проект успешно удален', { variant: 'success' });
      }
      return { id, success };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении проекта');
    }
  }
);

// Создаем slice
const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Очистка выбранного проекта
    clearSelectedProject(state) {
      state.selectedProject = null;
    },
    
    // Обновление проекта от WebSocket
    updateProjectFromWebSocket(state, action: PayloadAction<Project>) {
      const project = action.payload;
      // Обновление в списке проектов
      const index = state.projects.findIndex(p => p.id === project.id);
      if (index !== -1) {
        state.projects[index] = project;
      }
      // Обновление выбранного проекта, если он открыт
      if (state.selectedProject && state.selectedProject.id === project.id) {
        state.selectedProject = project;
      }
    }
  },
  extraReducers: (builder) => {
    // Обработка загрузки списка проектов
    builder.addCase(fetchProjects.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.isLoading = false;
      state.projects = action.payload;
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Обработка загрузки конкретного проекта
    builder.addCase(fetchProjectById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProjectById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedProject = action.payload;
    });
    builder.addCase(fetchProjectById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Обработка создания проекта
    builder.addCase(createProject.fulfilled, (state, action) => {
      state.projects.unshift(action.payload);
    });
    
    // Обработка обновления проекта
    builder.addCase(updateProject.fulfilled, (state, action) => {
      const index = state.projects.findIndex(project => project.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      // Обновляем выбранный проект если он открыт
      if (state.selectedProject && state.selectedProject.id === action.payload.id) {
        state.selectedProject = action.payload;
      }
    });
    
    // Обработка удаления проекта
    builder.addCase(deleteProject.fulfilled, (state, action) => {
      if (action.payload.success) {
        state.projects = state.projects.filter(project => project.id !== action.payload.id);
        // Очищаем выбранный проект если он был удален
        if (state.selectedProject && state.selectedProject.id === action.payload.id) {
          state.selectedProject = null;
        }
      }
    });
  }
});

// Экспортируем actions и reducer
export const { clearSelectedProject, updateProjectFromWebSocket } = projectsSlice.actions;
export default projectsSlice.reducer;