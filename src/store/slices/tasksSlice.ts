// src/store/slices/tasksSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskState, TaskFilterParams, TaskLogParams, CodeReviewRequest } from '../../types/task.types';
import TaskService from '../../api/services/task.service';
import { enqueueSnackbar } from 'notistack';

// Начальное состояние
const initialState: TaskState = {
  tasks: [],
  selectedTask: null,
  isLoading: false,
  error: null
};

// Асинхронные действия
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: TaskFilterParams = {}, { rejectWithValue }) => {
    try {
      const response = await TaskService.getTasks(params);
      return response.items;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке задач');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id: number, { rejectWithValue }) => {
    try {
      const task = await TaskService.getTaskById(id);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке задачи');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: any, { rejectWithValue }) => {
    try {
      const task = await TaskService.createTask(taskData);
      enqueueSnackbar('Задача успешно создана', { variant: 'success' });
      return task;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при создании задачи');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: number; data: Partial<Task> }, { rejectWithValue }) => {
    try {
      const task = await TaskService.updateTask(id, data);
      enqueueSnackbar('Задача успешно обновлена', { variant: 'success' });
      return task;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении задачи');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: number, { rejectWithValue }) => {
    try {
      const success = await TaskService.deleteTask(id);
      if (success) {
        enqueueSnackbar('Задача успешно удалена', { variant: 'success' });
      }
      return { id, success };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении задачи');
    }
  }
);

export const fetchTaskLogs = createAsyncThunk(
  'tasks/fetchTaskLogs',
  async (params: TaskLogParams, { rejectWithValue }) => {
    try {
      const logs = await TaskService.getTaskLogs(params);
      return logs;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке логов задачи');
    }
  }
);

export const processTask = createAsyncThunk(
  'tasks/processTask',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const result = await TaskService.processTask(taskId);
      enqueueSnackbar('Задача отправлена на обработку AI-ассистентом', { variant: 'info' });
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обработке задачи');
    }
  }
);

export const reviewCode = createAsyncThunk(
  'tasks/reviewCode',
  async (reviewData: CodeReviewRequest, { rejectWithValue }) => {
    try {
      const result = await TaskService.reviewCode(reviewData);
      const statusMsg = reviewData.status === 'approved' ? 'одобрен' : 'отклонен';
      enqueueSnackbar(`Код успешно ${statusMsg}`, { variant: 'success' });
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при проверке кода');
    }
  }
);

// Создаем slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Очистка выбранной задачи
    clearSelectedTask(state) {
      state.selectedTask = null;
    },
    // Обновление задачи от WebSocket
    updateTaskFromWebSocket(state, action: PayloadAction<Task>) {
      const task = action.payload;
      // Обновление в списке задач
      const index = state.tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        state.tasks[index] = task;
      } else {
        // Если задачи нет в списке, добавляем её
        state.tasks.push(task);
      }
      // Обновление выбранной задачи, если она открыта
      if (state.selectedTask && state.selectedTask.id === task.id) {
        // Сохраняем логи текущей задачи, если они есть
        const currentLogs = state.selectedTask.logs || [];
        
        // Объединяем данные обновленной задачи с сохранением логов
        state.selectedTask = {
          ...task,
          logs: task.logs ? task.logs : currentLogs
        };
      }
    },
    // Добавление лога задачи от WebSocket
    addTaskLogFromWebSocket(state, action: PayloadAction<{ taskId: number; log: any }>) {
      const { taskId, log } = action.payload;
      
      // Добавляем лог к выбранной задаче, если она открыта
      if (state.selectedTask && state.selectedTask.id === taskId) {
        if (!state.selectedTask.logs) {
          state.selectedTask.logs = [];
        }
        
        // Проверяем, есть ли уже такой лог
        const existingLogIndex = state.selectedTask.logs.findIndex(l => l.id === log.id);
        
        if (existingLogIndex !== -1) {
          // Обновляем существующий лог
          state.selectedTask.logs[existingLogIndex] = log;
        } else {
          // Добавляем новый лог в начало массива для хронологического порядка
          state.selectedTask.logs.unshift(log);
          
          // Ограничиваем количество логов в состоянии для предотвращения проблем с производительностью
          if (state.selectedTask.logs.length > 100) {
            state.selectedTask.logs = state.selectedTask.logs.slice(0, 100);
          }
        }
      }
      
      // Также можно обновить задачу в общем списке, чтобы отразить последний статус
      const taskIndex = state.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        // Обновляем прогресс или статус задачи на основе лога
        if (log.progress !== undefined) {
          state.tasks[taskIndex].progress = log.progress;
        }
        
        if (log.status) {
          state.tasks[taskIndex].status = log.status;
        }
      }
    },
    
    // Обновление статуса задачи от WebSocket
    updateTaskStatusFromWebSocket(state, action: PayloadAction<{ taskId: number; status: string }>) {
      const { taskId, status } = action.payload;
      // Обновляем статус в списке задач
      const taskIndex = state.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].status = status as any;
      }
      // Обновляем статус выбранной задачи, если она открыта
      if (state.selectedTask && state.selectedTask.id === taskId) {
        state.selectedTask.status = status as any;
      }
    }
  },
  extraReducers: (builder) => {
    // Обработка загрузки списка задач
    builder.addCase(fetchTasks.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks = action.payload;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Обработка загрузки конкретной задачи
    builder.addCase(fetchTaskById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTaskById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedTask = action.payload;
    });
    builder.addCase(fetchTaskById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Обработка создания задачи
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.tasks.unshift(action.payload);
    });
    
    // Обработка обновления задачи
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      // Обновляем выбранную задачу если она открыта
      if (state.selectedTask && state.selectedTask.id === action.payload.id) {
        state.selectedTask = action.payload;
      }
    });
    
    // Обработка удаления задачи
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      if (action.payload.success) {
        state.tasks = state.tasks.filter(task => task.id !== action.payload.id);
        // Очищаем выбранную задачу если она была удалена
        if (state.selectedTask && state.selectedTask.id === action.payload.id) {
          state.selectedTask = null;
        }
      }
    });
    
    // Обработка загрузки логов задачи
    builder.addCase(fetchTaskLogs.fulfilled, (state, action) => {
      // Если есть выбранная задача, добавляем в нее логи
      if (state.selectedTask && action.payload.taskId === state.selectedTask.id) {
        state.selectedTask.logs = action.payload.logs;
      }
    });
  }
});

// Экспортируем actions и reducer
export const { 
  clearSelectedTask, 
  updateTaskFromWebSocket, 
  addTaskLogFromWebSocket,
  updateTaskStatusFromWebSocket
} = tasksSlice.actions;

export default tasksSlice.reducer;