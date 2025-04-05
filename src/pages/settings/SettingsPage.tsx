// src/pages/settings/SettingsPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  Switch,
  Divider,
  Badge,
  useToast,
  useColorMode,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  IconButton,
  Avatar,
  Code,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  Radio,
  RadioGroup,
  Stack
} from '@chakra-ui/react';
import { useAppSelector } from '../../hooks/redux';
import { Environment, getCurrentEnvironment, setEnvironment } from '../../config/api.config';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const SaveIcon = () => <span>💾</span>;
const ResetIcon = () => <span>🔄</span>;
const EditIcon = () => <span>✏️</span>;
const UserIcon = () => <span>👤</span>;
const LockIcon = () => <span>🔒</span>;
const BellIcon = () => <span>🔔</span>;
const ThemeIcon = () => <span>🎨</span>;
const CodeIcon = () => <span>💻</span>;
const NetworkIcon = () => <span>🌐</span>;
const HistoryIcon = () => <span>⏱️</span>;

const SettingsPage: React.FC = () => {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useAppSelector(state => state.auth);
  
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
  
  // Цвета
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Обработчик изменения окружения
  const handleEnvironmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEnv = e.target.value as Environment;
    setCurrentEnvironment(newEnv);
    setEnvironment(newEnv);
    
    toast({
      title: 'Окружение изменено',
      description: `Текущее окружение: ${newEnv === Environment.LOCAL ? 'Локальное' : 'Промышленное'}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Обработчик сохранения настроек пользователя
  const handleSaveUserSettings = () => {
    toast({
      title: 'Настройки сохранены',
      description: 'Ваши настройки успешно сохранены',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Обработчик сохранения системных настроек
  const handleSaveSystemSettings = () => {
    toast({
      title: 'Системные настройки сохранены',
      description: 'Системные настройки успешно обновлены',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Обработчик сброса настроек
  const handleResetSettings = () => {
    toast({
      title: 'Настройки сброшены',
      description: 'Все настройки сброшены до значений по умолчанию',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <VStack align="flex-start" spacing={1}>
          <Heading size="lg">Настройки</Heading>
          <Text color="gray.500">
            Настройка параметров ИИ-ассистента и пользовательских предпочтений
          </Text>
        </VStack>
        
        <HStack spacing={2}>
          <Button 
            leftIcon={<SaveIcon />} 
            colorScheme="blue" 
            onClick={handleSaveUserSettings}
          >
            Сохранить изменения
          </Button>
          
          <Button 
            leftIcon={<ResetIcon />} 
            variant="outline" 
            onClick={handleResetSettings}
          >
            Сбросить
          </Button>
        </HStack>
      </Flex>
      
      <Tabs variant="enclosed" colorScheme="blue" isLazy>
        <TabList>
          <Tab><HStack><UserIcon /><Text>Профиль</Text></HStack></Tab>
          <Tab><HStack><BellIcon /><Text>Уведомления</Text></HStack></Tab>
          <Tab><HStack><ThemeIcon /><Text>Интерфейс</Text></HStack></Tab>
          <Tab><HStack><CodeIcon /><Text>ИИ-ассистент</Text></HStack></Tab>
          <Tab><HStack><NetworkIcon /><Text>Подключение</Text></HStack></Tab>
          <Tab><HStack><LockIcon /><Text>Безопасность</Text></HStack></Tab>
        </TabList>
        
        <TabPanels>
          {/* Панель профиля */}
          <TabPanel p={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card borderColor={borderColor} bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>Информация о пользователе</Heading>
                  
                  <HStack spacing={4} mb={6}>
                    <Avatar size="xl" name={user?.username} src={user?.avatarUrl} />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">{user?.firstName} {user?.lastName}</Text>
                      <Text color="gray.500">{user?.email}</Text>
                      <Badge colorScheme="purple">{user?.role}</Badge>
                    </VStack>
                    <IconButton 
                      aria-label="Edit profile" 
                      icon={<EditIcon />} 
                      variant="ghost" 
                      ml="auto"
                    />
                  </HStack>
                  
                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel>Имя</FormLabel>
                      <Input defaultValue={user?.firstName || ''} />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Фамилия</FormLabel>
                      <Input defaultValue={user?.lastName || ''} />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input defaultValue={user?.email || ''} />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Имя пользователя</FormLabel>
                      <Input defaultValue={user?.username || ''} isReadOnly />
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>
              
              <Card borderColor={borderColor} bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>Статистика</Heading>
                  
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text>Создано задач:</Text>
                      <Text fontWeight="bold">24</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text>Выполнено задач:</Text>
                      <Text fontWeight="bold">18</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text>Проверено кода:</Text>
                      <Text fontWeight="bold">42 файла</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text>Активно с:</Text>
                      <Text fontWeight="bold">12.01.2023</Text>
                    </HStack>
                    
                    <Divider />
                    
                    <HStack justify="space-between">
                      <Text>Роль:</Text>
                      <Badge colorScheme="purple">{user?.role}</Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text>Статус:</Text>
                      <Badge colorScheme="green">Активен</Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Панель уведомлений */}
          <TabPanel p={4}>
            <Card borderColor={borderColor} bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4}>Настройки уведомлений</Heading>
                
                <VStack spacing={6} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="notifications-toggle" mb="0">
                      Включить уведомления
                    </FormLabel>
                    <Switch
                      id="notifications-toggle"
                      colorScheme="blue"
                      isChecked={userSettings.notificationsEnabled}
                      onChange={() => setUserSettings({
                        ...userSettings,
                        notificationsEnabled: !userSettings.notificationsEnabled
                      })}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="email-notifications-toggle" mb="0">
                      Уведомления по электронной почте
                    </FormLabel>
                    <Switch
                      id="email-notifications-toggle"
                      colorScheme="blue"
                      isChecked={userSettings.emailNotifications}
                      isDisabled={!userSettings.notificationsEnabled}
                      onChange={() => setUserSettings({
                        ...userSettings,
                        emailNotifications: !userSettings.emailNotifications
                      })}
                    />
                  </FormControl>
                  
                  <Divider />
                  
                  <Heading size="sm">Типы уведомлений</Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="task-created-toggle" mb="0">
                        Создание задачи
                      </FormLabel>
                      <Switch
                        id="task-created-toggle"
                        colorScheme="blue"
                        defaultChecked
                        isDisabled={!userSettings.notificationsEnabled}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="task-completed-toggle" mb="0">
                        Завершение задачи
                      </FormLabel>
                      <Switch
                        id="task-completed-toggle"
                        colorScheme="blue"
                        defaultChecked
                        isDisabled={!userSettings.notificationsEnabled}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="code-generated-toggle" mb="0">
                        Генерация кода
                      </FormLabel>
                      <Switch
                        id="code-generated-toggle"
                        colorScheme="blue"
                        defaultChecked
                        isDisabled={!userSettings.notificationsEnabled}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="error-toggle" mb="0">
                        Ошибки
                      </FormLabel>
                      <Switch
                        id="error-toggle"
                        colorScheme="blue"
                        defaultChecked
                        isDisabled={!userSettings.notificationsEnabled}
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Панель интерфейса */}
          <TabPanel p={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card borderColor={borderColor} bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>Настройки темы</Heading>
                  
                  <VStack spacing={6} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="theme-toggle" mb="0">
                        Темная тема
                      </FormLabel>
                      <Switch
                        id="theme-toggle"
                        colorScheme="blue"
                        isChecked={colorMode === 'dark'}
                        onChange={toggleColorMode}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Цветовая схема</FormLabel>
                      <Select defaultValue="blue">
                        <option value="blue">Синяя (по умолчанию)</option>
                        <option value="purple">Фиолетовая</option>
                        <option value="green">Зеленая</option>
                        <option value="red">Красная</option>
                      </Select>
                      <FormHelperText>Основной цвет интерфейса</FormHelperText>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="animations-toggle" mb="0">
                        Анимации
                      </FormLabel>
                      <Switch
                        id="animations-toggle"
                        colorScheme="blue"
                        defaultChecked
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card borderColor={borderColor} bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>Настройки интерфейса</Heading>
                  
                  <VStack spacing={6} align="stretch">
                    <FormControl>
                      <FormLabel>Язык интерфейса</FormLabel>
                      <Select 
                        value={userSettings.language}
                        onChange={(e) => setUserSettings({
                          ...userSettings,
                          language: e.target.value
                        })}
                      >
                        <option value="ru">Русский</option>
                        <option value="en">English</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="compact-mode-toggle" mb="0">
                        Компактный режим
                      </FormLabel>
                      <Switch
                        id="compact-mode-toggle"
                        colorScheme="blue"
                        defaultChecked={false}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="autosave-toggle" mb="0">
                        Автосохранение
                      </FormLabel>
                      <Switch
                        id="autosave-toggle"
                        colorScheme="blue"
                        isChecked={userSettings.autoSaveEnabled}
                        onChange={() => setUserSettings({
                          ...userSettings,
                          autoSaveEnabled: !userSettings.autoSaveEnabled
                        })}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Панель ИИ-ассистента */}
          <TabPanel p={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card borderColor={borderColor} bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>Настройки ИИ-модели</Heading>
                  
                  <VStack spacing={6} align="stretch">
                    <FormControl>
                      <FormLabel>Модель ИИ</FormLabel>
                      <Select 
                        value={userSettings.aiModel}
                        onChange={(e) => setUserSettings({
                          ...userSettings,
                          aiModel: e.target.value
                        })}
                      >
                        <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                        <option value="claude-3-opus">Claude 3 Opus</option>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="llama-3-70b">Llama 3 70B</option>
                      </Select>
                      <FormHelperText>Основная модель для генерации кода</FormHelperText>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Уровень проверки кода</FormLabel>
                      <RadioGroup
                        value={userSettings.codeReviewLevel}
                        onChange={(value) => setUserSettings({
                          ...userSettings,
                          codeReviewLevel: value
                        })}
                      >
                        <Stack direction="column" spacing={2}>
                          <Radio value="minimal">
                            Минимальный
                            <Text fontSize="xs" color="gray.500">Простая проверка синтаксиса</Text>
                          </Radio>
                          <Radio value="balanced">
                            Сбалансированный
                            <Text fontSize="xs" color="gray.500">Оптимальный баланс между скоростью и тщательностью</Text>
                          </Radio>
                          <Radio value="thorough">
                            Тщательный
                            <Text fontSize="xs" color="gray.500">Максимально тщательный анализ кода</Text>
                          </Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="limit-tokens-toggle" mb="0">
                        Ограничить использование токенов
                      </FormLabel>
                      <Switch
                        id="limit-tokens-toggle"
                        colorScheme="blue"
                        isChecked={isLimitTokens}
                        onChange={() => setIsLimitTokens(!isLimitTokens)}
                      />
                    </FormControl>
                    
                    <FormControl isDisabled={!isLimitTokens}>
                      <FormLabel htmlFor="max-tokens-slider" mb={2}>
                        Максимум токенов на запрос: {maxTokensPerRequest}
                      </FormLabel>
                      <Slider
                        id="max-tokens-slider"
                        value={maxTokensPerRequest}
                        min={1000}
                        max={16000}
                        step={1000}
                        onChange={setMaxTokensPerRequest}
                        onMouseEnter={() => setShowSliderValue(true)}
                        onMouseLeave={() => setShowSliderValue(false)}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <Tooltip
                          hasArrow
                          bg="blue.500"
                          color="white"
                          placement="top"
                          isOpen={showSliderValue}
                          label={`${maxTokensPerRequest}`}
                        >
                          <SliderThumb />
                        </Tooltip>
                      </Slider>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card borderColor={borderColor} bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>Параметры генерации кода</Heading>
                  
                  <VStack spacing={6} align="stretch">
                    <FormControl>
                      <FormLabel>Фреймворк по умолчанию</FormLabel>
                      <Select defaultValue="react">
                        <option value="react">React</option>
                        <option value="angular">Angular</option>
                        <option value="vue">Vue</option>
                        <option value="svelte">Svelte</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Стиль кода</FormLabel>
                      <Select defaultValue="functional">
                        <option value="functional">Функциональный</option>
                        <option value="oop">Объектно-ориентированный</option>
                        <option value="mixed">Смешанный</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="typescript-toggle" mb="0">
                        Использовать TypeScript
                      </FormLabel>
                      <Switch
                        id="typescript-toggle"
                        colorScheme="blue"
                        defaultChecked
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="comments-toggle" mb="0">
                        Подробные комментарии
                      </FormLabel>
                      <Switch
                        id="comments-toggle"
                        colorScheme="blue"
                        defaultChecked
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="tests-generation-toggle" mb="0">
                        Генерировать тесты
                      </FormLabel>
                      <Switch
                        id="tests-generation-toggle"
                        colorScheme="blue"
                        defaultChecked
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Панель подключений */}
          <TabPanel p={4}>
            <Card borderColor={borderColor} bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4}>Настройки API и подключений</Heading>
                
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Среда API</FormLabel>
                    <Select 
                      value={environment}
                      onChange={handleEnvironmentChange}
                    >
                      <option value={Environment.LOCAL}>Локальная (http://localhost:3000/api)</option>
                      <option value={Environment.PRODUCTION}>Промышленная (https://ai-assistant-back-zneh.onrender.com/api)</option>
                    </Select>
                    <FormHelperText>
                      Текущий API URL: <Code fontSize="sm">
                        {environment === Environment.LOCAL ? 'http://localhost:3000/api' : 'https://ai-assistant-back-zneh.onrender.com/api'}
                      </Code>
                    </FormHelperText>
                  </FormControl>
                  
                  <Divider />
                  
                  <Heading size="sm">Ключи API</Heading>
                  
                  <FormControl>
                    <FormLabel>Ключ API ИИ-ассистента</FormLabel>
                    <Input type="password" defaultValue="sk_••••••••••••••••••••••••••••••" />
                    <FormHelperText>API ключ для доступа к сервисам ИИ-ассистента</FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>URL системы контроля версий</FormLabel>
                    <Input defaultValue="https://github.com/organization/biz360-crm.git" />
                    <FormHelperText>URL для интеграции с системой контроля версий</FormHelperText>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="auto-update-toggle" mb="0">
                      Автоматическое обновление
                    </FormLabel>
                    <Switch
                      id="auto-update-toggle"
                      colorScheme="blue"
                      isChecked={systemSettings.autoUpdateEnabled}
                      onChange={() => setSystemSettings({
                        ...systemSettings,
                        autoUpdateEnabled: !systemSettings.autoUpdateEnabled
                      })}
                    />
                  </FormControl>
                  
                  <Button colorScheme="blue" alignSelf="flex-start" onClick={handleSaveSystemSettings}>
                    Сохранить настройки подключения
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Панель безопасности */}
          <TabPanel p={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card borderColor={borderColor} bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>Безопасность аккаунта</Heading>
                  
                  <VStack spacing={6} align="stretch">
                    <FormControl>
                      <FormLabel>Текущий пароль</FormLabel>
                      <Input type="password" placeholder="••••••••••••" />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Новый пароль</FormLabel>
                      <Input type="password" placeholder="••••••••••••" />
                      <FormHelperText>Минимум 8 символов, включая цифры и специальные символы</FormHelperText>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Подтверждение пароля</FormLabel>
                      <Input type="password" placeholder="••••••••••••" />
                    </FormControl>
                    
                    <Button colorScheme="blue">Изменить пароль</Button>
                    
                    <Divider />
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="2fa-toggle" mb="0">
                        Двухфакторная аутентификация
                      </FormLabel>
                      <Switch
                        id="2fa-toggle"
                        colorScheme="blue"
                        defaultChecked={false}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card borderColor={borderColor} bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>Журнал активности</Heading>
                  
                  <VStack spacing={4} align="stretch">
                    <HStack borderBottomWidth="1px" borderBottomColor={borderColor} pb={2}>
                      <HistoryIcon />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Авторизация в системе</Text>
                        <Text fontSize="sm" color="gray.500">Сегодня, 10:45</Text>
                      </VStack>
                      <Badge ml="auto" colorScheme="green">Успешно</Badge>
                    </HStack>
                    
                    <HStack borderBottomWidth="1px" borderBottomColor={borderColor} pb={2}>
                      <HistoryIcon />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Изменение настроек профиля</Text>
                        <Text fontSize="sm" color="gray.500">Вчера, 14:23</Text>
                      </VStack>
                      <Badge ml="auto" colorScheme="blue">Изменение</Badge>
                    </HStack>
                    
                    <HStack borderBottomWidth="1px" borderBottomColor={borderColor} pb={2}>
                      <HistoryIcon />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Неудачная попытка входа</Text>
                        <Text fontSize="sm" color="gray.500">23.04.2023, 09:12</Text>
                      </VStack>
                      <Badge ml="auto" colorScheme="red">Ошибка</Badge>
                    </HStack>
                    
                    <Button variant="outline" size="sm" alignSelf="flex-end">
                      Показать все
                    </Button>
                    
                    <Divider />
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="activity-log-toggle" mb="0">
                        Ведение журнала активности
                      </FormLabel>
                      <Switch
                        id="activity-log-toggle"
                        colorScheme="blue"
                        defaultChecked
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default SettingsPage;