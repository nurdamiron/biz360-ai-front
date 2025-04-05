// src/components/common/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import MainLayout from '../../layouts/MainLayout';

interface PrivateRouteProps {
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ redirectTo = '/login' }) => {
  const { isLoggedIn, isLoading } = useAppSelector(state => state.auth);
  
  // Если проверка авторизации в процессе, можно показать прелоадер
  if (isLoading) {
    return <div>Загрузка...</div>;
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