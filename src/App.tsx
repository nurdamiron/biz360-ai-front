import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, PaletteMode } from '@mui/material';
import { createAppTheme } from './theme';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { fetchUser } from './store/slices/authSlice';
import NotificationProvider from './components/common/NotificationProvider';

// Компоненты для маршрутизации
import PrivateRoute from './components/common/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TasksPage from './pages/tasks/TasksPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import CodePage from './pages/code/CodePage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import SettingsPage from './pages/settings/SettingsPage';

// Контекст цветовой темы
export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
  mode: 'light' as PaletteMode,
});

function App() {
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAppSelector(state => state.auth);
  
  // Состояние для выбора режима темы (светлая/темная)
  const [mode, setMode] = useState<PaletteMode>(
    localStorage.getItem('themeMode') as PaletteMode || 'light'
  );

  // Контекст для переключения цветовой темы
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode],
  );

  // Создание темы на основе выбранного режима
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  
  // Проверяем аутентификацию пользователя при загрузке приложения
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUser());
    }
  }, [dispatch, isLoggedIn]);
  
  // Настройка PWA - добавляем мета-теги для мобильных устройств
  useEffect(() => {
    // Создаем или обновляем мета-теги для PWA
    const metaTags = [
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'theme-color', content: theme.palette.primary.main }
    ];

    metaTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', tag.name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });
  }, [theme]);
  
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Приватные маршруты */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                <Route path="/code" element={<CodePage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              
              {/* Перенаправление с корневого маршрута */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Обработка несуществующих маршрутов */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;