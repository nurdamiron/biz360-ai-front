import React, { useEffect, useMemo, useState, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, PaletteMode, CssBaseline } from '@mui/material';
import { ruRU } from '@mui/material/locale';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { fetchUser } from './store/slices/authSlice';
import { SnackbarProvider } from 'notistack';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import useWebSocketIntegration from './hooks/useWebSocketIntegration';

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

// Тема и стили
import { getDesignTokens } from './theme';

// Контекст цветовой темы
export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
  mode: 'light' as PaletteMode,
});



function App() {
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAppSelector(state => state.auth);
  
  useWebSocketIntegration();

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
  const theme = useMemo(() => 
    createTheme(getDesignTokens(mode), ruRU), 
    [mode]
  );
  
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
      { name: 'theme-color', content: theme.palette.primary.main },
      { name: 'format-detection', content: 'telephone=no' }
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

    // Добавляем стили для устранения резиновых эффектов на iOS
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      body {
        position: fixed;
        width: 100%;
        height: 100%;
        overflow: hidden;
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      
      #root {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
      }
      
      * {
        -webkit-touch-callout: none;
      }
    `;
    document.head.appendChild(styleElement);
  }, [theme]);
  

  // В функции App добавьте следующий useEffect для настройки PWA
useEffect(() => {
  // Определяем, является ли устройство мобильным
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Определяем, запущено ли приложение в режиме PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true;
  
  if (isMobile) {
    // Настройки для мобильных устройств
    document.body.classList.add('mobile-device');
    
    if (isPWA) {
      document.body.classList.add('pwa-mode');
      
      // Дополнительные настройки для PWA режима
      document.addEventListener('gesturestart', (e) => {
        e.preventDefault(); // Предотвращает масштабирование жестами на iOS
      });
    }
    
    // Установка правильной высоты viewport для мобильных устройств
    const setAppHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', () => {
      // Небольшая задержка для iOS
      setTimeout(setAppHeight, 100);
    });
    
    return () => {
      window.removeEventListener('resize', setAppHeight);
      window.removeEventListener('orientationchange', setAppHeight);
    };
  }
}, []);

// Добавьте этот хук useLayoutEffect перед рендерингом, чтобы предотвратить мерцание при загрузке
useLayoutEffect(() => {
  // Устанавливаем режим отображения сразу при монтировании
  const setInitialDisplayMode = () => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true;
    
    if (isPWA) {
      document.body.classList.add('pwa-mode');
      
      // Скрываем адресную строку браузера в iOS
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.scrollTo(0, 0);
      }
    }
  };
  
  setInitialDisplayMode();
}, []);
  // Настраиваем референс для SnackbarProvider
  const notistackRef = React.createRef<SnackbarProvider>();
  
  // Функция для закрытия снэкбаров
  const onClickDismiss = (key: string | number) => {
    notistackRef.current?.closeSnackbar(key);
  };
  
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          ref={notistackRef}
          maxSnack={3}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          action={(key) => (
            <IconButton 
              size="small" 
              onClick={() => onClickDismiss(key)}
              color="inherit"
            >
              <CloseIcon />
            </IconButton>
          )}
        >
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
        </SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;