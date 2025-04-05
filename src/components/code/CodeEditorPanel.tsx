// src/components/code/CodeEditorPanel.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Tooltip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Collapse,
  Rating,
  alpha,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HistoryIcon from '@mui/icons-material/History';
import BugReportIcon from '@mui/icons-material/BugReport';
import BuildIcon from '@mui/icons-material/Build';
import DescriptionIcon from '@mui/icons-material/Description';
import { useSnackbar } from 'notistack';

import { CodeGeneration } from '../../types/task.types';
import { useAppDispatch } from '../../hooks/redux';
import { reviewCode } from '../../store/slices/tasksSlice';
import { regenerateCode, sendFeedback, analyzeFailedGeneration } from '../../store/slices/aiAssistantSlice';

import { useEffect } from 'react';

interface CodeEditorPanelProps {
  codeGeneration: CodeGeneration;
  taskId: number;
  projectId: number;
}

const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({ 
  codeGeneration, 
  taskId,
  projectId
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  // Локальные состояния
  const [expanded, setExpanded] = useState(true);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(3);
  const [regenerateFeedback, setRegenerateFeedback] = useState('');
  const [failedAnalysis, setFailedAnalysis] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Определение языка кода на основе расширения файла
  const getLanguage = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase() || '';
    const extensionMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rb': 'ruby',
      'php': 'php',
      'sql': 'sql',
    };
    return extensionMap[extension] || 'javascript';
  };
  
  // Подсветка синтаксиса
  const language = getLanguage(codeGeneration.filePath);

  // Обработка подсветки синтаксиса после рендеринга
  useEffect(() => {
    // Применяем базовую стилизацию для блока кода
    document.querySelectorAll('pre code').forEach((block) => {
      (block as HTMLElement).style.fontFamily = '"Fira Code", monospace';
    });
  }, [codeGeneration, expanded]);
  
  // Обработчик одобрения кода
  const handleApprove = () => {
    setFeedbackDialogOpen(true);
  };
  
  
  
  // Обработчик отправки обратной связи
  const handleSubmitFeedback = async () => {
    if (!codeGeneration) return;
    
    try {
      setIsLoading(true);
      
      // Отправляем статус кода (одобрен)
      await dispatch(reviewCode({
        generationId: codeGeneration.id,
        status: 'approved',
        feedback: feedback
      })).unwrap();
      
      // Отправляем обратную связь для AI
      if (feedback || rating) {
        await dispatch(sendFeedback({
          projectId,
          generationId: codeGeneration.id,
          feedbackText: feedback,
          rating: rating || 3
        })).unwrap();
      }
      
      setFeedbackDialogOpen(false);
      setFeedback('');
      setRating(3);
      
      enqueueSnackbar('Код успешно одобрен', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Произошла ошибка при отправке обратной связи', 
        { variant: 'error' }
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обработчик регенерации кода
  const handleRegenerateCode = async () => {
    if (!codeGeneration) return;
    
    if (!regenerateFeedback.trim()) {
      enqueueSnackbar('Пожалуйста, укажите причину отклонения кода', { variant: 'warning' });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Отправляем статус кода (отклонен)
      await dispatch(reviewCode({
        generationId: codeGeneration.id,
        status: 'rejected',
        feedback: regenerateFeedback
      })).unwrap();
      
      // Запрашиваем регенерацию кода
      await dispatch(regenerateCode({
        generationId: codeGeneration.id,
        taskId,
        feedback: regenerateFeedback
      })).unwrap();
      
      setRegenerateDialogOpen(false);
      setRegenerateFeedback('');
      
      enqueueSnackbar('Запрос на регенерацию кода отправлен', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Произошла ошибка при регенерации кода', 
        { variant: 'error' }
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  
  // Обработчик отклонения кода
  const handleReject = () => {
    setRegenerateDialogOpen(true);
  };

  // Обработчик копирования кода в буфер обмена
  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeGeneration.generatedCode).then(() => {
      enqueueSnackbar('Код скопирован в буфер обмена', { variant: 'success' });
    }).catch((err) => {
      enqueueSnackbar('Не удалось скопировать код', { variant: 'error' });
      console.error('Failed to copy:', err);
    });
  };
  
  // Обработчик анализа проблемы с генерацией (для неудачных генераций)
  const handleAnalyzeFailure = async () => {
    if (!codeGeneration) return;
    
    try {
      setIsLoading(true);
      
      const result = await dispatch(analyzeFailedGeneration({
        projectId,
        generationId: codeGeneration.id
      })).unwrap();
      
      setFailedAnalysis(result.analysis);
      setShowAnalysis(true);
      
      enqueueSnackbar('Анализ завершен успешно', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Произошла ошибка при анализе генерации', 
        { variant: 'error' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTests = async () => {
    if (!codeGeneration) return;
    
    try {
      setIsLoading(true);
      
      const result = await dispatch(generateTests(codeGeneration.id)).unwrap();
      
      enqueueSnackbar('Тесты успешно сгенерированы', { variant: 'success' });
      
      // Оповещаем родительский компонент о созданных тестах
      // Предполагаем, что у нас есть пропс onTestsGenerated
      if (onTestsGenerated && result) {
        onTestsGenerated(result);
      }
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Произошла ошибка при генерации тестов', 
        { variant: 'error' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  
  
  // Отображение статуса кода
  const renderStatusChip = () => {
    switch (codeGeneration.status) {
      case 'pending':
        return <Chip label="Ожидает проверки" size="small" color="warning" />;
      case 'approved':
        return <Chip label="Одобрен" size="small" color="success" icon={<CheckCircleIcon />} />;
      case 'rejected':
        return <Chip label="Отклонен" size="small" color="error" icon={<CancelIcon />} />;
      default:
        return <Chip label={codeGeneration.status} size="small" color="default" />;
    }
  };
  
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {codeGeneration.filePath}
            </Typography>
            {renderStatusChip()}
          </Box>
        }
        action={
          <IconButton 
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show/hide code"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            Создан: {new Date(codeGeneration.createdAt).toLocaleString()} 
            {codeGeneration.updatedAt !== codeGeneration.createdAt && 
              ` • Обновлен: ${new Date(codeGeneration.updatedAt).toLocaleString()}`}
          </Typography>
        }
      />
      <Divider />
      
      <Collapse in={expanded} timeout="auto">
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box 
            component="pre" 
            sx={{ 
              position: 'relative',
              margin: 0,
              maxHeight: '400px', 
              overflow: 'auto',
              borderRadius: 0,
              '& code': {
                fontFamily: '"Fira Code", Consolas, Monaco, "Andale Mono", monospace',
                fontSize: '0.875rem',
                p: 2,
                display: 'block',
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 1,
                m: 1
              }}
            >
              <Tooltip title="Копировать код">
                <IconButton 
                  size="small" 
                  onClick={handleCopyCode}
                  sx={{ 
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    '&:hover': {
                      bgcolor: theme.palette.background.paper,
                    }
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <code className={`language-${getLanguage(selectedFile)}`}>
              {fileContent}
            </code>
          </Box>
        </CardContent>
      </Collapse>

      {codeGeneration.feedback && (
        <Box sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
          <Typography variant="subtitle2">Обратная связь:</Typography>
          <Typography variant="body2">{codeGeneration.feedback}</Typography>
        </Box>
      )}
      
      {showAnalysis && failedAnalysis && (
        <Box sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
          <Typography variant="subtitle2">Анализ проблемы:</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{failedAnalysis}</Typography>
        </Box>
      )}
      
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Stack direction="row" spacing={1}>
          {codeGeneration.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleApprove}
                size="small"
              >
                Одобрить
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleReject}
                size="small"
              >
                Отклонить
              </Button>
            </>
          )}
          
          {codeGeneration.status === 'rejected' && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RefreshIcon />}
              onClick={() => setRegenerateDialogOpen(true)}
              size="small"
            >
              Регенерировать
            </Button>
          )}
        </Stack>
        
        <Stack direction="row" spacing={1}>
          {codeGeneration.status === 'rejected' && !failedAnalysis && (
            <Button
              variant="text"
              color="info"
              startIcon={<BugReportIcon />}
              onClick={handleAnalyzeFailure}
              size="small"
            >
              Анализировать проблему
            </Button>
          )}
          
          <Button
            variant="text"
            color="inherit"
            startIcon={<DescriptionIcon />}
            size="small"
            onClick={() => {
              // TODO: Добавить создание тестов для кода
              enqueueSnackbar('Функция создания тестов будет доступна в следующей версии', { 
                variant: 'info'
              });
            }}
          >
            Создать тесты
          </Button>
        </Stack>
      </CardActions>
      
      {/* Диалог обратной связи при одобрении */}
      <Dialog 
        open={feedbackDialogOpen} 
        onClose={() => setFeedbackDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Обратная связь по сгенерированному коду</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography gutterBottom>Оцените качество кода:</Typography>
            <Rating
              name="code-rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
            />
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            id="feedback"
            label="Комментарии и предложения (необязательно)"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            helperText="Ваша обратная связь поможет улучшить генерацию кода в будущем"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)} color="inherit">
            Отмена
          </Button>
          <Button onClick={handleSubmitFeedback} color="primary" variant="contained">
            Отправить и одобрить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог обратной связи при отклонении/регенерации */}
      <Dialog 
        open={regenerateDialogOpen} 
        onClose={() => setRegenerateDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Регенерация кода</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="regenerate-feedback"
            label="Укажите, что нужно исправить"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={regenerateFeedback}
            onChange={(e) => setRegenerateFeedback(e.target.value)}
            helperText="Опишите проблемы с текущим кодом и что нужно улучшить"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegenerateDialogOpen(false)} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleRegenerateCode} 
            color="primary" 
            variant="contained"
            disabled={!regenerateFeedback.trim()}
          >
            Отправить и регенерировать
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CodeEditorPanel;