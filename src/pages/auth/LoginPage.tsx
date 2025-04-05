// src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Paper,
  Select,
  Typography,
  MenuItem,
  Alert,
  useTheme,
  SelectChangeEvent,
  Divider,
  Stack,
  useMediaQuery,
  CircularProgress,
  Fade
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { login, clearError } from '../../store/slices/authSlice';
import { Environment, getCurrentEnvironment, setEnvironment } from '../../config/api.config';
import { ColorModeContext } from '../../App';

// Иконки
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BusinessIcon from '@mui/icons-material/Business';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [environment, setCurrentEnvironment] = useState<Environment>(getCurrentEnvironment());
  const [formErrors, setFormErrors] = useState({
    username: '',
    password: '',
  });
  
  const { isLoggedIn, isLoading, error } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Перенаправление, если пользователь уже вошел
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);
  
  // Валидация формы
  const validateForm = (): boolean => {
    let isValid = true;
    const errors = {
      username: '',
      password: '',
    };
    
    if (!username.trim()) {
      errors.username = 'Имя пользователя обязательно';
      isValid = false;
    }
    
    if (!password) {
      errors.password = 'Пароль обязателен';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Обработчик входа
  const handleLogin = () => {
    if (validateForm()) {
      dispatch(login({ username, password }));
    }
  };
  
  // Обработчик нажатия Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };
  
  // Обработчик изменения окружения
  const handleEnvironmentChange = (e: SelectChangeEvent<string>) => {
    const newEnv = e.target.value as Environment;
    setCurrentEnvironment(newEnv);
    setEnvironment(newEnv);
  };
  
  // Переключение видимости пароля
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        height: '100%',
        width: '100%',
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, 0.1)} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative'
      }}
    >
      {/* Фон с градиентом */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '35%',
          background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.4)}, transparent)`,
          zIndex: 0
        }}
      />
      
      <Container 
        maxWidth="sm" 
        sx={{ 
          zIndex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'center' : 'flex-start'
        }}
      >
        <Fade in={true} timeout={800}>
          <Card 
            elevation={12} 
            sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.8 : 0.9),
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                p: 3, 
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -30, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  width: 60,
                  height: 60,
                  borderRadius: '50%', 
                  bgcolor: 'primary.dark',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 3
                }}
              >
                <BusinessIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 3 }}>
                Biz360 CRM
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                ИИ-Ассистент
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h5" component="h1" gutterBottom>
                  Вход в систему
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Войдите, чтобы получить доступ к вашим проектам и задачам
                </Typography>
              </Box>
              
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    animation: 'shake 0.5s',
                    '@keyframes shake': {
                      '0%, 100%': { transform: 'translateX(0)' },
                      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                      '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
                    }
                  }}
                >
                  {error}
                </Alert>
              )}
              
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <FormControl 
                  fullWidth 
                  margin="normal" 
                  variant="outlined" 
                  error={!!formErrors.username}
                >
                  <InputLabel htmlFor="username">Имя пользователя</InputLabel>
                  <OutlinedInput
                    id="username"
                    label="Имя пользователя"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      dispatch(clearError());
                      setFormErrors({...formErrors, username: ''});
                    }}
                    onKeyPress={handleKeyPress}
                    fullWidth
                    autoFocus={!isMobile} // Отключаем автофокус на мобильных для предотвращения появления клавиатуры
                  />
                  {formErrors.username && (
                    <FormHelperText error>{formErrors.username}</FormHelperText>
                  )}
                </FormControl>
                
                <FormControl 
                  fullWidth 
                  margin="normal" 
                  variant="outlined" 
                  error={!!formErrors.password}
                >
                  <InputLabel htmlFor="password">Пароль</InputLabel>
                  <OutlinedInput
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      dispatch(clearError());
                      setFormErrors({...formErrors, password: ''});
                    }}
                    onKeyPress={handleKeyPress}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Пароль"
                  />
                  {formErrors.password && (
                    <FormHelperText error>{formErrors.password}</FormHelperText>
                  )}
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="environment-label">Сервер</InputLabel>
                  <Select
                    labelId="environment-label"
                    id="environment"
                    value={environment}
                    label="Сервер"
                    onChange={handleEnvironmentChange}
                  >
                    <MenuItem value={Environment.LOCAL}>Локальный</MenuItem>
                    <MenuItem value={Environment.PRODUCTION}>Промышленный</MenuItem>
                  </Select>
                  <FormHelperText>Выберите серверное окружение для подключения</FormHelperText>
                </FormControl>
                
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ 
                    mt: 3, 
                    mb: 2, 
                    height: 50,
                    fontSize: '1rem',
                    borderRadius: 10,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : 'Войти'}
                </Button>
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Демо-версия ИИ-ассистента для разработчика Biz360 CRM
                  </Typography>
                </Box>
                
                <Stack 
                  direction="row" 
                  spacing={1} 
                  justifyContent="center" 
                  alignItems="center" 
                  sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Для тестирования: admin / admin123
                  </Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Fade>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <IconButton 
            onClick={colorMode.toggleColorMode} 
            sx={{ 
              bgcolor: theme.palette.background.paper, 
              boxShadow: 2,
              '&:hover': { bgcolor: theme.palette.background.default }
            }}
          >
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;