// src/components/ai/AIAssistantStatus.tsx
import React, { useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Typography, 
  CircularProgress, 
  Chip, 
  Stack, 
  LinearProgress 
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAIStatus } from '../../store/slices/aiAssistantSlice';

const AIAssistantStatus: React.FC = () => {
  const dispatch = useAppDispatch();
  const { status, isLoading, error } = useAppSelector(state => state.aiAssistant);
  
  // Загружаем статус при монтировании и обновляем каждые 30 секунд
  useEffect(() => {
    dispatch(fetchAIStatus());
    
    const interval = setInterval(() => {
      dispatch(fetchAIStatus());
    }, 30000); // 30 секунд
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  if (isLoading && !status) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress size={30} />
      </Box>
    );
  }
  
  if (error && !status) {
    return (
      <Typography color="error" align="center" p={2}>
        Ошибка загрузки статуса: {error}
      </Typography>
    );
  }
  
  if (!status) return null;
  
  return (
    <Card variant="outlined">
      <CardHeader 
        title="Статус AI-ассистента" 
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Chip 
            label={status.running ? "Активен" : "Остановлен"}
            color={status.running ? "success" : "error"}
            size="small"
          />
        }
      />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Очередь задач
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1}>
                <Chip 
                  label={`В ожидании: ${status.queue.statuses.pending}`} 
                  size="small" 
                  color="default" 
                  variant="outlined"
                />
                <Chip 
                  label={`В обработке: ${status.queue.statuses.processing}`} 
                  size="small" 
                  color="warning" 
                  variant="outlined"
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Chip 
                  label={`Завершено: ${status.queue.statuses.completed}`} 
                  size="small" 
                  color="success" 
                  variant="outlined"
                />
                <Chip 
                  label={`Ошибки: ${status.queue.statuses.failed}`} 
                  size="small" 
                  color="error" 
                  variant="outlined"
                />
              </Stack>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Использование токенов (сегодня)
            </Typography>
            <Box mb={1}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">
                  {status.tokenUsage.usage.daily.total.toLocaleString()} / {status.tokenUsage.limits.daily.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  {((status.tokenUsage.usage.daily.total / status.tokenUsage.limits.daily) * 100).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(status.tokenUsage.usage.daily.total / status.tokenUsage.limits.daily) * 100} 
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Примерная стоимость: ${status.tokenUsage.estimatedCost.total}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AIAssistantStatus;