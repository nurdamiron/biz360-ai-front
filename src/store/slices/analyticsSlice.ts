// src/store/slices/analyticsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/axios-instance';
import { DataPoint } from '../../components/analytics/LineChart';
import { BarData } from '../../components/analytics/BarChart';
import { PieData } from '../../components/analytics/PieChart';

// Интерфейсы для данных аналитики
export interface TasksStatusDistribution {
  status: string;
  count: number;
}

export interface TasksPriorityDistribution {
  priority: string;
  count: number;
}

export interface TasksCompletionStats {
  date: string;
  created: number;
  completed: number;
}

export interface TasksPerformanceStats {
  date: string;
  estimatedTime: number;
  actualTime: number;
}

export interface UserActivityStats {
  user: {
    id: number;
    name: string;
  };
  tasksCreated: number;
  tasksCompleted: number;
  codeReviewed: number;
}

export interface ProjectStats {
  id: number;
  name: string;
  tasksCount: number;
  completionRate: number;
}

export interface AnalyticsState {
  tasksStatusDistribution: TasksStatusDistribution[];
  tasksPriorityDistribution: TasksPriorityDistribution[];
  tasksCompletionTimeline: TasksCompletionStats[];
  tasksPerformanceTimeline: TasksPerformanceStats[];
  userActivityStats: UserActivityStats[];
  projectStats: ProjectStats[];
  isLoading: boolean;
  error: string | null;
}

// Интерфейс для параметров фильтрации
export interface AnalyticsFilterParams {
  startDate?: string;
  endDate?: string;
  projectId?: number;
  userId?: number;
}

// Начальное состояние
const initialState: AnalyticsState = {
  tasksStatusDistribution: [],
  tasksPriorityDistribution: [],
  tasksCompletionTimeline: [],
  tasksPerformanceTimeline: [],
  userActivityStats: [],
  projectStats: [],
  isLoading: false,
  error: null,
};

// Асинхронные экшены для загрузки данных аналитики
export const fetchTasksStatusDistribution = createAsyncThunk(
  'analytics/fetchTasksStatusDistribution',
  async (params: AnalyticsFilterParams = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ data: TasksStatusDistribution[] }>(
        '/analytics/tasks-status', 
        { params }
      );
      return data.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения данных');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

export const fetchTasksPriorityDistribution = createAsyncThunk(
  'analytics/fetchTasksPriorityDistribution',
  async (params: AnalyticsFilterParams = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ data: TasksPriorityDistribution[] }>(
        '/analytics/tasks-priority', 
        { params }
      );
      return data.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения данных');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

export const fetchTasksCompletionTimeline = createAsyncThunk(
  'analytics/fetchTasksCompletionTimeline',
  async (params: AnalyticsFilterParams = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ data: TasksCompletionStats[] }>(
        '/analytics/tasks-completion-timeline', 
        { params }
      );
      return data.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения данных');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

export const fetchTasksPerformanceTimeline = createAsyncThunk(
  'analytics/fetchTasksPerformanceTimeline',
  async (params: AnalyticsFilterParams = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ data: TasksPerformanceStats[] }>(
        '/analytics/tasks-performance-timeline', 
        { params }
      );
      return data.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения данных');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

export const fetchUserActivityStats = createAsyncThunk(
  'analytics/fetchUserActivityStats',
  async (params: AnalyticsFilterParams = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ data: UserActivityStats[] }>(
        '/analytics/user-activity', 
        { params }
      );
      return data.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения данных');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

export const fetchProjectStats = createAsyncThunk(
  'analytics/fetchProjectStats',
  async (params: AnalyticsFilterParams = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ data: ProjectStats[] }>(
        '/analytics/project-stats', 
        { params }
      );
      return data.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения данных');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

// Помощники для преобразования данных для компонентов визуализации
export const toLineChartData = (data: { date: string; value: number }[]): DataPoint[] => {
  return data.map(item => ({
    date: item.date,
    value: item.value,
    label: new Date(item.date).toLocaleDateString()
  }));
};

export const toBarChartData = (data: { label: string; value: number }[]): BarData[] => {
  return data.map(item => ({
    label: item.label,
    value: item.value
  }));
};

export const toPieChartData = (data: { label: string; value: number }[]): PieData[] => {
  return data.map(item => ({
    label: item.label,
    value: item.value
  }));
};

// Создаем слайс
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Очистка ошибок
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Распределение задач по статусам
    builder
      .addCase(fetchTasksStatusDistribution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasksStatusDistribution.fulfilled, (state, action: PayloadAction<TasksStatusDistribution[]>) => {
        state.isLoading = false;
        state.tasksStatusDistribution = action.payload;
      })
      .addCase(fetchTasksStatusDistribution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Распределение задач по приоритетам
    builder
      .addCase(fetchTasksPriorityDistribution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasksPriorityDistribution.fulfilled, (state, action: PayloadAction<TasksPriorityDistribution[]>) => {
        state.isLoading = false;
        state.tasksPriorityDistribution = action.payload;
      })
      .addCase(fetchTasksPriorityDistribution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Таймлайн выполнения задач
    builder
      .addCase(fetchTasksCompletionTimeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasksCompletionTimeline.fulfilled, (state, action: PayloadAction<TasksCompletionStats[]>) => {
        state.isLoading = false;
        state.tasksCompletionTimeline = action.payload;
      })
      .addCase(fetchTasksCompletionTimeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Таймлайн производительности
    builder
      .addCase(fetchTasksPerformanceTimeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasksPerformanceTimeline.fulfilled, (state, action: PayloadAction<TasksPerformanceStats[]>) => {
        state.isLoading = false;
        state.tasksPerformanceTimeline = action.payload;
      })
      .addCase(fetchTasksPerformanceTimeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Статистика активности пользователей
    builder
      .addCase(fetchUserActivityStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserActivityStats.fulfilled, (state, action: PayloadAction<UserActivityStats[]>) => {
        state.isLoading = false;
        state.userActivityStats = action.payload;
      })
      .addCase(fetchUserActivityStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Статистика по проектам
    builder
      .addCase(fetchProjectStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectStats.fulfilled, (state, action: PayloadAction<ProjectStats[]>) => {
        state.isLoading = false;
        state.projectStats = action.payload;
      })
      .addCase(fetchProjectStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;