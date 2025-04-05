// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginCredentials } from '../../types/user.types';
import AuthService from '../../api/services/auth.service';
import websocketService from '../../api/services/websocket.service';
import { enqueueSnackbar } from 'notistack';

// Начальное состояние
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoggedIn: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null
};

// Асинхронные действия (thunks)
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      
      // Подключаем WebSocket при успешной авторизации
      if (response.token) {
        websocketService.setAuthToken(response.token);
        websocketService.connect();
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при входе в систему');
    }
  }
);

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await AuthService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при получении данных пользователя');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AuthService.refreshToken();
      return { token };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении токена');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Отключаем WebSocket при выходе
      websocketService.disconnect();
      
      // Выполняем выход
      AuthService.logout();
      
      // Показываем уведомление
      enqueueSnackbar('Вы успешно вышли из системы', { 
        variant: 'info',
        autoHideDuration: 3000
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
      return false;
    }
  }
);

// Создаем slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Очистка сообщения об ошибке
    clearError(state) {
      state.error = null;
    },
    
    // Установка токена вручную
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.isLoggedIn = true;
    },
    
    // Установка пользователя вручную
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isLoggedIn = true;
    }
  },
  extraReducers: (builder) => {
    // Обработка входа в систему
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Обработка получения пользователя
    builder.addCase(fetchUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isLoggedIn = true;
    });
    builder.addCase(fetchUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Обработка обновления токена
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.token = action.payload.token;
    });
    
    // Обработка выхода
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
    });
  }
});

// Экспорт actions и reducer
export const { clearError, setToken, setUser } = authSlice.actions;
export default authSlice.reducer;