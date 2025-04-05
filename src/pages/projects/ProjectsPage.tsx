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
  FormHelperText,
  Paper,
  Stack,
  CircularProgress,
  SelectChangeEvent,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchProjects, 
  createProject, 
  ProjectFilterParams 
} from '../../store/slices/projectsSlice';
import ProjectCard from '../../components/project/ProjectCard';

// Импорт иконок
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';

const ProjectsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { projects, isLoading } = useAppSelector(state => state.projects);
  
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
  
  // Состояние для диалога создания проекта
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Состояние для ошибок валидации
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    description: ''
  });
  
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
  const handleStatusFilterChange = (e: SelectChangeEvent) => {
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
  
  // Обработчик открытия диалога создания проекта
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  
  // Обработчик закрытия диалога создания проекта
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewProject({ name: '', description: '' });
    setValidationErrors({ name: '', description: '' });
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
      
      // Закрываем диалог создания проекта
      handleCloseDialog();
      
      // Показываем уведомление об успешном создании
      enqueueSnackbar(`Проект "${result.name}" успешно создан`, { 
        variant: 'success',
        autoHideDuration: 3000
      });
      
      // Если проект создан успешно, переходим на страницу с деталями
      if (result?.id) {
        navigate(`/projects/${result.id}`);
      }
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Произошла ошибка при создании проекта', { 
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  };
  
  // Обработчик просмотра проекта
  const handleViewProject = (id: number) => {
    navigate(`/projects/${id}`);
  };
  
  // Обработчик редактирования проекта
  const handleEditProject = (id: number) => {
    enqueueSnackbar(`Функция редактирования проекта #${id} будет доступна в следующей версии`, { 
      variant: 'info',
      autoHideDuration: 3000
    });
  };
  
  // Обработчик удаления проекта
  const handleDeleteProject = (id: number) => {
    enqueueSnackbar(`Функция удаления проекта #${id} будет доступна в следующей версии`, { 
      variant: 'info',
      autoHideDuration: 3000
    });
  };
  
  // Отрисовка скелетона загрузки
  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
        <Card variant="outlined">
          <CardContent>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={80} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={30} />
            <Skeleton variant="text" width="100%" height={30} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Skeleton variant="text" width="30%" height={30} />
              <Skeleton variant="rectangular" width="30%" height={30} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ));
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Проекты
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Новый проект
        </Button>
      </Box>
      
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                placeholder="Поиск проектов..."
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
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Статус</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Статус"
              >
                <MenuItem value="">Все статусы</MenuItem>
                <MenuItem value="active">Активные</MenuItem>
                <MenuItem value="inactive">Неактивные</MenuItem>
                <MenuItem value="archived">Архивированные</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-filter-label">Сортировка</InputLabel>
              <Select
                labelId="sort-filter-label"
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={handleSortChange}
                label="Сортировка"
              >
                <MenuItem value="updatedAt_desc">Последние обновления</MenuItem>
                <MenuItem value="createdAt_desc">Новые первыми</MenuItem>
                <MenuItem value="createdAt_asc">Старые первыми</MenuItem>
                <MenuItem value="name_asc">По имени (А-Я)</MenuItem>
                <MenuItem value="name_desc">По имени (Я-А)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="limit-filter-label">Показывать</InputLabel>
              <Select
                labelId="limit-filter-label"
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
        
        {/* Индикаторы активных фильтров */}
        {(statusFilter || searchTerm) && (
          <Stack direction="row" spacing={1} mt={2}>
            {searchTerm && (
              <Chip 
                label={`Поиск: ${searchTerm}`} 
                color="primary" 
                onDelete={() => setSearchTerm('')} 
              />
            )}
            
            {statusFilter && (
              <Chip 
                label={`Статус: ${statusFilter}`} 
                color="secondary" 
                onDelete={() => setStatusFilter('')} 
              />
            )}
          </Stack>
        )}
      </Paper>
      
      {isLoading ? (
        <Grid container spacing={3}>
          {renderSkeletons()}
        </Grid>
      ) : projects.length > 0 ? (
        <Grid container spacing={3}>
          {projects.map(project => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <ProjectCard 
                project={project} 
                onView={handleViewProject}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Проекты не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Попробуйте изменить параметры фильтрации или создайте новый проект
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={handleOpenDialog}
            sx={{ mt: 2 }}
          >
            Создать проект
          </Button>
        </Paper>
      )}
      
      {/* Диалог создания проекта */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Создание нового проекта</DialogTitle>
        <DialogContent>
          <FormControl 
            fullWidth 
            error={!!validationErrors.name}
            margin="normal"
          >
            <TextField
              autoFocus
              margin="dense"
              label="Название проекта"
              fullWidth
              variant="outlined"
              value={newProject.name}
              onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
            />
          </FormControl>
          
          <FormControl 
            fullWidth 
            error={!!validationErrors.description}
            margin="normal"
          >
            <TextField
              margin="dense"
              label="Описание проекта"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              error={!!validationErrors.description}
              helperText={validationErrors.description}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button onClick={handleCreateProject} color="primary" variant="contained">
            Создать проект
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsPage;