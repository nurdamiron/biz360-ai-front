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
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import UpdateIcon from '@mui/icons-material/Update';
import TaskRecommendations from '../../components/ai/TaskRecommendations';

import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchTaskById, 
  fetchTaskLogs, 
  processTask,
  clearSelectedTask,
  updateTaskFromWebSocket
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { selectedTask, isLoading } = useAppSelector(state => state.tasks);
  const { enqueueSnackbar } = useSnackbar();
  const { subscribe, unsubscribe } = useWebSocket();
  
  // Состояние для активной вкладки
  const [tabValue, setTabValue] = useState(0);
  
  // Локальное состояние для обновления логов в реальном времени
  const [logs, setLogs] = useState<TaskLog[]>([]);
  

  // Добавить эти функции перед useEffect с WebSocket
const handleTaskUpdate = (data: Task) => {
  // Обновляем задачу из WebSocket
  dispatch(updateTaskFromWebSocket(data));
};

const handleLogsUpdate = (data: { log: TaskLog } | TaskLog) => {
  // Обработка двух возможных форматов данных
  const log = 'log' in data ? data.log : data;
  
  if (log && log.taskId) {
    setLogs(prevLogs => [log, ...prevLogs]);
  }
};

  // Загружаем данные о задаче при монтировании
  // Загружаем данные о задаче и настраиваем WebSocket
useEffect(() => {
  if (taskId) {
    // Загружаем данные о задаче
    dispatch(fetchTaskById(Number(taskId)));
    dispatch(fetchTaskLogs({ taskId: Number(taskId), limit: 50 }));
    
    // Настраиваем WebSocket подписки
    subscribe(`task`, Number(taskId), handleTaskUpdate);
    subscribe(`task_logs`, Number(taskId), handleLogsUpdate);
    
    // Отписываемся при размонтировании
    return () => {
      dispatch(clearSelectedTask());
      unsubscribe(`task`, Number(taskId), handleTaskUpdate);
      unsubscribe(`task_logs`, Number(taskId), handleLogsUpdate);
    };
  }
}, [dispatch, taskId, subscribe, unsubscribe]);
  
  // Обновляем локальные логи, когда изменяются логи в selectedTask
  useEffect(() => {
    if (selectedTask?.logs) {
      setLogs(selectedTask.logs);
    }
  }, [selectedTask?.logs]);
  
  // Обработчик переключения вкладок
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Обработчик запуска обработки задачи
  const handleProcessTask = async () => {
    if (!taskId) return;
    
    try {
      await dispatch(processTask(Number(taskId))).unwrap();
      
      enqueueSnackbar('ИИ-ассистент начал обработку задачи', {
        variant: 'success'
      });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Произошла ошибка при запуске задачи', 
        { variant: 'error' }
      );
    }
  };
  
  // Обработчик обновления данных
  const handleRefresh = () => {
    if (taskId) {
      dispatch(fetchTaskById(Number(taskId)));
      dispatch(fetchTaskLogs({ taskId: Number(taskId), limit: 50 }));
    }
  };
  
  // Получаем статус задачи в виде чипа
  const getStatusChip = (status: TaskStatus) => {
    const statusMap = {
      [TaskStatus.NEW]: { color: 'default', text: 'Новая' },
      [TaskStatus.PENDING]: { color: 'primary', text: 'Ожидание' },
      [TaskStatus.IN_PROGRESS]: { color: 'warning', text: 'В процессе' },
      [TaskStatus.RESOLVED]: { color: 'info', text: 'Решена' },
      [TaskStatus.COMPLETED]: { color: 'success', text: 'Завершена' },
      [TaskStatus.FAILED]: { color: 'error', text: 'Ошибка' },
      [TaskStatus.CANCELED]: { color: 'default', text: 'Отменена' },
    };
    
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    
    return (
      <Chip 
        label={text} 
        color={color as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'} 
        size="small" 
      />
    );
  };
  
  // Получаем иконку для типа лога
  const getLogIcon = (type: LogType) => {
    switch (type) {
      case LogType.INFO:
        return <InfoIcon fontSize="small" color="info" />;
      case LogType.ERROR:
        return <ErrorOutlineIcon fontSize="small" color="error" />;
      case LogType.WARNING:
        return <WarningIcon fontSize="small" color="warning" />;
      case LogType.PROGRESS:
        return <UpdateIcon fontSize="small" color="success" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };
  
  // Преобразуем логи для отображения
  const renderLogs = () => {
    return logs.length > 0 ? (
      <Stack spacing={1} sx={{ maxHeight: '500px', overflowY: 'auto', p: 1 }}>
        {logs.map((log) => (
          <Paper 
            key={log.id} 
            variant="outlined"
            sx={{ p: 2 }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Box display="flex" alignItems="center">
                {getLogIcon(log.type)}
                <Typography variant="body2" fontWeight="medium" sx={{ ml: 1 }}>
                  {log.type}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {new Date(log.timestamp).toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {log.message}
            </Typography>
            {log.progress !== undefined && (
              <LinearProgress 
                variant="determinate" 
                value={log.progress} 
                sx={{ mt: 2, height: 6, borderRadius: 3 }} 
              />
            )}
          </Paper>
        ))}
      </Stack>
    ) : (
      <Typography color="text.secondary" align="center" py={4}>
        Логи отсутствуют
      </Typography>
    );
  };
  
  // Рендерим подзадачи
  const renderSubtasks = (subtasks?: Subtask[]) => {
    if (!subtasks || subtasks.length === 0) {
      return (
        <Typography color="text.secondary" align="center" py={4}>
          Подзадачи отсутствуют или еще не созданы
        </Typography>
      );
    }
    
    return (
      <div>
        {subtasks.map((subtask) => (
          <Accordion key={subtask.id} defaultExpanded={true}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`subtask-${subtask.id}-content`}
              id={`subtask-${subtask.id}-header`}
            >
              <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" pr={2}>
                <Typography variant="subtitle1">
                  {subtask.title}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {getStatusChip(subtask.status)}
                  <Typography variant="body2">
                    {subtask.progress}%
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {subtask.description && (
                  <Typography variant="body2">
                    {subtask.description}
                  </Typography>
                )}
                
                <LinearProgress 
                  variant="determinate" 
                  value={subtask.progress} 
                  color={subtask.status === TaskStatus.FAILED ? 'error' : 'primary'} 
                  sx={{ height: 6, borderRadius: 3 }}
                />
                
                {subtask.dependsOn && subtask.dependsOn.length > 0 && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="medium">
                      Зависит от:
                    </Typography>
                    {subtask.dependsOn.map(depId => (
                      <Chip 
                        key={depId} 
                        label={`#${depId}`} 
                        color="secondary" 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
                
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {subtask.startTime && (
                    <Typography variant="body2" color="text.secondary">
                      Начало: {new Date(subtask.startTime).toLocaleString()}
                    </Typography>
                  )}
                  
                  {subtask.endTime && (
                    <Typography variant="body2" color="text.secondary">
                      Завершение: {new Date(subtask.endTime).toLocaleString()}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    );
  };
  
  // Рендерим генерации кода
  const renderCodeGenerations = () => {
    if (!selectedTask?.codeGenerations || selectedTask.codeGenerations.length === 0) {
      return (
        <Typography color="text.secondary" align="center" py={4}>
          Генерации кода отсутствуют
        </Typography>
      );
    }
    
    return (
      <Stack spacing={3}>
        {selectedTask.codeGenerations.map((generation) => (
          <CodeEditorPanel 
            key={generation.id} 
            codeGeneration={generation} 
            onRegenerate={() => console.log('Regenerate code for', generation.id)}
          />
        ))}
      </Stack>
    );
  };
  
  // Определяем, можно ли управлять задачей
  const canProcess = selectedTask?.status === TaskStatus.NEW || selectedTask?.status === TaskStatus.PENDING;
  const canPause = selectedTask?.status === TaskStatus.IN_PROGRESS;
  const canStop = selectedTask?.status === TaskStatus.IN_PROGRESS || selectedTask?.status === TaskStatus.PENDING;
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!selectedTask) {
    return (
      <Box textAlign="center" py={5}>
        <Typography variant="h6" gutterBottom>
          Задача не найдена
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/tasks')}
          sx={{ mt: 2 }}
        >
          Вернуться к списку задач
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tasks')}
        >
          К списку задач
        </Button>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Обновить
          </Button>
          
          {canProcess && (
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrowIcon />}
              onClick={handleProcessTask}
            >
              Запустить обработку
            </Button>
          )}
          
          {canPause && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<PauseIcon />}
            >
              Приостановить
            </Button>
          )}
          
          {canStop && (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
            >
              Остановить
            </Button>
          )}
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              title={
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {selectedTask.title}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {getStatusChip(selectedTask.status)}
                    <Chip 
                      label={`#${selectedTask.id}`} 
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
                {selectedTask.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight="medium">
                    Прогресс:
                  </Typography>
                  <Typography variant="body2">
                    {selectedTask.progress}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={selectedTask.progress} 
                  color={selectedTask.status === TaskStatus.FAILED ? 'error' : 'primary'} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                <Typography variant="body2" color="text.secondary">
                  Создана: {new Date(selectedTask.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Обновлена: {new Date(selectedTask.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Box sx={{ width: '100%', mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="task tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Подзадачи" id="task-tab-0" aria-controls="task-tabpanel-0" />
                <Tab label="Генерации кода" id="task-tab-1" aria-controls="task-tabpanel-1" />
                <Tab label="Логи" id="task-tab-2" aria-controls="task-tabpanel-2" />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              {renderSubtasks(selectedTask.subtasks)}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderCodeGenerations()}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {renderLogs()}
            </TabPanel>
          </Box>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <Card variant="outlined">
              <CardHeader title="Информация о задаче" />
              <Divider />
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Проект" 
                    secondary="Biz360 CRM" 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText 
                    primary="Приоритет" 
                    secondary={selectedTask.priority} 
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={selectedTask.priority} 
                      color={
                        selectedTask.priority === 'critical' ? 'error' : 
                        selectedTask.priority === 'high' ? 'warning' : 
                        selectedTask.priority === 'medium' ? 'primary' : 
                        'default'
                      } 
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText 
                    primary="Создана" 
                    secondary={new Date(selectedTask.createdAt).toLocaleDateString()} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText 
                    primary="Автор" 
                    secondary={`Пользователь #${selectedTask.createdBy}`} 
                  />
                </ListItem>
                
                {selectedTask.assignedTo && (
                  <>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="Назначена" 
                        secondary={`Пользователь #${selectedTask.assignedTo}`} 
                      />
                    </ListItem>
                  </>
                )}
                
                {selectedTask.startTime && (
                  <>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="Начало работы" 
                        secondary={new Date(selectedTask.startTime).toLocaleString()} 
                      />
                    </ListItem>
                  </>
                )}
                
                {selectedTask.endTime && (
                  <>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="Завершение" 
                        secondary={new Date(selectedTask.endTime).toLocaleString()} 
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </Card>
            
            <TaskRecommendations 
              taskId={selectedTask.id} 
              projectId={selectedTask.projectId}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column' 
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Подзадачи
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedTask.subtasks?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                    {selectedTask.subtasks?.filter(s => s.status === TaskStatus.COMPLETED).length || 0} завершено
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column' 
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Генерации кода
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedTask.codeGenerations?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                    {selectedTask.codeGenerations?.filter(c => c.status === 'approved').length || 0} одобрено
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Card variant="outlined">
              <CardHeader title="Последняя активность" />
              <Divider />
              <CardContent sx={{ pt: 0 }}>
                <List disablePadding>
                  {logs.slice(0, 5).map((log) => (
                    <React.Fragment key={log.id}>
                      <ListItem 
                        sx={{ 
                          py: 1.5,
                          pl: 1,
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderRadius: 1
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              {getLogIcon(log.type)}
                              <Typography 
                                variant="body2" 
                                component="span" 
                                sx={{ ml: 1 }}
                                color={
                                  log.type === LogType.ERROR ? 'error.main' :
                                  log.type === LogType.WARNING ? 'warning.main' :
                                  log.type === LogType.PROGRESS ? 'success.main' :
                                  'info.main'
                                }
                              >
                                {log.type}
                              </Typography>
                            </Box>
                          }
                          secondary={log.message}
                          secondaryTypographyProps={{
                            noWrap: true,
                            style: {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '100%'
                            }
                          }}
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                  
                  {logs.length === 0 && (
                    <ListItem>
                      <ListItemText 
                        primary="Нет активности" 
                        primaryTypographyProps={{ 
                          align: 'center', 
                          color: 'text.secondary' 
                        }} 
                      />
                    </ListItem>
                  )}
                </List>
                
                {logs.length > 5 && (
                  <Box textAlign="center" pt={1}>
                    <Button 
                      variant="text" 
                      size="small" 
                      onClick={() => setTabValue(2)}
                    >
                      Показать все логи
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskDetailPage;