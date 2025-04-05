// src/components/analytics/BarChart.tsx
import React from 'react';
import {
  Box,
  useColorModeValue,
  Flex,
  Text,
  VStack,
  Badge,
  Tooltip
} from '@chakra-ui/react';

// Данные для графика
export interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  title: string;
  description?: string;
  height?: number | string;
  valuePrefix?: string;
  valueSuffix?: string;
  defaultColor?: string;
  showLabels?: boolean;
  showValues?: boolean;
  showTotal?: boolean;
  minValue?: number;
  maxValue?: number;
  horizontal?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  description,
  height = 200,
  valuePrefix = '',
  valueSuffix = '',
  defaultColor = 'blue.500',
  showLabels = true,
  showValues = true,
  showTotal = true,
  minValue,
  maxValue,
  horizontal = false
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  
  // Определяем минимальное и максимальное значение из данных
  const min = minValue !== undefined 
    ? minValue 
    : 0; // Обычно для столбчатых диаграмм минимум 0
  
  const max = maxValue !== undefined 
    ? maxValue 
    : Math.max(...data.map(d => d.value));
  
  // Вычисляем итоговую сумму
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Функция для получения размера столбца (в процентах)
  const getBarSize = (value: number) => {
    if (max === min) return 0; // Избегаем деления на ноль
    return ((value - min) / (max - min)) * 100;
  };
  
  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      p={4}
      boxShadow="sm"
      width="100%"
    >
      <Flex justifyContent="space-between" alignItems="baseline" mb={2}>
        <VStack align="start" spacing={0}>
          <Text fontWeight="medium" fontSize="md">{title}</Text>
          {description && (
            <Text fontSize="xs" color={labelColor}>{description}</Text>
          )}
        </VStack>
        {showTotal && (
          <Flex alignItems="center">
            <Text fontWeight="bold" fontSize="lg">
              {valuePrefix}{total.toLocaleString()}{valueSuffix}
            </Text>
            <Badge ml={2} colorScheme="blue" borderRadius="full" px={2}>
              Всего
            </Badge>
          </Flex>
        )}
      </Flex>
      
      <Box 
        height={height} 
        mt={4}
        position="relative"
      >
        {horizontal ? (
          // Горизонтальный бар-чарт
          <VStack spacing={3} alignItems="stretch" height="100%">
            {data.map((item, index) => (
              <Flex key={index} alignItems="center" height={`${100 / data.length}%`}>
                {showLabels && (
                  <Text 
                    width="20%" 
                    textAlign="right" 
                    pr={2} 
                    fontSize="xs" 
                    color={labelColor}
                    isTruncated
                  >
                    {item.label}
                  </Text>
                )}
                <Box width="70%" position="relative">
                  <Tooltip 
                    label={`${item.label}: ${valuePrefix}${item.value.toLocaleString()}${valueSuffix}`} 
                    placement="top"
                    hasArrow
                  >
                    <Box
                      height="70%"
                      width={`${getBarSize(item.value)}%`}
                      bg={item.color || defaultColor}
                      borderRadius="sm"
                      transition="width 0.3s ease"
                      _hover={{ opacity: 0.8 }}
                    />
                  </Tooltip>
                </Box>
                {showValues && (
                  <Text 
                    width="10%" 
                    pl={2} 
                    fontSize="xs" 
                    fontWeight="medium"
                  >
                    {valuePrefix}{item.value.toLocaleString()}{valueSuffix}
                  </Text>
                )}
              </Flex>
            ))}
          </VStack>
        ) : (
          // Вертикальный бар-чарт
          <Flex 
            height="100%" 
            alignItems="flex-end" 
            justifyContent="space-between"
            position="relative"
          >
            {/* Линии сетки (горизонтальные) */}
            {[0, 25, 50, 75, 100].map(percent => (
              <Box
                key={percent}
                position="absolute"
                bottom={`${percent}%`}
                left={0}
                right={0}
                height="1px"
                bg={borderColor}
                opacity={percent === 0 ? 0 : 0.5}
              />
            ))}
            
            {data.map((item, index) => (
              <VStack key={index} spacing={1} width={`${90 / data.length}%`}>
                <Tooltip 
                  label={`${item.label}: ${valuePrefix}${item.value.toLocaleString()}${valueSuffix}`} 
                  placement="top"
                  hasArrow
                >
                  <Box
                    width="100%"
                    height={`${getBarSize(item.value)}%`}
                    bg={item.color || defaultColor}
                    borderRadius="sm"
                    transition="height 0.3s ease"
                    _hover={{ opacity: 0.8 }}
                    cursor="pointer"
                  />
                </Tooltip>
                {showLabels && (
                  <Text 
                    fontSize="xs" 
                    color={labelColor}
                    textAlign="center"
                    isTruncated
                  >
                    {item.label}
                  </Text>
                )}
                {showValues && (
                  <Text 
                    fontSize="xs" 
                    fontWeight="medium"
                    position="absolute"
                    bottom={`${getBarSize(item.value) + 2}%`}
                    transform="translateY(-100%)"
                  >
                    {item.value}
                  </Text>
                )}
              </VStack>
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default BarChart;