// src/components/layout/Sidebar.tsx
import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  IconButton, 
  useTheme, 
  useMediaQuery,
  Collapse
} from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { UserRole } from '../../types/user.types';

// Material UI иконки
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CodeIcon from '@mui/icons-material/Code';
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';

// Интерфейс для пункта меню
interface NavItemProps {
  icon: React.ReactElement;
  to: string;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
}

// Компонент пункта меню
const NavItem: React.FC<NavItemProps> = ({ 
  icon, 
  label, 
  to, 
  isActive = false,
  isCollapsed = false,
  onClick
}) => {
  const theme = useTheme();
  
  return (
    <ListItem 
      disablePadding 
      sx={{ 
        display: 'block',
        mb: 0.5
      }}
    >
      <ListItemButton
        component={NavLink}
        to={to}
        onClick={onClick}
        selected={isActive}
        sx={{
          minHeight: 48,
          justifyContent: isCollapsed ? 'center' : 'initial',
          px: 2.5,
          borderRadius: 1,
          mx: 1,
          '&.Mui-selected': {
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            color: theme.palette.primary.main,
            '& .MuiListItemIcon-root': {
              color: theme.palette.primary.main,
            }
          }
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: isCollapsed ? 0 : 3,
            justifyContent: 'center',
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={label} 
          sx={{ 
            opacity: isCollapsed ? 0 : 1,
            display: isCollapsed ? 'none' : 'block'
          }} 
        />
      </ListItemButton>
    </ListItem>
  );
};

// Константы для drawer
const DRAWER_WIDTH = 240;
const COLLAPSED_DRAWER_WIDTH = 64;

// Основной компонент боковой панели
const Sidebar: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAppSelector(state => state.auth);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  // Определяем ширину для медиа-запросов
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
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
  
  // Обработчик сворачивания/разворачивания бокового меню
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Обработчик открытия/закрытия мобильного меню
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Закрываем мобильное меню при выборе пункта
  const handleNavItemClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  // Пункты меню
  const menuItems = [
    { label: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard', role: UserRole.VIEWER },
    { label: 'Проекты', icon: <FolderIcon />, path: '/projects', role: UserRole.VIEWER },
    { label: 'Задачи', icon: <AssignmentIcon />, path: '/tasks', role: UserRole.VIEWER },
    { label: 'Код', icon: <CodeIcon />, path: '/code', role: UserRole.DEVELOPER },
    { label: 'Аналитика', icon: <InsightsIcon />, path: '/analytics', role: UserRole.MANAGER },
    { label: 'Настройки', icon: <SettingsIcon />, path: '/settings', role: UserRole.VIEWER },
  ];
  
  // Содержимое бокового меню
  const drawerContent = (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: theme.spacing(0, 1),
          ...theme.mixins.toolbar
        }}
      >
        {!isCollapsed && <Box sx={{ pl: 2 }}></Box>}
        <IconButton onClick={handleToggleCollapse} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {isCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          canAccess(item.role) && (
            <NavItem 
              key={item.label} 
              icon={item.icon} 
              label={item.label} 
              to={item.path} 
              isActive={isActive(item.path)}
              isCollapsed={isCollapsed}
              onClick={handleNavItemClick}
            />
          )
        ))}
      </List>
    </Box>
  );
  
  return (
    <>
      {/* Десктопная боковая панель */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
      
      {/* Мобильная боковая панель */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;