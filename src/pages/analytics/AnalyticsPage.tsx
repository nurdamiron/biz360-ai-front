// src/pages/analytics/AnalyticsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  Stack,
  IconButton,
  Menu,
  alpha,
  useTheme,
  useMediaQuery,
  SelectChangeEvent,
  Badge,
  List,
  ListItem,
  ListItemText,
  Tooltip
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useSnackbar } from 'notistack';
import {
  fetchTasksStatusDistribution,
  fetchTasksPriorityDistribution,
  fetchTasksCompletionTimeline,
  fetchTasksPerformanceTimeline,
  fetchUserActivityStats,
  fetchProjectStats,
  AnalyticsFilterParams,
  toBarChartData,
  toPieChartData,
  toLineChartData
} from '../../store/slices/analyticsSlice';
import LineChart, { DataPoint } from '../../components/analytics/LineChart';
import BarChart from '../../components/analytics/BarChart';
import PieChart from '../../components/analytics/PieChart';
import { Project } from '../../store/slices/projectsSlice';
import { fetchProjects } from '../../store/slices/projectsSlice';

// Иконки
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
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

const AnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Получаем данные из Redux
  const {
    tasksStatusDistribution,
    tasksPriorityDistribution,
    tasksCompletionTimeline,
    tasksPerformanceTimeline,
    userActivityStats,
    projectStats,
    isLoading
  } = useAppSelector(state => state.analytics);
  
  const { projects } = useAppSelector(state => state.projects);
  
  // Состояние для фильтров
  const [filters, setFilters] = useState<AnalyticsFilterParams>({});
  
  // Состояние для временного диапазона
  const [timeRange, setTimeRange] = useState('30days'); // '7days', '30days', '90days', 'year'
  
  // Состояние для выбранного проекта
  const [selectedProject, setSelectedProject] = useState<number | undefined>(undefined);
  
  // Состояние для меню экспорта
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Состояние для активной вкладки
  const [tabValue, setTabValue] = useState(0);
  
  // Преобразование данных для компонентов визуализации
  const statusDistributionData = toPieChartData(
    tasksStatusDistribution.map(item => ({
      label: getStatusLabel(item.status),
      value: item.count
    }))
  );
  
  const priorityDistributionData = toPieChartData(
    tasksPriorityDistribution.map(item => ({
      label: getPriorityLabel(item.priority),
      value: item.count
    }))
  );
  
  const completionTimelineData = {
    created: toLineChartData(
      tasksCompletionTimeline.map(item => ({
        date: item.date,
        value: item.created
      }))
    ),
    completed: toLineChartData(
      tasksCompletionTimeline.map(item => ({
        date: item.date,
        value: item.completed
      }))
    )
  };
  
  const performanceTimelineData = {
    estimated: toLineChartData(
      tasksPerformanceTimeline.map(item => ({
        date: item.date,
        value: item.estimatedTime
      }))
    ),
    actual: toLineChartData(
      tasksPerformanceTimeline.map(item => ({
        date: item.date,
        value: item.actualTime
      }))
    )
  };
  
  const userActivityData = toBarChartData(
    userActivityStats.map(item => ({
      label: item.user.name,
      value: item.tasksCompleted
    }))
  );
  
  const projectStatsData = toBarChartData(
    projectStats.map(item => ({
      label: item.name,
      value: item.completionRate
    }))
  );
  
  // Загружаем данные при монтировании и при изменении фильтров
  useEffect(() => {
    // Преобразуем временной диапазон в даты
    let startDate: string | undefined;
    const now = new Date();
    
    switch (timeRange) {
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        break;
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90)).toISOString().split('T')[0];
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
        break;
      default:
        startDate = undefined;
    }
    
    const filterParams: AnalyticsFilterParams = {
      ...filters,
      startDate,
      projectId: selectedProject
    };
    
    dispatch(fetchTasksStatusDistribution(filterParams));
    dispatch(fetchTasksPriorityDistribution(filterParams));
    dispatch(fetchTasksCompletionTimeline(filterParams));
    dispatch(fetchTasksPerformanceTimeline(filterParams));
    dispatch(fetchUserActivityStats(filterParams));
    dispatch(fetchProjectStats(filterParams));
    
    // Также загружаем список проектов, если еще не загружен
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, filters, timeRange, selectedProject, projects.length]);
  
  // Функция для получения читаемого названия статуса
  function getStatusLabel(status: string): string {
    switch (status) {
      case 'new': return 'Новые';
      case 'pending': return 'Ожидающие';
      case 'in_progress': return 'В работе';
      case 'resolved': return 'Решены';
      case 'completed': return 'Завершены';
      case 'failed': return 'Ошибка';
      case 'canceled': return 'Отменены';
      default: return status;
    }
  }
  
  // Функция для получения читаемого названия приоритета
  function getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'low': return 'Низкий';
      case 'medium': return 'Средний';
      case 'high': return 'Высокий';
      case 'critical': return 'Критический';
      default: return priority;
    }
  }
  
  // Обработчик изменения временного диапазона
  const handleTimeRangeChange = (e: SelectChangeEvent) => {
    setTimeRange(e.target.value);
  };
  
  // Обработчик изменения проекта
  const handleProjectChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    setSelectedProject(value ? Number(value) : undefined);
  };
  
  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setTimeRange('30days');
    setSelectedProject(undefined);
    setFilters({});
  };
  
  // Обработчик открытия меню экспорта
  const handleOpenExportMenu = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };
  
  // Обработчик закрытия меню экспорта
  const handleCloseExportMenu = () => {
    setExportMenuAnchor(null);
  };
  
  // Обработчик экспорта данных (заглушка)
  const handleExport = (format: string) => {
    handleCloseExportMenu();
    enqueueSnackbar('Функция экспорта данных будет доступна в следующей версии', {
      variant: 'info',
      autoHideDuration: 3000,
    });
  };
  
  // Обработчик печати отчета (заглушка)
  const handlePrint = () => {
    handleCloseExportMenu();
    enqueueSnackbar('Функция печати отчета будет доступна в следующей версии', {
      variant: 'info',
      autoHideDuration: 3000,
    });
  };
  
  // Обработчик переключения вкладок
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Аналитика
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={() => {
              // Повторно загружаем данные с текущими фильтрами
              const filterParams: AnalyticsFilterParams = {
                ...filters,
                projectId: selectedProject
              };
              
              dispatch(fetchTasksStatusDistribution(filterParams));
              dispatch(fetchTasksPriorityDistribution(filterParams));
              dispatch(fetchTasksCompletionTimeline(filterParams));
              dispatch(fetchTasksPerformanceTimeline(filterParams));
              dispatch(fetchUserActivityStats(filterParams));
              dispatch(fetchProjectStats(filterParams));
            }}
            disabled={isLoading}
          >
            Обновить
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            onClick={handleOpenExportMenu}
          >
            Экспорт
          </Button>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={handleCloseExportMenu}
          >
            <MenuItem onClick={() => handleExport('csv')}>Экспорт в CSV</MenuItem>
            <MenuItem onClick={() => handleExport('excel')}>Экспорт в Excel</MenuItem>
            <MenuItem onClick={() => handleExport('pdf')}>Экспорт в PDF</MenuItem>
            <MenuItem onClick={handlePrint}>
              <Box display="flex" alignItems="center">
                <PrintIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography>Печать отчета</Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Stack>
      </Box>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid 
            container 
            spacing={2} 
            alignItems="center"
            direction={{ xs: 'column', md: 'row' }}
          >
            <Grid item xs={12} md={8}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                width="100%"
              >
                <FormControl fullWidth size="small">
                  <InputLabel id="time-range-label">Период</InputLabel>
                  <Select
                    labelId="time-range-label"
                    value={timeRange}
                    label="Период"
                    onChange={handleTimeRangeChange}
                  >
                    <MenuItem value="7days">Последние 7 дней</MenuItem>
                    <MenuItem value="30days">Последние 30 дней</MenuItem>
                    <MenuItem value="90days">Последние 90 дней</MenuItem>
                    <MenuItem value="year">Последний год</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small">
                  <InputLabel id="project-label">Проект</InputLabel>
                  <Select
                    labelId="project-label"
                    value={selectedProject?.toString() || ''}
                    label="Проект"
                    onChange={handleProjectChange}
                    displayEmpty
                  >
                    <MenuItem value="">Все проекты</MenuItem>
                    {projects.map(project => (
                      <MenuItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4} textAlign={{ xs: 'center', md: 'right' }}>
              <Button 
                variant="text" 
                onClick={handleResetFilters}
              >
                Сбросить фильтры
              </Button>
            </Grid>
          </Grid>
          
          {/* Индикаторы активных фильтров */}
          {(selectedProject !== undefined || timeRange !== '30days') && (
            <Stack 
              direction="row" 
              spacing={1} 
              flexWrap="wrap" 
              mt={2}
            >
              {selectedProject !== undefined && (
                <Chip 
                  label={`Проект: ${projects.find(p => p.id === selectedProject)?.name || selectedProject}`} 
                  color="secondary" 
                  onDelete={() => setSelectedProject(undefined)} 
                />
              )}
              
              <Chip 
                label={`Период: ${
                  timeRange === '7days' ? 'Последние 7 дней' :
                  timeRange === '30days' ? 'Последние 30 дней' :
                  timeRange === '90days' ? 'Последние 90 дней' :
                  'Последний год'
                }`} 
                color="primary" 
                onDelete={() => setTimeRange('30days')} 
              />
            </Stack>
          )}
        </CardContent>
      </Card>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="analytics tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Обзор" id="analytics-tab-0" aria-controls="analytics-tabpanel-0" />
            <Tab label="Задачи" id="analytics-tab-1" aria-controls="analytics-tabpanel-1" />
            <Tab label="Производительность" id="analytics-tab-2" aria-controls="analytics-tabpanel-2" />
            <Tab label="Пользователи" id="analytics-tab-3" aria-controls="analytics-tabpanel-3" />
            <Tab label="Проекты" id="analytics-tab-4" aria-controls="analytics-tabpanel-4" />
          </Tabs>
        </Box>
        
        {/* Панель обзора */}
        <TabPanel value={tabValue} index={0}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Создание и выполнение задач" 
                      subheader="Количество созданных и выполненных задач по дням" 
                      titleTypographyProps={{ variant: 'h6' }}
                      subheaderTypographyProps={{ variant: 'body2' }}
                    />
                    <Divider />
                    <CardContent>
                      <LineChart 
                        title="" 
                        data={completionTimelineData.created} 
                        height={300} 
                        color={theme.palette.primary.main}
                        compareData={completionTimelineData.completed}
                        compareColor={theme.palette.success.main}
                        mainLabel="Созданные"
                        compareLabel="Выполненные"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Производительность" 
                      subheader="Соотношение планового и фактического времени выполнения" 
                      titleTypographyProps={{ variant: 'h6' }}
                      subheaderTypographyProps={{ variant: 'body2' }}
                    />
                    <Divider />
                    <CardContent>
                      <LineChart 
                        title="" 
                        data={performanceTimelineData.estimated} 
                        height={300} 
                        color={theme.palette.info.main}
                        compareData={performanceTimelineData.actual}
                        compareColor={theme.palette.success.main}
                        mainLabel="Плановое время"
                        compareLabel="Фактическое время"
                        valueSuffix=" мин."
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Распределение статусов задач" 
                      subheader="Количество задач в каждом статусе" 
                      titleTypographyProps={{ variant: 'h6' }}
                      subheaderTypographyProps={{ variant: 'body2' }}
                    />
                    <Divider />
                    <CardContent>
                      <PieChart 
                        title="" 
                        data={statusDistributionData} 
                        donut={true}
                        showLegend={true}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Распределение приоритетов" 
                      subheader="Количество задач по приоритетам" 
                      titleTypographyProps={{ variant: 'h6' }}
                      subheaderTypographyProps={{ variant: 'body2' }}
                    />
                    <Divider />
                    <CardContent>
                      <PieChart 
                        title="" 
                        data={priorityDistributionData} 
                        donut={true}
                        showLegend={true}
                        colorScheme={[
                          theme.palette.error.main,
                          theme.palette.warning.main,
                          theme.palette.info.main,
                          theme.palette.grey[500]
                        ]}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Активность пользователей" 
                      subheader="Количество выполненных задач по пользователям" 
                      titleTypographyProps={{ variant: 'h6' }}
                      subheaderTypographyProps={{ variant: 'body2' }}
                    />
                    <Divider />
                    <CardContent>
                      <BarChart 
                        title=""
                        data={userActivityData.slice(0, 5)}
                        height={250}
                        horizontal={true}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </TabPanel>
        
        {/* Панель задач */}
        <TabPanel value={tabValue} index={1}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Создание задач" 
                    subheader="Количество созданных задач по дням" 
                    titleTypographyProps={{ variant: 'h6' }}
                    subheaderTypographyProps={{ variant: 'body2' }}
                  />
                  <Divider />
                  <CardContent>
                    <LineChart 
                      title="" 
                      data={completionTimelineData.created} 
                      height={300} 
                      color={theme.palette.primary.main}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Выполнение задач" 
                    subheader="Количество выполненных задач по дням" 
                    titleTypographyProps={{ variant: 'h6' }}
                    subheaderTypographyProps={{ variant: 'body2' }}
                  />
                  <Divider />
                  <CardContent>
                    <LineChart 
                      title="" 
                      data={completionTimelineData.completed} 
                      height={300} 
                      color={theme.palette.success.main}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Статусы задач" 
                    subheader="Распределение задач по статусам" 
                    titleTypographyProps={{ variant: 'h6' }}
                    subheaderTypographyProps={{ variant: 'body2' }}
                  />
                  <Divider />
                  <CardContent sx={{ height: 350 }}>
                    <PieChart 
                      title="" 
                      data={statusDistributionData} 
                      showLegend={true}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Приоритеты задач" 
                    subheader="Распределение задач по приоритетам" 
                    titleTypographyProps={{ variant: 'h6' }}
                    subheaderTypographyProps={{ variant: 'body2' }}
                  />
                  <Divider />
                  <CardContent sx={{ height: 350 }}>
                    <PieChart 
                      title="" 
                      data={priorityDistributionData} 
                      showLegend={true}
                      colorScheme={[
                        theme.palette.error.main,
                        theme.palette.warning.main,
                        theme.palette.info.main,
                        theme.palette.grey[500]
                      ]}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>
        
        {/* Панель производительности */}
        <TabPanel value={tabValue} index={2}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Плановое время" 
                      subheader="Плановое время выполнения задач по дням (мин.)" 
                      titleTypographyProps={{ variant: 'h6' }}
                      subheaderTypographyProps={{ variant: 'body2' }}
                    />
                    <Divider />
                    <CardContent>
                      <LineChart 
                        title="" 
                        data={performanceTimelineData.estimated} 
                        height={300} 
                        color={theme.palette.primary.main}
                        valueSuffix=" мин."
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Фактическое время" 
                      subheader="Фактическое время выполнения задач по дням (мин.)" 
                      titleTypographyProps={{ variant: 'h6' }}
                      subheaderTypographyProps={{ variant: 'body2' }}
                    />
                    <Divider />
                    <CardContent>
                      <LineChart 
                        title="" 
                        data={performanceTimelineData.actual} 
                        height={300} 
                        color={theme.palette.success.main}
                        valueSuffix=" мин."
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Card variant="outlined">
                <CardHeader 
                  title="Эффективность ИИ-ассистента" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.primary.main, 0.05)
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Средняя скорость
                        </Typography>
                        <Typography variant="h4" color="primary" gutterBottom>
                          87%
                        </Typography>
                        <Chip label="Выше среднего" color="success" size="small" />
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.success.main, 0.05)
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Точность кода
                        </Typography>
                        <Typography variant="h4" color="success" gutterBottom>
                          92%
                        </Typography>
                        <Chip label="Отлично" color="success" size="small" />
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.secondary.main, 0.05)
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Успешные PR
                        </Typography>
                        <Typography variant="h4" color="secondary" gutterBottom>
                          78%
                        </Typography>
                        <Chip label="Хорошо" color="primary" size="small" />
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.warning.main, 0.05)
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Экономия времени
                        </Typography>
                        <Typography variant="h4" color="warning.dark" gutterBottom>
                          67%
                        </Typography>
                        <Chip label="Средне" color="warning" size="small" />
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </TabPanel>
        
        {/* Панель пользователей */}
        <TabPanel value={tabValue} index={3}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Созданные задачи" 
                      subheader="Количество созданных задач по пользователям" 
                      titleTypographyProps={{ variant: 'h6' }}
                      subheaderTypographyProps={{ variant: 'body2' }}
                    />
                    <Divider />
                    <CardContent>
                      <BarChart 
                        title=""
                        data={userActivityStats.map(user => ({
                          label: user.user.name,
                          value: user.tasksCreated
                        }))}
                        height={300}
                        horizontal={true}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Выполненные задачи" 
                      subheader="Количество выполненных задач по пользователям" 
                      titleTypographyProps={{ variant: 'h6' }}
                      subheaderTypographyProps={{ variant: 'body2' }}
                    />
                    <Divider />
                    <CardContent>
                      <BarChart 
                        title=""
                        data={userActivityStats.map(user => ({
                          label: user.user.name,
                          value: user.tasksCompleted
                        }))}
                        height={300}
                        horizontal={true}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Card variant="outlined">
                <CardHeader 
                  title="Лидеры по эффективности" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    {userActivityStats.slice(0, 3).map((user, index) => (
                      <Grid item xs={12} md={4} key={user.user.id}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Badge
                              color={index === 0 ? 'warning' : index === 1 ? 'secondary' : 'error'}
                              badgeContent={`#${index + 1}`}
                              sx={{ 
                                '& .MuiBadge-badge': { 
                                  fontSize: 16,
                                  width: 30,
                                  height: 30,
                                  borderRadius: '50%'
                                }
                              }}
                            >
                              <Avatar
                                sx={{ 
                                  width: 60, 
                                  height: 60, 
                                  bgcolor: theme.palette.primary.main,
                                  mx: 'auto',
                                  mb: 1
                                }}
                              >
                                {user.user.name.charAt(0)}
                              </Avatar>
                            </Badge>
                            <Typography variant="h6" gutterBottom>
                              {user.user.name}
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Grid container spacing={2} mt={1}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Задачи
                                </Typography>
                                <Typography variant="h6">
                                  {user.tasksCompleted}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Код
                                </Typography>
                                <Typography variant="h6">
                                  {user.codeReviewed}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </TabPanel>
        
        {/* Панель проектов */}
        <TabPanel value={tabValue} index={4}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Количество задач" 
                      subheader="Количество задач по проектам" 
                      titleTypographyProps={{ variant: 'h6' }}
                      subheaderTypographyProps={{ variant: 'body2' }}
                    />
                    <Divider />
                    <CardContent>
                      <BarChart 
                        title=""
                        data={projectStats.map(project => ({
                          label: project.name,
                          value: project.tasksCount
                        }))}
                        height={300}
                        horizontal={true}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Процент выполнения" 
                      subheader="Процент выполненных задач по проектам" 
                      titleTypographyProps={{ variant: 'h6' }}
                      subheaderTypographyProps={{ variant: 'body2' }}
                    />
                    <Divider />
                    <CardContent>
                      <BarChart 
                        title=""
                        data={projectStats.map(project => ({
                          label: project.name,
                          value: project.completionRate
                        }))}
                        height={300}
                        horizontal={true}
                        valueSuffix="%"
                        maxValue={100}
                        defaultColor={theme.palette.success.main}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Card variant="outlined">
                <CardHeader 
                  title="Топ проектов по эффективности" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    {projectStats
                      .sort((a, b) => b.completionRate - a.completionRate)
                      .slice(0, 4)
                      .map(project => (
                        <Grid item xs={12} sm={6} md={3} key={project.id}>
                          <Paper variant="outlined" sx={{ p: 3 }}>
                            <Typography variant="h6" noWrap title={project.name}>
                              {project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {project.tasksCount} задач
                            </Typography>
                            <Box display="flex" alignItems="center" mt={2}>
                              <Typography variant="body1" fontWeight="medium" sx={{ mr: 1 }}>
                                {project.completionRate}%
                              </Typography>
                              <Box sx={{ flexGrow: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={project.completionRate} 
                                  color={
                                    project.completionRate > 75 ? 'success' :
                                    project.completionRate > 50 ? 'primary' :
                                    project.completionRate > 25 ? 'warning' :
                                    'error'
                                  }
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </TabPanel>
      </Box>
    </Box>
  );
};

export default AnalyticsPage;