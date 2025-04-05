import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '../../hooks/redux';
import MainLayout from '../../layouts/MainLayout';

interface PrivateRouteProps {
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ redirectTo = '/login' }) => {
  const { isLoggedIn, isLoading } = useAppSelector(state => state.auth);
  
  // Если проверка авторизации в процессе, показываем индикатор загрузки
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // Если пользователь не аутентифицирован, перенаправляем на страницу логина
  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Если аутентифицирован, рендерим дочерние маршруты внутри MainLayout
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default PrivateRoute;