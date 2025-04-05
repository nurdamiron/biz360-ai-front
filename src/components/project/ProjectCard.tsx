// src/components/project/ProjectCard.tsx
import React from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  Flex,
  HStack,
  VStack,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Button,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../store/slices/projectsSlice';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const ViewIcon = () => <span>👁️</span>;
const MoreIcon = () => <span>⋮</span>;
const EditIcon = () => <span>✏️</span>;
const DeleteIcon = () => <span>🗑️</span>;

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
  
  // Цвета
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Расчет процента выполнения задач
  const completionPercentage = 
    project.tasksCount > 0 
    ? Math.round((project.completedTasks / project.tasksCount) * 100) 
    : 0;
  
  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'orange';
      case 'archived':
        return 'gray';
      default:
        return 'blue';
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
  
  // Обработчики действий
  const handleView = () => {
    if (onView) {
      onView(project.id);
    } else {
      navigate(`/projects/${project.id}`);
    }
  };
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(project.id);
    }
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(project.id);
    }
  };
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      bg={cardBg}
      boxShadow="sm"
      p={4}
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
      width="100%"
    >
      <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
        <VStack align="flex-start" spacing={1}>
          <Heading size="md">{project.name}</Heading>
          <Badge colorScheme={getStatusColor(project.status)}>
            {getStatusText(project.status)}
          </Badge>
        </VStack>
        
        <HStack>
          <IconButton
            aria-label="View project"
            icon={<ViewIcon />}
            size="sm"
            variant="ghost"
            onClick={handleView}
          />
          
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<MoreIcon />}
              variant="ghost"
              size="sm"
            />
            <MenuList>
              <MenuItem icon={<ViewIcon />} onClick={handleView}>
                Открыть проект
              </MenuItem>
              <MenuItem icon={<EditIcon />} onClick={handleEdit}>
                Редактировать
              </MenuItem>
              <MenuItem icon={<DeleteIcon />} onClick={handleDelete} color="red.500">
                Удалить
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      <Text fontSize="sm" noOfLines={2} mb={4} color="gray.600">
        {project.description}
      </Text>
      
      <Divider mb={4} />
      
      <VStack spacing={4} align="stretch">
        <HStack spacing={4} justify="space-between">
          <Stat size="sm">
            <StatLabel fontSize="xs">Всего задач</StatLabel>
            <StatNumber fontSize="md">{project.tasksCount}</StatNumber>
          </Stat>
          
          <Stat size="sm">
            <StatLabel fontSize="xs">Активные</StatLabel>
            <StatNumber fontSize="md">{project.activeTasks}</StatNumber>
          </Stat>
          
          <Stat size="sm">
            <StatLabel fontSize="xs">Завершенные</StatLabel>
            <StatNumber fontSize="md">{project.completedTasks}</StatNumber>
          </Stat>
        </HStack>
        
        <Box>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="sm">Прогресс</Text>
            <Text fontSize="sm">{completionPercentage}%</Text>
          </Flex>
          <Progress
            value={completionPercentage}
            size="sm"
            borderRadius="full"
            colorScheme={completionPercentage < 30 ? 'red' : completionPercentage < 70 ? 'yellow' : 'green'}
          />
        </Box>
        
        {project.codeStats && (
          <HStack fontSize="xs" color="gray.500" justify="space-between">
            <Text>{project.codeStats.totalFiles} файлов</Text>
            <Text>{project.codeStats.totalLines} строк кода</Text>
            <HStack>
              {project.codeStats.languages.slice(0, 3).map((lang, index) => (
                <Badge key={index} variant="outline" colorScheme="blue" fontSize="xs">
                  {lang.name} {lang.percentage}%
                </Badge>
              ))}
            </HStack>
          </HStack>
        )}
      </VStack>
      
      <Flex justifyContent="space-between" mt={4}>
        <Text fontSize="xs" color="gray.500">
          Создан: {new Date(project.createdAt).toLocaleDateString()}
        </Text>
        
        <Button size="sm" variant="outline" colorScheme="blue" onClick={handleView}>
          Подробнее
        </Button>
      </Flex>
    </Box>
  );
};

export default ProjectCard;