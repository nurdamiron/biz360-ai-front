import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Chip,
  IconButton,
  LinearProgress,
  Divider,
  Paper,
  Stack,
  Tooltip
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { CodeGeneration } from '../../types/task.types';
import { useAppDispatch } from '../../hooks/redux';
import { reviewCode } from '../../store/slices/tasksSlice';

// Импорт иконок
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import CommentIcon from '@mui/icons-material/Comment';
import CodeIcon from '@mui/icons-material/Code';
import UpdateIcon from '@mui/icons-material/Update';

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
      id={`code-tabpanel-${index}`}
      aria-labelledby={`code-tab-${index}`}
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
};

interface CodeEditorPanelProps {
  codeGeneration: CodeGeneration;
  onRegenerate?: () => void;
}

const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({ 
  codeGeneration,
  onRegenerate 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [feedback, setFeedback] = useState(codeGeneration.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  // Получаем статус генерации в виде чипа
  const getStatusChip = () => {
    const statusMap = {
      'pending': { color: 'info', text: 'Ожидает проверки' },
      'approved': { color: 'success', text: 'Одобрено' },
      'rejected': { color: 'error', text: 'Отклонено' },
    };
    
    const { color, text } = statusMap[codeGeneration.status] || 
      { color: 'default', text: codeGeneration.status };
    
    return (
      <Chip 
        label={text} 
        color={color as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'} 
        size="small"
      />
    );
  };
  
  // Обработчик утверждения кода
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(reviewCode({
        generationId: codeGeneration.id,
        status: 'approved',
        feedback
      })).unwrap();
      
      enqueueSnackbar('Код утвержден, изменения будут применены', { 
        variant: 'success',
        autoHideDuration: 5000
      });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Произошла ошибка при утверждении кода', 
        { variant: 'error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Обработчик отклонения кода
  const handleReject = async () => {
    if (!feedback.trim()) {
      enqueueSnackbar('Пожалуйста, укажите причину отклонения кода', {
        variant: 'warning'
      });
      setActiveTab(3); // Переключаемся на вкладку обратной связи
      return;
    }
    
    setIsSubmitting(true);
    try {
      await dispatch(reviewCode({
        generationId: codeGeneration.id,
        status: 'rejected',
        feedback
      })).unwrap();
      
      enqueueSnackbar('Код отклонен, ваш отзыв будет учтен при следующей генерации', {
        variant: 'info'
      });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Произошла ошибка при отклонении кода', 
        { variant: 'error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Обработчик регенерации кода
  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
    }
  };
  
  // Простая имитация diff-вида
  const renderDiff = () => {
    if (!codeGeneration.originalCode) {
      return (
        <Box textAlign="center" p={3}>
          <Typography color="text.secondary">
            Этот код был создан с нуля, оригинальный код отсутствует
          </Typography>
        </Box>
      );
    }
    
    // Очень простая имитация diff (для демонстрации UI)
    // В реальном приложении используйте библиотеку diff
    return (
      <Stack spacing={1}>
        <Paper sx={{ p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)' }}>
          <Typography fontFamily="monospace" color="error.main" fontSize={14}>
            - Удаленная строка
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
          <Typography fontFamily="monospace" color="success.main" fontSize={14}>
            + Добавленная строка
          </Typography>
        </Paper>
        <Typography variant="caption" color="text.secondary" p={1}>
          (Это простая имитация, в реальном приложении будет полноценный diff)
        </Typography>
      </Stack>
    );
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div" mr={1}>
              {codeGeneration.filePath}
            </Typography>
            {getStatusChip()}
          </Box>
        }
        subheader={`Создан: ${new Date(codeGeneration.createdAt).toLocaleString()}`}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {codeGeneration.status === 'pending' && (
              <>
                <Tooltip title="Утвердить код">
                  <IconButton 
                    color="success" 
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    aria-label="Утвердить код"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Отклонить код">
                  <IconButton 
                    color="error" 
                    onClick={handleReject}
                    disabled={isSubmitting}
                    aria-label="Отклонить код"
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            <Tooltip title="Создать новую версию">
              <IconButton 
                onClick={handleRegenerate}
                disabled={isSubmitting}
                aria-label="Создать новую версию"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      
      <Divider />
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="code editor tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label="Сгенерированный код" 
              id="code-tab-0" 
              aria-controls="code-tabpanel-0" 
              icon={<CodeIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Оригинальный код" 
              id="code-tab-1" 
              aria-controls="code-tabpanel-1"
              icon={<CodeIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Изменения (diff)" 
              id="code-tab-2" 
              aria-controls="code-tabpanel-2"
              icon={<UpdateIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Обратная связь" 
              id="code-tab-3" 
              aria-controls="code-tabpanel-3"
              icon={<CommentIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        <TabPanel value={activeTab} index={0}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: theme => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              fontFamily: 'monospace',
              fontSize: 14,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              height: '400px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            {codeGeneration.generatedCode || 'Код отсутствует'}
          </Paper>
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: theme => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              fontFamily: 'monospace',
              fontSize: 14,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              height: '400px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            {codeGeneration.originalCode || 'Оригинальный код отсутствует'}
          </Paper>
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ height: '400px', maxHeight: '400px', overflowY: 'auto' }}>
            {renderDiff()}
          </Box>
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          <Stack spacing={3}>
            <TextField
              label="Комментарии и обратная связь"
              multiline
              rows={12}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={codeGeneration.status !== 'pending'}
              fullWidth
              variant="outlined"
              placeholder="Введите комментарии и обратную связь по коду..."
            />
            
            {codeGeneration.feedback && (
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: theme => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Предыдущая обратная связь:
                </Typography>
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'inherit'
                  }}
                >
                  {codeGeneration.feedback}
                </Typography>
              </Paper>
            )}
          </Stack>
        </TabPanel>
      </Box>
      
      {isSubmitting && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
    </Card>
  );
};

export default CodeEditorPanel;