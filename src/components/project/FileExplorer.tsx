// src/components/project/FileExplorer.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Divider,
  Breadcrumbs,
  Link,
  CircularProgress,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemSecondaryAction,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';

// Иконки
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DescriptionIcon from '@mui/icons-material/Description';
import DataObjectIcon from '@mui/icons-material/DataObject';

import { useSnackbar } from 'notistack';
import ProjectService from '../../api/services/project.service';
import { useAppDispatch } from '../../hooks/redux';

// Типы для файловой структуры
interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  extension?: string;
  size?: number;
  lastModified?: string;
}

interface FileExplorerProps {
  projectId: number;
  onSelectFile: (filePath: string, content: string) => void;
  readOnly?: boolean;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ projectId, onSelectFile, readOnly = false }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  // Состояния
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  // Состояния для контекстного меню
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [contextMenuTarget, setContextMenuTarget] = useState<FileNode | null>(null);
  
  // Состояния для диалогов
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  
  // Загрузка файлов при монтировании и изменении projectId или currentPath
  useEffect(() => {
    if (projectId) {
      loadFiles();
    }
  }, [projectId, currentPath]);
  
  // Загрузка файлов проекта
  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ProjectService.getProjectFiles(projectId, currentPath);
      setFiles(response);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке файлов';
      setError(errorMessage);
      enqueueSnackbar(`Не удалось загрузить файлы: ${errorMessage}`, { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обработчик клика по папке или файлу
  const handleItemClick = async (item: FileNode) => {
    if (item.type === 'directory') {
      // Переключение состояния развертывания для папки
      const newExpandedPaths = new Set(expandedPaths);
      if (newExpandedPaths.has(item.path)) {
        newExpandedPaths.delete(item.path);
      } else {
        newExpandedPaths.add(item.path);
      }
      setExpandedPaths(newExpandedPaths);
    } else {
      // Обработка выбора файла
      setSelectedFile(item.path);
      
      try {
        setIsLoading(true);
        const content = await ProjectService.getFileContent(projectId, item.path);
        onSelectFile(item.path, content);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке содержимого файла';
        enqueueSnackbar(`Не удалось загрузить содержимое файла: ${errorMessage}`, { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Обработчик навигации к родительской папке
  const handleNavigateUp = () => {
    if (currentPath) {
      // Получаем путь родительской папки
      const pathParts = currentPath.split('/');
      pathParts.pop(); // Удаляем последний сегмент
      const parentPath = pathParts.join('/');
      setCurrentPath(parentPath);
    }
  };
  
  // Обработчик открытия контекстного меню
  const handleContextMenu = (event: React.MouseEvent<HTMLButtonElement>, item: FileNode) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setContextMenuTarget(item);
  };
  
  // Обработчик закрытия контекстного меню
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setContextMenuTarget(null);
  };
  
  // Обработчик создания нового файла
  const handleCreateFile = () => {
    handleCloseMenu();
    setNewItemName('');
    setNewFileDialogOpen(true);
  };
  
  // Обработчик создания новой папки
  const handleCreateFolder = () => {
    handleCloseMenu();
    setNewItemName('');
    setNewFolderDialogOpen(true);
  };
  
  // Обработчик удаления файла/папки
  const handleDelete = () => {
    handleCloseMenu();
    setDeleteDialogOpen(true);
  };
  
  // Функция подтверждения создания файла
  const confirmCreateFile = async () => {
    if (!newItemName.trim()) {
      enqueueSnackbar('Имя файла не может быть пустым', { variant: 'error' });
      return;
    }

    try {
      // Здесь будет вызов API для создания файла
      // Имитация успешного создания
      enqueueSnackbar(`Файл ${newItemName} успешно создан`, { variant: 'success' });
      setNewFileDialogOpen(false);
      
      // Перезагрузка файлов после создания
      loadFiles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при создании файла';
      enqueueSnackbar(`Не удалось создать файл: ${errorMessage}`, { variant: 'error' });
    }
  };
  
  // Функция подтверждения создания папки
  const confirmCreateFolder = async () => {
    if (!newItemName.trim()) {
      enqueueSnackbar('Имя папки не может быть пустым', { variant: 'error' });
      return;
    }

    try {
      // Здесь будет вызов API для создания папки
      // Имитация успешного создания
      enqueueSnackbar(`Папка ${newItemName} успешно создана`, { variant: 'success' });
      setNewFolderDialogOpen(false);
      
      // Перезагрузка файлов после создания
      loadFiles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при создании папки';
      enqueueSnackbar(`Не удалось создать папку: ${errorMessage}`, { variant: 'error' });
    }
  };
  
  // Функция подтверждения удаления
  const confirmDelete = async () => {
    if (!contextMenuTarget) return;

    try {
      // Здесь будет вызов API для удаления файла/папки
      // Имитация успешного удаления
      enqueueSnackbar(`${contextMenuTarget.name} успешно удален`, { variant: 'success' });
      setDeleteDialogOpen(false);
      
      // Перезагрузка файлов после удаления
      loadFiles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при удалении';
      enqueueSnackbar(`Не удалось удалить: ${errorMessage}`, { variant: 'error' });
    }
  };
  
  // Получение иконки файла на основе его расширения
  const getFileIcon = (file: FileNode) => {
    if (file.type === 'directory') {
      return expandedPaths.has(file.path) ? <FolderOpenIcon color="primary" /> : <FolderIcon color="primary" />;
    }
    
    const extension = file.extension || file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <CodeIcon color="warning" />;
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return <DataObjectIcon color="info" />;
      case 'html':
      case 'htm':
      case 'xml':
        return <CodeIcon color="info" />;
      case 'json':
        return <DataObjectIcon color="warning" />;
      case 'md':
      case 'txt':
        return <TextSnippetIcon color="action" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <ImageIcon color="success" />;
      case 'pdf':
      case 'doc':
      case 'docx':
        return <DescriptionIcon color="error" />;
      default:
        return <InsertDriveFileIcon />;
    }
  };
  
  // Форматирование пути для хлебных крошек
  const formatBreadcrumbs = () => {
    if (!currentPath) return [{ name: 'Корень', path: '' }];
    
    const pathParts = currentPath.split('/');
    let accumulatedPath = '';
    
    return [
      { name: 'Корень', path: '' },
      ...pathParts.map(part => {
        accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
        return {
          name: part,
          path: accumulatedPath
        };
      })
    ];
  };
  
  // Отрисовка хлебных крошек
  const renderBreadcrumbs = () => {
    const breadcrumbs = formatBreadcrumbs();
    
    return (
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumbs"
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return isLast ? (
            <Typography color="text.primary" key={crumb.path} variant="body2">
              {crumb.name}
            </Typography>
          ) : (
            <Link
              key={crumb.path}
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPath(crumb.path);
              }}
              variant="body2"
            >
              {crumb.name}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };
  
  // Рекурсивная отрисовка дерева файлов
  const renderFileTree = (fileList: FileNode[], level: number = 0) => {
    return (
      <List dense disablePadding>
        {fileList.map((item) => {
          const isExpanded = expandedPaths.has(item.path);
          const isSelected = selectedFile === item.path;
          
          return (
            <React.Fragment key={item.path}>
              <ListItemButton
                onClick={() => handleItemClick(item)}
                sx={{
                  pl: 2 + level * 2,
                  py: 0.75,
                  bgcolor: isSelected ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: isSelected ? 'action.selected' : 'action.hover',
                  }
                }}
                dense
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getFileIcon(item)}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="body2" noWrap>
                      {item.name}
                    </Typography>
                  }
                />
                {!readOnly && (
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="actions"
                      size="small"
                      onClick={(e) => handleContextMenu(e, item)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
                {item.type === 'directory' && (
                  <IconButton 
                    edge="end" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    size="small"
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
              </ListItemButton>
              
              {item.type === 'directory' && isExpanded && item.children && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  {renderFileTree(item.children, level + 1)}
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    );
  };
  
  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <Box 
        sx={{ 
          p: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          Файлы проекта
        </Typography>
        
        <Box>
          {!readOnly && (
            <Tooltip title="Добавить файл/папку">
              <IconButton size="small" onClick={(e) => handleContextMenu(e, { name: '', path: currentPath, type: 'directory' })}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Обновить">
            <IconButton size="small" onClick={loadFiles}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Контекстное меню */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleCloseMenu}
        >
          {contextMenuTarget?.type === 'directory' && (
            <>
              <MenuItem onClick={handleCreateFile}>
                <ListItemIcon>
                  <NoteAddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Новый файл" />
              </MenuItem>
              <MenuItem onClick={handleCreateFolder}>
                <ListItemIcon>
                  <CreateNewFolderIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Новая папка" />
              </MenuItem>
              <Divider />
            </>
          )}
          
          {contextMenuTarget && (
            <>
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Переименовать" />
              </MenuItem>
              <MenuItem onClick={handleDelete}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Удалить" 
                  primaryTypographyProps={{ color: 'error' }}
                />
              </MenuItem>
            </>
          )}
        </Menu>
      </Box>
      
      <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center'
          }}
        >
          {currentPath && (
            <Tooltip title="Назад">
              <IconButton
                size="small"
                onClick={handleNavigateUp}
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {renderBreadcrumbs()}
        </Box>
      </Box>
      
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="error" variant="body2">{error}</Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={loadFiles}
              sx={{ mt: 1 }}
            >
              Повторить
            </Button>
          </Box>
        ) : files.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              Нет файлов для отображения
            </Typography>
          </Box>
        ) : (
          renderFileTree(files)
        )}
      </Box>
      
      {/* Диалог создания нового файла */}
      <Dialog 
        open={newFileDialogOpen} 
        onClose={() => setNewFileDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Создать новый файл</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="file-name"
            label="Имя файла"
            type="text"
            fullWidth
            variant="outlined"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            helperText="Например: index.js, config.json"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFileDialogOpen(false)} color="inherit">
            Отмена
          </Button>
          <Button onClick={confirmCreateFile} color="primary" variant="contained">
            Создать
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог создания новой папки */}
      <Dialog 
        open={newFolderDialogOpen} 
        onClose={() => setNewFolderDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Создать новую папку</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="folder-name"
            label="Имя папки"
            type="text"
            fullWidth
            variant="outlined"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            helperText="Например: components, utils"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialogOpen(false)} color="inherit">
            Отмена
          </Button>
          <Button onClick={confirmCreateFolder} color="primary" variant="contained">
            Создать
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог подтверждения удаления */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить {contextMenuTarget?.name}?
            {contextMenuTarget?.type === 'directory' && ' Это действие удалит все содержимое папки.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Отмена
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FileExplorer;