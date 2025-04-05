// src/components/code/CodeWorkspace.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';

// Иконки
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';

// Компоненты
import FileExplorer from '../project/FileExplorer';
import CodeEditorPanel from './CodeEditorPanel';

// Highlight.js для подсветки синтаксиса
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // или другая тема

// Хуки
import { useSnackbar } from 'notistack';
import { useAppDispatch } from '../../hooks/redux';

// Сервисы
import ProjectService from '../../api/services/project.service';
import CodeGenerationService from '../../api/services/code-generation.service';
import { CodeGeneration } from '../../types/task.types';

interface CodeWorkspaceProps {
  projectId: number;
  taskId: number;
  codeGenerations: CodeGeneration[];
  readOnly?: boolean;
}

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
      id={`code-workspace-tabpanel-${index}`}
      aria-labelledby={`code-workspace-tab-${index}`}
      {...other}
      style={{ height: '100%', display: value === index ? 'flex' : 'none', flexDirection: 'column' }}
    >
      {value === index && children}
    </div>
  );
}

const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  projectId,
  taskId,
  codeGenerations,
  readOnly = false
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  
  // Состояния
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [currentGenerationIndex, setCurrentGenerationIndex] = useState<number | null>(null);
  
  // Определяем текущую генерацию кода (если выбрана)
  const currentGeneration = currentGenerationIndex !== null 
    ? codeGenerations[currentGenerationIndex] 
    : null;
  
  // Обработчики
  // Переключение вкладок
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Выбор файла из проводника
  const handleSelectFile = (filePath: string, content: string) => {
    setSelectedFile(filePath);
    setFileContent(content);
    
    // Подсветка синтаксиса
    setTimeout(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }, 0);
  };
  
  // Копирование содержимого файла
  const handleCopyContent = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent).then(() => {
        enqueueSnackbar('Код скопирован в буфер обмена', { variant: 'success' });
      }).catch(() => {
        enqueueSnackbar('Не удалось скопировать код', { variant: 'error' });
      });
    }
  };
  
  // Сохранение изменений в файле
  const handleSaveFile = async () => {
    if (!selectedFile || !fileContent) return;
    
    try {
      setIsLoading(true);
      
      // Имитация сохранения файла (заглушка для API)
      setTimeout(() => {
        enqueueSnackbar(`Файл ${selectedFile} успешно сохранен`, { variant: 'success' });
        setIsLoading(false);
      }, 1000);
      
      // Здесь должен быть реальный запрос к API для сохранения файла
      // await ProjectService.saveFileContent(projectId, selectedFile, fileContent);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при сохранении файла';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      setIsLoading(false);
    }
  };
  
  // Применение сгенерированного кода к текущему файлу
  const handleApplyGeneration = () => {
    if (!currentGeneration) return;
    
    setFileContent(currentGeneration.generatedCode);
    setSelectedFile(currentGeneration.filePath);
    
    // Подсветка синтаксиса
    setTimeout(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }, 0);
    
    enqueueSnackbar('Сгенерированный код применен к файлу', { variant: 'success' });
  };
  
  // Создание тестов для текущей генерации
  const handleGenerateTests = async () => {
    if (!currentGeneration) return;
    
    try {
      setIsLoading(true);
      
      const result = await CodeGenerationService.generateTests(currentGeneration.id);
      
      enqueueSnackbar('Тесты успешно сгенерированы', { variant: 'success' });
      
      // Обновляем выбранный файл на файл с тестами
      handleSelectFile(result.testFileName, result.testContent);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при генерации тестов';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Скачивание файла
  const handleDownloadFile = () => {
    if (!selectedFile || !fileContent) return;
    
    const filename = selectedFile.split('/').pop() || 'file.txt';
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(href);
    
    enqueueSnackbar(`Файл ${filename} скачан`, { variant: 'success' });
  };
  
  // Выбор генерации кода для отображения
  const handleSelectGeneration = (index: number) => {
    setCurrentGenerationIndex(index);
    
    const generation = codeGenerations[index];
    setFileContent(generation.generatedCode);
    setSelectedFile(generation.filePath);
    
    // Подсветка синтаксиса
    setTimeout(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }, 0);
  };
  
  // Определение языка кода на основе расширения файла
  const getLanguage = (filePath: string): string => {
    const extension = filePath?.split('.').pop()?.toLowerCase() || '';
    
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
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          aria-label="code workspace tabs"
        >
          <Tab label="Проект" id="code-workspace-tab-0" />
          <Tab label="Сгенерированный код" id="code-workspace-tab-1" />
          <Tab label="Тесты" id="code-workspace-tab-2" />
        </Tabs>
      </Box>
      
      {/* Вкладка с проектом */}
      <TabPanel value={activeTab} index={0}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            height: '100%', 
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            borderTop: 'none',
            borderRadius: 0
          }}
        >
          {/* Файловый проводник */}
          {showFileExplorer && (
            <Box 
              sx={{ 
                width: 300, 
                flexShrink: 0, 
                borderRight: `1px solid ${theme.palette.divider}`,
                height: '100%',
                overflow: 'auto'
              }}
            >
              <FileExplorer 
                projectId={projectId} 
                onSelectFile={handleSelectFile} 
                readOnly={readOnly}
              />
            </Box>
          )}
          
          {/* Редактор кода */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 1.5, 
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <Box display="flex" alignItems="center">
                <IconButton 
                  size="small" 
                  onClick={() => setShowFileExplorer(!showFileExplorer)}
                  sx={{ mr: 1 }}
                >
                  {showFileExplorer ? <ViewSidebarIcon /> : <ViewSidebarOutlinedIcon />}
                </IconButton>
                
                {selectedFile ? (
                  <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                    {selectedFile}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Выберите файл из проводника
                  </Typography>
                )}
              </Box>
              
              <Box>
                {selectedFile && fileContent && (
                  <>
                    <Tooltip title="Скачать файл">
                      <IconButton size="small" onClick={handleDownloadFile} sx={{ ml: 1 }}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Копировать содержимое">
                      <IconButton size="small" onClick={handleCopyContent} sx={{ ml: 1 }}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {!readOnly && (
                      <Tooltip title="Сохранить изменения">
                        <IconButton 
                          size="small" 
                          onClick={handleSaveFile} 
                          sx={{ ml: 1 }}
                          color="primary"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                )}
              </Box>
            </Box>
            
            <Box 
              sx={{ 
                flexGrow: 1, 
                overflow: 'auto', 
                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                p: 0,
                position: 'relative'
              }}
            >
              {selectedFile && fileContent ? (
                <Box
                  component="pre"
                  sx={{
                    margin: 0,
                    height: '100%',
                    overflow: 'auto',
                    '& code': {
                      fontFamily: '"Fira Code", Consolas, Monaco, "Andale Mono", monospace',
                      fontSize: '0.875rem',
                      p: 2,
                      display: 'block',
                    }
                  }}
                >
                  <code className={`language-${getLanguage(selectedFile)}`}>
                    {fileContent}
                  </code>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%' 
                  }}
                >
                  <Typography color="text.secondary">
                    Выберите файл для просмотра и редактирования
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </TabPanel>
      
      {/* Вкладка со сгенерированным кодом */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={2} sx={{ height: '100%', pt: 2 }}>
          {/* Список генераций */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Генерации кода для задачи
            </Typography>
            {codeGenerations.length === 0 ? (
              <Paper 
                variant="outlined" 
                sx={{ p: 2, textAlign: 'center' }}
              >
                <Typography color="text.secondary">
                  Для этой задачи еще не было сгенерировано кода
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={() => {
                    enqueueSnackbar('Функция генерации кода будет доступна в следующей версии', { 
                      variant: 'info'
                    });
                  }}
                >
                  Сгенерировать код
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {codeGenerations.map((generation, index) => (
                  <Grid item xs={12} key={generation.id}>
                    <CodeEditorPanel 
                      codeGeneration={generation}
                      taskId={taskId}
                      projectId={projectId}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Вкладка с тестами */}
      <TabPanel value={activeTab} index={2}>
        <Box 
          sx={{ 
            p: 2, 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Генерация тестов для кода
          </Typography>
          
          <Typography color="text.secondary" sx={{ maxWidth: 600, mb: 2 }}>
            Выберите генерацию кода, для которой нужно создать тесты. 
            AI-ассистент автоматически создаст тестовые сценарии для проверки работоспособности кода.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateTests}
              disabled={currentGenerationIndex === null || isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              ) : null}
              Сгенерировать тесты
            </Button>
            
            {codeGenerations.length > 0 && (
              <Button
                variant="outlined"
                onClick={() => {
                  setCurrentGenerationIndex(0);
                  handleSelectGeneration(0);
                }}
                disabled={currentGenerationIndex !== null}
              >
                Выбрать генерацию
              </Button>
            )}
          </Box>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default CodeWorkspace;