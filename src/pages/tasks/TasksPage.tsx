import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
  Checkbox,
  FormControlLabel,
  FormGroup,
  SelectChangeEvent,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTasks, createTask } from '../../store/slices/tasksSlice';
import { TaskFilterParams } from '../../types/api.types';
import { Task, TaskStatus, TaskPriority } from '../../types/task.types';
import TaskProgressCard from '../../components/task/TaskProgressCard';

// Иконки
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';

const TasksPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
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
  
  // Состояние для диалогового окна создания задачи
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Состояние для активного фильтра
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Состояние для ошибок валидации
  const [validationErrors, setValidationErrors] = useState({
    title: '',
    description: ''
  });
  
  // Проверяем проектные параметры из state навигации
  useEffect(() => {
    if (location.state && 'projectId' in location.state) {
      setFilters(prev => ({
        ...prev,
        projectId: location.state.projectId as number
      }));
    }
  }, [location.state]);
  
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
    
    // Вызываем асинхронное действие для загрузки задач
    dispatch(fetchTasks(queryParams));
  }, [dispatch, filters, searchTerm, statusFilter, priorityFilter]);
  
  // Обработчик изменения сортировки
  const handleSortChange = (e: SelectChangeEvent) => {
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
  const handleLimitChange = (e: SelectChangeEvent) => {
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
  
  // Обработчик открытия диалогового окна создания задачи
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  
  // Обработчик закрытия диалогового окна создания задачи
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewTask({
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      projectId: 1
    });
    setValidationErrors({
      title: '',
      description: ''
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
      
      // Закрываем диалоговое окно
      handleCloseDialog();
      
      // Показываем уведомление об успешном создании
      enqueueSnackbar(`Задача "${result.title}" успешно создана`, { 
        variant: 'success',
        autoHideDuration: 3000
      });
      
      // Если задача создана успешно, переходим на страницу с деталями
      if (result?.id) {
        navigate(`/tasks/${result.id}`);
      }
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Произошла ошибка при создании задачи', { 
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  };
  
  // Отрисовка скелетона загрузки
  const renderSkeletons = () => {
    return Array(4).fill(0).map((_, index) => (
      <Grid item xs={12} md={6} key={`skeleton-${index}`}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
            <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={40} />
          </CardContent>
        </Card>
      </Grid>
    ));
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Задачи
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Новая задача
        </Button>
      </Box>
      
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                placeholder="Поиск задач..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant={filterOpen ? "contained" : "outlined"}
              startIcon={filterOpen ? <FilterListOffIcon /> : <FilterListIcon />}
              onClick={() => setFilterOpen(!filterOpen)}
              fullWidth
            >
              Фильтры
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-label">Сортировка</InputLabel>
              <Select
                labelId="sort-label"
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={handleSortChange}
                label="Сортировка"
              >
                <MenuItem value="updatedAt_desc">Последние обновления</MenuItem>
                <MenuItem value="createdAt_desc">Новые первыми</MenuItem>
                <MenuItem value="createdAt_asc">Старые первыми</MenuItem>
                <MenuItem value="priority_desc">По приоритету (выс→низк)</MenuItem>
                <MenuItem value="priority_asc">По приоритету (низк→выс)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="limit-label">Показывать</InputLabel>
              <Select
                labelId="limit-label"
                value={filters.limit.toString()}
                onChange={handleLimitChange}
                label="Показывать"
              >
                <MenuItem value="5">5 на странице</MenuItem>
                <MenuItem value="10">10 на странице</MenuItem>
                <MenuItem value="20">20 на странице</MenuItem>
                <MenuItem value="50">50 на странице</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={1}>
            <IconButton 
              color="primary" 
              onClick={handleResetFilters}
              title="Сбросить фильтры"
              aria-label="Сбросить фильтры"
            >
              <FilterListOffIcon />
            </IconButton>
          </Grid>
        </Grid>
        
        {/* Панель расширенных фильтров */}
        {filterOpen && (
          <Box mt={3} p={2} bgcolor="rgba(0, 0, 0, 0.02)" borderRadius={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Статус задачи
                </Typography>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={statusFilter.includes(TaskStatus.NEW)}
                        onChange={() => handleStatusFilterChange(TaskStatus.NEW)}
                        size="small"
                      />
                    }
                    label="Новые"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={statusFilter.includes(TaskStatus.IN_PROGRESS)}
                        onChange={() => handleStatusFilterChange(TaskStatus.IN_PROGRESS)}
                        size="small"
                      />
                    }
                    label="В процессе"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={statusFilter.includes(TaskStatus.COMPLETED)}
                        onChange={() => handleStatusFilterChange(TaskStatus.COMPLETED)}
                        size="small"
                      />
                    }
                    label="Завершенные"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={statusFilter.includes(TaskStatus.FAILED)}
                        onChange={() => handleStatusFilterChange(TaskStatus.FAILED)}
                        size="small"
                      />
                    }
                    label="Ошибки"
                  />
                </FormGroup>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Приоритет
                </Typography>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={priorityFilter.includes(TaskPriority.LOW)}
                        onChange={() => handlePriorityFilterChange(TaskPriority.LOW)}
                        size="small"
                      />
                    }
                    label="Низкий"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={priorityFilter.includes(TaskPriority.MEDIUM)}
                        onChange={() => handlePriorityFilterChange(TaskPriority.MEDIUM)}
                        size="small"
                      />
                    }
                    label="Средний"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={priorityFilter.includes(TaskPriority.HIGH)}
                        onChange={() => handlePriorityFilterChange(TaskPriority.HIGH)}
                        size="small"
                      />
                    }
                    label="Высокий"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={priorityFilter.includes(TaskPriority.CRITICAL)}
                        onChange={() => handlePriorityFilterChange(TaskPriority.CRITICAL)}
                        size="small"
                      />
                    }
                    label="Критический"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Индикаторы активных фильтров */}
        {(statusFilter.length > 0 || priorityFilter.length > 0 || searchTerm) && (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
            {searchTerm && (
              <Chip 
                label={`Поиск: ${searchTerm}`} 
                color="primary" 
                onDelete={() => setSearchTerm('')} 
                size="small"
              />
            )}
            
            {statusFilter.map(status => (
              <Chip 
                key={status} 
                label={`Статус: ${status}`} 
                color="secondary" 
                onDelete={() => handleStatusFilterChange(status)} 
                size="small"
              />
            ))}
            
            {priorityFilter.map(priority => (
              <Chip 
                key={priority} 
                label={`Приоритет: ${priority}`} 
                color="info" 
                onDelete={() => handlePriorityFilterChange(priority)} 
                size="small"
              />
            ))}
            
            <Chip 
              label="Сбросить все" 
              variant="outlined" 
              onClick={handleResetFilters} 
              size="small"
            />
          </Stack>
        )}
      </Paper>
      
      {isLoading ? (
        <Grid container spacing={3}>
          {renderSkeletons()}
        </Grid>
      ) : tasks.length > 0 ? (
        <Grid container spacing={3}>
          {tasks.map(task => (
            <Grid item xs={12} sm={6} key={task.id}>
              <TaskProgressCard task={task} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Задачи не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Попробуйте изменить параметры фильтрации или создайте новую задачу
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={handleOpenDialog}
            sx={{ mt: 2 }}
          >
            Создать задачу
          </Button>
        </Paper>
      )}
      
      {/* Диалоговое окно создания задачи */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Создание новой задачи</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Название задачи"
            fullWidth
            variant="outlined"
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            error={!!validationErrors.title}
            helperText={validationErrors.title}
          />
          
          <TextField
            margin="normal"
            label="Описание задачи"
            fullWidth
            multiline
            rows={5}
            variant="outlined"
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            error={!!validationErrors.description}
            helperText={validationErrors.description}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="priority-label">Приоритет</InputLabel>
            <Select
              labelId="priority-label"
              value={newTask.priority}
              label="Приоритет"
              onChange={(e) => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
            >
              <MenuItem value={TaskPriority.LOW}>Низкий</MenuItem>
              <MenuItem value={TaskPriority.MEDIUM}>Средний</MenuItem>
              <MenuItem value={TaskPriority.HIGH}>Высокий</MenuItem>
              <MenuItem value={TaskPriority.CRITICAL}>Критический</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="project-label">Проект</InputLabel>
            <Select
              labelId="project-label"
              value={newTask.projectId.toString()}
              label="Проект"
              onChange={(e) => setNewTask({...newTask, projectId: Number(e.target.value)})}
            >
              <MenuItem value="1">Biz360 CRM</MenuItem>
              {/* Здесь будет список проектов из API */}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button onClick={handleCreateTask} color="primary" variant="contained">
            Создать задачу
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TasksPage;