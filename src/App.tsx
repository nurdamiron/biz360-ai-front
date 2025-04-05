// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { fetchUser } from './store/slices/authSlice';

// Компоненты для маршрутизации
import PrivateRoute from './components/common/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TasksPage from './pages/tasks/TasksPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';

function App() {
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAppSelector(state => state.auth);
  
  // Проверяем аутентификацию пользователя при загрузке приложения
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUser());
    }
  }, [dispatch, isLoggedIn]);
  
  return (
    <ChakraProvider theme={theme}>
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
            
            {/* Пока не реализованные страницы перенаправляют на дашборд */}
            <Route path="/code" element={<Navigate to="/dashboard" replace />} />
            <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
            <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          {/* Перенаправление с корневого маршрута */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Обработка несуществующих маршрутов */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;