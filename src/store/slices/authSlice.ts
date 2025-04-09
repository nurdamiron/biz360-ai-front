// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginCredentials } from '../../types/user.types';
import AuthService from '../../api/services/auth.service';
import websocketService from '../../api/services/websocket.service';
import { enqueueSnackbar } from 'notistack';

// Функция для проверки срока действия JWT токена
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    // Разбираем JWT токен
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp в JWT хранится в секундах
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    // Если не удалось разобрать токен, считаем его недействительным
    console.error('Ошибка при проверке токена:', e);
    return false;
  }
};

// Получаем токен и проверяем его действительность
const storedToken = localStorage.getItem('auth_token');
const tokenIsValid = isTokenValid(storedToken);

// Если токен недействителен, удаляем его
if (storedToken && !tokenIsValid) {
  localStorage.removeItem('auth_token');
}

// Начальное состояние
const initialState: AuthState = {
  user: null,
  token: tokenIsValid ? storedToken : null,
  isLoggedIn: tokenIsValid,
  isLoading: false,
  error: null
};

// Проверка статуса аутентификации при загрузке приложения
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Проверяем наличие и действительность токена
      const token = localStorage.getItem('auth_token');
      if (!token || !isTokenValid(token)) {
        localStorage.removeItem('auth_token');
        return rejectWithValue('Необходима авторизация');
      }
      
      // Получаем данные пользователя
      const userData = await AuthService.getCurrentUser();
      
      // Подключаем WebSocket при подтверждении авторизации
      websocketService.setAuthToken(token);
      websocketService.connect();
      
      return userData;
    } catch (error: any) {
      // При ошибке очищаем токен
      localStorage.removeItem('auth_token');
      console.error('Ошибка проверки аутентификации:', error);
      return rejectWithValue('Сессия истекла. Необходима повторная авторизация');
    }
  }
);

// Асинхронное действие для входа в систему
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      
      // Проверяем полученный токен
      if (!response.token) {
        return rejectWithValue('Токен не получен от сервера');
      }
      
      // Сохраняем токен в localStorage
      localStorage.setItem('auth_token', response.token);
      
      // Подключаем WebSocket
      websocketService.setAuthToken(response.token);
      websocketService.connect();
      
      return response;
    } catch (error: any) {
      console.error('Ошибка при входе:', error);
      return rejectWithValue(error.message || 'Ошибка при входе в систему');
    }
  }
);

// Получение данных текущего пользователя
export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Проверяем наличие токена в состоянии
      const { auth } = getState() as { auth: AuthState };
      if (!auth.token || !isTokenValid(auth.token)) {
        return rejectWithValue('Необходима авторизация');
      }
      
      const user = await AuthService.getCurrentUser();
      return user;
    } catch (error: any) {
      console.error('Ошибка при получении данных пользователя:', error);
      // Если сервер вернул 401, возможно токен истек
      if (error.status === 401) {
        localStorage.removeItem('auth_token');
      }
      return rejectWithValue(error.message || 'Ошибка при получении данных пользователя');
    }
  }
);

// Обновление токена
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AuthService.refreshToken();
      
      // Обновляем WebSocket соединение
      websocketService.setAuthToken(token);
      websocketService.reconnect();
      
      return { token };
    } catch (error: any) {
      console.error('Ошибка при обновлении токена:', error);
      return rejectWithValue(error.message || 'Ошибка при обновлении токена');
    }
  }
);

// Выход из системы
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Отключаем WebSocket
      websocketService.disconnect();
      
      // Выполняем выход на сервере
      await AuthService.logout();
      
      // Удаляем токен
      localStorage.removeItem('auth_token');
      
      // Показываем уведомление
      enqueueSnackbar('Вы успешно вышли из системы', { 
        variant: 'info',
        autoHideDuration: 3000
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
      // Удаляем токен даже при ошибке
      localStorage.removeItem('auth_token');
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
      localStorage.setItem('auth_token', action.payload);
    },
    
    // Установка пользователя вручную
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isLoggedIn = !!state.token;
    }
  },
  extraReducers: (builder) => {
    // Обработка проверки статуса аутентификации
    builder.addCase(checkAuthStatus.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkAuthStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isLoggedIn = true;
    });
    builder.addCase(checkAuthStatus.rejected, (state) => {
      state.isLoading = false;
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
    });
    
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
      if (action.meta.rejectedWithValue) {
        state.isLoggedIn = false;
        state.token = null;
      }
    });
    
    // Обработка обновления токена
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.isLoggedIn = true;
    });
    builder.addCase(refreshToken.rejected, (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
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