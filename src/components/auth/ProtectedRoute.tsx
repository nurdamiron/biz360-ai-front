// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';

const ProtectedRoute: React.FC = () => {
  const { isLoggedIn } = useAppSelector(state => state.auth);
  const location = useLocation();
  
  if (!isLoggedIn) {
    // Перенаправляем на страницу входа, сохраняя текущий URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Если пользователь авторизован, отображаем дочерние маршруты
  return <Outlet />;
};

export default ProtectedRoute;