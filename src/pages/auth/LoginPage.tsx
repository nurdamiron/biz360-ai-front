// src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  useColorModeValue,
  FormErrorMessage,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  Flex,
  Select,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { login, clearError } from '../../store/slices/authSlice';
import { Environment, getCurrentEnvironment, setEnvironment } from '../../config/api.config';

// Иконка для показа/скрытия пароля
const ViewIcon = () => <span>👁️</span>;
const HideIcon = () => <span>🔒</span>;

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
  
  // Цвета
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
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
  const handleEnvironmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEnv = e.target.value as Environment;
    setCurrentEnvironment(newEnv);
    setEnvironment(newEnv);
  };
  
  return (
    <Container maxW="md" py={12}>
      <VStack
        spacing={8}
        p={8}
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        bg={bgColor}
        boxShadow="lg"
      >
        <Heading size="lg">Вход в Biz360 CRM</Heading>
        
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <VStack spacing={4} width="100%">
          <FormControl isInvalid={!!formErrors.username}>
            <FormLabel>Имя пользователя</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                dispatch(clearError());
                setFormErrors({...formErrors, username: ''});
              }}
              onKeyPress={handleKeyPress}
            />
            <FormErrorMessage>{formErrors.username}</FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={!!formErrors.password}>
            <FormLabel>Пароль</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  dispatch(clearError());
                  setFormErrors({...formErrors, password: ''});
                }}
                onKeyPress={handleKeyPress}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  icon={showPassword ? <HideIcon /> : <ViewIcon />}
                  onClick={() => setShowPassword(!showPassword)}
                  variant="ghost"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{formErrors.password}</FormErrorMessage>
          </FormControl>
          
          <FormControl>
            <FormLabel>Сервер</FormLabel>
            <Select
              value={environment}
              onChange={handleEnvironmentChange}
            >
              <option value={Environment.LOCAL}>Локальный</option>
              <option value={Environment.PRODUCTION}>Промышленный</option>
            </Select>
          </FormControl>
          
          <Button
            colorScheme="blue"
            width="100%"
            mt={4}
            onClick={handleLogin}
            isLoading={isLoading}
            loadingText="Вход..."
          >
            Войти
          </Button>
        </VStack>
        
        <Box width="100%">
          <Text fontSize="sm" textAlign="center" color="gray.500">
            Демо-версия ИИ-ассистента для разработчика Biz360 CRM
          </Text>
        </Box>
      </VStack>
      
      <Flex mt={4} justifyContent="center">
        <Text fontSize="sm" color="gray.500">
          Для тестового доступа используйте: admin / admin123
        </Text>
      </Flex>
    </Container>
  );
};

export default LoginPage;