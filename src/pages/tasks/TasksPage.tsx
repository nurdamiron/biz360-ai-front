// src/pages/tasks/TasksPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Checkbox,
  Badge,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Spinner,
  FormControl,
  FormLabel,
  Divider,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTasks, createTask } from '../../store/slices/tasksSlice';
import { TaskFilterParams } from '../../types/api.types';
import { Task, TaskStatus, TaskPriority } from '../../types/task.types';
import TaskProgressCard from '../../components/task/TaskProgressCard';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const SearchIcon = () => <span>🔍</span>;
const FilterIcon = () => <span>🔎</span>;
const AddIcon = () => <span>➕</span>;
const SortIcon = () => <span>↓↑</span>;

const TasksPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tasks, isLoading } = useAppSelector(state => state.tasks);
  
  // Состояние для фильтров
  const [filters, setFilters] = useState<TaskFilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });
  
  // Состояние для текстового поиска
  const [searchTerm, setSearchTerm] = useState('');
  
  // Состояние для фильтра по статусу
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  
  // Состояние для фильтра по приоритету
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  
  // Состояние для новой задачи
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    projectId: 1  // По умолчанию первый проект
  });
  
  // Управление модальным окном создания задачи
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Состояние для ошибок валидации
  const [validationErrors, setValidationErrors] = useState({
    title: '',
    description: ''
  });
  
  // Цвета
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Загружаем задачи при монтировании и при изменении фильтров
  useEffect(() => {
    const queryParams: TaskFilterParams = { ...filters };
    
    // Добавляем текстовый поиск, если есть
    if (searchTerm.trim()) {
      queryParams.search = searchTerm.trim();
    }
    
    // Добавляем фильтр по статусу, если выбраны статусы
    if (statusFilter.length > 0) {
      queryParams.status = statusFilter;
    }
    
    // Добавляем фильтр по приоритету, если выбраны приоритеты
    if (priorityFilter.length > 0) {
      queryParams.priority = priorityFilter;
    }
    
    dispatch(fetchTasks(queryParams));
  }, [dispatch, filters, searchTerm, statusFilter, priorityFilter]);
  
  // Обработчик изменения сортировки
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    // Разбиваем значение на поле и порядок (например, "updatedAt_desc")
    const [sortBy, sortOrder] = value.split('_');
    
    setFilters({
      ...filters,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
      page: 1  // Сброс на первую страницу
    });
  };
  
  // Обработчик изменения количества элементов на странице
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      limit: Number(e.target.value),
      page: 1  // Сброс на первую страницу
    });
  };
  
  // Обработчик изменения текстового поиска
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Обработчик отправки поиска
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Поиск будет выполнен автоматически через useEffect
  };
  
  // Обработчик изменения фильтра по статусу
  const handleStatusFilterChange = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(item => item !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };
  
  // Обработчик изменения фильтра по приоритету
  const handlePriorityFilterChange = (priority: string) => {
    if (priorityFilter.includes(priority)) {
      setPriorityFilter(priorityFilter.filter(item => item !== priority));
    } else {
      setPriorityFilter([...priorityFilter, priority]);
    }
  };
  
  // Обработчик сброса всех фильтров
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
    setPriorityFilter([]);
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
  };
  
  // Обработчик создания новой задачи
  const handleCreateTask = async () => {
    // Проверка валидации
    const errors = {
      title: '',
      description: ''
    };
    
    if (!newTask.title.trim()) {
      errors.title = 'Название задачи обязательно';
    }
    
    if (!newTask.description.trim()) {
      errors.description = 'Описание задачи обязательно';
    }
    
    if (errors.title || errors.description) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      const result = await dispatch(createTask(newTask)).unwrap();
      
      // Закрываем модальное окно
      onClose();
      
      // Очищаем форму
      setNewTask({
        title: '',
        description: '',
        priority: TaskPriority.MEDIUM,
        projectId: 1
      });
      
      // Сбрасываем ошибки валидации
      setValidationErrors({
        title: '',
        description: ''
      });
      
      // Если задача создана успешно, переходим на страницу с деталями
      if (result?.id) {
        navigate(`/tasks/${result.id}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      // Можно добавить обработку ошибок
    }
  };
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <VStack align="flex-start" spacing={1}>
          <Heading size="lg">Задачи</Heading>
          <Text color="gray.500">
            Управление и мониторинг задач проекта
          </Text>
        </VStack>
        
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          onClick={onOpen}
        >
          Новая задача
        </Button>
      </Flex>
      
      <Card borderColor={borderColor} boxShadow="sm" mb={6}>
        <CardBody>
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align={{ base: 'stretch', md: 'center' }}
            gap={4}
          >
            <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon />
                </InputLeftElement>
                <Input 
                  placeholder="Поиск задач..." 
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </form>
            
            <HStack spacing={2}>
              <Menu closeOnSelect={false}>
                <MenuButton
                  as={IconButton}
                  aria-label="Фильтры"
                  icon={<FilterIcon />}
                  variant="outline"
                />
                <MenuList p={2} minWidth="240px">
                  <Text fontWeight="bold" mb={2}>Статус</Text>
                  <VStack align="start" mb={3} spacing={1}>
                    <Checkbox
                      isChecked={statusFilter.includes(TaskStatus.NEW)}
                      onChange={() => handleStatusFilterChange(TaskStatus.NEW)}
                    >
                      Новые
                    </Checkbox>
                    <Checkbox
                      isChecked={statusFilter.includes(TaskStatus.IN_PROGRESS)}
                      onChange={() => handleStatusFilterChange(TaskStatus.IN_PROGRESS)}
                    >
                      В процессе
                    </Checkbox>
                    <Checkbox
                      isChecked={statusFilter.includes(TaskStatus.COMPLETED)}
                      onChange={() => handleStatusFilterChange(TaskStatus.COMPLETED)}
                    >
                      Завершенные
                    </Checkbox>
                    <Checkbox
                      isChecked={statusFilter.includes(TaskStatus.FAILED)}
                      onChange={() => handleStatusFilterChange(TaskStatus.FAILED)}
                    >
                      Ошибки
                    </Checkbox>
                  </VStack>
                  
                  <Divider my={2} />
                  
                  <Text fontWeight="bold" mb={2}>Приоритет</Text>
                  <VStack align="start" mb={3} spacing={1}>
                    <Checkbox
                      isChecked={priorityFilter.includes(TaskPriority.LOW)}
                      onChange={() => handlePriorityFilterChange(TaskPriority.LOW)}
                    >
                      Низкий
                    </Checkbox>
                    <Checkbox
                      isChecked={priorityFilter.includes(TaskPriority.MEDIUM)}
                      onChange={() => handlePriorityFilterChange(TaskPriority.MEDIUM)}
                    >
                      Средний
                    </Checkbox>
                    <Checkbox
                      isChecked={priorityFilter.includes(TaskPriority.HIGH)}
                      onChange={() => handlePriorityFilterChange(TaskPriority.HIGH)}
                    >
                      Высокий
                    </Checkbox>
                    <Checkbox
                      isChecked={priorityFilter.includes(TaskPriority.CRITICAL)}
                      onChange={() => handlePriorityFilterChange(TaskPriority.CRITICAL)}
                    >
                      Критический
                    </Checkbox>
                  </VStack>
                  
                  <Button 
                    size="sm" 
                    width="full" 
                    onClick={handleResetFilters}
                  >
                    Сбросить все фильтры
                  </Button>
                </MenuList>
              </Menu>
              
              <Select 
                width="auto" 
                size="md" 
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={handleSortChange}
              >
                <option value="updatedAt_desc">Последние обновления</option>
                <option value="createdAt_desc">Новые первыми</option>
                <option value="createdAt_asc">Старые первыми</option>
                <option value="priority_desc">По приоритету (выс→низк)</option>
                <option value="priority_asc">По приоритету (низк→выс)</option>
              </Select>
              
              <Select 
                width="auto" 
                size="md" 
                value={filters.limit.toString()}
                onChange={handleLimitChange}
              >
                <option value="5">5 на странице</option>
                <option value="10">10 на странице</option>
                <option value="20">20 на странице</option>
                <option value="50">50 на странице</option>
              </Select>
            </HStack>
          </Flex>
          
          {/* Индикаторы активных фильтров */}
          {(statusFilter.length > 0 || priorityFilter.length > 0 || searchTerm) && (
            <Flex wrap="wrap" gap={2} mt={4}>
              {searchTerm && (
                <Badge colorScheme="blue" borderRadius="full" px={2} py={1}>
                  Поиск: {searchTerm}
                </Badge>
              )}
              
              {statusFilter.map(status => (
                <Badge key={status} colorScheme="purple" borderRadius="full" px={2} py={1}>
                  Статус: {status}
                </Badge>
              ))}
              
              {priorityFilter.map(priority => (
                <Badge key={priority} colorScheme="orange" borderRadius="full" px={2} py={1}>
                  Приоритет: {priority}
                </Badge>
              ))}
              
              <Button 
                size="xs" 
                variant="ghost" 
                onClick={handleResetFilters}
              >
                Сбросить все
              </Button>
            </Flex>
          )}
        </CardBody>
      </Card>
      
      {isLoading ? (
        <Flex justify="center" align="center" p={10}>
          <Spinner size="xl" />
        </Flex>
      ) : tasks.length > 0 ? (
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {tasks.map(task => (
            <TaskProgressCard key={task.id} task={task} />
          ))}
        </SimpleGrid>
      ) : (
        <Box p={10} textAlign="center">
          <Text fontSize="lg" color="gray.500">
            Задачи не найдены
          </Text>
          <Text color="gray.500" mt={2}>
            Попробуйте изменить параметры фильтрации или создайте новую задачу
          </Text>
          <Button 
            mt={4} 
            colorScheme="blue" 
            leftIcon={<AddIcon />} 
            onClick={onOpen}
          >
            Создать задачу
          </Button>
        </Box>
      )}
      
      {/* Модальное окно создания задачи */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Создание новой задачи</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!validationErrors.title}>
                <FormLabel>Название задачи</FormLabel>
                <Input 
                  placeholder="Введите название задачи" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
                {validationErrors.title && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {validationErrors.title}
                  </Text>
                )}
              </FormControl>
              
              <FormControl isRequired isInvalid={!!validationErrors.description}>
                <FormLabel>Описание задачи</FormLabel>
                <Textarea 
                  placeholder="Подробно опишите задачу..." 
                  rows={5}
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
                {validationErrors.description && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {validationErrors.description}
                  </Text>
                )}
              </FormControl>
              
              <FormControl>
                <FormLabel>Приоритет</FormLabel>
                <Select 
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
                >
                  <option value={TaskPriority.LOW}>Низкий</option>
                  <option value={TaskPriority.MEDIUM}>Средний</option>
                  <option value={TaskPriority.HIGH}>Высокий</option>
                  <option value={TaskPriority.CRITICAL}>Критический</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Проект</FormLabel>
                <Select 
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({...newTask, projectId: Number(e.target.value)})}
                >
                  <option value={1}>Biz360 CRM</option>
                  {/* Здесь будет список проектов из API */}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button colorScheme="blue" onClick={handleCreateTask}>
              Создать задачу
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TasksPage;