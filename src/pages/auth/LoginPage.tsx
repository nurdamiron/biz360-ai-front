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
  SelectChangeEvent
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { login, clearError } from '../../store/slices/authSlice';
import { Environment, getCurrentEnvironment, setEnvironment } from '../../config/api.config';
import { ColorModeContext } from '../../App';

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
        bgcolor: 'background.default',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom color="primary.main" fontWeight="bold">
                Biz360 CRM
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 3 }}>
                Вход в систему
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
            </Box>
            
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
              </FormControl>
              
              <Button
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Демо-версия ИИ-ассистента для разработчика Biz360 CRM
                </Typography>
              </Box>
              
              <Box sx={{ mt: 2, textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Для тестового доступа используйте: admin / admin123
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                  {theme.palette.mode === 'dark' ? <Visibility /> : <VisibilityOff />}
                </IconButton>
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {theme.palette.mode === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;