// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AuthService from '../../services/auth.service';
import { AuthState, User } from '../../types/user.types';
import websocketService from '../../services/websocket.service';

// Начальное состояние
const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('auth_token'),
    isLoggedIn: !!localStorage.getItem('auth_token'), // исправлено с 'authtoken'
    isLoading: false,
    error: null,
  };

// Асинхронный экшен для логина
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await AuthService.login({ username, password });
      
      // Устанавливаем токен для WebSocket сервиса
      if (response.token) {
        websocketService.setAuthToken(response.token);
        
        // Подключаемся к WebSocket после успешной авторизации
        websocketService.connect();
      }
      
      return response;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка авторизации');
      }
      return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
    }
  }
);

// Асинхронный экшен для получения данных пользователя
export const fetchUser = createAsyncThunk(
    'auth/fetchUser',
    async (_, { rejectWithValue }) => { // добавлен параметр '_'
      try {
        return await AuthService.getUser();
      } catch (error: any) {
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data.message || 'Ошибка получения данных пользователя');
        }
        return rejectWithValue('Ошибка сети. Пожалуйста, проверьте соединение.');
      }
    }
  );

// Асинхронный экшен для выхода из системы
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    // Отключаем WebSocket перед выходом
    websocketService.disconnect();
    
    // Выход из системы
    AuthService.logout();
    
    return null;
  }
);

// Создаем слайс
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Действие для очистки ошибок
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Обработка логина
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Обработка получения данных пользователя
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Обработка выхода из системы
    builder
      .addCase(logout.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.token = null;
        state.user = null;
      });
  },
});

// Экспорт экшенов и редьюсера
export const { clearError } = authSlice.actions;
export default authSlice.reducer;