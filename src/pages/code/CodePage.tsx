// src/pages/code/CodePage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  HStack,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  List,
  ListItem,
  Divider
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTasks } from '../../store/slices/tasksSlice';
import { fetchProjects } from '../../store/slices/projectsSlice';
import CodeEditorPanel from '../../components/code/CodeEditorPanel';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const SearchIcon = () => <span>🔍</span>;
const FilterIcon = () => <span>🔎</span>;
const RefreshIcon = () => <span>🔄</span>;
const ViewIcon = () => <span>👁️</span>;
const CheckIcon = () => <span>✅</span>;
const XIcon = () => <span>❌</span>;
const FolderIcon = () => <span>📁</span>;
const FileIcon = () => <span>📄</span>;

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

const CodePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Состояния и модальные окна
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [activeGeneration, setActiveGeneration] = useState<CodeGeneration | null>(null);
  
  const { isOpen: isFileViewOpen, onOpen: onFileViewOpen, onClose: onFileViewClose } = useDisclosure();
  const { isOpen: isGenerationViewOpen, onOpen: onGenerationViewOpen, onClose: onGenerationViewClose } = useDisclosure();
  
  // Получаем данные из Redux
  const { tasks, isLoading: isTasksLoading } = useAppSelector(state => state.tasks);
  const { projects, isLoading: isProjectsLoading } = useAppSelector(state => state.projects);
  
  // Цвета
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
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
      <Box key={file.id}>
        <Box
          pl={depth * 4}
          py={2}
          px={3}
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: hoverBgColor }}
          onClick={() => handleFileClick(file)}
          display="flex"
          alignItems="center"
        >
          {file.isDirectory ? <FolderIcon /> : <FileIcon />}
          <Text ml={2}>{file.name}{file.extension ? `.${file.extension}` : ''}</Text>
        </Box>
        {file.isDirectory && file.children && renderFileTree(file.children, depth + 1)}
      </Box>
    ));
  };
  
  // Обработчик клика по файлу
  const handleFileClick = (file: CodeFile) => {
    if (!file.isDirectory) {
      setSelectedFile(file);
      onFileViewOpen();
    }
  };
  
  // Обработчик клика по сгенерированному коду
  const handleGenerationClick = (generation: CodeGeneration) => {
    setActiveGeneration(generation);
    onGenerationViewOpen();
  };
  
  // Обработчик изменения проекта
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProject(e.target.value);
  };
  
  // Обработчик изменения статуса
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <VStack align="flex-start" spacing={1}>
          <Heading size="lg">Управление кодом</Heading>
          <Text color="gray.500">
            Просмотр, анализ и утверждение сгенерированного кода
          </Text>
        </VStack>
        
        <HStack spacing={2}>
          <Button 
            leftIcon={<RefreshIcon />} 
            variant="outline" 
            onClick={() => {
              dispatch(fetchTasks());
              dispatch(fetchProjects());
            }}
            isLoading={isTasksLoading || isProjectsLoading}
          >
            Обновить
          </Button>
        </HStack>
      </Flex>
      
      <Card borderColor={borderColor} boxShadow="sm" mb={6}>
        <CardBody>
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align={{ base: 'stretch', md: 'center' }}
            gap={4}
          >
            <InputGroup maxW={{ base: '100%', md: '400px' }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon />
              </InputLeftElement>
              <Input 
                placeholder="Поиск кода..." 
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
            
            <HStack spacing={2}>
              <Select 
                placeholder="Все проекты" 
                value={selectedProject}
                onChange={handleProjectChange}
                width="auto"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
              
              <Select 
                placeholder="Все статусы" 
                value={selectedStatus}
                onChange={handleStatusChange}
                width="auto"
              >
                <option value="pending">Ожидает проверки</option>
                <option value="approved">Утверждено</option>
                <option value="rejected">Отклонено</option>
              </Select>
              
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleResetFilters}
              >
                Сбросить
              </Button>
            </HStack>
          </Flex>
        </CardBody>
      </Card>
      
      <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={6}>
        <GridItem>
          <Card borderColor={borderColor} boxShadow="sm" h="100%">
            <CardBody p={0}>
              <Heading size="md" p={4} borderBottomWidth="1px" borderBottomColor={borderColor}>
                Файловая структура
              </Heading>
              <Box maxH="600px" overflowY="auto" p={2}>
                {renderFileTree(fileStructure)}
              </Box>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card borderColor={borderColor} boxShadow="sm">
            <CardBody p={0}>
              <Heading size="md" p={4} borderBottomWidth="1px" borderBottomColor={borderColor}>
                Сгенерированный код
              </Heading>
              
              {isTasksLoading ? (
                <Flex justify="center" align="center" p={10}>
                  <Spinner size="xl" />
                </Flex>
              ) : filteredGenerations.length > 0 ? (
                <Box maxH="600px" overflowY="auto">
                  <Table variant="simple">
                    <Thead position="sticky" top={0} bg={useColorModeValue('white', 'gray.800')} zIndex={1}>
                      <Tr>
                        <Th>Путь к файлу</Th>
                        <Th>Задача</Th>
                        <Th>Статус</Th>
                        <Th>Дата</Th>
                        <Th>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredGenerations.map(generation => {
                        const task = tasks.find(t => t.id === generation.taskId);
                        return (
                          <Tr 
                            key={generation.id} 
                            _hover={{ bg: hoverBgColor }}
                            cursor="pointer"
                            onClick={() => handleGenerationClick(generation)}
                          >
                            <Td>
                              <HStack>
                                <FileIcon />
                                <Text>{generation.filePath}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              {task ? (
                                <VStack align="start" spacing={0}>
                                  <Text>{task.title}</Text>
                                  <Text fontSize="xs" color="gray.500">#{task.id}</Text>
                                </VStack>
                              ) : (
                                <Text>Задача не найдена</Text>
                              )}
                            </Td>
                            <Td>
                              <Badge 
                                colorScheme={
                                  generation.status === 'approved' ? 'green' : 
                                  generation.status === 'rejected' ? 'red' : 
                                  'blue'
                                }
                              >
                                {
                                  generation.status === 'approved' ? 'Утверждено' : 
                                  generation.status === 'rejected' ? 'Отклонено' : 
                                  'Ожидает проверки'
                                }
                              </Badge>
                            </Td>
                            <Td>{new Date(generation.createdAt).toLocaleDateString()}</Td>
                            <Td>
                              <IconButton
                                aria-label="View code"
                                icon={<ViewIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerationClick(generation);
                                }}
                              />
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Box p={10} textAlign="center">
                  <Text fontSize="lg" color="gray.500">
                    Сгенерированный код не найден
                  </Text>
                  <Text color="gray.500" mt={2}>
                    Попробуйте изменить параметры фильтрации или создать новые задачи
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      {/* Модальное окно просмотра файла */}
      <Modal isOpen={isFileViewOpen} onClose={onFileViewClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxW="90vw" h="80vh">
          <ModalHeader>
            {selectedFile && (
              <HStack>
                <FileIcon />
                <Text>{selectedFile.path}</Text>
              </HStack>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedFile && (
              <Box
                fontFamily="mono"
                fontSize="sm"
                whiteSpace="pre-wrap"
                p={4}
                bg={useColorModeValue('gray.50', 'gray.800')}
                borderRadius="md"
                overflowX="auto"
                h="100%"
              >
                {selectedFile.content}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Text fontSize="sm" color="gray.500" mr="auto">
              {selectedFile && `Последнее изменение: ${new Date(selectedFile.lastModified).toLocaleString()}`}
            </Text>
            <Button variant="ghost" mr={3} onClick={onFileViewClose}>
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Модальное окно просмотра сгенерированного кода */}
      <Modal isOpen={isGenerationViewOpen} onClose={onGenerationViewClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxW="90vw" h="80vh">
          <ModalHeader>
            {activeGeneration && (
              <VStack align="start" spacing={0}>
                <HStack>
                  <FileIcon />
                  <Text>{activeGeneration.filePath}</Text>
                </HStack>
                <HStack mt={1}>
                  <Badge 
                    colorScheme={
                      activeGeneration.status === 'approved' ? 'green' : 
                      activeGeneration.status === 'rejected' ? 'red' : 
                      'blue'
                    }
                  >
                    {
                      activeGeneration.status === 'approved' ? 'Утверждено' : 
                      activeGeneration.status === 'rejected' ? 'Отклонено' : 
                      'Ожидает проверки'
                    }
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    Создано: {new Date(activeGeneration.createdAt).toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {activeGeneration && (
              <CodeEditorPanel
                codeGeneration={activeGeneration}
                onRegenerate={() => {
                  toast({
                    title: 'Запрос на регенерацию отправлен',
                    description: 'ИИ-ассистент создаст новую версию кода',
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                  });
                }}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onGenerationViewClose}>
              Закрыть
            </Button>
            {activeGeneration && activeGeneration.status === 'pending' && (
              <>
                <Button colorScheme="green" leftIcon={<CheckIcon />} mr={3}>
                  Утвердить
                </Button>
                <Button colorScheme="red" leftIcon={<XIcon />}>
                  Отклонить
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CodePage;