// src/components/code/CodeWorkspace.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  alpha,
  Paper
} from '@mui/material';

// Иконки
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';

// Компоненты
import FileExplorer from '../project/FileExplorer';
import CodeEditorPanel from './CodeEditorPanel';

// Хуки
import { useSnackbar } from 'notistack';
import { useAppDispatch } from '../../hooks/redux';

// Сервисы
import ProjectService from '../../api/services/project.service';
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
  const [testContent, setTestContent] = useState<{ fileName: string, content: string } | null>(null);
  
  // Определяем текущую генерацию кода (если выбрана)
  const currentGeneration = currentGenerationIndex !== null 
    ? codeGenerations[currentGenerationIndex] 
    : null;
  
  // Переключение вкладок
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Выбор файла из проводника
  const handleSelectFile = (filePath: string, content: string) => {
    setSelectedFile(filePath);
    setFileContent(content);
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
      
      await ProjectService.saveFileContent(projectId, selectedFile, fileContent);
      enqueueSnackbar(`Файл ${selectedFile} успешно сохранен`, { variant: 'success' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при сохранении файла';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Применение сгенерированного кода к текущему файлу
  const handleApplyGeneration = async () => {
    if (!currentGeneration) return;
    
    try {
      setIsLoading(true);
      
      // Если файл уже существует, спрашиваем подтверждение через UI
      const confirm = window.confirm(`Вы уверены, что хотите заменить содержимое файла ${currentGeneration.filePath}?`);
      
      if (!confirm) {
        setIsLoading(false);
        return;
      }
      
      // Применяем сгенерированный код к файлу
      await ProjectService.saveFileContent(
        projectId, 
        currentGeneration.filePath, 
        currentGeneration.generatedCode
      );
      
      // Обновляем текущее содержимое и выбранный файл
      setFileContent(currentGeneration.generatedCode);
      setSelectedFile(currentGeneration.filePath);
      
      enqueueSnackbar('Сгенерированный код успешно применен к файлу', { variant: 'success' });
      
      // Переключаемся на вкладку проекта
      setActiveTab(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при применении кода';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обработчик для тестов, созданных для генерации кода
  const handleTestsGenerated = (testData: { testFileName: string, testContent: string }) => {
    setTestContent({
      fileName: testData.testFileName,
      content: testData.testContent
    });
    
    // Переключаемся на вкладку с тестами
    setActiveTab(2);
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
  };
  
  // Определение языка кода на основе расширения файла
  const getLanguage = (filePath: string | null): string => {
    if (!filePath) return 'javascript';
    
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
                      onTestsGenerated={handleTestsGenerated}
                    />
                    
                    {/* Дополнительные кнопки для взаимодействия с кодом */}
                    {generation.status === 'approved' && (
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            handleSelectGeneration(index);
                            handleApplyGeneration();
                          }}
                        >
                          Применить код к проекту
                        </Button>
                      </Box>
                    )}
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Вкладка с тестами */}
      <TabPanel value={activeTab} index={2}>
        {testContent ? (
          <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 1, 
                mb: 2,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="subtitle1">
                {testContent.fileName}
              </Typography>
              
              <Box>
                <Tooltip title="Копировать тесты">
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      navigator.clipboard.writeText(testContent.content);
                      enqueueSnackbar('Тесты скопированы в буфер обмена', { variant: 'success' });
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {!readOnly && (
                  <Tooltip title="Сохранить тесты в проект">
                    <IconButton 
                      size="small" 
                      color="primary"
                      sx={{ ml: 1 }}
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          await ProjectService.saveFileContent(
                            projectId,
                            testContent.fileName,
                            testContent.content
                          );
                          enqueueSnackbar('Тесты успешно сохранены в проект', { variant: 'success' });
                        } catch (error) {
                          const errorMessage = error instanceof Error 
                            ? error.message 
                            : 'Произошла ошибка при сохранении тестов';
                          enqueueSnackbar(errorMessage, { variant: 'error' });
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      <SaveIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
            
            <Box 
              sx={{ 
                flexGrow: 1, 
                overflow: 'auto', 
                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              }}
            >
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
                <code className={`language-${getLanguage(testContent.fileName)}`}>
                  {testContent.content}
                </code>
              </Box>
            </Box>
          </Box>
        ) : (
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
                onClick={() => {
                  if (codeGenerations.length > 0) {
                    // Выбираем первую генерацию для создания тестов
                    setCurrentGenerationIndex(0);
                    setActiveTab(1); // Переключаемся на вкладку с генерациями
                    enqueueSnackbar('Выберите код для генерации тестов и нажмите "Создать тесты"', { variant: 'info' });
                  } else {
                    enqueueSnackbar('Сначала нужно сгенерировать код', { variant: 'warning' });
                  }
                }}
              >
                Перейти к выбору кода
              </Button>
            </Box>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
};

export default CodeWorkspace;