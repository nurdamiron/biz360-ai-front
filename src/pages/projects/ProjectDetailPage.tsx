// src/pages/projects/ProjectDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Flex,
  Grid,
  GridItem,
  Divider,
  Spinner,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  SimpleGrid,
  Progress,
  Icon,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchProjectById, 
  clearSelectedProject 
} from '../../store/slices/projectsSlice';
import { fetchTasks } from '../../store/slices/tasksSlice';
import { TaskFilterParams } from '../../types/api.types';
import TaskProgressCard from '../../components/task/TaskProgressCard';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const BackIcon = () => <span>←</span>;
const RefreshIcon = () => <span>🔄</span>;
const EditIcon = () => <span>✏️</span>;
const AddIcon = () => <span>➕</span>;
const FileIcon = () => <span>📄</span>;
const FolderIcon = () => <span>📁</span>;
const CodeIcon = () => <span>💻</span>;

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedProject, isLoading: isProjectLoading } = useAppSelector(state => state.projects);
  const { tasks, isLoading: isTasksLoading } = useAppSelector(state => state.tasks);
  const toast = useToast();
  
  // Цвета
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Загружаем данные о проекте при монтировании
  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(Number(projectId)));
      
      // Загружаем задачи проекта
      const taskParams: TaskFilterParams = {
        projectId: Number(projectId),
        limit: 5,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      };
      dispatch(fetchTasks(taskParams));
    }
    
    // Очищаем выбранный проект при размонтировании
    return () => {
      dispatch(clearSelectedProject());
    };
  }, [dispatch, projectId]);
  
  // Обработчик обновления данных
  const handleRefresh = () => {
    if (projectId) {
      dispatch(fetchProjectById(Number(projectId)));
      
      const taskParams: TaskFilterParams = {
        projectId: Number(projectId),
        limit: 5,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      };
      dispatch(fetchTasks(taskParams));
    }
  };
  
  // Обработчик создания новой задачи
  const handleCreateTask = () => {
    navigate('/tasks/new', { state: { projectId: Number(projectId) } });
  };
  
  // Обработчик редактирования проекта (заглушка)
  const handleEditProject = () => {
    toast({
      title: 'Редактирование проекта',
      description: 'Функция редактирования проекта будет доступна в следующей версии',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'orange';
      case 'archived':
        return 'gray';
      default:
        return 'blue';
    }
  };
  
  // Получение текста статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'inactive':
        return 'Неактивный';
      case 'archived':
        return 'Архивирован';
      default:
        return status;
    }
  };
  
  if (isProjectLoading) {
    return (
      <Flex justify="center" align="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  if (!selectedProject) {
    return (
      <Box textAlign="center" p={10}>
        <Heading size="md" mb={4}>Проект не найден</Heading>
        <Button leftIcon={<BackIcon />} onClick={() => navigate('/projects')}>
          Вернуться к списку проектов
        </Button>
      </Box>
    );
  }
  
  // Расчет процента выполнения задач
  const completionPercentage = 
    selectedProject.tasksCount > 0 
    ? Math.round((selectedProject.completedTasks / selectedProject.tasksCount) * 100) 
    : 0;
  
  return (
    <Box>
      <HStack justifyContent="space-between" alignItems="center" mb={6}>
        <Button 
          leftIcon={<BackIcon />} 
          variant="ghost" 
          onClick={() => navigate('/projects')}
        >
          К списку проектов
        </Button>
        
        <HStack>
          <Button 
            leftIcon={<RefreshIcon />} 
            variant="outline" 
            onClick={handleRefresh}
          >
            Обновить
          </Button>
          
          <Button 
            leftIcon={<EditIcon />} 
            colorScheme="blue" 
            variant="outline"
            onClick={handleEditProject}
          >
            Редактировать
          </Button>
          
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="green" 
            onClick={handleCreateTask}
          >
            Новая задача
          </Button>
        </HStack>
      </HStack>
      
      <Grid 
        templateColumns={{ base: '1fr', lg: '2fr 1fr' }} 
        gap={6}
      >
        <GridItem>
          <Card borderColor={borderColor} boxShadow="sm" mb={6}>
            <CardHeader>
              <VStack align="flex-start" spacing={1}>
                <Heading size="lg">{selectedProject.name}</Heading>
                <HStack spacing={2}>
                  <Badge colorScheme={getStatusColor(selectedProject.status)}>
                    {getStatusText(selectedProject.status)}
                  </Badge>
                  <Badge colorScheme="purple" borderRadius="full" px={2}>
                    #{selectedProject.id}
                  </Badge>
                </HStack>
              </VStack>
            </CardHeader>
            
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Text>{selectedProject.description}</Text>
                
                <Divider />
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Выполнение задач:</Text>
                  <Text>{completionPercentage}%</Text>
                </HStack>
                
                <Progress 
                  value={completionPercentage} 
                  size="md" 
                  colorScheme={completionPercentage < 30 ? 'red' : completionPercentage < 70 ? 'yellow' : 'green'} 
                  borderRadius="full"
                />
              </VStack>
            </CardBody>
            
            <CardFooter>
              <Flex width="100%" justifyContent="space-between" flexWrap="wrap">
                <Text fontSize="sm" color="gray.500">
                  Создан: {new Date(selectedProject.createdAt).toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Обновлен: {new Date(selectedProject.updatedAt).toLocaleString()}
                </Text>
              </Flex>
            </CardFooter>
          </Card>
          
          <Tabs variant="enclosed" colorScheme="blue" isLazy>
            <TabList>
              <Tab>Задачи</Tab>
              <Tab>Структура проекта</Tab>
              <Tab>Статистика</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={4}>
                {isTasksLoading ? (
                  <Flex justify="center" p={6}>
                    <Spinner />
                  </Flex>
                ) : tasks.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {tasks.map(task => (
                      <TaskProgressCard key={task.id} task={task} />
                    ))}
                    
                    <Button 
                      variant="outline" 
                      width="100%" 
                      onClick={() => navigate('/tasks', { state: { projectId: Number(projectId) } })}
                    >
                      Показать все задачи
                    </Button>
                  </VStack>
                ) : (
                  <Box textAlign="center" p={6}>
                    <Text color="gray.500" mb={2}>В проекте еще нет задач</Text>
                    <Button 
                      leftIcon={<AddIcon />} 
                      colorScheme="blue" 
                      onClick={handleCreateTask}
                    >
                      Создать задачу
                    </Button>
                  </Box>
                )}
              </TabPanel>
              
              <TabPanel p={4}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="sm">Файловая структура</Heading>
                  
                  <Box 
                    p={4} 
                    bg={cardBg} 
                    borderWidth="1px" 
                    borderColor={borderColor} 
                    borderRadius="md"
                  >
                    <List spacing={2}>
                      <ListItem>
                        <HStack>
                          <FolderIcon />
                          <Text fontWeight="medium">src/</Text>
                        </HStack>
                        <List pl={6} spacing={1} mt={2}>
                          <ListItem>
                            <HStack>
                              <FolderIcon />
                              <Text>components/</Text>
                            </HStack>
                          </ListItem>
                          <ListItem>
                            <HStack>
                              <FolderIcon />
                              <Text>models/</Text>
                            </HStack>
                          </ListItem>
                          <ListItem>
                            <HStack>
                              <FolderIcon />
                              <Text>controllers/</Text>
                            </HStack>
                          </ListItem>
                          <ListItem>
                            <HStack>
                              <FileIcon />
                              <Text>app.js</Text>
                            </HStack>
                          </ListItem>
                          <ListItem>
                            <HStack>
                              <FileIcon />
                              <Text>config.js</Text>
                            </HStack>
                          </ListItem>
                        </List>
                      </ListItem>
                      <ListItem mt={2}>
                        <HStack>
                          <FolderIcon />
                          <Text fontWeight="medium">public/</Text>
                        </HStack>
                      </ListItem>
                      <ListItem mt={2}>
                        <HStack>
                          <FileIcon />
                          <Text fontWeight="medium">package.json</Text>
                        </HStack>
                      </ListItem>
                    </List>
                  </Box>
                  
                  <Heading size="sm" mt={2}>Активные изменения</Heading>
                  
                  <Box 
                    p={4} 
                    bg={cardBg} 
                    borderWidth="1px" 
                    borderColor={borderColor} 
                    borderRadius="md"
                  >
                    <List spacing={2}>
                      <ListItem>
                        <HStack>
                          <CodeIcon />
                          <Text>src/models/user.model.js</Text>
                          <Badge colorScheme="green">В разработке</Badge>
                        </HStack>
                      </ListItem>
                      <ListItem>
                        <HStack>
                          <CodeIcon />
                          <Text>src/controllers/auth.controller.js</Text>
                          <Badge colorScheme="yellow">Проверка</Badge>
                        </HStack>
                      </ListItem>
                      <ListItem>
                        <HStack>
                          <CodeIcon />
                          <Text>src/components/login.component.js</Text>
                          <Badge colorScheme="blue">Тестирование</Badge>
                        </HStack>
                      </ListItem>
                    </List>
                  </Box>
                </VStack>
              </TabPanel>
              
              <TabPanel p={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {/* Пример статистики */}
                  <Card p={4} borderColor={borderColor}>
                    <CardHeader p={2}>
                      <Heading size="sm">Распределение кода по языкам</Heading>
                    </CardHeader>
                    <CardBody p={2}>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm">JavaScript</Text>
                          <Text fontSize="sm">68%</Text>
                        </HStack>
                        <Progress value={68} size="sm" colorScheme="yellow" borderRadius="full" />
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm">HTML</Text>
                          <Text fontSize="sm">15%</Text>
                        </HStack>
                        <Progress value={15} size="sm" colorScheme="orange" borderRadius="full" />
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm">CSS</Text>
                          <Text fontSize="sm">12%</Text>
                        </HStack>
                        <Progress value={12} size="sm" colorScheme="blue" borderRadius="full" />
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm">Другие</Text>
                          <Text fontSize="sm">5%</Text>
                        </HStack>
                        <Progress value={5} size="sm" colorScheme="gray" borderRadius="full" />
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  <Card p={4} borderColor={borderColor}>
                    <CardHeader p={2}>
                      <Heading size="sm">Активность</Heading>
                    </CardHeader>
                    <CardBody p={2}>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Коммиты за неделю</Text>
                          <Text fontSize="sm" fontWeight="bold">23</Text>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between">
                          <Text fontSize="sm">Pull Requests</Text>
                          <Text fontSize="sm" fontWeight="bold">7</Text>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between">
                          <Text fontSize="sm">Изменено файлов</Text>
                          <Text fontSize="sm" fontWeight="bold">42</Text>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between">
                          <Text fontSize="sm">Добавлено строк</Text>
                          <Text fontSize="sm" fontWeight="bold">+1,204</Text>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between">
                          <Text fontSize="sm">Удалено строк</Text>
                          <Text fontSize="sm" fontWeight="bold">-408</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>
        
        <GridItem>
          <Card borderColor={borderColor} boxShadow="sm" mb={6}>
            <CardHeader>
              <Heading size="md">Обзор проекта</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={2} spacing={4} mb={4}>
                <Stat>
                  <StatLabel>Всего задач</StatLabel>
                  <StatNumber>{selectedProject.tasksCount}</StatNumber>
                  <StatHelpText>
                    {completionPercentage}% завершено
                  </StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Активные задачи</StatLabel>
                  <StatNumber>{selectedProject.activeTasks}</StatNumber>
                  <StatHelpText>
                    {selectedProject.activeTasks > 0 ? 'В процессе' : 'Нет активных'}
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
              
              <VStack spacing={4} align="stretch">
                <Divider />
                
                <Box>
                  <Heading size="sm" mb={2}>Статистика по коду</Heading>
                  
                  {selectedProject.codeStats ? (
                    <List spacing={2}>
                      <ListItem display="flex" justifyContent="space-between">
                        <Text>Файлы</Text>
                        <Text fontWeight="medium">{selectedProject.codeStats.totalFiles}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between">
                        <Text>Строки кода</Text>
                        <Text fontWeight="medium">{selectedProject.codeStats.totalLines}</Text>
                      </ListItem>
                      <ListItem>
                        <Text mb={1}>Языки</Text>
                        <HStack spacing={2} wrap="wrap">
                          {selectedProject.codeStats.languages.map((lang, idx) => (
                            <Badge key={idx} colorScheme="blue" variant="outline">
                              {lang.name} ({lang.percentage}%)
                            </Badge>
                          ))}
                        </HStack>
                      </ListItem>
                    </List>
                  ) : (
                    <Text color="gray.500">Статистика по коду недоступна</Text>
                  )}
                </Box>
                
                <Divider />
                
                <Box>
                  <Heading size="sm" mb={2}>Последние действия</Heading>
                  
                  <List spacing={2}>
                    <ListItem>
                      <Text fontSize="sm" color="gray.500">2 часа назад</Text>
                      <Text>Обновлена задача "Авторизация пользователей"</Text>
                    </ListItem>
                    <ListItem>
                      <Text fontSize="sm" color="gray.500">Вчера</Text>
                      <Text>Создана новая задача "Интеграция платежного API"</Text>
                    </ListItem>
                    <ListItem>
                      <Text fontSize="sm" color="gray.500">3 дня назад</Text>
                      <Text>Изменен статус проекта на "Активный"</Text>
                    </ListItem>
                  </List>
                </Box>
              </VStack>
            </CardBody>
          </Card>
          
          <Card borderColor={borderColor} boxShadow="sm">
            <CardHeader>
              <Heading size="md">Участники проекта</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">Александр Иванов</Text>
                    <Text fontSize="sm" color="gray.500">Менеджер проекта</Text>
                  </VStack>
                  <Badge colorScheme="green">Онлайн</Badge>
                </HStack>
                
                <Divider />
                
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">Мария Петрова</Text>
                    <Text fontSize="sm" color="gray.500">Разработчик</Text>
                  </VStack>
                  <Badge colorScheme="gray">Офлайн</Badge>
                </HStack>
                
                <Divider />
                
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">Сергей Сидоров</Text>
                    <Text fontSize="sm" color="gray.500">Разработчик</Text>
                  </VStack>
                  <Badge colorScheme="gray">Офлайн</Badge>
                </HStack>
                
                <Divider />
                
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">ИИ-ассистент</Text>
                    <Text fontSize="sm" color="gray.500">Помощник</Text>
                  </VStack>
                  <Badge colorScheme="purple">Активен</Badge>
                </HStack>
                
                <Button size="sm" leftIcon={<AddIcon />} mt={2}>
                  Добавить участника
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ProjectDetailPage;