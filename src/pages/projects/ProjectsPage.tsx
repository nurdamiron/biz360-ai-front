// src/pages/projects/ProjectsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Select,
  VStack,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Spinner,
  useToast,
  FormErrorMessage,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchProjects, 
  createProject, 
  ProjectFilterParams 
} from '../../store/slices/projectsSlice';
import ProjectCard from '../../components/project/ProjectCard';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const AddIcon = () => <span>➕</span>;
const SearchIcon = () => <span>🔍</span>;
const FilterIcon = () => <span>🔎</span>;

const ProjectsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, isLoading } = useAppSelector(state => state.projects);
  const toast = useToast();
  
  // Состояние для фильтров
  const [filters, setFilters] = useState<ProjectFilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });
  
  // Состояние для текстового поиска
  const [searchTerm, setSearchTerm] = useState('');
  
  // Состояние для фильтра по статусу
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Состояние для нового проекта
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });
  
  // Состояние для ошибок валидации
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    description: ''
  });
  
  // Управление модальным окном создания проекта
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Цвета
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Загружаем проекты при монтировании и при изменении фильтров
  useEffect(() => {
    const queryParams: ProjectFilterParams = { ...filters };
    
    // Добавляем текстовый поиск, если есть
    if (searchTerm.trim()) {
      queryParams.search = searchTerm.trim();
    }
    
    // Добавляем фильтр по статусу, если выбран
    if (statusFilter) {
      queryParams.status = statusFilter;
    }
    
    dispatch(fetchProjects(queryParams));
  }, [dispatch, filters, searchTerm, statusFilter]);
  
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
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  // Обработчик сброса всех фильтров
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
  };
  
  // Обработчик создания нового проекта
  const handleCreateProject = async () => {
    // Проверка валидации
    const errors = {
      name: '',
      description: ''
    };
    
    if (!newProject.name.trim()) {
      errors.name = 'Название проекта обязательно';
    }
    
    if (!newProject.description.trim()) {
      errors.description = 'Описание проекта обязательно';
    }
    
    if (errors.name || errors.description) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      const result = await dispatch(createProject(newProject)).unwrap();
      
      // Закрываем модальное окно
      onClose();
      
      // Очищаем форму
      setNewProject({
        name: '',
        description: ''
      });
      
      // Сбрасываем ошибки валидации
      setValidationErrors({
        name: '',
        description: ''
      });
      
      // Показываем уведомление об успешном создании
      toast({
        title: 'Проект создан',
        description: `Проект "${result.name}" успешно создан`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Если проект создан успешно, переходим на страницу с деталями
      if (result?.id) {
        navigate(`/projects/${result.id}`);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка при создании проекта',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Обработчик просмотра проекта
  const handleViewProject = (id: number) => {
    navigate(`/projects/${id}`);
  };
  
  // Обработчик редактирования проекта (заглушка)
  const handleEditProject = (id: number) => {
    toast({
      title: 'Редактирование проекта',
      description: `Функция редактирования проекта #${id} будет доступна в следующей версии`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Обработчик удаления проекта (заглушка)
  const handleDeleteProject = (id: number) => {
    toast({
      title: 'Удаление проекта',
      description: `Функция удаления проекта #${id} будет доступна в следующей версии`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <VStack align="flex-start" spacing={1}>
          <Heading size="lg">Проекты</Heading>
          <Text color="gray.500">
            Управление проектами для ИИ-ассистента
          </Text>
        </VStack>
        
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          onClick={onOpen}
        >
          Новый проект
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
                  placeholder="Поиск проектов..." 
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </form>
            
            <HStack spacing={2}>
              <Select 
                width="auto" 
                size="md" 
                value={statusFilter}
                onChange={handleStatusFilterChange}
                placeholder="Все статусы"
              >
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
                <option value="archived">Архивированные</option>
              </Select>
              
              <Select 
                width="auto" 
                size="md" 
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={handleSortChange}
              >
                <option value="updatedAt_desc">Последние обновления</option>
                <option value="createdAt_desc">Новые первыми</option>
                <option value="createdAt_asc">Старые первыми</option>
                <option value="name_asc">По имени (А-Я)</option>
                <option value="name_desc">По имени (Я-А)</option>
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
          {(statusFilter || searchTerm) && (
            <Flex wrap="wrap" gap={2} mt={4}>
              {searchTerm && (
                <Badge colorScheme="blue" borderRadius="full" px={2} py={1}>
                  Поиск: {searchTerm}
                </Badge>
              )}
              
              {statusFilter && (
                <Badge colorScheme="purple" borderRadius="full" px={2} py={1}>
                  Статус: {statusFilter}
                </Badge>
              )}
              
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
      ) : projects.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onView={handleViewProject}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Box p={10} textAlign="center">
          <Text fontSize="lg" color="gray.500">
            Проекты не найдены
          </Text>
          <Text color="gray.500" mt={2}>
            Попробуйте изменить параметры фильтрации или создайте новый проект
          </Text>
          <Button 
            mt={4} 
            colorScheme="blue" 
            leftIcon={<AddIcon />} 
            onClick={onOpen}
          >
            Создать проект
          </Button>
        </Box>
      )}
      
      {/* Модальное окно создания проекта */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Создание нового проекта</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!validationErrors.name}>
                <FormLabel>Название проекта</FormLabel>
                <Input 
                  placeholder="Введите название проекта" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                />
                {validationErrors.name && (
                  <FormErrorMessage>{validationErrors.name}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl isRequired isInvalid={!!validationErrors.description}>
                <FormLabel>Описание проекта</FormLabel>
                <Textarea 
                  placeholder="Введите описание проекта..." 
                  rows={5}
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
                {validationErrors.description && (
                  <FormErrorMessage>{validationErrors.description}</FormErrorMessage>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button colorScheme="blue" onClick={handleCreateProject}>
              Создать проект
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProjectsPage;