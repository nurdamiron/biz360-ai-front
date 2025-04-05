// src/components/ai/AIAssistantStatus.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Chip,
  Button,
  IconButton,
  useTheme,
  alpha,
  Badge,
  Avatar
} from '@mui/material';

// Иконки
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MemoryIcon from '@mui/icons-material/Memory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

// Redux
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAIStatus } from '../../store/slices/aiAssistantSlice';

// Хуки
import { useSnackbar } from 'notistack';

interface AIAssistantStatusProps {
  variant?: 'full' | 'compact';
  refreshInterval?: number; // в миллисекундах
}

const AIAssistantStatus: React.FC<AIAssistantStatusProps> = ({
  variant = 'compact',
  refreshInterval = 30000 // По умолчанию 30 секунд
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  // Получаем статус из Redux
  const { status, isLoading } = useAppSelector(state => state.aiAssistant);
  
  // Локальные состояния
  const [expanded, setExpanded] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState<number | null>(null);
  const [nextRefresh, setNextRefresh] = useState<number>(0);
  const [refreshProgress, setRefreshProgress] = useState<number>(0);
  
  // Загружаем статус AI при монтировании
  useEffect(() => {
    loadStatus();
    
    // Устанавливаем интервал обновления
    const intervalId = window.setInterval(() => {
      loadStatus();
      setNextRefresh(refreshInterval);
      setRefreshProgress(0);
    }, refreshInterval);
    
    setRefreshTimer(intervalId);
    setNextRefresh(refreshInterval);
    
    // Настройка индикатора прогресса обновления
    const progressIntervalId = window.setInterval(() => {
      setNextRefresh(prev => Math.max(0, prev - 1000));
      setRefreshProgress(prev => Math.min(100, prev + (100 / (refreshInterval / 1000))));
    }, 1000);
    
    // Очистка интервалов при размонтировании
    return () => {
      if (refreshTimer) {
        window.clearInterval(refreshTimer);
      }
      window.clearInterval(progressIntervalId);
    };
  }, []);
  
  // Загрузка статуса AI-ассистента
  const loadStatus = () => {
    dispatch(fetchAIStatus());
  };
  
  // Форматирование времени
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) return `${seconds} сек`;
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };
  
  // Получение цвета для отображения состояния
  const getStatusColor = () => {
    if (!status) return 'default';
    
    if (!status.running) return 'error';
    
    if (status.queue.statuses.pending + status.queue.statuses.processing > 10) {
      return 'warning';
    }
    
    return 'success';
  };
  
  // Получение текста для отображения состояния
  const getStatusText = () => {
    if (!status) return 'Загрузка...';
    
    if (!status.running) return 'Остановлен';
    
    const pendingCount = status.queue.statuses.pending;
    const processingCount = status.queue.statuses.processing;
    
    if (pendingCount + processingCount === 0) {
      return 'Доступен';
    }
    
    return `${processingCount} в работе, ${pendingCount} в очереди`;
  };
  
  // Проверка использования токенов
  const getTokenUsageStatus = () => {
    if (!status || !status.tokenUsage) return { color: 'info', text: 'Нет данных' };
    
    const { usage, limits } = status.tokenUsage;
    
    if (!usage.daily) return { color: 'info', text: 'Нет данных' };
    
    const dailyPercentage = (usage.daily.total / limits.daily) * 100;
    
    if (dailyPercentage > 90) return { color: 'error', text: 'Критический уровень' };
    if (dailyPercentage > 70) return { color: 'warning', text: 'Высокий уровень' };
    if (dailyPercentage > 50) return { color: 'info', text: 'Средний уровень' };
    
    return { color: 'success', text: 'Нормальный уровень' };
  };
  
  // Получение процента использования токенов
  const getTokenUsagePercentage = () => {
    if (!status || !status.tokenUsage || !status.tokenUsage.usage.daily) return 0;
    
    const { usage, limits } = status.tokenUsage;
    return Math.min(100, (usage.daily.total / limits.daily) * 100);
  };
  
  // Рендер компактной версии
  if (variant === 'compact') {
    return (
      <Box>
        <Card variant="outlined">
          <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <Badge
                  color={status?.running ? "success" : "error"}
                  variant="dot"
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                >
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 40, height: 40 }}>
                    <MemoryIcon color="primary" />
                  </Avatar>
                </Badge>
                
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle2">
                    AI-ассистент {isLoading && <CircularProgress size={12} sx={{ ml: 1 }} />}
                  </Typography>
                  
                  <Box display="flex" alignItems="center">
                    <Chip
                      label={getStatusText()}
                      color={getStatusColor() as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                      size="small"
                      sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                    />
                    
                    {status && status.tokenUsage && (
                      <Tooltip title="Использование токенов">
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={getTokenUsagePercentage()}
                            color={getTokenUsageStatus().color as "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                            sx={{ width: 50, height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Tooltip title="Обновить статус">
                <IconButton 
                  size="small" 
                  onClick={loadStatus}
                  disabled={isLoading}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }
  
  // Полная версия будет более детализированной
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <MemoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6">Статус AI-ассистента</Typography>
          </Box>
        }
        action={
          <Box display="flex" alignItems="center">
            <Tooltip title={`Автообновление через ${formatTime(nextRefresh)}`}>
              <Box sx={{ width: 40, mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={refreshProgress}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            </Tooltip>
            
            <Tooltip title="Обновить статус">
              <IconButton 
                onClick={loadStatus}
                disabled={isLoading}
                size="small"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <IconButton 
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'Свернуть' : 'Развернуть'}
              aria-expanded={expanded}
              size="small"
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        }
      />
      <Divider />
      
      <CardContent sx={{ pt: 2 }}>
        {isLoading && !status ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={40} />
          </Box>
        ) : !status ? (
          <Typography color="text.secondary" align="center">
            Не удалось загрузить статус AI-ассистента
          </Typography>
        ) : (
          <Box>
            {/* Базовая информация о статусе */}
            <Box 
              sx={{
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2
              }}
            >
              {/* Статус системы */}
              <Box 
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 1, 
                  p: 2,
                  height: '100%'
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Статус системы
                </Typography>
                
                <Box display="flex" alignItems="center" mt={1}>
                  {status.running ? (
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  ) : (
                    <ErrorIcon color="error" sx={{ mr: 1 }} />
                  )}
                  
                  <Typography>
                    {status.running ? 'Активна' : 'Остановлена'}
                  </Typography>
                </Box>
                
                {!status.running && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    startIcon={<PlayCircleOutlineIcon />}
                    sx={{ mt: 1 }}
                    onClick={() => {
                      enqueueSnackbar('Функция запуска AI-ассистента будет доступна в следующей версии', { 
                        variant: 'info'
                      });
                    }}
                  >
                    Запустить ассистент
                  </Button>
                )}
                
                {status.running && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<PauseCircleOutlineIcon />}
                    sx={{ mt: 1 }}
                    onClick={() => {
                      enqueueSnackbar('Функция остановки AI-ассистента будет доступна в следующей версии', { 
                        variant: 'info'
                      });
                    }}
                  >
                    Остановить ассистент
                  </Button>
                )}
              </Box>
              
              {/* Очередь задач */}
              <Box 
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 1, 
                  p: 2,
                  height: '100%'
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Очередь задач
                </Typography>
                
                <Box sx={{ mt: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2">Ожидают:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {status.queue.statuses.pending}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2">В обработке:</Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="medium"
                      color={status.queue.statuses.processing > 0 ? 'warning.main' : 'text.primary'}
                    >
                      {status.queue.statuses.processing}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2">Завершены:</Typography>
                    <Typography variant="body2" fontWeight="medium" color="success.main">
                      {status.queue.statuses.completed}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Ошибки:</Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="medium"
                      color={status.queue.statuses.failed > 0 ? 'error.main' : 'text.primary'}
                    >
                      {status.queue.statuses.failed}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Использование токенов */}
              <Box 
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 1, 
                  p: 2,
                  height: '100%'
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Использование токенов
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Сегодня:</Typography>
                    <Typography variant="body2">
                      {status.tokenUsage.usage.daily.total.toLocaleString()} / {status.tokenUsage.limits.daily.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={getTokenUsagePercentage()}
                    color={getTokenUsageStatus().color as "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                    sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                  />
                  
                  <Box display="flex" justifyContent="flex-end" mt={0.5}>
                    <Chip
                      label={getTokenUsageStatus().text}
                      size="small"
                      color={getTokenUsageStatus().color as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                      sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                    />
                  </Box>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="caption" color="text.secondary">
                  Примерная стоимость: {status.tokenUsage.estimatedCost.total} $
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistantStatus;