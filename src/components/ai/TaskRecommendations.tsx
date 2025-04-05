// src/components/ai/TaskRecommendations.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  Alert,
  Skeleton,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BoltIcon from '@mui/icons-material/Bolt';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { analyzeTask, clearRecommendations } from '../../store/slices/aiAssistantSlice';
import { useSnackbar } from 'notistack';

// Добавляем библиотеку для рендеринга Markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TaskRecommendationsProps {
  taskId: number;
  projectId: number;
}

const TaskRecommendations: React.FC<TaskRecommendationsProps> = ({
  taskId,
  projectId
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  // Получаем рекомендации и состояние загрузки из Redux
  const { recommendations, isLoading } = useAppSelector(state => state.aiAssistant);
  
  // Локальное состояние для отображения панели
  const [expanded, setExpanded] = useState(true);
  
  // Загружаем рекомендации при монтировании, если их еще нет
  useEffect(() => {
    if (!recommendations && !isLoading) {
      loadRecommendations();
    }
    
    // Очищаем рекомендации при размонтировании
    return () => {
      dispatch(clearRecommendations());
    };
  }, [taskId, projectId]);
  
  // Функция для загрузки рекомендаций
  const loadRecommendations = () => {
    dispatch(analyzeTask({ projectId, taskId }));
  };
  
  // Обработчик копирования рекомендаций
  const handleCopyRecommendations = () => {
    if (recommendations?.recommendations) {
      navigator.clipboard.writeText(recommendations.recommendations).then(() => {
        enqueueSnackbar('Рекомендации скопированы в буфер обмена', { variant: 'success' });
      }).catch(() => {
        enqueueSnackbar('Не удалось скопировать рекомендации', { variant: 'error' });
      });
    }
  };
  
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <LightbulbIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
            <Typography variant="h6">Рекомендации AI-ассистента</Typography>
          </Box>
        }
        action={
          <IconButton 
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Свернуть' : 'Развернуть'}
            aria-expanded={expanded}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      />
      <Divider />
      
      <Collapse in={expanded} timeout="auto">
        <CardContent sx={{ pt: 2 }}>
          {isLoading ? (
            <Box>
              <Skeleton variant="text" width="100%" height={30} />
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="95%" height={20} />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 2 }} />
            </Box>
          ) : recommendations ? (
            <Box>
              {recommendations.recommendations ? (
                <Box 
                  sx={{ 
                    pl: 2,
                    pr: 1,
                    py: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    position: 'relative',
                    maxHeight: '400px',
                    overflow: 'auto'
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={handleCopyRecommendations}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      '&:hover': {
                        bgcolor: theme.palette.background.paper,
                      }
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                  
                  <Box sx={{ 
                    '& a': { 
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    },
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      mt: 2,
                      mb: 1,
                      fontWeight: 'bold'
                    },
                    '& h1': { fontSize: '1.4rem' },
                    '& h2': { fontSize: '1.3rem' },
                    '& h3': { fontSize: '1.2rem' },
                    '& h4': { fontSize: '1.1rem' },
                    '& h5, & h6': { fontSize: '1rem' },
                    '& code': {
                      fontFamily: '"Fira Code", Consolas, monospace',
                      backgroundColor: alpha(theme.palette.text.primary, 0.08),
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontSize: '0.9em'
                    },
                    '& pre': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.08),
                      padding: theme.spacing(1.5),
                      borderRadius: theme.shape.borderRadius,
                      overflow: 'auto',
                      '& code': {
                        backgroundColor: 'transparent',
                        padding: 0
                      }
                    },
                    '& ul, & ol': {
                      pl: 2.5,
                    },
                    '& blockquote': {
                      borderLeft: `4px solid ${theme.palette.divider}`,
                      pl: 2,
                      ml: 0,
                      color: 'text.secondary'
                    }
                  }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {recommendations.recommendations}
                    </ReactMarkdown>
                  </Box>
                </Box>
              ) : (
                <Alert severity="info">
                  Нет рекомендаций для этой задачи. Нажмите кнопку "Анализировать", чтобы получить рекомендации.
                </Alert>
              )}
            </Box>
          ) : (
            <Alert severity="info">
              Нажмите кнопку "Анализировать", чтобы получить рекомендации от AI-ассистента по выполнению этой задачи.
            </Alert>
          )}
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadRecommendations}
            disabled={isLoading}
          >
            {isLoading ? 'Анализ...' : recommendations ? 'Обновить' : 'Анализировать'}
          </Button>
          
          {recommendations && (
            <Button
              variant="contained"
              startIcon={<BoltIcon />}
              onClick={() => {
                enqueueSnackbar('Функция автоматической обработки задачи будет доступна в следующей версии', { 
                  variant: 'info'
                });
              }}
            >
              Автоматизировать
            </Button>
          )}
        </CardActions>
      </Collapse>
    </Card>
  );
};

export default TaskRecommendations;