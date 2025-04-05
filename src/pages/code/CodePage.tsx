// src/pages/code/CodePage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Badge,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
  alpha,
  useMediaQuery,
  Menu,
  SelectChangeEvent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTasks } from '../../store/slices/tasksSlice';
import { fetchProjects } from '../../store/slices/projectsSlice';
import CodeEditorPanel from '../../components/code/CodeEditorPanel';
import { useSnackbar } from 'notistack';

// Иконки
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CodeIcon from '@mui/icons-material/Code';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Интерфейсы для типизации
interface CodeGeneration {
  id: number;
  taskId: number;
  subtaskId?: number;
  originalCode?: string;
  generatedCode: string;
  filePath: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  feedback?: string;
}

interface CodeFile {
  id: number;
  path: string;
  name: string;
  extension: string;
  size: number;
  isDirectory: boolean;
  lastModified: string;
  content?: string;
  children?: CodeFile[];
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
      id={`code-tabpanel-${index}`}
      aria-labelledby={`code-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CodePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Состояния и модальные окна
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [activeGeneration, setActiveGeneration] = useState<CodeGeneration | null>(null);
  
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const [isGenerationViewOpen, setIsGenerationViewOpen] = useState(false);
  
  // Получаем данные из Redux
  const { tasks, isLoading: isTasksLoading } = useAppSelector(state => state.tasks);
  const { projects, isLoading: isProjectsLoading } = useAppSelector(state => state.projects);
  
  // Загружаем данные при монтировании
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchProjects());
  }, [dispatch]);
  
  // Получаем сгенерированный код из всех задач
  const getAllCodeGenerations = (): CodeGeneration[] => {
    const generations: CodeGeneration[] = [];
    
    tasks.forEach(task => {
      if (task.codeGenerations && task.codeGenerations.length > 0) {
        task.codeGenerations.forEach(generation => {
          generations.push({
            ...generation,
            taskId: task.id
          });
        });
      }
    });
    
    return generations;
  };
  
  // Фильтруем сгенерированный код
  const getFilteredCodeGenerations = (): CodeGeneration[] => {
    let filtered = getAllCodeGenerations();
    
    if (searchTerm) {
      filtered = filtered.filter(
        gen => 
          gen.filePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (gen.originalCode && gen.originalCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
          gen.generatedCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedProject) {
      const projectTasks = tasks.filter(task => task.projectId === Number(selectedProject));
      const projectTaskIds = projectTasks.map(task => task.id);
      filtered = filtered.filter(gen => projectTaskIds.includes(gen.taskId));
    }
    
    if (selectedStatus) {
      filtered = filtered.filter(gen => gen.status === selectedStatus);
    }
    
    return filtered;
  };
  
  // Примерная файловая структура проекта (в реальном приложении получать из API)
  const fileStructure: CodeFile[] = [
    {
      id: 1,
      path: '/src',
      name: 'src',
      extension: '',
      size: 0,
      isDirectory: true,
      lastModified: '2023-01-01T10:00:00Z',
      children: [
        {
          id: 2,
          path: '/src/components',
          name: 'components',
          extension: '',
          size: 0,
          isDirectory: true,
          lastModified: '2023-01-01T10:00:00Z',
          children: [
            {
              id: 3,
              path: '/src/components/Button.jsx',
              name: 'Button',
              extension: 'jsx',
              size: 1200,
              isDirectory: false,
              lastModified: '2023-01-15T15:30:00Z',
              content: 'import React from "react";\n\nconst Button = ({ children, onClick, variant = "primary" }) => {\n  return (\n    <button\n      className={`btn btn-${variant}`}\n      onClick={onClick}\n    >\n      {children}\n    </button>\n  );\n};\n\nexport default Button;'
            },
            {
              id: 4,
              path: '/src/components/Card.jsx',
              name: 'Card',
              extension: 'jsx',
              size: 1500,
              isDirectory: false,
              lastModified: '2023-01-20T12:45:00Z',
              content: 'import React from "react";\n\nconst Card = ({ title, children }) => {\n  return (\n    <div className="card">\n      {title && <div className="card-header">{title}</div>}\n      <div className="card-body">{children}</div>\n    </div>\n  );\n};\n\nexport default Card;'
            }
          ]
        },
        {
          id: 5,
          path: '/src/utils',
          name: 'utils',
          extension: '',
          size: 0,
          isDirectory: true,
          lastModified: '2023-01-05T09:20:00Z',
          children: [
            {
              id: 6,
              path: '/src/utils/format.js',
              name: 'format',
              extension: 'js',
              size: 800,
              isDirectory: false,
              lastModified: '2023-01-22T16:10:00Z',
              content: '/**\n * Format a date to a string\n * @param {Date} date - The date to format\n * @param {string} format - The format string\n * @returns {string} The formatted date\n */\nexport const formatDate = (date, format = "YYYY-MM-DD") => {\n  // Implementation...\n  return "2023-01-01";\n};\n\n/**\n * Format a number to a currency string\n * @param {number} value - The value to format\n * @param {string} currency - The currency code\n * @returns {string} The formatted currency\n */\nexport const formatCurrency = (value, currency = "USD") => {\n  // Implementation...\n  return "$100.00";\n};'
            }
          ]
        },
        {
          id: 7,
          path: '/src/App.jsx',
          name: 'App',
          extension: 'jsx',
          size: 1800,
          isDirectory: false,
          lastModified: '2023-01-25T11:30:00Z',
          content: 'import React from "react";\nimport { BrowserRouter, Routes, Route } from "react-router-dom";\nimport Home from "./pages/Home";\nimport About from "./pages/About";\nimport Contact from "./pages/Contact";\nimport Navbar from "./components/Navbar";\nimport Footer from "./components/Footer";\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <Navbar />\n      <Routes>\n        <Route path="/" element={<Home />} />\n        <Route path="/about" element={<About />} />\n        <Route path="/contact" element={<Contact />} />\n      </Routes>\n      <Footer />\n    </BrowserRouter>\n  );\n}\n\nexport default App;'
        }
      ]
    }
  ];
  
  // Функция для получения полного пути файла или директории
  const getFullPath = (file: CodeFile): string => {
    return file.isDirectory ? `${file.path}/` : file.path;
  };
  
  // Функция для рендеринга файловой структуры
  const renderFileTree = (files: CodeFile[], depth = 0) => {
    return files.map(file => (
      <React.Fragment key={file.id}>
        <ListItem 
          button
          onClick={() => handleFileClick(file)}
          sx={{ 
            pl: depth * 2 + 2,
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
            borderRadius: 1
          }}
        >
          <ListItemIcon>
            {file.isDirectory ? <FolderIcon color="primary" /> : <InsertDriveFileIcon color="info" />}
          </ListItemIcon>
          <ListItemText primary={file.name + (file.extension ? `.${file.extension}` : '')} />
        </ListItem>
        {file.isDirectory && file.children && renderFileTree(file.children, depth + 1)}
      </React.Fragment>
    ));
  };
  
  // Обработчик клика по файлу
  const handleFileClick = (file: CodeFile) => {
    if (!file.isDirectory) {
      setSelectedFile(file);
      setIsFileViewOpen(true);
    }
  };
  
  // Обработчик клика по сгенерированному коду
  const handleGenerationClick = (generation: CodeGeneration) => {
    setActiveGeneration(generation);
    setIsGenerationViewOpen(true);
  };
  
  // Обработчик изменения проекта
  const handleProjectChange = (e: SelectChangeEvent) => {
    setSelectedProject(e.target.value);
  };
  
  // Обработчик изменения статуса
  const handleStatusChange = (e: SelectChangeEvent) => {
    setSelectedStatus(e.target.value);
  };
  
  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedProject('');
    setSelectedStatus('');
  };
  
  // Сгенерированный код (после фильтрации)
  const filteredGenerations = getFilteredCodeGenerations();
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Управление кодом
        </Typography>
        
        <Button 
          startIcon={<RefreshIcon />} 
          variant="outlined" 
          onClick={() => {
            dispatch(fetchTasks());
            dispatch(fetchProjects());
          }}
          disabled={isTasksLoading || isProjectsLoading}
        >
          Обновить
        </Button>
      </Box>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth
                placeholder="Поиск кода..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="project-select-label">Проект</InputLabel>
                <Select
                  labelId="project-select-label"
                  value={selectedProject}
                  label="Проект"
                  onChange={handleProjectChange}
                >
                  <MenuItem value="">Все проекты</MenuItem>
                  {projects.map(project => (
                    <MenuItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-select-label">Статус</InputLabel>
                <Select
                  labelId="status-select-label"
                  value={selectedStatus}
                  label="Статус"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="">Все статусы</MenuItem>
                  <MenuItem value="pending">Ожидает проверки</MenuItem>
                  <MenuItem value="approved">Утверждено</MenuItem>
                  <MenuItem value="rejected">Отклонено</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                variant="outlined"
                fullWidth
                onClick={handleResetFilters}
              >
                Сбросить
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader 
              title="Файловая структура" 
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            <Box sx={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
              <List component="div">
                {renderFileTree(fileStructure)}
              </List>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={8}>
          <Card variant="outlined">
            <CardHeader 
              title="Сгенерированный код" 
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            
            {isTasksLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <CircularProgress />
              </Box>
            ) : filteredGenerations.length > 0 ? (
              <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Путь к файлу</TableCell>
                      <TableCell>Задача</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Дата</TableCell>
                      <TableCell align="center">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredGenerations.map(generation => {
                      const task = tasks.find(t => t.id === generation.taskId);
                      return (
                        <TableRow 
                          key={generation.id} 
                          hover
                          onClick={() => handleGenerationClick(generation)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <InsertDriveFileIcon sx={{ mr: 1 }} fontSize="small" color="info" />
                              <Typography variant="body2">{generation.filePath}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {task ? (
                              <Box>
                                <Typography variant="body2">{task.title}</Typography>
                                <Typography variant="caption" color="text.secondary">#{task.id}</Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2">Задача не найдена</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={
                                generation.status === 'approved' ? 'Утверждено' : 
                                generation.status === 'rejected' ? 'Отклонено' : 
                                'Ожидает проверки'
                              }
                              color={
                                generation.status === 'approved' ? 'success' : 
                                generation.status === 'rejected' ? 'error' : 
                                'info'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{new Date(generation.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Просмотреть код">
                              <IconButton 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerationClick(generation);
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box p={4} textAlign="center">
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Сгенерированный код не найден
                </Typography>
                <Typography color="text.secondary">
                  Попробуйте изменить параметры фильтрации или создать новые задачи
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
      
      {/* Модальное окно просмотра файла */}
      <Dialog
        open={isFileViewOpen}
        onClose={() => setIsFileViewOpen(false)}
        fullWidth
        maxWidth="lg"
        scroll="paper"
      >
        <DialogTitle>
          {selectedFile && (
            <Box display="flex" alignItems="center">
              <InsertDriveFileIcon sx={{ mr: 1 }} color="info" />
              <Typography>{selectedFile.path}</Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedFile && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                fontFamily: 'monospace',
                fontSize: 14,
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)'
              }}
            >
              {selectedFile.content}
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto', ml: 2 }}>
            {selectedFile && `Последнее изменение: ${new Date(selectedFile.lastModified).toLocaleString()}`}
          </Typography>
          <Button onClick={() => setIsFileViewOpen(false)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Модальное окно просмотра сгенерированного кода */}
      <Dialog
        open={isGenerationViewOpen}
        onClose={() => setIsGenerationViewOpen(false)}
        fullWidth
        maxWidth="lg"
        scroll="paper"
      >
        <DialogTitle>
          {activeGeneration && (
            <Box>
              <Box display="flex" alignItems="center">
                <InsertDriveFileIcon sx={{ mr: 1 }} color="info" />
                <Typography>{activeGeneration.filePath}</Typography>
              </Box>
              <Box display="flex" alignItems="center" mt={1}>
                <Chip 
                  label={
                    activeGeneration.status === 'approved' ? 'Утверждено' : 
                    activeGeneration.status === 'rejected' ? 'Отклонено' : 
                    'Ожидает проверки'
                  }
                  color={
                    activeGeneration.status === 'approved' ? 'success' : 
                    activeGeneration.status === 'rejected' ? 'error' : 
                    'info'
                  }
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Создано: {new Date(activeGeneration.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {activeGeneration && (
            <CodeEditorPanel
              codeGeneration={activeGeneration}
              onRegenerate={() => {
                enqueueSnackbar('Запрос на регенерацию отправлен', {
                  variant: 'info',
                  autoHideDuration: 3000,
                });
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsGenerationViewOpen(false)}>
            Закрыть
          </Button>
          {activeGeneration && activeGeneration.status === 'pending' && (
            <>
              <Button 
                color="success" 
                startIcon={<CheckCircleIcon />}
                variant="contained"
              >
                Утвердить
              </Button>
              <Button 
                color="error" 
                startIcon={<CancelIcon />}
                variant="contained"
              >
                Отклонить
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CodePage;