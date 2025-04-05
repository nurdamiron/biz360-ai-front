// src/components/task/TaskProgressCard.tsx
import React from 'react';
import { 
  Box, Flex, Text, Progress, Badge, IconButton, 
  VStack, HStack, useColorModeValue, Tooltip,
  Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Task, TaskStatus, TaskPriority, LogType } from '../../types/task.types';
import { processTask } from '../../store/slices/tasksSlice';
import { useAppDispatch } from '../../hooks/redux';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const PlayIcon = () => <span>▶️</span>;
const PauseIcon = () => <span>⏸️</span>;
const StopIcon = () => <span>⏹️</span>;
const ViewIcon = () => <span>👁️</span>;
const MoreIcon = () => <span>⋮</span>;

interface TaskProgressCardProps {
  task: Task;
  showDetailedLogs?: boolean;
}

const TaskProgressCard: React.FC<TaskProgressCardProps> = ({ 
  task, 
  showDetailedLogs = false 
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Получаем последние логи
  const recentLogs = task.logs?.slice(-3).reverse() || [];
  
  // Преобразование статуса в Badge
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
  
  // Преобразование приоритета в Badge
  const getPriorityBadge = (priority: TaskPriority) => {
    const priorityMap = {
      [TaskPriority.LOW]: { color: 'gray', text: 'Низкий' },
      [TaskPriority.MEDIUM]: { color: 'blue', text: 'Средний' },
      [TaskPriority.HIGH]: { color: 'orange', text: 'Высокий' },
      [TaskPriority.CRITICAL]: { color: 'red', text: 'Критический' },
    };
    
    const { color, text } = priorityMap[priority] || { color: 'gray', text: priority };
    
    return (
      <Badge colorScheme={color} variant="outline" borderRadius="full" px={2}>
        {text}
      </Badge>
    );
  };
  
  // Преобразование типа лога в цвет
  const getLogColor = (type: LogType) => {
    const logColorMap = {
      [LogType.INFO]: 'blue.500',
      [LogType.ERROR]: 'red.500',
      [LogType.WARNING]: 'orange.500',
      [LogType.PROGRESS]: 'green.500',
    };
    
    return logColorMap[type] || 'gray.500';
  };
  
  // Обработчик для перехода к детальной странице задачи
  const handleViewDetails = () => {
    navigate(`/tasks/${task.id}`);
  };
  
  // Обработчик для запуска обработки задачи
  const handleProcessTask = () => {
    dispatch(processTask(task.id));
  };
  
  // Определяем, можно ли запустить задачу
  const canProcess = task.status === TaskStatus.NEW || task.status === TaskStatus.PENDING;
  
  // Определяем, можно ли приостановить задачу
  const canPause = task.status === TaskStatus.IN_PROGRESS;
  
  // Определяем, можно ли остановить задачу
  const canStop = task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.PENDING;
  
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={cardBg}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
      width="100%"
    >
      <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold" fontSize="lg">{task.title}</Text>
          <HStack spacing={2}>
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </HStack>
        </VStack>
        
        <HStack>
          <Tooltip label="Просмотреть детали">
            <IconButton
              aria-label="View details"
              icon={<ViewIcon />}
              size="sm"
              variant="ghost"
              onClick={handleViewDetails}
            />
          </Tooltip>
          
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="More options"
              icon={<MoreIcon />}
              size="sm"
              variant="ghost"
            />
            <MenuList>
              {canProcess && (
                <MenuItem
                  icon={<PlayIcon />}
                  onClick={handleProcessTask}
                >
                  Запустить обработку
                </MenuItem>
              )}
              {canPause && (
                <MenuItem
                  icon={<PauseIcon />}
                >
                  Приостановить
                </MenuItem>
              )}
              {canStop && (
                <MenuItem
                  icon={<StopIcon />}
                >
                  Остановить
                </MenuItem>
              )}
              <MenuItem onClick={handleViewDetails}>
                Подробная информация
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      <Text fontSize="sm" noOfLines={2} mb={3} color="gray.500">
        {task.description}
      </Text>
      
      <VStack spacing={2} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="sm" fontWeight="medium">
            Прогресс:
          </Text>
          <Text fontSize="sm">
            {task.progress}%
          </Text>
        </Flex>
        
        <Progress 
          value={task.progress} 
          size="sm" 
          colorScheme={task.status === TaskStatus.FAILED ? 'red' : 'blue'} 
          borderRadius="full"
        />
        
        {showDetailedLogs && recentLogs.length > 0 && (
          <Box mt={3}>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Последние действия:
            </Text>
            <VStack spacing={1} align="stretch">
              {recentLogs.map((log) => (
                <Box 
                  key={log.id} 
                  p={2} 
                  bg={useColorModeValue('gray.50', 'gray.700')} 
                  borderRadius="md"
                  fontSize="xs"
                >
                  <Flex justifyContent="space-between" mb={0.5}>
                    <Text fontWeight="medium" color={getLogColor(log.type)}>
                      {log.type}
                    </Text>
                    <Text color="gray.500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </Text>
                  </Flex>
                  <Text>{log.message}</Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default TaskProgressCard;