import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
  Grid,
  Divider,
  Paper,
  Button,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../store/slices/projectsSlice';

// Иконки Material UI
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import CodeIcon from '@mui/icons-material/Code';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

interface ProjectCardProps {
  project: Project;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onView,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // Расчет процента выполнения задач
  const completionPercentage = 
    project.tasksCount > 0 
    ? Math.round((project.completedTasks / project.tasksCount) * 100) 
    : 0;
  
  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'info';
    }
  };
  
  // Получение текста статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'inactive':
        return 'Неактивный';
      case 'archived':
        return 'Архивирован';
      default:
        return status;
    }
  };
  
  // Обработчик открытия меню
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Обработчик закрытия меню
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Обработчики действий
  const handleView = () => {
    handleMenuClose();
    if (onView) {
      onView(project.id);
    } else {
      navigate(`/projects/${project.id}`);
    }
  };
  
  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) {
      onEdit(project.id);
    }
  };
  
  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) {
      onDelete(project.id);
    }
  };
  
  // Получение цвета прогресса
  const getProgressColor = () => {
    if (completionPercentage < 30) return 'error';
    if (completionPercentage < 70) return 'warning';
    return 'success';
  };
  
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1, flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              {project.name}
            </Typography>
            <Chip 
              label={getStatusText(project.status)} 
              color={getStatusColor(project.status) as 'success' | 'warning' | 'error' | 'default' | 'info'} 
              size="small"
            />
          </Box>
          <Box display="flex">
            <IconButton 
              size="small" 
              onClick={handleView}
              aria-label="Просмотреть проект"
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Еще"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="project-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleView}>
                <ListItemIcon>
                  <VisibilityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Открыть проект" />
              </MenuItem>
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Редактировать" />
              </MenuItem>
              <MenuItem onClick={handleDelete}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary="Удалить" primaryTypographyProps={{ color: 'error' }} />
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          gutterBottom
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
            minHeight: '40px'
          }}
        >
          {project.description}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default', textAlign: 'center' }}>
              <Typography variant="caption" display="block" color="text.secondary">
                Всего задач
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {project.tasksCount}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default', textAlign: 'center' }}>
              <Typography variant="caption" display="block" color="text.secondary">
                Активные
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {project.activeTasks}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default', textAlign: 'center' }}>
              <Typography variant="caption" display="block" color="text.secondary">
                Завершенные
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {project.completedTasks}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" color="text.secondary">Прогресс</Typography>
            <Typography variant="body2" color="text.secondary">{completionPercentage}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={completionPercentage} 
            color={getProgressColor()}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
        
        {project.codeStats && (
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Chip 
              icon={<FolderIcon />} 
              label={`${project.codeStats.totalFiles} файлов`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              icon={<CodeIcon />} 
              label={`${project.codeStats.totalLines} строк`} 
              size="small" 
              variant="outlined" 
            />
            <Box>
              {project.codeStats.languages.slice(0, 2).map((lang, index) => (
                <Chip 
                  key={index} 
                  label={`${lang.name} ${lang.percentage}%`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ ml: 0.5 }}
                />
              ))}
            </Box>
          </Stack>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', bgcolor: 'background.default', pt: 0 }}>
        <Typography variant="caption" color="text.secondary">
          Создан: {new Date(project.createdAt).toLocaleDateString()}
        </Typography>
        <Button 
          size="small" 
          variant="outlined" 
          endIcon={<VisibilityIcon />}
          onClick={handleView}
        >
          Подробнее
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;