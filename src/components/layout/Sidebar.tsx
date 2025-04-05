// src/components/layout/Sidebar.tsx
import React from 'react';
import { 
  Box, Flex, VStack, Text, Icon, Divider, 
  useColorMode, IconButton, Collapse,
  useDisclosure, BoxProps
} from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { UserRole } from '../../types/user.types';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const DashboardIcon = () => <span>📊</span>;
const ProjectsIcon = () => <span>📁</span>;
const TasksIcon = () => <span>📝</span>;
const CodeIcon = () => <span>💻</span>;
const AnalyticsIcon = () => <span>📈</span>;
const SettingsIcon = () => <span>⚙️</span>;
const MenuIcon = () => <span>≡</span>;

// Интерфейс для пункта меню
interface NavItemProps extends BoxProps {
  icon: React.ReactNode;
  to: string;
  children: React.ReactNode;
  isActive?: boolean;
}

// Компонент пункта меню
const NavItem: React.FC<NavItemProps> = ({ 
  icon, 
  children, 
  to, 
  isActive,
  ...rest 
}) => {
  const { colorMode } = useColorMode();
  
  return (
    <Box
      as={NavLink}
      to={to}
      p={3}
      borderRadius="md"
      transition="all 0.2s"
      fontWeight="medium"
      bg={isActive ? 'primary.50' : 'transparent'}
      color={isActive ? 'primary.500' : colorMode === 'light' ? 'gray.700' : 'gray.200'}
      _hover={{
        bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
        color: colorMode === 'light' ? 'gray.900' : 'white',
      }}
      width="100%"
      {...rest}
    >
      <Flex align="center">
        <Box mr={3}>
          {icon}
        </Box>
        <Text>{children}</Text>
      </Flex>
    </Box>
  );
};

// Основной компонент боковой панели
const Sidebar: React.FC = () => {
  const { colorMode } = useColorMode();
  const location = useLocation();
  const { user } = useAppSelector(state => state.auth);
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  
  // Состояние для мобильной версии
  const mobileMenuDisclosure = useDisclosure();
  
  // Проверка активности пункта меню
  const isActive = (path: string) => location.pathname === path;
  
  // Проверка прав доступа для пункта меню
  const canAccess = (requiredRole: UserRole) => {
    if (!user) return false;
    
    switch (requiredRole) {
      case UserRole.ADMIN:
        return user.role === UserRole.ADMIN;
      case UserRole.MANAGER:
        return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
      case UserRole.DEVELOPER:
        return [UserRole.ADMIN, UserRole.MANAGER, UserRole.DEVELOPER].includes(user.role);
      case UserRole.VIEWER:
      default:
        return true;
    }
  };
  
  // Содержимое меню
  const menuContent = (
    <VStack spacing={1} align="stretch" width="100%">
      <NavItem 
        icon={<DashboardIcon />} 
        to="/dashboard" 
        isActive={isActive('/dashboard')}
      >
        Дашборд
      </NavItem>
      
      <NavItem 
        icon={<ProjectsIcon />} 
        to="/projects" 
        isActive={isActive('/projects')}
      >
        Проекты
      </NavItem>
      
      <NavItem 
        icon={<TasksIcon />} 
        to="/tasks" 
        isActive={isActive('/tasks')}
      >
        Задачи
      </NavItem>
      
      {canAccess(UserRole.DEVELOPER) && (
        <NavItem 
          icon={<CodeIcon />} 
          to="/code" 
          isActive={isActive('/code')}
        >
          Код
        </NavItem>
      )}
      
      {canAccess(UserRole.MANAGER) && (
        <NavItem 
          icon={<AnalyticsIcon />} 
          to="/analytics" 
          isActive={isActive('/analytics')}
        >
          Аналитика
        </NavItem>
      )}
      
      <Divider my={2} />
      
      <NavItem 
        icon={<SettingsIcon />} 
        to="/settings" 
        isActive={isActive('/settings')}
      >
        Настройки
      </NavItem>
    </VStack>
  );
  
  return (
    <>
      {/* Мобильное меню */}
      <Box
        display={{ base: 'flex', md: 'none' }}
        position="fixed"
        top="16" // Adjust based on your header height
        left="0"
        right="0"
        zIndex="900"
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        p={2}
        borderBottomWidth="1px"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        justifyContent="center"
      >
        <IconButton
          aria-label="Toggle mobile menu"
          icon={<MenuIcon />}
          onClick={mobileMenuDisclosure.onToggle}
          variant="ghost"
        />
      </Box>
      
      <Collapse in={mobileMenuDisclosure.isOpen} animateOpacity>
        <Box
          display={{ base: 'block', md: 'none' }}
          position="fixed"
          top="24" // Adjust based on your header height + toggle button
          left="0"
          right="0"
          zIndex="900"
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          p={4}
          borderBottomWidth="1px"
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          boxShadow="md"
        >
          {menuContent}
        </Box>
      </Collapse>
      
      {/* Десктопная боковая панель */}
      <Box
        as="nav"
        position="fixed"
        top="16" // Adjust based on your header height
        left="0"
        h="calc(100vh - 16px)" // Adjust based on your header height
        w={isOpen ? "240px" : "80px"}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        borderRightWidth="1px"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        transition="width 0.2s ease"
        display={{ base: 'none', md: 'block' }}
        overflowY="auto"
        zIndex="900"
      >
        <Flex direction="column" height="full" p={4}>
          <Flex justify="flex-end" mb={4}>
            <IconButton
              aria-label="Toggle sidebar"
              icon={<MenuIcon />}
              onClick={onToggle}
              variant="ghost"
              size="sm"
            />
          </Flex>
          
          {isOpen ? (
            menuContent
          ) : (
            <VStack spacing={4} align="center">
              <NavItem 
                icon={<DashboardIcon />} 
                to="/dashboard" 
                isActive={isActive('/dashboard')}
                display="flex"
                justifyContent="center"
                p={2}
              >
                {isOpen ? 'Дашборд' : ''}
              </NavItem>
              
              <NavItem 
                icon={<ProjectsIcon />} 
                to="/projects" 
                isActive={isActive('/projects')}
                display="flex"
                justifyContent="center"
                p={2}
              >
                {isOpen ? 'Проекты' : ''}
              </NavItem>
              
              <NavItem 
                icon={<TasksIcon />} 
                to="/tasks" 
                isActive={isActive('/tasks')}
                display="flex"
                justifyContent="center"
                p={2}
              >
                {isOpen ? 'Задачи' : ''}
              </NavItem>
              
              {canAccess(UserRole.DEVELOPER) && (
                <NavItem 
                  icon={<CodeIcon />} 
                  to="/code" 
                  isActive={isActive('/code')}
                  display="flex"
                  justifyContent="center"
                  p={2}
                >
                  {isOpen ? 'Код' : ''}
                </NavItem>
              )}
              
              {canAccess(UserRole.MANAGER) && (
                <NavItem 
                  icon={<AnalyticsIcon />} 
                  to="/analytics" 
                  isActive={isActive('/analytics')}
                  display="flex"
                  justifyContent="center"
                  p={2}
                >
                  {isOpen ? 'Аналитика' : ''}
                </NavItem>
              )}
              
              <Divider my={2} />
              
              <NavItem 
                icon={<SettingsIcon />} 
                to="/settings" 
                isActive={isActive('/settings')}
                display="flex"
                justifyContent="center"
                p={2}
              >
                {isOpen ? 'Настройки' : ''}
              </NavItem>
            </VStack>
          )}
        </Flex>
      </Box>
    </>
  );
};

export default Sidebar;