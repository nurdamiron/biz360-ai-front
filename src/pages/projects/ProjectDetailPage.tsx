// src/pages/projects/ProjectDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Badge,
  Avatar,
  alpha
} from '@mui/material';

// Иконки
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CodeIcon from '@mui/icons-material/Code';

import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchProjectById, 
  clearSelectedProject 
} from '../../store/slices/projectsSlice';
import { fetchTasks } from '../../store/slices/tasksSlice';
import { TaskFilterParams } from '../../types/api.types';
import TaskProgressCard from '../../components/task/TaskProgressCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { selectedProject, isLoading: isProjectLoading } = useAppSelector(state => state.projects);
  const { tasks, isLoading: isTasksLoading } = useAppSelector(state => state.tasks);
  const { enqueueSnackbar } = useSnackbar();
  
  // Состояние для активной вкладки
  const [tabValue, setTabValue] = useState(0);

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
    enqueueSnackbar('Функция редактирования проекта будет доступна в следующей версии', {
      variant: 'info',
      autoHideDuration: 3000,
    });
  };
  
  // Обработчик переключения вкладок
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'primary';
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!selectedProject) {
    return (
      <Box textAlign="center" py={5}>
        <Typography variant="h6" gutterBottom>
          Проект не найден
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
        >
          К списку проектов
        </Button>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Обновить
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            color="primary"
            onClick={handleEditProject}
          >
            Редактировать
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
            onClick={handleCreateTask}
          >
            Новая задача
          </Button>
        </Stack>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              title={
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {selectedProject.name}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label={getStatusText(selectedProject.status)} 
                      color={getStatusColor(selectedProject.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'} 
                      size="small" 
                    />
                    <Chip 
                      label={`#${selectedProject.id}`} 
                      color="secondary" 
                      size="small" 
                      variant="outlined" 
                    />
                  </Stack>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Typography paragraph>
                {selectedProject.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight="medium">
                    Прогресс выполнения:
                  </Typography>
                  <Typography variant="body2">
                    {completionPercentage}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={completionPercentage} 
                  color={
                    completionPercentage < 30 ? 'error' : 
                    completionPercentage < 70 ? 'warning' : 
                    'success'
                  } 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                <Typography variant="body2" color="text.secondary">
                  Создан: {new Date(selectedProject.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Обновлен: {new Date(selectedProject.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Box sx={{ width: '100%', mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="project tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Задачи" id="project-tab-0" aria-controls="project-tabpanel-0" />
                <Tab label="Структура проекта" id="project-tab-1" aria-controls="project-tabpanel-1" />
                <Tab label="Статистика" id="project-tab-2" aria-controls="project-tabpanel-2" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              {isTasksLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : tasks.length > 0 ? (
                <Stack spacing={2}>
                  {tasks.map(task => (
                    <TaskProgressCard key={task.id} task={task} />
                  ))}
                  
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => navigate('/tasks', { state: { projectId: Number(projectId) } })}
                  >
                    Показать все задачи
                  </Button>
                </Stack>
              ) : (
                <Box textAlign="center" p={4}>
                  <Typography color="text.secondary" mb={2}>В проекте еще нет задач</Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    color="primary" 
                    onClick={handleCreateTask}
                  >
                    Создать задачу
                  </Button>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Файловая структура
                </Typography>
                
                <Paper 
                  variant="outlined" 
                  sx={{ p: 2 }}
                >
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Box display="flex" alignItems="center">
                            <FolderIcon color="primary" sx={{ mr: 1 }} />
                            <Typography fontWeight="medium">src/</Typography>
                          </Box>
                        } 
                      />
                    </ListItem>
                    <Box ml={4}>
                      <List dense disablePadding>
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Box display="flex" alignItems="center">
                                <FolderIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                                <Typography>components/</Typography>
                              </Box>
                            } 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Box display="flex" alignItems="center">
                                <FolderIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                                <Typography>models/</Typography>
                              </Box>
                            } 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Box display="flex" alignItems="center">
                                <FolderIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                                <Typography>controllers/</Typography>
                              </Box>
                            } 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Box display="flex" alignItems="center">
                                <InsertDriveFileIcon color="info" sx={{ mr: 1, fontSize: 20 }} />
                                <Typography>app.js</Typography>
                              </Box>
                            } 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Box display="flex" alignItems="center">
                                <InsertDriveFileIcon color="info" sx={{ mr: 1, fontSize: 20 }} />
                                <Typography>config.js</Typography>
                              </Box>
                            } 
                          />
                        </ListItem>
                      </List>
                    </Box>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Box display="flex" alignItems="center">
                            <FolderIcon color="primary" sx={{ mr: 1 }} />
                            <Typography fontWeight="medium">public/</Typography>
                          </Box>
                        } 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Box display="flex" alignItems="center">
                            <InsertDriveFileIcon color="info" sx={{ mr: 1 }} />
                            <Typography fontWeight="medium">package.json</Typography>
                          </Box>
                        } 
                      />
                    </ListItem>
                  </List>
                </Paper>
                
                <Typography variant="subtitle1" fontWeight="medium" mt={2}>
                  Активные изменения
                </Typography>
                
                <Paper 
                  variant="outlined" 
                  sx={{ p: 2 }}
                >
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Box display="flex" alignItems="center">
                            <CodeIcon sx={{ mr: 1 }} />
                            <Typography>src/models/user.model.js</Typography>
                          </Box>
                        } 
                      />
                      <ListItemSecondaryAction>
                        <Chip label="В разработке" color="success" size="small" />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Box display="flex" alignItems="center">
                            <CodeIcon sx={{ mr: 1 }} />
                            <Typography>src/controllers/auth.controller.js</Typography>
                          </Box>
                        } 
                      />
                      <ListItemSecondaryAction>
                        <Chip label="Проверка" color="warning" size="small" />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Box display="flex" alignItems="center">
                            <CodeIcon sx={{ mr: 1 }} />
                            <Typography>src/components/login.component.js</Typography>
                          </Box>
                        } 
                      />
                      <ListItemSecondaryAction>
                        <Chip label="Тестирование" color="info" size="small" />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Paper>
              </Stack>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                {/* Пример статистики */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Распределение кода по языкам" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                    />
                    <Divider />
                    <CardContent>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">JavaScript</Typography>
                          <Typography variant="body2">68%</Typography>
                        </Box>
                        <LinearProgress value={68} variant="determinate" color="warning" />
                        
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">HTML</Typography>
                          <Typography variant="body2">15%</Typography>
                        </Box>
                        <LinearProgress value={15} variant="determinate" color="error" />
                        
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">CSS</Typography>
                          <Typography variant="body2">12%</Typography>
                        </Box>
                        <LinearProgress value={12} variant="determinate" color="primary" />
                        
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Другие</Typography>
                          <Typography variant="body2">5%</Typography>
                        </Box>
                        <LinearProgress value={5} variant="determinate" color="secondary" />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Активность" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                    />
                    <Divider />
                    <CardContent>
                      <List disablePadding>
                        <ListItem divider>
                          <ListItemText primary="Коммиты за неделю" />
                          <Typography variant="body1" fontWeight="medium">23</Typography>
                        </ListItem>
                        <ListItem divider>
                          <ListItemText primary="Pull Requests" />
                          <Typography variant="body1" fontWeight="medium">7</Typography>
                        </ListItem>
                        <ListItem divider>
                          <ListItemText primary="Изменено файлов" />
                          <Typography variant="body1" fontWeight="medium">42</Typography>
                        </ListItem>
                        <ListItem divider>
                          <ListItemText primary="Добавлено строк" />
                          <Typography variant="body1" fontWeight="medium" color="success.main">+1,204</Typography>
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Удалено строк" />
                          <Typography variant="body1" fontWeight="medium" color="error.main">-408</Typography>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <Card variant="outlined">
              <CardHeader title="Обзор проекта" titleTypographyProps={{ variant: 'h6' }} />
              <Divider />
              <CardContent>
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Всего задач</Typography>
                      <Typography variant="h4">{selectedProject.tasksCount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {completionPercentage}% завершено
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Активные задачи</Typography>
                      <Typography variant="h4">{selectedProject.activeTasks}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedProject.activeTasks > 0 ? 'В процессе' : 'Нет активных'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Статистика по коду
                  </Typography>
                  
                  {selectedProject.codeStats ? (
                    <List dense>
                      <ListItem divider>
                        <ListItemText primary="Файлы" />
                        <Typography variant="body2" fontWeight="medium">
                          {selectedProject.codeStats.totalFiles}
                        </Typography>
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="Строки кода" />
                        <Typography variant="body2" fontWeight="medium">
                          {selectedProject.codeStats.totalLines}
                        </Typography>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Языки" />
                        <Box>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {selectedProject.codeStats.languages.map((lang, idx) => (
                              <Chip 
                                key={idx} 
                                label={`${lang.name} (${lang.percentage}%)`} 
                                size="small" 
                                variant="outlined" 
                                color="primary"
                              />
                            ))}
                          </Stack>
                        </Box>
                      </ListItem>
                    </List>
                  ) : (
                    <Typography color="text.secondary">Статистика по коду недоступна</Typography>
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Последние действия
                  </Typography>
                  
                  <List dense>
                    <ListItem divider>
                      <ListItemText 
                        primary="Обновлена задача «Авторизация пользователей»" 
                        secondary="2 часа назад"
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItem>
                    <ListItem divider>
                      <ListItemText 
                        primary="Создана новая задача «Интеграция платежного API»" 
                        secondary="Вчера"
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Изменен статус проекта на «Активный»" 
                        secondary="3 дня назад"
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardHeader title="Участники проекта" titleTypographyProps={{ variant: 'h6' }} />
              <Divider />
              <CardContent>
                <List>
                  <ListItem divider>
                    <ListItemText
                      primary="Александр Иванов"
                      secondary="Менеджер проекта"
                    />
                    <ListItemSecondaryAction>
                      <Chip label="Онлайн" color="success" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem divider>
                    <ListItemText
                      primary="Мария Петрова"
                      secondary="Разработчик"
                    />
                    <ListItemSecondaryAction>
                      <Chip label="Офлайн" color="default" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem divider>
                    <ListItemText
                      primary="Сергей Сидоров"
                      secondary="Разработчик"
                    />
                    <ListItemSecondaryAction>
                      <Chip label="Офлайн" color="default" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="ИИ-ассистент"
                      secondary="Помощник"
                    />
                    <ListItemSecondaryAction>
                      <Chip label="Активен" color="secondary" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                
                <Button 
                  size="small" 
                  startIcon={<AddIcon />} 
                  sx={{ mt: 2 }}
                  fullWidth
                  variant="outlined"
                >
                  Добавить участника
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetailPage;