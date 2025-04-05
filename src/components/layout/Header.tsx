// src/components/layout/Header.tsx
import React from 'react';
import { 
  Box, Flex, Text, Button, Avatar, Menu, 
  MenuButton, MenuList, MenuItem, Icon,
} from '@chakra-ui/react';

import { useColorMode, IconButton, HStack, Select, useDisclosure } from '@chakra-ui/react';


import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { Environment, getCurrentEnvironment, setEnvironment } from '../../config/api.config';
import WebSocketIndicator from '../common/WebSocketIndicator';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const SunIcon = () => <span>☀️</span>;
const MoonIcon = () => <span>🌙</span>;
const MenuIcon = () => <span>≡</span>;

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Состояние для мобильного меню
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Состояние для окружения
  const [environment, setCurrentEnvironment] = React.useState<Environment>(getCurrentEnvironment());
  
  // Обработчик выхода из системы
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  // Обработчик изменения окружения
  const handleEnvironmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEnv = e.target.value as Environment;
    setCurrentEnvironment(newEnv);
    setEnvironment(newEnv);
    // Перезагрузка страницы для применения изменений
    window.location.reload();
  };
  
  return (
    <Box 
      as="header" 
      bg={colorMode === 'light' ? 'white' : 'gray.800'} 
      boxShadow="sm" 
      position="fixed"
      top="0"
      width="100%"
      zIndex="1000"
    >
      <Flex 
        alignItems="center" 
        justifyContent="space-between" 
        maxW="1400px" 
        mx="auto" 
        px={4} 
        py={2}
      >
        {/* Логотип и название */}
        <Flex alignItems="center">
          <Text fontSize="xl" fontWeight="bold" color="primary.500">
            Biz360 CRM
          </Text>
          <Text ml={2} fontSize="sm" color="gray.500">
            ИИ-Ассистент
          </Text>
        </Flex>
        
        {/* Центральные элементы */}
        <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
          <WebSocketIndicator />
          
          <Select 
            size="sm" 
            value={environment} 
            onChange={handleEnvironmentChange}
            width="auto"
            bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
          >
            <option value={Environment.LOCAL}>Локальный сервер</option>
            <option value={Environment.PRODUCTION}>Промышленный сервер</option>
          </Select>
        </HStack>
        
        {/* Пользовательское меню */}
        <HStack spacing={2}>
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          />
          
          {user && (
            <Menu>
              <MenuButton 
                as={Button} 
                variant="unstyled" 
                display="flex" 
                alignItems="center"
              >
                <Avatar size="sm" name={user.username} src={user.avatarUrl} />
              </MenuButton>
              <MenuList>
                <MenuItem>Профиль</MenuItem>
                <MenuItem>Настройки</MenuItem>
                <MenuItem onClick={handleLogout}>Выйти</MenuItem>
              </MenuList>
            </Menu>
          )}
          
          {/* Мобильное меню */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Open menu"
            icon={<MenuIcon />}
            onClick={onOpen}
            variant="ghost"
            size="sm"
          />
        </HStack>
      </Flex>
      
      {/* Мобильное меню (при необходимости) */}
      {isOpen && (
        <Box
          display={{ base: 'block', md: 'none' }}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          p={4}
          shadow="md"
        >
          <WebSocketIndicator />
          
          <Select 
            size="sm" 
            value={environment} 
            onChange={handleEnvironmentChange}
            width="full"
            mt={2}
            bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
          >
            <option value={Environment.LOCAL}>Локальный сервер</option>
            <option value={Environment.PRODUCTION}>Промышленный сервер</option>
          </Select>
        </Box>
      )}
    </Box>
  );
};

export default Header;