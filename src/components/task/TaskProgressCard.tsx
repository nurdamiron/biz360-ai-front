import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  LinearProgress, 
  Divider, 
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Task, TaskStatus, TaskPriority, LogType } from '../../types/task.types';
import { useAppDispatch } from '../../hooks/redux';
import { processTask } from '../../store/slices/tasksSlice';

// Импорт иконок
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import UpdateIcon from '@mui/icons-material/Update';

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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // Получаем последние логи
  const recentLogs = task.logs?.slice(-3).reverse() || [];
  
  // Преобразование статуса в Chip
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
  
  // Преобразование приоритета в Chip
  const getPriorityChip = (priority: TaskPriority) => {
    const priorityMap = {
      [TaskPriority.LOW]: { color: 'default', text: 'Низкий' },
      [TaskPriority.MEDIUM]: { color: 'info', text: 'Средний' },
      [TaskPriority.HIGH]: { color: 'warning', text: 'Высокий' },
      [TaskPriority.CRITICAL]: { color: 'error', text: 'Критический' },
    };
    
    const { color, text } = priorityMap[priority] || { color: 'default', text: priority };
    
    return (
      <Chip 
        label={text} 
        color={color as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
        size="small"
        variant="outlined"
      />
    );
  };
  
  // Получение иконки для типа лога
  const getLogIcon = (type: LogType) => {
    switch (type) {
      case LogType.INFO:
        return <InfoIcon fontSize="small" color="info" />;
      case LogType.ERROR:
        return <ErrorIcon fontSize="small" color="error" />;
      case LogType.WARNING:
        return <WarningIcon fontSize="small" color="warning" />;
      case LogType.PROGRESS:
        return <UpdateIcon fontSize="small" color="success" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };
  
  // Обработчик открытия меню
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Обработчик закрытия меню
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Обработчик для перехода к детальной странице задачи
  const handleViewDetails = () => {
    navigate(`/tasks/${task.id}`);
    handleMenuClose();
  };
  
  // Обработчик для запуска обработки задачи
  const handleProcessTask = () => {
    dispatch(processTask(task.id));
    handleMenuClose();
  };
  
  // Определяем, можно ли запустить задачу
  const canProcess = task.status === TaskStatus.NEW || task.status === TaskStatus.PENDING;
  
  // Определяем, можно ли приостановить задачу
  const canPause = task.status === TaskStatus.IN_PROGRESS;
  
  // Определяем, можно ли остановить задачу
  const canStop = task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.PENDING;
  
  // Определяем цвет индикатора прогресса
  const progressColor = 
    task.status === TaskStatus.FAILED ? 'error' :
    task.status === TaskStatus.COMPLETED ? 'success' :
    task.status === TaskStatus.IN_PROGRESS ? 'warning' : 'primary';
  
  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {task.title}
            </Typography>
            <Stack direction="row" spacing={1}>
              {getStatusChip(task.status)}
              {getPriorityChip(task.priority)}
            </Stack>
          </Box>
          
          <Box display="flex">
            <IconButton 
              size="small" 
              onClick={handleViewDetails}
              aria-label="Просмотреть детали"
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton
              size="small"
              aria-controls="task-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              aria-label="Дополнительные действия"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="task-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleViewDetails}>
                <ListItemIcon>
                  <VisibilityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Подробнее" />
              </MenuItem>
              
              {canProcess && (
                <MenuItem onClick={handleProcessTask}>
                  <ListItemIcon>
                    <PlayArrowIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Запустить обработку" />
                </MenuItem>
              )}
              
              {canPause && (
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <PauseIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Приостановить" />
                </MenuItem>
              )}
              
              {canStop && (
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <StopIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Остановить" />
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
          {task.description}
        </Typography>
        
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2">Прогресс:</Typography>
            <Typography variant="body2">{task.progress}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={task.progress} 
            color={progressColor}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
        
        {showDetailedLogs && recentLogs.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Последние действия:
            </Typography>
            <Stack spacing={1}>
              {recentLogs.map((log) => (
                <Paper 
                  key={log.id}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 1 }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Box display="flex" alignItems="center">
                      {getLogIcon(log.type)}
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {log.type}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {log.message}
                  </Typography>
                  {log.progress !== undefined && (
                    <LinearProgress 
                      variant="determinate" 
                      value={log.progress} 
                      sx={{ mt: 1, height: 4 }} 
                    />
                  )}
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskProgressCard;