// src/components/code/CodeEditorPanel.tsx
import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Textarea,
  useColorModeValue,
  VStack,
  HStack,
  Divider,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import { CodeGeneration } from '../../types/task.types';
import { useAppDispatch } from '../../hooks/redux';
import { reviewCode } from '../../store/slices/tasksSlice';

// Иконки (доступны через react-icons)
// В этом шаблоне используем условные имена, которые нужно заменить на реальные импорты
const CheckIcon = () => <span>✅</span>;
const XIcon = () => <span>❌</span>;
const RefreshIcon = () => <span>🔄</span>;
const CommentIcon = () => <span>💬</span>;

interface CodeEditorPanelProps {
  codeGeneration: CodeGeneration;
  onRegenerate?: () => void;
}

const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({ 
  codeGeneration,
  onRegenerate 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dispatch = useAppDispatch();
  const toast = useToast();
  
  // Цвета
  const codeBg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const diffAddedBg = useColorModeValue('green.50', 'green.900');
  const diffRemovedBg = useColorModeValue('red.50', 'red.900');
  
  // Получаем статус генерации
  const getStatusBadge = () => {
    const statusMap = {
      'pending': { color: 'blue', text: 'Ожидает проверки' },
      'approved': { color: 'green', text: 'Одобрено' },
      'rejected': { color: 'red', text: 'Отклонено' },
    };
    
    const { color, text } = statusMap[codeGeneration.status] || 
      { color: 'gray', text: codeGeneration.status };
    
    return (
      <Badge colorScheme={color} borderRadius="full" px={2}>
        {text}
      </Badge>
    );
  };
  
  // Обработчик утверждения кода
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(reviewCode({
        generationId: codeGeneration.id,
        status: 'approved',
        feedback
      })).unwrap();
      
      toast({
        title: 'Код утвержден',
        description: 'Изменения будут применены',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ошибка утверждения',
        description: error instanceof Error ? error.message : 'Произошла ошибка при утверждении кода',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Обработчик отклонения кода
  const handleReject = async () => {
    if (!feedback.trim()) {
      toast({
        title: 'Требуется обратная связь',
        description: 'Пожалуйста, укажите причину отклонения кода',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await dispatch(reviewCode({
        generationId: codeGeneration.id,
        status: 'rejected',
        feedback
      })).unwrap();
      
      toast({
        title: 'Код отклонен',
        description: 'Ваш отзыв будет учтен при следующей генерации',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ошибка отклонения',
        description: error instanceof Error ? error.message : 'Произошла ошибка при отклонении кода',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Обработчик регенерации кода
  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
    }
  };
  
  // Простая имитация diff-вида (в реальном приложении используйте библиотеку diff)
  const renderDiff = () => {
    if (!codeGeneration.originalCode) {
      return (
        <Box p={4} textAlign="center">
          <Text color="gray.500">Этот код был создан с нуля, оригинальный код отсутствует</Text>
        </Box>
      );
    }
    
    // Очень простая имитация diff (для демонстрации UI)
    // В реальном приложении используйте библиотеку diff
    return (
      <VStack spacing={1} align="stretch">
        <Box p={2} bg={diffRemovedBg} borderRadius="md">
          <Text fontFamily="mono" fontSize="sm" color="red.600">- Удаленная строка</Text>
        </Box>
        <Box p={2} bg={diffAddedBg} borderRadius="md">
          <Text fontFamily="mono" fontSize="sm" color="green.600">+ Добавленная строка</Text>
        </Box>
        <Text fontSize="sm" p={2} color="gray.500">
          (Это простая имитация, в реальном приложении будет полноценный diff)
        </Text>
      </VStack>
    );
  };
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      boxShadow="sm"
      overflow="hidden"
      width="100%"
    >
      <Flex 
        p={4} 
        justifyContent="space-between" 
        alignItems="center"
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
      >
        <VStack align="flex-start" spacing={1}>
          <Text fontWeight="bold" fontSize="md">
            {codeGeneration.filePath}
          </Text>
          <HStack>
            {getStatusBadge()}
            <Text fontSize="sm" color="gray.500">
              Создан: {new Date(codeGeneration.createdAt).toLocaleString()}
            </Text>
          </HStack>
        </VStack>
        
        <HStack spacing={2}>
          {codeGeneration.status === 'pending' && (
            <>
              <Tooltip label="Утвердить код">
                <IconButton
                  aria-label="Approve code"
                  icon={<CheckIcon />}
                  colorScheme="green"
                  size="sm"
                  onClick={handleApprove}
                  isLoading={isSubmitting}
                />
              </Tooltip>
              
              <Tooltip label="Отклонить код">
                <IconButton
                  aria-label="Reject code"
                  icon={<XIcon />}
                  colorScheme="red"
                  size="sm"
                  onClick={handleReject}
                  isLoading={isSubmitting}
                />
              </Tooltip>
            </>
          )}
          
          <Tooltip label="Создать новую версию">
            <IconButton
              aria-label="Regenerate code"
              icon={<RefreshIcon />}
              size="sm"
              onClick={handleRegenerate}
              isDisabled={isSubmitting}
            />
          </Tooltip>
        </HStack>
      </Flex>
      
      <Tabs variant="enclosed" index={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab>Сгенерированный код</Tab>
          <Tab>Оригинальный код</Tab>
          <Tab>Изменения (diff)</Tab>
          <Tab>Обратная связь</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box
              p={4}
              bg={codeBg}
              borderRadius="md"
              fontFamily="mono"
              fontSize="sm"
              whiteSpace="pre-wrap"
              overflowX="auto"
              height="400px"
            >
              {codeGeneration.generatedCode || 'Код отсутствует'}
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box
              p={4}
              bg={codeBg}
              borderRadius="md"
              fontFamily="mono"
              fontSize="sm"
              whiteSpace="pre-wrap"
              overflowX="auto"
              height="400px"
            >
              {codeGeneration.originalCode || 'Оригинальный код отсутствует'}
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box p={4} bg={codeBg} borderRadius="md" height="400px" overflowY="auto">
              {renderDiff()}
            </Box>
          </TabPanel>
          
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Textarea
                placeholder="Введите комментарии и обратную связь по коду..."
                height="340px"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                isDisabled={codeGeneration.status !== 'pending'}
              />
              
              {codeGeneration.feedback && (
                <Box p={4} bg={codeBg} borderRadius="md">
                  <Text fontWeight="bold" mb={2}>Предыдущая обратная связь:</Text>
                  <Text whiteSpace="pre-wrap">{codeGeneration.feedback}</Text>
                </Box>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CodeEditorPanel;