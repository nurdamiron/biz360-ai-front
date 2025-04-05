// src/components/analytics/BarChart.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  alpha,
  Tooltip as MuiTooltip,
  Divider,
  Paper
} from '@mui/material';

// Интерфейс для данных диаграммы
export interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  title: string;
  description?: string;
  data: BarData[];
  height?: number;
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
  title,
  description,
  data,
  height = 300,
  valuePrefix = '',
  valueSuffix = '',
  defaultColor,
  showLabels = true,
  showValues = true,
  showTotal = false,
  minValue,
  maxValue,
  horizontal = false
}) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Используем цвет из темы, если не указан
  const barColor = defaultColor || theme.palette.primary.main;
  
  // Вычисляем общую сумму
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Определяем минимальное и максимальное значение из данных
  const min = minValue !== undefined 
    ? minValue 
    : 0; // Обычно для столбчатых диаграмм минимум 0
  
  const max = maxValue !== undefined 
    ? maxValue 
    : Math.max(...data.map(d => d.value), 0);
  
  // Отступы для диаграммы
  const padding = horizontal ? { top: 10, right: 20, bottom: 10, left: 100 } 
                            : { top: 20, right: 10, bottom: 40, left: 40 };
  
  // Вычисляем размеры диаграммы
  const chartWidth = horizontal ? 
    500 - padding.left - padding.right : 
    100 * data.length;
  
  const chartHeight = horizontal ? 
    30 * data.length : 
    height - padding.top - padding.bottom;
  
  // Вычисляем размер столбца в зависимости от ориентации
  const barSize = horizontal ? 
    chartHeight / data.length - 5 : // Горизонтальные полосы
    chartWidth / data.length - 10;  // Вертикальные столбцы
  
  // Функция для получения размера столбца (в пикселях)
  const getBarSize = (value: number) => {
    if (max === min) return 0; // Избегаем деления на ноль
    const size = ((value - min) / (max - min)) * (horizontal ? chartWidth : chartHeight);
    return Math.max(size, 0); // Убеждаемся, что размер не отрицательный
  };
  
  // Создаем столбцы/полосы для диаграммы
  const createBars = () => {
    return data.map((item, index) => {
      const isActive = activeIndex === index;
      const itemColor = item.color || barColor;
      
      // Размер столбца/полосы
      const size = getBarSize(item.value);
      
      if (horizontal) {
        // Горизонтальные полосы
        const y = index * (barSize + 5);
        return (
          <g key={index}>
            <rect
              x={0}
              y={y}
              width={size}
              height={barSize}
              fill={isActive ? alpha(itemColor, 0.8) : itemColor}
              rx={4} // Скругление углов
              ry={4}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{ 
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            />
            
            {showLabels && (
              <text
                x={-5}
                y={y + barSize / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={12}
                fill={theme.palette.text.primary}
                style={{ 
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
              >
                {item.label}
              </text>
            )}
            
            {showValues && (
              <text
                x={size + 5}
                y={y + barSize / 2}
                dominantBaseline="middle"
                fontSize={12}
                fill={theme.palette.text.primary}
                style={{ 
                  userSelect: 'none',
                  pointerEvents: 'none',
                  fontWeight: isActive ? 'bold' : 'normal' 
                }}
              >
                {valuePrefix}{item.value.toLocaleString()}{valueSuffix}
              </text>
            )}
          </g>
        );
      } else {
        // Вертикальные столбцы
        const x = index * (barSize + 10) + 5;
        return (
          <g key={index}>
            <rect
              x={x}
              y={chartHeight - size}
              width={barSize}
              height={size}
              fill={isActive ? alpha(itemColor, 0.8) : itemColor}
              rx={4} // Скругление углов
              ry={4}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{ 
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            />
            
            {showLabels && (
              <text
                x={x + barSize / 2}
                y={chartHeight + 15}
                textAnchor="middle"
                fontSize={11}
                fill={theme.palette.text.secondary}
                style={{
                  maxWidth: barSize,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  transform: item.label.length > 10 ? 'rotate(-45deg)' : 'none',
                  transformOrigin: `${x + barSize / 2}px ${chartHeight + 15}px`
                }}
              >
                {item.label.length > 10 ? item.label.substring(0, 10) + '...' : item.label}
              </text>
            )}
            
            {showValues && (
              <text
                x={x + barSize / 2}
                y={chartHeight - size - 5}
                textAnchor="middle"
                fontSize={12}
                fill={theme.palette.text.primary}
                style={{ 
                  userSelect: 'none',
                  pointerEvents: 'none',
                  fontWeight: isActive ? 'bold' : 'normal' 
                }}
              >
                {valuePrefix}{item.value.toLocaleString()}{valueSuffix}
              </text>
            )}
          </g>
        );
      }
    });
  };
  
  // Создаем линии сетки для оси Y (только для вертикальных столбцов)
  const createYGridLines = () => {
    if (horizontal) return null;
    
    const lines = [];
    const numLines = 5;
    
    for (let i = 0; i <= numLines; i++) {
      const y = chartHeight - (i / numLines) * chartHeight;
      const value = min + (i / numLines) * (max - min);
      
      lines.push(
        <g key={`grid-y-${i}`}>
          <line
            x1={0}
            y1={y}
            x2={chartWidth}
            y2={y}
            stroke={theme.palette.divider}
            strokeWidth={1}
            strokeDasharray={i === 0 ? "0" : "4"}
          />
          
          <text
            x={-5}
            y={y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={11}
            fill={theme.palette.text.secondary}
            style={{ userSelect: 'none' }}
          >
            {valuePrefix}{Math.round(value)}{valueSuffix}
          </text>
        </g>
      );
    }
    
    return lines;
  };
  
  // Создаем линии сетки для оси X (только для горизонтальных полос)
  const createXGridLines = () => {
    if (!horizontal) return null;
    
    const lines = [];
    const numLines = 5;
    
    for (let i = 0; i <= numLines; i++) {
      const x = (i / numLines) * chartWidth;
      const value = min + (i / numLines) * (max - min);
      
      lines.push(
        <g key={`grid-x-${i}`}>
          <line
            x1={x}
            y1={0}
            x2={x}
            y2={chartHeight}
            stroke={theme.palette.divider}
            strokeWidth={1}
            strokeDasharray={i === 0 ? "0" : "4"}
          />
          
          <text
            x={x}
            y={chartHeight + 15}
            textAnchor="middle"
            fontSize={11}
            fill={theme.palette.text.secondary}
            style={{ userSelect: 'none' }}
          >
            {valuePrefix}{Math.round(value)}{valueSuffix}
          </text>
        </g>
      );
    }
    
    return lines;
  };
  
  // Рассчитываем размеры и положение SVG
  const svgViewBox = horizontal 
    ? `0 0 ${chartWidth + padding.left + padding.right} ${chartHeight + padding.top + padding.bottom}`
    : `0 0 ${Math.max(chartWidth, 300)} ${chartHeight + padding.top + padding.bottom}`;
  
  return (
    <MuiTooltip
      title={activeIndex !== null ? 
        `${data[activeIndex].label}: ${valuePrefix}${data[activeIndex].value.toLocaleString()}${valueSuffix}` : 
        ''}
      placement="top"
      arrow
      open={activeIndex !== null}
    >
      <Card 
        variant="outlined" 
        sx={{ 
          height: '100%',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2
          }
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" component="div">
                {title}
              </Typography>
              
              {description && (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              )}
            </Box>
            
            {showTotal && (
              <Paper 
                elevation={0} 
                sx={{ 
                  px: 2, 
                  py: 0.5, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: 10
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {valuePrefix}{total.toLocaleString()}{valueSuffix}
                </Typography>
              </Paper>
            )}
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box 
            sx={{ 
              height, 
              width: '100%', 
              position: 'relative', 
              overflow: 'visible',
              '& text': {
                fontFamily: theme.typography.fontFamily
              }
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox={svgViewBox}
              preserveAspectRatio="xMidYMid meet"
            >
              <g transform={`translate(${padding.left}, ${padding.top})`}>
                {/* Сетка */}
                {createYGridLines()}
                {createXGridLines()}
                
                {/* Столбцы/полосы */}
                {createBars()}
              </g>
            </svg>
          </Box>
        </CardContent>
      </Card>
    </MuiTooltip>
  );
};

export default BarChart;