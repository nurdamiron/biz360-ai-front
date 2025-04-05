import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  LinearProgress,
  useTheme,
  IconButton,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTasks } from '../../store/slices/tasksSlice';

// Импорт иконок
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import DnsIcon from '@mui/icons-material/Dns';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WifiIcon from '@mui/icons-material/Wifi';

import TaskProgressCard from '../../components/task/TaskProgressCard';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { tasks, isLoading } = useAppSelector(state => state.tasks);
  const { user } = useAppSelector(state => state.auth);
  
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
  
  // Стиль для статистических карточек
  const statCardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Панель управления
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateTask}
        >
          Новая задача
        </Button>
      </Box>
      
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={1} sx={statCardStyle}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Всего задач
              </Typography>
              <Typography variant="h4">
                {taskStats.all}
              </Typography>
              <Box mt={1}>
                <Chip 
                  label="Актуально" 
                  color="primary" 
                  size="small" 
                  icon={<TaskAltIcon />} 
                />
              </Box>
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={1} sx={statCardStyle}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Активные задачи
              </Typography>
              <Typography variant="h4">
                {taskStats.active}
              </Typography>
              <Box mt={1}>
                <Chip 
                  label={taskStats.active > 2 ? "Высокая активность" : "Нормальная активность"} 
                  color="warning" 
                  size="small" 
                  icon={<PendingIcon />} 
                />
              </Box>
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={1} sx={statCardStyle}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Завершенные задачи
              </Typography>
              <Typography variant="h4">
                {taskStats.completed}
              </Typography>
              <Box mt={1}>
                <Chip 
                  label="Успешно" 
                  color="success" 
                  size="small" 
                  icon={<CheckCircleIcon />} 
                />
              </Box>
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={1} sx={statCardStyle}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Проблемные задачи
              </Typography>
              <Typography variant="h4">
                {taskStats.failed}
              </Typography>
              <Box mt={1}>
                <Chip 
                  label="Требуют внимания" 
                  color="error" 
                  size="small" 
                  icon={<ErrorOutlineIcon />} 
                />
              </Box>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader 
              title="Активные задачи" 
              action={
                <Button 
                  endIcon={<ArrowForwardIcon />} 
                  onClick={() => navigate('/tasks')}
                  color="primary"
                >
                  Все задачи
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                {isLoading ? (
                  <Box py={4}>
                    <LinearProgress />
                    <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                      Загрузка задач...
                    </Typography>
                  </Box>
                ) : activeTasks.length > 0 ? (
                  activeTasks.map(task => (
                    <TaskProgressCard key={task.id} task={task} showDetailedLogs />
                  ))
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="textSecondary">
                      Активных задач нет
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<AddIcon />} 
                      onClick={handleCreateTask}
                      sx={{ mt: 2 }}
                    >
                      Создать задачу
                    </Button>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Последние обновления" />
                <Divider />
                <List>
                  {isLoading ? (
                    <Box py={2}>
                      <LinearProgress />
                    </Box>
                  ) : recentTasks.length > 0 ? (
                    recentTasks.map(task => (
                      <React.Fragment key={task.id}>
                        <ListItem button onClick={() => navigate(`/tasks/${task.id}`)}>
                          <ListItemText
                            primary={task.title}
                            secondary={new Date(task.updatedAt).toLocaleDateString()}
                          />
                          <ListItemSecondaryAction>
                            <Chip 
                              label={task.status} 
                              size="small" 
                              color={
                                task.status === 'completed' ? 'success' : 
                                task.status === 'failed' ? 'error' : 
                                'primary'
                              }
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText 
                        primary="Нет последних обновлений" 
                        primaryTypographyProps={{ color: 'textSecondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Информация о системе" />
                <Divider />
                <List disablePadding>
                  <ListItem>
                    <ListItemText 
                      primary="Пользователь" 
                      secondary={user?.username || 'Неизвестно'} 
                    />
                    <ListItemSecondaryAction>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemText 
                      primary="Роль" 
                      secondary={user?.role || 'Гость'} 
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={user?.role || 'Гость'}
                        size="small" 
                        color="secondary" 
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemText 
                      primary="Статус ИИ" 
                      secondary="Активен" 
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label="Активен"
                        size="small" 
                        color="success" 
                        icon={<WifiIcon />}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemText 
                      primary="Версия" 
                      secondary="1.0.0-beta" 
                    />
                  </ListItem>
                </List>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;