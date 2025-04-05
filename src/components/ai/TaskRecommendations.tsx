// src/components/ai/TaskRecommendations.tsx
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardActions, 
  CardContent, 
  CardHeader, 
  CircularProgress, 
  Collapse, 
  Divider, 
  IconButton, 
  Typography 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { analyzeTask, clearRecommendations } from '../../store/slices/aiAssistantSlice';
import ReactMarkdown from 'react-markdown';

interface TaskRecommendationsProps {
  taskId: number;
  projectId: number;
}

const TaskRecommendations: React.FC<TaskRecommendationsProps> = ({ taskId, projectId }) => {
  const dispatch = useAppDispatch();
  const { recommendations, isLoading } = useAppSelector(state => state.aiAssistant);
  const [expanded, setExpanded] = useState(false);
  
  // Очищаем рекомендации при размонтировании
  useEffect(() => {
    return () => {
      dispatch(clearRecommendations());
    };
  }, [dispatch]);
  
  const handleGetRecommendations = () => {
    dispatch(analyzeTask({ projectId, taskId }));
    setExpanded(true);
  };
  
  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Card variant="outlined">
      <CardHeader 
        title="AI-рекомендации" 
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <IconButton
            onClick={handleToggleExpand}
            aria-expanded={expanded}
            aria-label="показать/скрыть рекомендации"
          >
            <ExpandMoreIcon 
              sx={{ 
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: '0.3s',
              }}
            />
          </IconButton>
        }
      />
      <Divider />
      <Collapse in={expanded}>
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={30} />
            </Box>
          ) : recommendations ? (
            <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
              <ReactMarkdown>{recommendations.recommendations}</ReactMarkdown>
            </Box>
          ) : (
            <Typography color="text.secondary" align="center" py={2}>
              Нажмите кнопку "Анализировать задачу", чтобы получить рекомендации от AI-ассистента.
            </Typography>
          )}
        </CardContent>
        <CardActions>
          <Button 
            startIcon={<RefreshIcon />}
            onClick={handleGetRecommendations}
            disabled={isLoading}
            size="small"
            variant="outlined"
            fullWidth
          >
            {recommendations ? "Обновить рекомендации" : "Анализировать задачу"}
          </Button>
        </CardActions>
      </Collapse>
    </Card>
  );
};

export default TaskRecommendations;