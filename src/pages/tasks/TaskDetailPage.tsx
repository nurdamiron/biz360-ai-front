// src/pages/tasks/TaskDetailPage.tsx
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
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
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
  useToast
} from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchTaskById, 
  fetchTaskLogs, 
  processTask,
  clearSelectedTask 
} from '../../store/slices/tasksSlice';
import { 
  Task, 
  TaskStatus, 
  TaskLog, 
  LogType, 
  Subtask 
} from '../../types/task.types';
import useWebSocket from '../../hooks/useWebSocket';
import CodeEditorPanel from '../../components/code/CodeEditorPanel';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const PlayIcon = () => <span>▶️</span>;
const PauseIcon = () => <span>⏸️</span>;
const StopIcon = () => <span>⏹️</span>;
const BackIcon = () => <span>←</span>;
const RefreshIcon = () => <span>🔄</span>;

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedTask, isLoading } = useAppSelector(state => state.tasks);
  const toast = useToast();
  const { subscribe, unsubscribe } = useWebSocket();
  
  // Локальное состояние для обновления логов в реальном времени
  const [logs, setLogs] = useState<TaskLog[]>([]);
  
  // Цвета
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Загружаем данные о задаче при монтировании
  useEffect(() => {
    if (taskId) {
      dispatch(fetchTaskById(Number(taskId)));
      dispatch(fetchTaskLogs({ taskId: Number(taskId), limit: 50 }));
    }
    
    // Очищаем выбранную задачу при размонтировании
    return () => {
      dispatch(clearSelectedTask());
    };
  }, [dispatch, taskId]);
  
  // Подписываемся на обновления задачи через WebSocket
  useEffect(() => {
    if (taskId) {
      // Обработчик для обновления задачи
      const handleTaskUpdate = (data: Task) => {
        // Обновление придет через Redux
        console.log('Task updated via WebSocket:', data);
      };
      
      // Обработчик для обновления логов
      const handleLogsUpdate = (data: { log: TaskLog }) => {
        if (data.log) {
          setLogs(prevLogs => [data.log, ...prevLogs]);
        }
      };
      
      // Подписываемся на обновления задачи и логов
      subscribe(`task`, Number(taskId), handleTaskUpdate);
      subscribe(`task_logs`, Number(taskId), handleLogsUpdate);
      
      // Отписываемся при размонтировании
      return () => {
        unsubscribe(`task`, Number(taskId), handleTaskUpdate);
        unsubscribe(`task_logs`, Number(taskId), handleLogsUpdate);
      };
    }
  }, [taskId, subscribe, unsubscribe]);
  
  // Обновляем локальные логи, когда изменяются логи в selectedTask
  useEffect(() => {
    if (selectedTask?.logs) {
      setLogs(selectedTask.logs);
    }
  }, [selectedTask?.logs]);
  
  // Обработчик запуска обработки задачи
  const handleProcessTask = async () => {
    if (!taskId) return;
    
    try {
      await dispatch(processTask(Number(taskId))).unwrap();
      
      toast({
        title: 'Задача запущена',
        description: 'ИИ-ассистент начал обработку задачи',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка при запуске задачи',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Обработчик обновления данных
  const handleRefresh = () => {
    if (taskId) {
      dispatch(fetchTaskById(Number(taskId)));
      dispatch(fetchTaskLogs({ taskId: Number(taskId), limit: 50 }));
    }
  };
  
  // Получаем статус задачи в виде бейджа
  const getStatusBadge = (status: TaskStatus) => {
    const statusMap = {
      [TaskStatus.NEW]: { color: 'gray', text: 'Новая' },
      [TaskStatus.PENDING]: { color: 'blue', text: 'Ожидание' },
      [TaskStatus.IN_PROGRESS]: { color: 'yellow', text: 'В процессе' },
      [TaskStatus.RESOLVED]: { color: 'teal', text: 'Решена' },
      [TaskStatus.COMPLETED]: { color: 'green', text: 'Завершена' },
      [TaskStatus.FAILED]: { color: 'red', text: 'Ошибка' },
      [TaskStatus.CANCELED]: { color: 'orange', text: 'Отменена' },
    };
    
    const { color, text } = statusMap[status] || { color: 'gray', text: status };
    
    return (
      <Badge colorScheme={color} borderRadius="full" px={2}>
        {text}
      </Badge>
    );
  };
  
  // Получаем цвет для типа лога
  const getLogColor = (type: LogType) => {
    const logColorMap = {
      [LogType.INFO]: 'blue.500',
      [LogType.ERROR]: 'red.500',
      [LogType.WARNING]: 'orange.500',
      [LogType.PROGRESS]: 'green.500',
    };
    
    return logColorMap[type] || 'gray.500';
  };
  
  // Преобразуем логи для отображения
  const renderLogs = () => {
    return logs.length > 0 ? (
      <VStack spacing={2} align="stretch" maxH="500px" overflowY="auto" p={2}>
        {logs.map((log) => (
          <Box 
            key={log.id} 
            p={3} 
            borderWidth="1px" 
            borderRadius="md" 
            borderColor={borderColor}
          >
            <Flex justifyContent="space-between" mb={1}>
              <Text fontWeight="medium" color={getLogColor(log.type)}>
                {log.type}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {new Date(log.timestamp).toLocaleString()}
              </Text>
            </Flex>
            <Text>{log.message}</Text>
            {log.progress !== undefined && (
              <Progress 
                value={log.progress} 
                size="xs" 
                colorScheme="blue" 
                mt={2} 
                borderRadius="full"
              />
            )}
          </Box>
        ))}
      </VStack>
    ) : (
      <Text color="gray.500" textAlign="center" py={4}>
        Логи отсутствуют
      </Text>
    );
  };
  
  // Рендерим подзадачи
  const renderSubtasks = (subtasks?: Subtask[]) => {
    if (!subtasks || subtasks.length === 0) {
      return (
        <Text color="gray.500" textAlign="center" py={4}>
          Подзадачи отсутствуют или еще не созданы
        </Text>
      );
    }
    
    return (
      <Accordion allowMultiple defaultIndex={[0]}>
        {subtasks.map((subtask) => (
          <AccordionItem key={subtask.id} borderColor={borderColor}>
            <h2>
              <AccordionButton py={3}>
                <Box flex="1" textAlign="left">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="medium">{subtask.title}</Text>
                    <HStack spacing={2}>
                      {getStatusBadge(subtask.status)}
                      <Text>{subtask.progress}%</Text>
                    </HStack>
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack align="stretch" spacing={3}>
                {subtask.description && (
                  <Text>{subtask.description}</Text>
                )}
                
                <Progress 
                  value={subtask.progress} 
                  size="sm" 
                  colorScheme={subtask.status === TaskStatus.FAILED ? 'red' : 'blue'} 
                  borderRadius="full"
                />
                
                {subtask.dependsOn && subtask.dependsOn.length > 0 && (
                  <HStack>
                    <Text fontWeight="medium">Зависит от:</Text>
                    {subtask.dependsOn.map(depId => (
                      <Badge key={depId} colorScheme="purple">
                        #{depId}
                      </Badge>
                    ))}
                  </HStack>
                )}
                
                {subtask.startTime && (
                  <Text fontSize="sm" color="gray.500">
                    Начало: {new Date(subtask.startTime).toLocaleString()}
                  </Text>
                )}
                
                {subtask.endTime && (
                  <Text fontSize="sm" color="gray.500">
                    Завершение: {new Date(subtask.endTime).toLocaleString()}
                  </Text>
                )}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };
  
  // Рендерим генерации кода
  const renderCodeGenerations = () => {
    if (!selectedTask?.codeGenerations || selectedTask.codeGenerations.length === 0) {
      return (
        <Text color="gray.500" textAlign="center" py={4}>
          Генерации кода отсутствуют
        </Text>
      );
    }
    
    return (
      <VStack spacing={6} align="stretch">
        {selectedTask.codeGenerations.map((generation) => (
          <CodeEditorPanel 
            key={generation.id} 
            codeGeneration={generation} 
            onRegenerate={() => console.log('Regenerate code for', generation.id)}
          />
        ))}
      </VStack>
    );
  };
  
  // Определяем, можно ли управлять задачей
  const canProcess = selectedTask?.status === TaskStatus.NEW || selectedTask?.status === TaskStatus.PENDING;
  const canPause = selectedTask?.status === TaskStatus.IN_PROGRESS;
  const canStop = selectedTask?.status === TaskStatus.IN_PROGRESS || selectedTask?.status === TaskStatus.PENDING;
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  if (!selectedTask) {
    return (
      <Box textAlign="center" p={10}>
        <Heading size="md" mb={4}>Задача не найдена</Heading>
        <Button leftIcon={<BackIcon />} onClick={() => navigate('/tasks')}>
          Вернуться к списку задач
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <HStack justifyContent="space-between" alignItems="center" mb={6}>
        <Button 
          leftIcon={<BackIcon />} 
          variant="ghost" 
          onClick={() => navigate('/tasks')}
        >
          К списку задач
        </Button>
        
        <HStack>
          <Button 
            leftIcon={<RefreshIcon />} 
            variant="outline" 
            onClick={handleRefresh}
          >
            Обновить
          </Button>
          
          {canProcess && (
            <Button 
              leftIcon={<PlayIcon />} 
              colorScheme="green" 
              onClick={handleProcessTask}
            >
              Запустить обработку
            </Button>
          )}
          
          {canPause && (
            <Button 
              leftIcon={<PauseIcon />} 
              colorScheme="yellow"
            >
              Приостановить
            </Button>
          )}
          
          {canStop && (
            <Button 
              leftIcon={<StopIcon />} 
              colorScheme="red"
            >
              Остановить
            </Button>
          )}
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
                <Heading size="lg">{selectedTask.title}</Heading>
                <HStack spacing={2}>
                  {getStatusBadge(selectedTask.status)}
                  <Badge colorScheme="purple" borderRadius="full" px={2}>
                    #{selectedTask.id}
                  </Badge>
                </HStack>
              </VStack>
            </CardHeader>
            
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Text>{selectedTask.description}</Text>
                
                <Divider />
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Прогресс:</Text>
                  <Text>{selectedTask.progress}%</Text>
                </HStack>
                
                <Progress 
                  value={selectedTask.progress} 
                  size="md" 
                  colorScheme={selectedTask.status === TaskStatus.FAILED ? 'red' : 'blue'} 
                  borderRadius="full"
                />
              </VStack>
            </CardBody>
            
            <CardFooter>
              <Flex width="100%" justifyContent="space-between" flexWrap="wrap">
                <Text fontSize="sm" color="gray.500">
                  Создана: {new Date(selectedTask.createdAt).toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Обновлена: {new Date(selectedTask.updatedAt).toLocaleString()}
                </Text>
              </Flex>
            </CardFooter>
          </Card>
          
          <Tabs variant="enclosed" colorScheme="blue" isLazy>
            <TabList>
              <Tab>Подзадачи</Tab>
              <Tab>Генерации кода</Tab>
              <Tab>Логи</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={4}>
                {renderSubtasks(selectedTask.subtasks)}
              </TabPanel>
              
              <TabPanel p={4}>
                {renderCodeGenerations()}
              </TabPanel>
              
              <TabPanel p={4}>
                {renderLogs()}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>
        
        <GridItem>
          <Card borderColor={borderColor} boxShadow="sm" mb={6}>
            <CardHeader>
              <Heading size="md">Информация о задаче</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Проект:</Text>
                  <Text>Biz360 CRM</Text>
                </HStack>
                
                <Divider />
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Приоритет:</Text>
                  <Badge colorScheme={
                    selectedTask.priority === 'critical' ? 'red' : 
                    selectedTask.priority === 'high' ? 'orange' : 
                    selectedTask.priority === 'medium' ? 'blue' : 
                    'gray'
                  }>
                    {selectedTask.priority}
                  </Badge>
                </HStack>
                
                <Divider />
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Создана:</Text>
                  <Text>{new Date(selectedTask.createdAt).toLocaleDateString()}</Text>
                </HStack>
                
                <Divider />
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Автор:</Text>
                  <Text>Пользователь #{selectedTask.createdBy}</Text>
                </HStack>
                
                {selectedTask.assignedTo && (
                  <>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Назначена:</Text>
                      <Text>Пользователь #{selectedTask.assignedTo}</Text>
                    </HStack>
                  </>
                )}
                
                {selectedTask.startTime && (
                  <>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Начало работы:</Text>
                      <Text>{new Date(selectedTask.startTime).toLocaleString()}</Text>
                    </HStack>
                  </>
                )}
                
                {selectedTask.endTime && (
                  <>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Завершение:</Text>
                      <Text>{new Date(selectedTask.endTime).toLocaleString()}</Text>
                    </HStack>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
          
          <SimpleGrid columns={2} spacing={4} mb={6}>
            <Stat
              p={4}
              bg={cardBg}
              borderRadius="lg"
              boxShadow="sm"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <StatLabel>Подзадачи</StatLabel>
              <StatNumber>{selectedTask.subtasks?.length || 0}</StatNumber>
              <StatHelpText>
                {selectedTask.subtasks?.filter(s => s.status === TaskStatus.COMPLETED).length || 0} завершено
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
              <StatLabel>Генерации кода</StatLabel>
              <StatNumber>{selectedTask.codeGenerations?.length || 0}</StatNumber>
              <StatHelpText>
                {selectedTask.codeGenerations?.filter(c => c.status === 'approved').length || 0} одобрено
              </StatHelpText>
            </Stat>
          </SimpleGrid>
          
          <Card borderColor={borderColor} boxShadow="sm">
            <CardHeader>
              <Heading size="md">Последняя активность</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={2} align="stretch">
                {logs.slice(0, 5).map((log) => (
                  <Box 
                    key={log.id} 
                    p={2} 
                    borderWidth="1px" 
                    borderRadius="md" 
                    borderColor={borderColor}
                  >
                    <Flex justifyContent="space-between" mb={0.5}>
                      <Text fontSize="sm" fontWeight="medium" color={getLogColor(log.type)}>
                        {log.type}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </Text>
                    </Flex>
                    <Text fontSize="sm" noOfLines={2}>{log.message}</Text>
                  </Box>
                ))}
                {logs.length === 0 && (
                  <Text color="gray.500" textAlign="center">
                    Нет активности
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default TaskDetailPage;