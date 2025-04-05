import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Slider,
  Tabs,
  Tab,
  FormHelperText,
  RadioGroup,
  Radio,
  Paper,
  Stack,
  InputLabel,
  SelectChangeEvent,
  Tooltip
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../hooks/redux';
import { Environment, getCurrentEnvironment, setEnvironment } from '../../config/api.config';
import { ColorModeContext } from '../../App';

// Иконки
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaletteIcon from '@mui/icons-material/Palette';
import CodeIcon from '@mui/icons-material/Code';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const SettingsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const colorMode = React.useContext(ColorModeContext);
  const { user } = useAppSelector(state => state.auth);
  
  // Активная вкладка
  const [tabValue, setTabValue] = useState(0);
  
  // Локальные состояния для настроек
  const [environment, setCurrentEnvironment] = useState<Environment>(getCurrentEnvironment());
  const [isLimitTokens, setIsLimitTokens] = useState(true);
  const [maxTokensPerRequest, setMaxTokensPerRequest] = useState(4000);
  const [showSliderValue, setShowSliderValue] = useState(false);
  
  // Пользовательские настройки
  const [userSettings, setUserSettings] = useState({
    notificationsEnabled: true,
    emailNotifications: false,
    autoSaveEnabled: true,
    codeReviewLevel: 'balanced',
    aiModel: 'claude-3.5-sonnet',
    language: 'ru'
  });
  
  // Системные настройки
  const [systemSettings, setSystemSettings] = useState({
    autoUpdateEnabled: true,
    debugMode: false,
    saveLogs: true,
    backupFrequency: 'daily',
    tokenLimitPerDay: 1000000,
    maxConcurrentRequests: 5
  });
  
  // Обработчик изменения вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Обработчик изменения окружения
  const handleEnvironmentChange = (e: SelectChangeEvent) => {
    const newEnv = e.target.value as Environment;
    setCurrentEnvironment(newEnv);
    setEnvironment(newEnv);
    
    enqueueSnackbar(`Текущее окружение: ${newEnv === Environment.LOCAL ? 'Локальное' : 'Промышленное'}`, {
      variant: 'info'
    });
  };
  
  // Обработчик сохранения настроек пользователя
  const handleSaveUserSettings = () => {
    enqueueSnackbar('Ваши настройки успешно сохранены', {
      variant: 'success'
    });
  };
  
  // Обработчик сохранения системных настроек
  const handleSaveSystemSettings = () => {
    enqueueSnackbar('Системные настройки успешно обновлены', {
      variant: 'success'
    });
  };
  
  // Обработчик сброса настроек
  const handleResetSettings = () => {
    enqueueSnackbar('Все настройки сброшены до значений по умолчанию', {
      variant: 'info'
    });
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Настройки
        </Typography>
        
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveUserSettings}
            sx={{ mr: 1 }}
          >
            Сохранить изменения
          </Button>
          
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltIcon />}
            onClick={handleResetSettings}
          >
            Сбросить
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              icon={<PersonIcon />} 
              iconPosition="start" 
              label="Профиль" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<NotificationsIcon />} 
              iconPosition="start" 
              label="Уведомления" 
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<PaletteIcon />} 
              iconPosition="start" 
              label="Интерфейс" 
              {...a11yProps(2)} 
            />
            <Tab 
              icon={<CodeIcon />} 
              iconPosition="start" 
              label="ИИ-ассистент" 
              {...a11yProps(3)} 
            />
            <Tab 
              icon={<LanguageIcon />} 
              iconPosition="start" 
              label="Подключение" 
              {...a11yProps(4)} 
            />
            <Tab 
              icon={<SecurityIcon />} 
              iconPosition="start" 
              label="Безопасность" 
              {...a11yProps(5)} 
            />
          </Tabs>
        </Box>
        
        {/* Панель профиля */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Card variant="outlined">
                <CardHeader title="Информация о пользователе" />
                <Divider />
                <CardContent>
                  <Box display="flex" mb={4} alignItems="center">
                    <Avatar
                      sx={{ width: 80, height: 80, mr: 2 }}
                      alt={user?.username || 'Пользователь'}
                      src={user?.avatarUrl}
                    />
                    <Box>
                      <Typography variant="h6">
                        {user?.firstName} {user?.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email}
                      </Typography>
                      <Chip 
                        label={user?.role} 
                        color="primary" 
                        size="small" 
                        sx={{ mt: 1 }} 
                      />
                    </Box>
                    <IconButton 
                      sx={{ ml: 'auto' }} 
                      color="primary"
                      aria-label="Редактировать профиль"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Имя"
                        defaultValue={user?.firstName || ''}
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Фамилия"
                        defaultValue={user?.lastName || ''}
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        defaultValue={user?.email || ''}
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Имя пользователя"
                        defaultValue={user?.username || ''}
                        variant="outlined"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Card variant="outlined">
                <CardHeader title="Статистика" />
                <Divider />
                <CardContent>
                  <List disablePadding>
                    <ListItem divider>
                      <ListItemText primary="Создано задач" />
                      <Typography variant="body1" fontWeight="medium">
                        24
                      </Typography>
                    </ListItem>
                    
                    <ListItem divider>
                      <ListItemText primary="Выполнено задач" />
                      <Typography variant="body1" fontWeight="medium">
                        18
                      </Typography>
                    </ListItem>
                    
                    <ListItem divider>
                      <ListItemText primary="Проверено кода" />
                      <Typography variant="body1" fontWeight="medium">
                        42 файла
                      </Typography>
                    </ListItem>
                    
                    <ListItem divider>
                      <ListItemText primary="Активно с" />
                      <Typography variant="body1" fontWeight="medium">
                        12.01.2023
                      </Typography>
                    </ListItem>
                    
                    <ListItem divider>
                      <ListItemText primary="Роль" />
                      <Chip label={user?.role} color="primary" size="small" />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText primary="Статус" />
                      <Chip label="Активен" color="success" size="small" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Панель уведомлений */}
        <TabPanel value={tabValue} index={1}>
          <Card variant="outlined">
            <CardHeader title="Настройки уведомлений" />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userSettings.notificationsEnabled}
                        onChange={() => setUserSettings({
                          ...userSettings,
                          notificationsEnabled: !userSettings.notificationsEnabled
                        })}
                        color="primary"
                      />
                    }
                    label="Включить уведомления"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userSettings.emailNotifications}
                        onChange={() => setUserSettings({
                          ...userSettings,
                          emailNotifications: !userSettings.emailNotifications
                        })}
                        color="primary"
                        disabled={!userSettings.notificationsEnabled}
                      />
                    }
                    label="Уведомления по электронной почте"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Типы уведомлений
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            defaultChecked
                            disabled={!userSettings.notificationsEnabled}
                            color="primary"
                          />
                        }
                        label="Создание задачи"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            defaultChecked
                            disabled={!userSettings.notificationsEnabled}
                            color="primary"
                          />
                        }
                        label="Завершение задачи"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            defaultChecked
                            disabled={!userSettings.notificationsEnabled}
                            color="primary"
                          />
                        }
                        label="Генерация кода"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            defaultChecked
                            disabled={!userSettings.notificationsEnabled}
                            color="primary"
                          />
                        }
                        label="Ошибки"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Панель интерфейса */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Настройки темы" />
                <Divider />
                <CardContent>
                  <List disablePadding>
                    <ListItem>
                      <ListItemText primary="Темная тема" />
                      <Switch
                        edge="end"
                        checked={colorMode.mode === 'dark'}
                        onChange={colorMode.toggleColorMode}
                        color="primary"
                      />
                    </ListItem>
                    <Divider />
                    
                    <ListItem>
                      <ListItemIcon>
                        {colorMode.mode === 'dark' ? (
                          <Brightness7Icon />
                        ) : (
                          <Brightness4Icon />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          colorMode.mode === 'dark'
                            ? 'Включена темная тема'
                            : 'Включена светлая тема'
                        }
                      />
                      <IconButton
                        onClick={colorMode.toggleColorMode}
                        edge="end"
                        color="primary"
                      >
                        {colorMode.mode === 'dark' ? (
                          <Brightness7Icon />
                        ) : (
                          <Brightness4Icon />
                        )}
                      </IconButton>
                    </ListItem>
                    <Divider />
                    
                    <ListItem>
                      <FormControl fullWidth>
                        <InputLabel id="color-scheme-label">Цветовая схема</InputLabel>
                        <Select
                          labelId="color-scheme-label"
                          value="blue"
                          label="Цветовая схема"
                        >
                          <MenuItem value="blue">Синяя (по умолчанию)</MenuItem>
                          <MenuItem value="purple">Фиолетовая</MenuItem>
                          <MenuItem value="green">Зеленая</MenuItem>
                          <MenuItem value="red">Красная</MenuItem>
                        </Select>
                        <FormHelperText>Основной цвет интерфейса</FormHelperText>
                      </FormControl>
                    </ListItem>
                    <Divider />
                    
                    <ListItem>
                      <ListItemText primary="Анимации" />
                      <Switch
                        edge="end"
                        defaultChecked
                        color="primary"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Настройки интерфейса" />
                <Divider />
                <CardContent>
                  <List disablePadding>
                    <ListItem>
                      <FormControl fullWidth>
                        <InputLabel id="language-label">Язык интерфейса</InputLabel>
                        <Select
                          labelId="language-label"
                          value={userSettings.language}
                          label="Язык интерфейса"
                          onChange={(e) => setUserSettings({
                            ...userSettings,
                            language: e.target.value
                          })}
                        >
                          <MenuItem value="ru">Русский</MenuItem>
                          <MenuItem value="en">English</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItem>
                    <Divider />
                    
                    <ListItem>
                      <ListItemText primary="Компактный режим" />
                      <Switch
                        edge="end"
                        color="primary"
                      />
                    </ListItem>
                    <Divider />
                    
                    <ListItem>
                      <ListItemText primary="Автосохранение" />
                      <Switch
                        edge="end"
                        checked={userSettings.autoSaveEnabled}
                        onChange={() => setUserSettings({
                          ...userSettings,
                          autoSaveEnabled: !userSettings.autoSaveEnabled
                        })}
                        color="primary"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Панель ИИ-ассистента */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Настройки ИИ-модели" />
                <Divider />
                <CardContent>
                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel id="ai-model-label">Модель ИИ</InputLabel>
                      <Select
                        labelId="ai-model-label"
                        value={userSettings.aiModel}
                        label="Модель ИИ"
                        onChange={(e) => setUserSettings({
                          ...userSettings,
                          aiModel: e.target.value
                        })}
                      >
                        <MenuItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</MenuItem>
                        <MenuItem value="claude-3-opus">Claude 3 Opus</MenuItem>
                        <MenuItem value="gpt-4o">GPT-4o</MenuItem>
                        <MenuItem value="llama-3-70b">Llama 3 70B</MenuItem>
                      </Select>
                      <FormHelperText>Основная модель для генерации кода</FormHelperText>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Уровень проверки кода</FormLabel>
                      <RadioGroup
                        value={userSettings.codeReviewLevel}
                        onChange={(e) => setUserSettings({
                          ...userSettings,
                          codeReviewLevel: e.target.value
                        })}
                      >
                        <FormControlLabel 
                          value="minimal" 
                          control={<Radio />} 
                          label={
                            <Box>
                              <Typography variant="body1">Минимальный</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Простая проверка синтаксиса
                              </Typography>
                            </Box>
                          } 
                        />
                        <FormControlLabel 
                          value="balanced" 
                          control={<Radio />} 
                          label={
                            <Box>
                              <Typography variant="body1">Сбалансированный</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Оптимальный баланс между скоростью и тщательностью
                              </Typography>
                            </Box>
                          } 
                        />
                        <FormControlLabel 
                          value="thorough" 
                          control={<Radio />} 
                          label={
                            <Box>
                              <Typography variant="body1">Тщательный</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Максимально тщательный анализ кода
                              </Typography>
                            </Box>
                          } 
                        />
                      </RadioGroup>
                    </FormControl>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isLimitTokens}
                          onChange={() => setIsLimitTokens(!isLimitTokens)}
                          color="primary"
                        />
                      }
                      label="Ограничить использование токенов"
                    />
                    
                    <Box>
                      <Typography gutterBottom>
                        Максимум токенов на запрос: {maxTokensPerRequest}
                      </Typography>
                      <Slider
                        value={maxTokensPerRequest}
                        min={1000}
                        max={16000}
                        step={1000}
                        marks
                        disabled={!isLimitTokens}
                        valueLabelDisplay="auto"
                        onChange={(_, value) => setMaxTokensPerRequest(value as number)}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Параметры генерации кода" />
                <Divider />
                <CardContent>
                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel id="framework-label">Фреймворк по умолчанию</InputLabel>
                      <Select
                        labelId="framework-label"
                        defaultValue="react"
                        label="Фреймворк по умолчанию"
                      >
                        <MenuItem value="react">React</MenuItem>
                        <MenuItem value="angular">Angular</MenuItem>
                        <MenuItem value="vue">Vue</MenuItem>
                        <MenuItem value="svelte">Svelte</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth>
                      <InputLabel id="code-style-label">Стиль кода</InputLabel>
                      <Select
                        labelId="code-style-label"
                        defaultValue="functional"
                        label="Стиль кода"
                      >
                        <MenuItem value="functional">Функциональный</MenuItem>
                        <MenuItem value="oop">Объектно-ориентированный</MenuItem>
                        <MenuItem value="mixed">Смешанный</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          defaultChecked
                          color="primary"
                        />
                      }
                      label="Использовать TypeScript"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          defaultChecked
                          color="primary"
                        />
                      }
                      label="Подробные комментарии"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          defaultChecked
                          color="primary"
                        />
                      }
                      label="Генерировать тесты"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Панель подключений */}
        <TabPanel value={tabValue} index={4}>
          <Card variant="outlined">
            <CardHeader title="Настройки API и подключений" />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel id="environment-label">Среда API</InputLabel>
                  <Select
                    labelId="environment-label"
                    value={environment}
                    label="Среда API"
                    onChange={handleEnvironmentChange}
                  >
                    <MenuItem value={Environment.LOCAL}>Локальная (http://localhost:3000/api)</MenuItem>
                    <MenuItem value={Environment.PRODUCTION}>Промышленная (https://ai-assistant-back-zneh.onrender.com/api)</MenuItem>
                  </Select>
                  <FormHelperText>
                    Текущий API URL: <code>
                      {environment === Environment.LOCAL ? 'http://localhost:3000/api' : 'https://ai-assistant-back-zneh.onrender.com/api'}
                    </code>
                  </FormHelperText>
                </FormControl>
                
                <Divider />
                
                <Typography variant="h6">Ключи API</Typography>
                
                <TextField
                  fullWidth
                  label="Ключ API ИИ-ассистента"
                  type="password"
                  defaultValue="sk_••••••••••••••••••••••••••••••"
                  helperText="API ключ для доступа к сервисам ИИ-ассистента"
                />
                
                <TextField
                  fullWidth
                  label="URL системы контроля версий"
                  defaultValue="https://github.com/organization/biz360-crm.git"
                  helperText="URL для интеграции с системой контроля версий"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.autoUpdateEnabled}
                      onChange={() => setSystemSettings({
                        ...systemSettings,
                        autoUpdateEnabled: !systemSettings.autoUpdateEnabled
                      })}
                      color="primary"
                    />
                  }
                  label="Автоматическое обновление"
                />
                
                <Box>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleSaveSystemSettings}
                  >
                    Сохранить настройки подключения
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Панель безопасности */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Безопасность аккаунта" />
                <Divider />
                <CardContent>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Текущий пароль"
                      type="password"
                      placeholder="••••••••••••"
                    />
                    
                    <TextField
                      fullWidth
                      label="Новый пароль"
                      type="password"
                      placeholder="••••••••••••"
                      helperText="Минимум 8 символов, включая цифры и специальные символы"
                    />
                    
                    <TextField
                      fullWidth
                      label="Подтверждение пароля"
                      type="password"
                      placeholder="••••••••••••"
                    />
                    
                    <Button variant="contained" color="primary">
                      Изменить пароль
                    </Button>
                    
                    <Divider />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          color="primary"
                        />
                      }
                      label="Двухфакторная аутентификация"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Журнал активности" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem divider>
                      <ListItemIcon>
                        <HistoryIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Авторизация в системе"
                        secondary="Сегодня, 10:45"
                      />
                      <Chip label="Успешно" color="success" size="small" />
                    </ListItem>
                    
                    <ListItem divider>
                      <ListItemIcon>
                        <HistoryIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Изменение настроек профиля"
                        secondary="Вчера, 14:23"
                      />
                      <Chip label="Изменение" color="primary" size="small" />
                    </ListItem>
                    
                    <ListItem divider>
                      <ListItemIcon>
                        <HistoryIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Неудачная попытка входа"
                        secondary="23.04.2023, 09:12"
                      />
                      <Chip label="Ошибка" color="error" size="small" />
                    </ListItem>
                  </List>
                  
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button size="small" variant="outlined">
                      Показать все
                    </Button>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        defaultChecked
                        color="primary"
                      />
                    }
                    label="Ведение журнала активности"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default SettingsPage;