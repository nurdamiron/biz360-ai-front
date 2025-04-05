// src/store/slices/tasksSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/axios-instance';
import { 
  Task, TaskState, CreateTaskRequest, TaskLogParams, 
  TaskLogsResponse, TaskLog 
} from '../../types/task.types';
import { 
  ApiResponse, PaginatedResponse, TaskFilterParams,
  ProcessTaskRequest, ProcessTaskResponse, CodeReviewRequest
} from '../../types/api.types';

// Начальное состояние
const initialState: TaskState = {
  tasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
};

// Асинхронный экшен для получения списка задач
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: TaskFilterParams = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params });
      return data.items;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения задач');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

// Асинхронный экшен для получения задачи по ID
export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`);
      return data.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения задачи');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

// Асинхронный экшен для создания задачи
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskRequest, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Task>>('/tasks', taskData);
      return data.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка создания задачи');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

// Асинхронный экшен для получения логов задачи
export const fetchTaskLogs = createAsyncThunk(
  'tasks/fetchTaskLogs',
  async (params: TaskLogParams, { rejectWithValue }) => {
    try {
      const { taskId, ...restParams } = params;
      const { data } = await apiClient.get<TaskLogsResponse>(
        `/logs/task/${taskId}`, 
        { params: restParams }
      );
      return data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения логов задачи');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

// Асинхронный экшен для запуска обработки задачи
export const processTask = createAsyncThunk(
  'tasks/processTask',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const requestData: ProcessTaskRequest = { taskId };
      const { data } = await apiClient.post<ProcessTaskResponse>(
        '/ai-assistant/process-task', 
        requestData
      );
      return data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка запуска обработки задачи');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

// Асинхронный экшен для утверждения/отклонения кода
export const reviewCode = createAsyncThunk(
  'tasks/reviewCode',
  async (reviewData: CodeReviewRequest, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<ApiResponse<any>>(
        '/ai-assistant/review-code', 
        reviewData
      );
      return data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка отправки ревью кода');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

// Создаем слайс
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Очистка выбранной задачи
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
    
    // Очистка ошибок
    clearError: (state) => {
      state.error = null;
    },
    
    // Обновление задачи при получении сообщения по WebSocket
    updateTaskFromWebSocket: (state, action: PayloadAction<Task>) => {
      const updatedTask = action.payload;
      
      // Обновляем задачу в общем списке
      const taskIndex = state.tasks.findIndex(task => task.id === updatedTask.id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = updatedTask;
      }
      
      // Если это текущая выбранная задача, обновляем её
      if (state.selectedTask && state.selectedTask.id === updatedTask.id) {
        state.selectedTask = updatedTask;
      }
    },
    
    // Добавление лога по WebSocket
    addTaskLogFromWebSocket: (state, action: PayloadAction<{ taskId: number, log: TaskLog }>) => {
      const { taskId, log } = action.payload;
      
      // Если это текущая выбранная задача, добавляем лог
      if (state.selectedTask && state.selectedTask.id === taskId) {
        if (!state.selectedTask.logs) {
          state.selectedTask.logs = [];
        }
        state.selectedTask.logs.push(log);
      }
    }
  },
  extraReducers: (builder) => {
    // Обработка получения списка задач
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Обработка получения задачи по ID
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action: PayloadAction<Task | undefined>) => {
        state.isLoading = false;
        if (action.payload) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Обработка создания задачи
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task | undefined>) => {
        state.isLoading = false;
        if (action.payload) {
          state.tasks.push(action.payload);
          state.selectedTask = action.payload;
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Экспорт экшенов и редьюсера
export const { 
  clearSelectedTask, 
  clearError, 
  updateTaskFromWebSocket,
  addTaskLogFromWebSocket
} = tasksSlice.actions;
export default tasksSlice.reducer;