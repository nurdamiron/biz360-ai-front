// src/pages/analytics/AnalyticsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  VStack,
  HStack,
  Button,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  useColorModeValue,
  Spinner,
  Card,
  CardBody,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchTasksStatusDistribution,
  fetchTasksPriorityDistribution,
  fetchTasksCompletionTimeline,
  fetchTasksPerformanceTimeline,
  fetchUserActivityStats,
  fetchProjectStats,
  AnalyticsFilterParams,
  toBarChartData,
  toPieChartData,
  toLineChartData
} from '../../store/slices/analyticsSlice';
import LineChart, { DataPoint } from '../../components/analytics/LineChart';
import BarChart from '../../components/analytics/BarChart';
import PieChart from '../../components/analytics/PieChart';
import { Project } from '../../store/slices/projectsSlice';
import { fetchProjects } from '../../store/slices/projectsSlice';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const FilterIcon = () => <span>🔎</span>;
const RefreshIcon = () => <span>🔄</span>;
const DownloadIcon = () => <span>⬇️</span>;
const PrintIcon = () => <span>🖨️</span>;

const AnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  
  // Получаем данные из Redux
  const {
    tasksStatusDistribution,
    tasksPriorityDistribution,
    tasksCompletionTimeline,
    tasksPerformanceTimeline,
    userActivityStats,
    projectStats,
    isLoading
  } = useAppSelector(state => state.analytics);
  
  const { projects } = useAppSelector(state => state.projects);
  
  // Состояние для фильтров
  const [filters, setFilters] = useState<AnalyticsFilterParams>({});
  
  // Состояние для временного диапазона
  const [timeRange, setTimeRange] = useState('30days'); // '7days', '30days', '90days', 'year'
  
  // Состояние для выбранного проекта
  const [selectedProject, setSelectedProject] = useState<number | undefined>(undefined);
  
  // Цвета
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Преобразование данных для компонентов визуализации
  const statusDistributionData = toPieChartData(
    tasksStatusDistribution.map(item => ({
      label: getStatusLabel(item.status),
      value: item.count
    }))
  );
  
  const priorityDistributionData = toPieChartData(
    tasksPriorityDistribution.map(item => ({
      label: getPriorityLabel(item.priority),
      value: item.count
    }))
  );
  
  const completionTimelineData = {
    created: toLineChartData(
      tasksCompletionTimeline.map(item => ({
        date: item.date,
        value: item.created
      }))
    ),
    completed: toLineChartData(
      tasksCompletionTimeline.map(item => ({
        date: item.date,
        value: item.completed
      }))
    )
  };
  
  const performanceTimelineData = {
    estimated: toLineChartData(
      tasksPerformanceTimeline.map(item => ({
        date: item.date,
        value: item.estimatedTime
      }))
    ),
    actual: toLineChartData(
      tasksPerformanceTimeline.map(item => ({
        date: item.date,
        value: item.actualTime
      }))
    )
  };
  
  const userActivityData = toBarChartData(
    userActivityStats.map(item => ({
      label: item.user.name,
      value: item.tasksCompleted
    }))
  );
  
  const projectStatsData = toBarChartData(
    projectStats.map(item => ({
      label: item.name,
      value: item.completionRate
    }))
  );
  
  // Загружаем данные при монтировании и при изменении фильтров
  useEffect(() => {
    // Преобразуем временной диапазон в даты
    let startDate: string | undefined;
    const now = new Date();
    
    switch (timeRange) {
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        break;
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90)).toISOString().split('T')[0];
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
        break;
      default:
        startDate = undefined;
    }
    
    const filterParams: AnalyticsFilterParams = {
      ...filters,
      startDate,
      projectId: selectedProject
    };
    
    dispatch(fetchTasksStatusDistribution(filterParams));
    dispatch(fetchTasksPriorityDistribution(filterParams));
    dispatch(fetchTasksCompletionTimeline(filterParams));
    dispatch(fetchTasksPerformanceTimeline(filterParams));
    dispatch(fetchUserActivityStats(filterParams));
    dispatch(fetchProjectStats(filterParams));
    
    // Также загружаем список проектов, если еще не загружен
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, filters, timeRange, selectedProject, projects.length]);
  
  // Функция для получения читаемого названия статуса
  function getStatusLabel(status: string): string {
    switch (status) {
      case 'new': return 'Новые';
      case 'pending': return 'Ожидающие';
      case 'in_progress': return 'В работе';
      case 'resolved': return 'Решены';
      case 'completed': return 'Завершены';
      case 'failed': return 'Ошибка';
      case 'canceled': return 'Отменены';
      default: return status;
    }
  }
  
  // Функция для получения читаемого названия приоритета
  function getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'low': return 'Низкий';
      case 'medium': return 'Средний';
      case 'high': return 'Высокий';
      case 'critical': return 'Критический';
      default: return priority;
    }
  }
  
  // Обработчик изменения временного диапазона
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };
  
  // Обработчик изменения проекта
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedProject(value ? Number(value) : undefined);
  };
  
  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setTimeRange('30days');
    setSelectedProject(undefined);
    setFilters({});
  };
  
  // Обработчик экспорта данных (заглушка)
  const handleExport = () => {
    toast({
      title: 'Экспорт данных',
      description: 'Функция экспорта данных будет доступна в следующей версии',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Обработчик печати отчета (заглушка)
  const handlePrint = () => {
    toast({
      title: 'Печать отчета',
      description: 'Функция печати отчета будет доступна в следующей версии',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <VStack align="flex-start" spacing={1}>
          <Heading size="lg">Аналитика</Heading>
          <Text color="gray.500">
            Статистика и метрики производительности ИИ-ассистента
          </Text>
        </VStack>
        
        <HStack spacing={2}>
          <Button 
            leftIcon={<RefreshIcon />} 
            variant="outline" 
            onClick={() => {
              // Повторно загружаем данные с текущими фильтрами
              const filterParams: AnalyticsFilterParams = {
                ...filters,
                projectId: selectedProject
              };
              
              dispatch(fetchTasksStatusDistribution(filterParams));
              dispatch(fetchTasksPriorityDistribution(filterParams));
              dispatch(fetchTasksCompletionTimeline(filterParams));
              dispatch(fetchTasksPerformanceTimeline(filterParams));
              dispatch(fetchUserActivityStats(filterParams));
              dispatch(fetchProjectStats(filterParams));
            }}
            isLoading={isLoading}
          >
            Обновить
          </Button>
          
          <Menu>
            <MenuButton
              as={Button}
              leftIcon={<DownloadIcon />}
              variant="outline"
            >
              Экспорт
            </MenuButton>
            <MenuList>
              <MenuItem onClick={handleExport}>Экспорт в CSV</MenuItem>
              <MenuItem onClick={handleExport}>Экспорт в Excel</MenuItem>
              <MenuItem onClick={handleExport}>Экспорт в PDF</MenuItem>
              <MenuItem onClick={handlePrint} icon={<PrintIcon />}>Печать отчета</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      <Card borderColor={borderColor} boxShadow="sm" mb={6}>
        <CardBody>
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align={{ base: 'stretch', md: 'center' }}
            gap={4}
          >
            <HStack spacing={4}>
              <FormControl width="auto">
                <FormLabel fontSize="sm">Период</FormLabel>
                <Select 
                  value={timeRange} 
                  onChange={handleTimeRangeChange}
                  size="sm"
                >
                  <option value="7days">Последние 7 дней</option>
                  <option value="30days">Последние 30 дней</option>
                  <option value="90days">Последние 90 дней</option>
                  <option value="year">Последний год</option>
                </Select>
              </FormControl>
              
              <FormControl width="auto">
                <FormLabel fontSize="sm">Проект</FormLabel>
                <Select 
                  value={selectedProject || ''} 
                  onChange={handleProjectChange}
                  size="sm"
                  placeholder="Все проекты"
                >
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleResetFilters}
            >
              Сбросить фильтры
            </Button>
          </Flex>
          
          {/* Индикаторы активных фильтров */}
          {(selectedProject !== undefined) && (
            <Flex wrap="wrap" gap={2} mt={4}>
              {selectedProject !== undefined && (
                <Badge colorScheme="purple" borderRadius="full" px={2} py={1}>
                  Проект: {projects.find(p => p.id === selectedProject)?.name || selectedProject}
                </Badge>
              )}
              
              <Badge colorScheme="blue" borderRadius="full" px={2} py={1}>
                Период: {
                  timeRange === '7days' ? 'Последние 7 дней' :
                  timeRange === '30days' ? 'Последние 30 дней' :
                  timeRange === '90days' ? 'Последние 90 дней' :
                  'Последний год'
                }
              </Badge>
            </Flex>
          )}
        </CardBody>
      </Card>
      
      <Tabs variant="enclosed" colorScheme="blue" isLazy>
        <TabList>
          <Tab>Обзор</Tab>
          <Tab>Задачи</Tab>
          <Tab>Производительность</Tab>
          <Tab>Пользователи</Tab>
          <Tab>Проекты</Tab>
        </TabList>
        
        <TabPanels>
          {/* Панель обзора */}
          <TabPanel p={4}>
            {isLoading ? (
              <Flex justify="center" align="center" p={10}>
                <Spinner size="xl" />
              </Flex>
            ) : (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                  <LineChart 
                    title="Создание и выполнение задач"
                    description="Количество созданных и выполненных задач по дням"
                    data={completionTimelineData.created}
                    height={300}
                    color="blue.500"
                  />
                  
                  <LineChart 
                    title="Производительность"
                    description="Соотношение планового и фактического времени выполнения"
                    data={performanceTimelineData.actual}
                    height={300}
                    color="green.500"
                    valueSuffix=" мин."
                  />
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  <PieChart 
                    title="Распределение статусов задач"
                    description="Количество задач в каждом статусе"
                    data={statusDistributionData}
                    size={250}
                    showLegend={true}
                    donut={true}
                  />
                  
                  <PieChart 
                    title="Распределение приоритетов"
                    description="Количество задач по приоритетам"
                    data={priorityDistributionData}
                    size={250}
                    showLegend={true}
                    donut={true}
                    colorScheme={['#E53E3E', '#ED8936', '#3182CE', '#718096']}
                  />
                  
                  <BarChart 
                    title="Активность пользователей"
                    description="Количество выполненных задач по пользователям"
                    data={userActivityData.slice(0, 5)}
                    height={250}
                    horizontal={true}
                  />
                </SimpleGrid>
              </Box>
            )}
          </TabPanel>
          
          {/* Панель задач */}
          <TabPanel p={4}>
            {isLoading ? (
              <Flex justify="center" align="center" p={10}>
                <Spinner size="xl" />
              </Flex>
            ) : (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                  <LineChart 
                    title="Создание задач"
                    description="Количество созданных задач по дням"
                    data={completionTimelineData.created}
                    height={300}
                    color="blue.500"
                  />
                  
                  <LineChart 
                    title="Выполнение задач"
                    description="Количество выполненных задач по дням"
                    data={completionTimelineData.completed}
                    height={300}
                    color="green.500"
                  />
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <PieChart 
                    title="Статусы задач"
                    description="Распределение задач по статусам"
                    data={statusDistributionData}
                    showLegend={true}
                  />
                  
                  <PieChart 
                    title="Приоритеты задач"
                    description="Распределение задач по приоритетам"
                    data={priorityDistributionData}
                    showLegend={true}
                    colorScheme={['#E53E3E', '#ED8936', '#3182CE', '#718096']}
                  />
                </SimpleGrid>
              </Box>
            )}
          </TabPanel>
          
          {/* Панель производительности */}
          <TabPanel p={4}>
            {isLoading ? (
              <Flex justify="center" align="center" p={10}>
                <Spinner size="xl" />
              </Flex>
            ) : (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                  <LineChart 
                    title="Плановое время"
                    description="Плановое время выполнения задач по дням (мин.)"
                    data={performanceTimelineData.estimated}
                    height={300}
                    color="blue.500"
                    valueSuffix=" мин."
                  />
                  
                  <LineChart 
                    title="Фактическое время"
                    description="Фактическое время выполнения задач по дням (мин.)"
                    data={performanceTimelineData.actual}
                    height={300}
                    color="green.500"
                    valueSuffix=" мин."
                  />
                </SimpleGrid>
                
                <Card p={4} borderColor={borderColor} boxShadow="sm">
                  <Heading size="md" mb={4}>Эффективность ИИ-ассистента</Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    <Flex 
                      direction="column" 
                      alignItems="center" 
                      justifyContent="center" 
                      p={4} 
                      bg={useColorModeValue('blue.50', 'blue.900')}
                      borderRadius="md"
                    >
                      <Text fontSize="sm" color="gray.500">Средняя скорость</Text>
                      <Text fontSize="2xl" fontWeight="bold">87%</Text>
                      <Badge colorScheme="green">Выше среднего</Badge>
                    </Flex>
                    
                    <Flex 
                      direction="column" 
                      alignItems="center" 
                      justifyContent="center" 
                      p={4} 
                      bg={useColorModeValue('green.50', 'green.900')}
                      borderRadius="md"
                    >
                      <Text fontSize="sm" color="gray.500">Точность кода</Text>
                      <Text fontSize="2xl" fontWeight="bold">92%</Text>
                      <Badge colorScheme="green">Отлично</Badge>
                    </Flex>
                    
                    <Flex 
                      direction="column" 
                      alignItems="center" 
                      justifyContent="center" 
                      p={4} 
                      bg={useColorModeValue('purple.50', 'purple.900')}
                      borderRadius="md"
                    >
                      <Text fontSize="sm" color="gray.500">Успешные PR</Text>
                      <Text fontSize="2xl" fontWeight="bold">78%</Text>
                      <Badge colorScheme="blue">Хорошо</Badge>
                    </Flex>
                    
                    <Flex 
                      direction="column" 
                      alignItems="center" 
                      justifyContent="center" 
                      p={4} 
                      bg={useColorModeValue('orange.50', 'orange.900')}
                      borderRadius="md"
                    >
                      <Text fontSize="sm" color="gray.500">Экономия времени</Text>
                      <Text fontSize="2xl" fontWeight="bold">67%</Text>
                      <Badge colorScheme="orange">Средне</Badge>
                    </Flex>
                  </SimpleGrid>
                </Card>
              </Box>
            )}
          </TabPanel>
          
          {/* Панель пользователей */}
          <TabPanel p={4}>
            {isLoading ? (
              <Flex justify="center" align="center" p={10}>
                <Spinner size="xl" />
              </Flex>
            ) : (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                  <BarChart 
                    title="Созданные задачи"
                    description="Количество созданных задач по пользователям"
                    data={userActivityStats.map(user => ({
                      label: user.user.name,
                      value: user.tasksCreated
                    }))}
                    height={300}
                    horizontal={true}
                  />
                  
                  <BarChart 
                    title="Выполненные задачи"
                    description="Количество выполненных задач по пользователям"
                    data={userActivityStats.map(user => ({
                      label: user.user.name,
                      value: user.tasksCompleted
                    }))}
                    height={300}
                    horizontal={true}
                  />
                </SimpleGrid>
                
                <Card p={4} borderColor={borderColor} boxShadow="sm">
                  <Heading size="md" mb={4}>Лидеры по эффективности</Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    {userActivityStats.slice(0, 3).map((user, index) => (
                      <Card key={user.user.id} p={4} variant="outline">
                        <VStack spacing={2} align="center">
                          <Badge colorScheme={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'} fontSize="lg" p={2} borderRadius="full">
                            #{index + 1}
                          </Badge>
                          <Text fontWeight="bold">{user.user.name}</Text>
                          <HStack divider={<Text mx={2}>|</Text>}>
                            <VStack spacing={0}>
                              <Text fontSize="sm" color="gray.500">Задачи</Text>
                              <Text fontWeight="medium">{user.tasksCompleted}</Text>
                            </VStack>
                            <VStack spacing={0}>
                              <Text fontSize="sm" color="gray.500">Код</Text>
                              <Text fontWeight="medium">{user.codeReviewed}</Text>
                            </VStack>
                          </HStack>
                        </VStack>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Card>
              </Box>
            )}
          </TabPanel>
          
          {/* Панель проектов */}
          <TabPanel p={4}>
            {isLoading ? (
              <Flex justify="center" align="center" p={10}>
                <Spinner size="xl" />
              </Flex>
            ) : (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                  <BarChart 
                    title="Количество задач"
                    description="Количество задач по проектам"
                    data={projectStats.map(project => ({
                      label: project.name,
                      value: project.tasksCount
                    }))}
                    height={300}
                    horizontal={true}
                  />
                  
                  <BarChart 
                    title="Процент выполнения"
                    description="Процент выполненных задач по проектам"
                    data={projectStats.map(project => ({
                      label: project.name,
                      value: project.completionRate
                    }))}
                    height={300}
                    horizontal={true}
                    valueSuffix="%"
                    maxValue={100}
                    defaultColor="green.500"
                  />
                </SimpleGrid>
                
                <Card p={4} borderColor={borderColor} boxShadow="sm">
                  <Heading size="md" mb={4}>Топ проектов по эффективности</Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    {projectStats
                      .sort((a, b) => b.completionRate - a.completionRate)
                      .slice(0, 4)
                      .map(project => (
                        <Card key={project.id} p={4} variant="outline">
                          <VStack spacing={2} align="stretch">
                            <Text fontWeight="bold" isTruncated>{project.name}</Text>
                            <Text color="gray.500" fontSize="sm">{project.tasksCount} задач</Text>
                            <HStack>
                              <Text fontWeight="medium">{project.completionRate}%</Text>
                              <Box flex="1">
                                <Box 
                                  w="100%" 
                                  h="6px" 
                                  bg="gray.100" 
                                  borderRadius="full"
                                  overflow="hidden"
                                >
                                  <Box 
                                    w={`${project.completionRate}%`} 
                                    h="100%" 
                                    bg={
                                      project.completionRate > 75 ? 'green.500' :
                                      project.completionRate > 50 ? 'blue.500' :
                                      project.completionRate > 25 ? 'orange.500' :
                                      'red.500'
                                    }
                                  />
                                </Box>
                              </Box>
                            </HStack>
                          </VStack>
                        </Card>
                      ))}
                  </SimpleGrid>
                </Card>
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AnalyticsPage;