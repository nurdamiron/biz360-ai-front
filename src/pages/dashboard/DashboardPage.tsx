// src/pages/dashboard/DashboardPage.tsx
import React, { useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  VStack,
  HStack,
  Text,
  Badge,
  Grid,
  GridItem,
  Divider,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Button
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTasks } from '../../store/slices/tasksSlice';
import TaskProgressCard from '../../components/task/TaskProgressCard';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const AddIcon = () => <span>➕</span>;

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tasks, isLoading } = useAppSelector(state => state.tasks);
  const { user } = useAppSelector(state => state.auth);
  
  // Цвета
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Загружаем задачи при монтировании
  useEffect(() => {
    dispatch(fetchTasks({ limit: 5, sortBy: 'updatedAt', sortOrder: 'desc' }));
  }, [dispatch]);
  
  // Находим активные задачи (в процессе выполнения)
  const activeTasks = tasks.filter(task => task.status === 'in_progress');
  
  // Находим последние задачи
  const recentTasks = tasks.slice(0, 3);
  
  // Статистика задач по статусам
  const taskStats = {
    all: tasks.length,
    active: activeTasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    pending: tasks.filter(task => task.status === 'pending').length,
    failed: tasks.filter(task => task.status === 'failed').length,
  };
  
  // Обработчик создания новой задачи
  const handleCreateTask = () => {
    navigate('/tasks/new');
  };
  
  return (
    <Box>
      <HStack justifyContent="space-between" alignItems="center" mb={6}>
        <VStack align="flex-start" spacing={1}>
          <Heading size="lg">Панель управления</Heading>
          <Text color="gray.500">
            Обзор проекта и активные задачи
          </Text>
        </VStack>
        
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          onClick={handleCreateTask}
        >
          Новая задача
        </Button>
      </HStack>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
        <Stat
          p={4}
          bg={cardBg}
          borderRadius="lg"
          boxShadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <StatLabel>Всего задач</StatLabel>
          <StatNumber>{taskStats.all}</StatNumber>
          <StatHelpText>
            <Badge colorScheme="blue" borderRadius="full" px={2}>
              Актуально
            </Badge>
          </StatHelpText>
        </Stat>
        
        <Stat
          p={4}
          bg={cardBg}
          borderRadius="lg"
          boxShadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <StatLabel>Активные задачи</StatLabel>
          <StatNumber>{taskStats.active}</StatNumber>
          <StatHelpText>
            <StatArrow type={taskStats.active > 2 ? 'increase' : 'decrease'} />
            {taskStats.active > 2 ? 'Высокая активность' : 'Нормальная активность'}
          </StatHelpText>
        </Stat>
        
        <Stat
          p={4}
          bg={cardBg}
          borderRadius="lg"
          boxShadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <StatLabel>Завершенные задачи</StatLabel>
          <StatNumber>{taskStats.completed}</StatNumber>
          <StatHelpText>
            <Badge colorScheme="green" borderRadius="full" px={2}>
              Успешно
            </Badge>
          </StatHelpText>
        </Stat>
        
        <Stat
          p={4}
          bg={cardBg}
          borderRadius="lg"
          boxShadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <StatLabel>Проблемные задачи</StatLabel>
          <StatNumber>{taskStats.failed}</StatNumber>
          <StatHelpText>
            <Badge colorScheme="red" borderRadius="full" px={2}>
              Требуют внимания
            </Badge>
          </StatHelpText>
        </Stat>
      </SimpleGrid>
      
      <Grid 
        templateColumns={{ base: '1fr', lg: '2fr 1fr' }} 
        gap={6}
      >
        <GridItem>
          <Card borderColor={borderColor} boxShadow="sm">
            <CardHeader>
              <Heading size="md">Активные задачи</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {isLoading ? (
                  <Text>Загрузка задач...</Text>
                ) : activeTasks.length > 0 ? (
                  activeTasks.map(task => (
                    <TaskProgressCard key={task.id} task={task} showDetailedLogs />
                  ))
                ) : (
                  <Text color="gray.500">Активных задач нет</Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card borderColor={borderColor} boxShadow="sm">
            <CardHeader>
              <Heading size="md">Последние обновления</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {isLoading ? (
                  <Text>Загрузка обновлений...</Text>
                ) : recentTasks.length > 0 ? (
                  recentTasks.map(task => (
                    <HStack 
                      key={task.id} 
                      p={3} 
                      borderWidth="1px" 
                      borderRadius="md" 
                      borderColor={borderColor}
                      justifyContent="space-between"
                    >
                      <VStack align="flex-start" spacing={0}>
                        <Text fontWeight="medium">{task.title}</Text>
                        <HStack>
                          <Badge colorScheme={task.status === 'completed' ? 'green' : task.status === 'failed' ? 'red' : 'blue'}>
                            {task.status}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            {new Date(task.updatedAt).toLocaleDateString()}
                          </Text>
                        </HStack>
                      </VStack>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        Просмотр
                      </Button>
                    </HStack>
                  ))
                ) : (
                  <Text color="gray.500">Нет последних обновлений</Text>
                )}
              </VStack>
            </CardBody>
          </Card>
          
          <Card mt={6} borderColor={borderColor} boxShadow="sm">
            <CardHeader>
              <Heading size="md">Информация о системе</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <HStack justifyContent="space-between">
                  <Text fontWeight="medium">Пользователь:</Text>
                  <Text>{user?.username || 'Неизвестно'}</Text>
                </HStack>
                <Divider />
                <HStack justifyContent="space-between">
                  <Text fontWeight="medium">Роль:</Text>
                  <Badge colorScheme="purple">{user?.role || 'Гость'}</Badge>
                </HStack>
                <Divider />
                <HStack justifyContent="space-between">
                  <Text fontWeight="medium">Статус ИИ:</Text>
                  <Badge colorScheme="green">Активен</Badge>
                </HStack>
                <Divider />
                <HStack justifyContent="space-between">
                  <Text fontWeight="medium">Версия:</Text>
                  <Text>1.0.0-beta</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default DashboardPage;