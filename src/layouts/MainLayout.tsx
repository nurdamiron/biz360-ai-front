// src/layouts/MainLayout.tsx
import React, { useEffect } from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { useAppSelector } from '../hooks/redux';
import websocketService from '../services/websocket.service';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isLoggedIn, token } = useAppSelector(state => state.auth);
  const location = useLocation();
  
  // Цвета
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  // Подключаем WebSocket при монтировании, если пользователь аутентифицирован
  useEffect(() => {
    if (isLoggedIn && token) {
      // Устанавливаем токен для WebSocket соединения
      websocketService.setAuthToken(token);
      
      // Устанавливаем соединение
      websocketService.connect();
      
      // Отключаем соединение при размонтировании
      return () => {
        websocketService.disconnect();
      };
    }
  }, [isLoggedIn, token]);
  
  // Скролл в начало страницы при навигации
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <Box minH="100vh" bg={bgColor}>
      <Header />
      <Sidebar />
      
      <Box
        ml={{ base: 0, md: { base: "80px", lg: "240px" } }}
        pt="16" // Высота Header
        transition="margin-left 0.2s ease"
      >
        <Box 
          as="main" 
          p={6} 
          maxW="1400px" 
          mx="auto"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;