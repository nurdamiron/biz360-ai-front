// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import projectsReducer from './slices/projectsSlice';

// Настройка глобального store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    projects: projectsReducer,
    // Здесь будут добавляться другие редьюсеры
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем неконвертируемые значения в состояниях
        ignoredActions: ['some-action/containing-non-serializable-value'],
        ignoredPaths: ['some.path.with.non.serializable.value'],
      },
    }),
});

// Определение типов для store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;