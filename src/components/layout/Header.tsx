// src/components/layout/Header.tsx
import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  ListItemIcon,
  ListItemText,
  FormControl,
  Select,
  SelectChangeEvent,
  Drawer,
  List,
  ListItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { Environment, getCurrentEnvironment, setEnvironment } from '../../config/api.config';
import { ColorModeContext } from '../../App';
import WebSocketIndicator from '../common/WebSocketIndicator';

// Иконки Material UI
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const Header: React.FC = () => {
  const { colorMode } = React.useContext(ColorModeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Состояние для мобильного меню
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  // Состояние для меню пользователя
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  
  // Состояние для окружения
  const [environment, setCurrentEnvironment] = React.useState<Environment>(getCurrentEnvironment());
  
  // Обработчик выхода из системы
  const handleLogout = () => {
    handleCloseUserMenu();
    dispatch(logout());
    navigate('/login');
  };
  
  // Обработчик открытия меню пользователя
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Обработчик закрытия меню пользователя
  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };
  
  // Обработчик изменения окружения
  const handleEnvironmentChange = (e: SelectChangeEvent) => {
    const newEnv = e.target.value as Environment;
    setCurrentEnvironment(newEnv);
    setEnvironment(newEnv);
    // Перезагрузка страницы для применения изменений
    window.location.reload();
  };
  
  // Обработчик открытия/закрытия мобильного меню
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="fixed"
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 1
        }}
      >
        <Toolbar>
          {/* Мобильный переключатель меню */}
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleMobileMenu}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Логотип и название */}
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            Biz360 CRM
          </Typography>
          <Typography variant="subtitle2" sx={{ ml: 1, color: theme.palette.text.secondary, display: { xs: 'none', sm: 'block' } }}>
            ИИ-Ассистент
          </Typography>
          
          {/* Правая часть тулбара */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Центральные элементы для desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <WebSocketIndicator />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={environment}
                onChange={handleEnvironmentChange}
                variant="outlined"
                sx={{ fontSize: '0.875rem' }}
                displayEmpty
              >
                <MenuItem value={Environment.LOCAL}>Локальный сервер</MenuItem>
                <MenuItem value={Environment.PRODUCTION}>Промышленный сервер</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Тема и аватар */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <IconButton onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            
            {user && (
              <Box>
                <IconButton
                  onClick={handleOpenUserMenu}
                  size="small"
                  sx={{ ml: 1 }}
                  aria-controls={menuOpen ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? 'true' : undefined}
                >
                  <Avatar 
                    sx={{ width: 32, height: 32 }}
                    src={user.avatarUrl}
                    alt={user.username}
                  />
                </IconButton>
                <Menu
                  id="account-menu"
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleCloseUserMenu}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      overflow: 'visible',
                      mt: 1.5,
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                >
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Профиль</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/settings'); }}>
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Настройки</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Выйти" primaryTypographyProps={{ color: 'error' }} />
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Мобильное меню */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              Biz360 CRM
            </Typography>
          </Box>
          <Divider />
          <List>
            {/* Мобильное меню для окружения и индикатора */}
            <ListItem>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <WebSocketIndicator />
              </Box>
            </ListItem>
            <ListItem>
              <FormControl fullWidth size="small">
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
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Header;