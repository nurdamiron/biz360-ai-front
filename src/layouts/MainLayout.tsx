import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  useMediaQuery, 
  useTheme, 
  Avatar, 
  Menu, 
  MenuItem, 
  Badge,
  Container,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import TaskIcon from '@mui/icons-material/Task';
import CodeIcon from '@mui/icons-material/Code';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link, useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import { Environment, getCurrentEnvironment, setEnvironment } from '../config/api.config';
import { ColorModeContext } from '../App';
import websocketService, { WebSocketState } from '../services/websocket.service';

// Компонент индикатора WebSocket состояния
const WebSocketIndicator = () => {
  const [state, setState] = useState<WebSocketState>(websocketService.getState());
  
  useEffect(() => {
    const handleStateChange = (event: CustomEvent) => {
      setState(event.detail.state);
    };
    
    window.addEventListener('websocket-state-changed', handleStateChange as EventListener);
    
    setState(websocketService.getState());
    
    return () => {
      window.removeEventListener('websocket-state-changed', handleStateChange as EventListener);
    };
  }, []);
  
  // Определение цвета и текста в зависимости от состояния
  const getIndicatorProps = () => {
    switch (state) {
      case WebSocketState.OPEN:
        return {
          color: 'success',
          text: 'Подключено'
        };
      case WebSocketState.CONNECTING:
        return {
          color: 'warning',
          text: 'Подключение...'
        };
      case WebSocketState.CLOSING:
        return {
          color: 'warning',
          text: 'Закрытие...'
        };
      case WebSocketState.CLOSED:
      default:
        return {
          color: 'error',
          text: 'Отключено'
        };
    }
  };
  
  const { color, text } = getIndicatorProps();
  
  return (
    <Badge color={color as 'success' | 'warning' | 'error'} variant="dot">
      <Typography variant="caption" sx={{ ml: 1 }}>
        {text}
      </Typography>
    </Badge>
  );
};

interface MainLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isLoggedIn, token, user } = useAppSelector(state => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Состояние для боковой панели и меню пользователя
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [environment, setCurrentEnvironment] = useState<Environment>(getCurrentEnvironment());
  
  // Управление экраном в полноэкранном режиме для мобильных устройств
  useEffect(() => {
    if (isMobile) {
      const handleResize = () => {
        document.documentElement.style.height = `${window.innerHeight}px`;
      };
      
      window.addEventListener('resize', handleResize);
      handleResize();
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isMobile]);
  
  // Подключаем WebSocket при монтировании, если пользователь аутентифицирован
  useEffect(() => {
    if (isLoggedIn && token) {
      websocketService.setAuthToken(token);
      websocketService.connect();
      
      return () => {
        websocketService.disconnect();
      };
    }
  }, [isLoggedIn, token]);
  
  // Скролл в начало страницы при навигации
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Обработчики для мобильного меню
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Закрываем мобильное меню после клика на пункт
  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  // Обработчики для меню пользователя
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Обработчик выхода из системы
  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    navigate('/login');
  };
  
  // Обработчик изменения окружения
  const handleEnvironmentChange = (e: SelectChangeEvent<string>) => {
    const newEnv = e.target.value as Environment;
    setCurrentEnvironment(newEnv);
    setEnvironment(newEnv);
    window.location.reload();
  };
  
  // Пункты боковой навигации
  const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Проекты', icon: <FolderIcon />, path: '/projects' },
    { text: 'Задачи', icon: <TaskIcon />, path: '/tasks' },
    { text: 'Код', icon: <CodeIcon />, path: '/code' },
    { text: 'Аналитика', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Настройки', icon: <SettingsIcon />, path: '/settings' },
  ];
  
  // Содержимое боковой панели
  const drawer = (
    <div>
      <Toolbar 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          px: [1]
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Biz360 CRM
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            component={Link} 
            to={item.path}
            onClick={handleNavClick}
            button
            selected={location.pathname === item.path}
            sx={{
              color: location.pathname === item.path ? 'primary.main' : 'text.primary',
              bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              borderRadius: 1,
              mx: 1,
              mb: 0.5
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
                minWidth: 40
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Верхняя панель */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              display: { xs: 'none', sm: 'block' }, 
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            Biz360 CRM
          </Typography>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              ml: 1, 
              color: 'text.secondary',
              display: { xs: 'none', sm: 'block' } 
            }}
          >
            ИИ-Ассистент
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WebSocketIndicator />
            
            <FormControl size="small" sx={{ mx: 2, minWidth: 150 }}>
              <Select
                value={environment}
                onChange={handleEnvironmentChange}
                displayEmpty
                variant="outlined"
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value={Environment.LOCAL}>Локальный сервер</MenuItem>
                <MenuItem value={Environment.PRODUCTION}>Промышленный сервер</MenuItem>
              </Select>
            </FormControl>
            
            <IconButton onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              <Avatar 
                alt={user?.username || 'User'} 
                src={user?.avatarUrl}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Профиль" />
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Выйти" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Боковая панель (разные режимы для мобильных и десктопов) */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Мобильная панель */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Для лучшей мобильной производительности
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'background.paper'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Десктопная панель */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Основное содержимое */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Toolbar /> {/* Отступ для AppBar */}
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;