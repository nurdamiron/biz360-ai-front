// src/layouts/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

// Константы для drawer
const DRAWER_WIDTH = 240;
const COLLAPSED_DRAWER_WIDTH = 64;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Оптимизации для мобильного PWA
  useEffect(() => {
    if (isMobile) {
      // Устанавливаем высоту для фиксированного размера на мобильных устройствах
      const setAppHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.body.style.height = `${window.innerHeight}px`;
        document.body.style.overflowY = 'hidden'; // Предотвращает прокрутку документа
      };
      
      // Устанавливаем обработчик при изменении размера и ориентации
      window.addEventListener('resize', setAppHeight);
      window.addEventListener('orientationchange', setAppHeight);
      
      // Инициализируем высоту
      setAppHeight();
      
      // Делаем интерфейс более похожим на мобильное приложение
      const metaTags = [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: theme.palette.primary.main }
      ];
      
      // Устанавливаем необходимые мета-теги
      metaTags.forEach(tag => {
        let metaTag = document.querySelector(`meta[name="${tag.name}"]`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('name', tag.name);
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', tag.content);
      });
      
      // Предотвращаем двойной тап для масштабирования на iOS
      document.addEventListener('touchend', (e) => {
        e.preventDefault();
      }, { passive: false });
      
      // Отменяем тянущийся эффект при прокрутке на iOS
      document.body.style.overscrollBehavior = 'none';
      
      // Очистка при размонтировании
      return () => {
        window.removeEventListener('resize', setAppHeight);
        window.removeEventListener('orientationchange', setAppHeight);
        document.removeEventListener('touchend', (e) => { e.preventDefault(); });
      };
    }
  }, [isMobile, theme]);
  
  // Обработчик переключения состояния боковой панели
  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      height: isMobile ? 'calc(var(--vh, 1vh) * 100)' : '100vh',
      overflow: 'hidden'
    }}>
      <CssBaseline />
      <Header />
      <Sidebar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { 
            xs: '100%',
            md: `calc(100% - ${isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}px)`
          },
          ml: { 
            xs: 0,
            md: `${isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}px`
          },
          mt: '64px', // Высота AppBar
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: theme.palette.background.default
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;