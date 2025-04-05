// src/components/analytics/PieChart.tsx
import React, { useState } from 'react';
import {
  Box,
  useColorModeValue,
  Flex,
  Text,
  VStack,
  HStack,
  Badge,
  List,
  ListItem,
  Circle
} from '@material-ui/react';

// Данные для графика
export interface PieData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieData[];
  title: string;
  description?: string;
  size?: number | string;
  valuePrefix?: string;
  valueSuffix?: string;
  showLegend?: boolean;
  showPercentages?: boolean;
  donut?: boolean;
  donutThickness?: number;
  colorScheme?: string[];
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  description,
  size = 200,
  valuePrefix = '',
  valueSuffix = '',
  showLegend = true,
  showPercentages = true,
  donut = false,
  donutThickness = 40,
  colorScheme = ['#3182CE', '#63B3ED', '#4FD1C5', '#F6AD55', '#FC8181', '#B794F4', '#9F7AEA', '#F687B3', '#805AD5']
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  
  // Состояние для выделенного сегмента
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Вычисляем итоговую сумму
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Вычисляем проценты и углы для сегментов
  const segments = data.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    return {
      ...item,
      percentage,
      color: item.color || colorScheme[index % colorScheme.length]
    };
  });
  
  // Сортируем сегменты по убыванию значения
  segments.sort((a, b) => b.value - a.value);
  
  // Функция для создания SVG-пути для сегмента
  const createSvgPath = (startAngle: number, endAngle: number, radius: number) => {
    const x1 = radius + radius * Math.cos(startAngle);
    const y1 = radius + radius * Math.sin(startAngle);
    const x2 = radius + radius * Math.cos(endAngle);
    const y2 = radius + radius * Math.sin(endAngle);
    
    // Флаг для определения большой дуги (больше 180 градусов)
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
    
    // Внешняя дуга
    const pathData = [
      `M ${radius},${radius}`,
      `L ${x1},${y1}`,
      `A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`,
      'Z'
    ].join(' ');
    
    return pathData;
  };
  
  // Создаем сегменты для диаграммы
  let startAngle = -Math.PI / 2; // Начинаем сверху (-90 градусов)
  const pieSegments = segments.map((segment, index) => {
    const angle = (segment.percentage / 100) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    
    const path = createSvgPath(startAngle, endAngle, 50); // Радиус 50 (SVG размером 100x100)
    
    const isActive = activeIndex === index;
    
    // После создания сегмента увеличиваем угол для следующего
    const currentStartAngle = startAngle;
    startAngle = endAngle;
    
    // Средний угол для размещения текста
    const midAngle = currentStartAngle + angle / 2;
    const textX = 50 + 35 * Math.cos(midAngle); // Меньший радиус для текста
    const textY = 50 + 35 * Math.sin(midAngle);
    
    return {
      ...segment,
      path,
      isActive,
      textPosition: { x: textX, y: textY }
    };
  });
  
  // Создаем внутренний круг для пончика (если нужно)
  const innerCircle = donut ? (
    <circle
      cx="50"
      cy="50"
      r={50 - donutThickness}
      fill={bgColor}
    />
  ) : null;
  
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
        <Flex alignItems="center">
          <Text fontWeight="bold" fontSize="lg">
            {valuePrefix}{total.toLocaleString()}{valueSuffix}
          </Text>
        </Flex>
      </Flex>
      
      <Flex 
        mt={4} 
        flexDirection={{ base: 'column', md: showLegend ? 'row' : 'column' }}
        justifyContent="center" 
        alignItems="center"
        gap={6}
      >
        {/* Диаграмма */}
        <Box 
          position="relative" 
          width={typeof size === 'number' ? `${size}px` : size}
          height={typeof size === 'number' ? `${size}px` : size}
          flexShrink={0}
        >
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {pieSegments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                stroke={bgColor}
                strokeWidth="1"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                style={{
                  transition: 'all 0.3s ease',
                  transform: segment.isActive ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: '50px 50px'
                }}
              />
            ))}
            {innerCircle}
          </svg>
          
          {/* Центральный текст для пончика */}
          {donut && activeIndex !== null && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
              pointerEvents="none"
            >
              <Text fontSize="lg" fontWeight="bold">
                {segments[activeIndex].percentage.toFixed(1)}%
              </Text>
              <Text fontSize="xs" color={labelColor} textAlign="center" noOfLines={2}>
                {segments[activeIndex].label}
              </Text>
            </Flex>
          )}
          
          {/* Метки процентов на диаграмме */}
          {showPercentages && !donut && (
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 100 100"
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
            >
              {pieSegments.filter(segment => segment.percentage > 5).map((segment, index) => (
                <text
                  key={index}
                  x={segment.textPosition.x}
                  y={segment.textPosition.y}
                  fill="white"
                  fontSize="8"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(90, ${segment.textPosition.x}, ${segment.textPosition.y})`}
                >
                  {segment.percentage.toFixed(1)}%
                </text>
              ))}
            </svg>
          )}
        </Box>
        
        {/* Легенда */}
        {showLegend && (
          <List spacing={2} maxW="100%">
            {segments.map((segment, index) => (
              <ListItem 
                key={index}
                display="flex"
                alignItems="center"
                gap={2}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                cursor="pointer"
                py={1}
                px={2}
                borderRadius="md"
                bg={activeIndex === index ? useColorModeValue('gray.100', 'gray.700') : 'transparent'}
                transition="all 0.2s"
              >
                <Circle size="12px" bg={segment.color} />
                <Text 
                  fontSize="sm" 
                  fontWeight={activeIndex === index ? 'medium' : 'normal'}
                  flex="1"
                  isTruncated
                >
                  {segment.label}
                </Text>
                <Badge 
                  colorScheme={activeIndex === index ? 'blue' : 'gray'} 
                  variant={activeIndex === index ? 'solid' : 'outline'}
                >
                  {segment.percentage.toFixed(1)}%
                </Badge>
                <Text fontSize="sm" fontWeight="medium" minW="70px" textAlign="right">
                  {valuePrefix}{segment.value.toLocaleString()}{valueSuffix}
                </Text>
              </ListItem>
            ))}
          </List>
        )}
      </Flex>
    </Box>
  );
};

export default PieChart;