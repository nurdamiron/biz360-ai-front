// src/components/analytics/PieChart.tsx
import React, { useState } from 'react';
import {
  Box,
  useTheme,
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Badge,
  alpha,
  Tooltip,
  Paper
} from '@mui/material';

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
  const theme = useTheme();
  
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
      fill={theme.palette.background.paper}
    />
  ) : null;
  
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {valuePrefix}{total.toLocaleString()}{valueSuffix}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: showLegend ? 'row' : 'column' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2
          }}
        >
          {/* Диаграмма */}
          <Box 
            sx={{ 
              position: 'relative', 
              width: typeof size === 'number' ? `${size}px` : size,
              height: typeof size === 'number' ? `${size}px` : size,
              flexShrink: 0
            }}
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
                  stroke={theme.palette.background.paper}
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
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  pointerEvents: 'none'
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {segments[activeIndex].percentage.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center" noWrap sx={{ maxWidth: '80%' }}>
                  {segments[activeIndex].label}
                </Typography>
              </Box>
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
            <List sx={{ width: '100%', maxWidth: { xs: '100%', md: '60%' } }}>
              {segments.map((segment, index) => (
                <Tooltip 
                  key={index}
                  title={`${segment.label}: ${segment.value.toLocaleString()} (${segment.percentage.toFixed(1)}%)`}
                  arrow
                >
                  <ListItem 
                    sx={{ 
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.action.hover, 0.1)
                      },
                      ...(activeIndex === index && {
                        bgcolor: alpha(theme.palette.action.selected, 0.2)
                      })
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'inline-block', 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%',
                        bgcolor: segment.color,
                        mr: 1.5
                      }} 
                    />
                    <ListItemText 
                      primary={segment.label} 
                      primaryTypographyProps={{
                        variant: 'body2',
                        noWrap: true,
                        fontWeight: activeIndex === index ? 'medium' : 'normal'
                      }}
                    />
                    <Chip 
                      label={`${segment.percentage.toFixed(1)}%`} 
                      size="small"
                      variant={activeIndex === index ? "filled" : "outlined"}
                      color={activeIndex === index ? "primary" : "default"}
                      sx={{ mr: 1, minWidth: 45 }}
                    />
                    <Typography variant="body2" component="span" fontWeight="medium" sx={{ minWidth: 50, textAlign: 'right' }}>
                      {valuePrefix}{segment.value.toLocaleString()}{valueSuffix}
                    </Typography>
                  </ListItem>
                </Tooltip>
              ))}
            </List>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PieChart;