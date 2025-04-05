// src/components/analytics/LineChart.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  alpha,
  Divider,
  Tooltip,
  Paper
} from '@mui/material';

// Интерфейс для точки данных
export interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface LineChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  height?: number;
  color?: string;
  showLabels?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  showGrid?: boolean;
  showArea?: boolean;
  smoothing?: boolean;
  animation?: boolean;
  compareData?: DataPoint[];
  compareColor?: string;
  compareLabel?: string;
  mainLabel?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  description,
  data,
  height = 300,
  color,
  showLabels = true,
  valuePrefix = '',
  valueSuffix = '',
  showGrid = true,
  showArea = true,
  smoothing = true,
  animation = true,
  compareData,
  compareColor,
  compareLabel = 'Сравнение',
  mainLabel = 'Основные данные'
}) => {
  const theme = useTheme();
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  
  // Используем цвет из темы, если не указан
  const lineColor = color || theme.palette.primary.main;
  const secondLineColor = compareColor || theme.palette.secondary.main;
  
  // Определяем все наборы данных для обработки
  const dataSets = compareData ? [data, compareData] : [data];
  const colors = [lineColor, secondLineColor];
  const labels = [mainLabel, compareLabel];
  
  // Находим минимальное и максимальное значение для масштабирования
  const allValues = dataSets.flatMap(set => set.map(point => point.value));
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  
  // Padding для графика
  const paddingY = 30;
  const paddingX = 40;
  
  // Вычисляем размеры графика
  const chartWidth = 1000;
  const chartHeight = height - paddingY * 2;
  
  // Функция для преобразования значения Y в координату
  const getYCoordinate = (value: number): number => {
    // Если все значения одинаковые, размещаем в центре графика
    if (minValue === maxValue) {
      return chartHeight / 2;
    }
    
    // Нормализуем значение и преобразуем в координату (инвертируем, т.к. в SVG начало координат в верхнем левом углу)
    return chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
  };
  
  // Функция для преобразования индекса точки в координату X
  const getXCoordinate = (index: number, totalPoints: number): number => {
    // Если всего одна точка, размещаем в центре графика
    if (totalPoints === 1) {
      return chartWidth / 2;
    }
    
    // Равномерно распределяем точки по ширине графика
    return (index / (totalPoints - 1)) * chartWidth;
  };
  
  // Создаем точки для линий
  const pointSets = dataSets.map(dataSet => 
    dataSet.map((point, index) => ({
      x: getXCoordinate(index, dataSet.length),
      y: getYCoordinate(point.value),
      data: point,
      index
    }))
  );
  
  // Создаем строку для path элемента
  const createLinePath = (points: { x: number; y: number; data: DataPoint; index: number }[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      const point = points[0];
      return `M ${point.x},${point.y} L ${point.x},${point.y}`;
    }
    
    // Линия соединяет все точки
    if (!smoothing) {
      return points.map((point, i) => {
        return i === 0 ? `M ${point.x},${point.y}` : `L ${point.x},${point.y}`;
      }).join(' ');
    }
    
    // Сглаженная кривая (используем кривые Безье)
    return points.map((point, i) => {
      if (i === 0) {
        return `M ${point.x},${point.y}`;
      }
      
      const prev = points[i - 1];
      const controlPointX1 = prev.x + (point.x - prev.x) / 3;
      const controlPointX2 = prev.x + 2 * (point.x - prev.x) / 3;
      
      return `C ${controlPointX1},${prev.y} ${controlPointX2},${point.y} ${point.x},${point.y}`;
    }).join(' ');
  };
  
  // Создаем строку для path элемента для области под линией
  const createAreaPath = (points: { x: number; y: number; data: DataPoint; index: number }[]): string => {
    if (points.length === 0) return '';
    
    const linePath = createLinePath(points);
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    
    return `${linePath} L ${lastPoint.x},${chartHeight} L ${firstPoint.x},${chartHeight} Z`;
  };
  
  // Создаем линии сетки для оси Y
  const createYGridLines = () => {
    const lines = [];
    const numLines = 5;
    
    for (let i = 0; i <= numLines; i++) {
      const y = (i / numLines) * chartHeight;
      const value = maxValue - (i / numLines) * (maxValue - minValue);
      
      lines.push(
        <g key={`grid-y-${i}`}>
          {showGrid && (
            <line
              x1={0}
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke={theme.palette.divider}
              strokeWidth={1}
              strokeDasharray={i === numLines ? "0" : "4"}
            />
          )}
          
          {showLabels && (
            <text
              x={-10}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={12}
              fill={theme.palette.text.secondary}
              style={{ fontFamily: theme.typography.fontFamily }}
            >
              {valuePrefix}{Math.round(value)}{valueSuffix}
            </text>
          )}
        </g>
      );
    }
    
    return lines;
  };
  
  // Создаем метки для оси X
  const createXLabels = () => {
    if (!showLabels || data.length === 0) return null;
    
    // Если данных слишком много, показываем не все метки
    const step = data.length > 12 ? Math.ceil(data.length / 12) : 1;
    
    return data.map((point, i) => {
      // Пропускаем точки, чтобы избежать перекрытия меток
      if (i % step !== 0 && i !== data.length - 1) return null;
      
      const x = getXCoordinate(i, data.length);
      const label = point.label || new Date(point.date).toLocaleDateString();
      
      return (
        <text
          key={`label-x-${i}`}
          x={x}
          y={chartHeight + 20}
          textAnchor="middle"
          fontSize={12}
          fill={theme.palette.text.secondary}
          style={{ 
            fontFamily: theme.typography.fontFamily,
            transform: label.length > 8 ? `rotate(-45deg) translateX(-20px)` : 'none',
            transformOrigin: `${x}px ${chartHeight + 20}px`
          }}
        >
          {label}
        </text>
      );
    });
  };
  
  // Создаем точки на линиях (и обработчики для показа тултипов)
  const createDataPoints = (points: { x: number; y: number; data: DataPoint; index: number }[], setIndex: number) => {
    return points.map((point, i) => (
      <g 
        key={`point-${setIndex}-${i}`}
        onMouseEnter={() => setActivePointIndex(i)}
        onMouseLeave={() => setActivePointIndex(null)}
      >
        <circle
          cx={point.x}
          cy={point.y}
          r={activePointIndex === i ? 6 : 4}
          fill={theme.palette.background.paper}
          stroke={colors[setIndex]}
          strokeWidth={2}
          style={{ 
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        />
        
        {activePointIndex === i && (
          <g>
            {/* Вертикальная линия от точки до оси X */}
            <line
              x1={point.x}
              y1={point.y}
              x2={point.x}
              y2={chartHeight}
              stroke={theme.palette.divider}
              strokeWidth={1}
              strokeDasharray="3"
            />
            
            {/* Горизонтальная линия от точки до оси Y */}
            <line
              x1={0}
              y1={point.y}
              x2={point.x}
              y2={point.y}
              stroke={theme.palette.divider}
              strokeWidth={1}
              strokeDasharray="3"
            />
            
            {/* Значение на оси Y */}
            <rect
              x={-50}
              y={point.y - 10}
              width={40}
              height={20}
              rx={4}
              ry={4}
              fill={alpha(colors[setIndex], 0.1)}
              stroke={colors[setIndex]}
              strokeWidth={1}
            />
            <text
              x={-30}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fill={theme.palette.text.primary}
              style={{ fontFamily: theme.typography.fontFamily }}
            >
              {valuePrefix}{point.data.value}{valueSuffix}
            </text>
            
            {/* Метка на оси X */}
            <rect
              x={point.x - 30}
              y={chartHeight + 5}
              width={60}
              height={20}
              rx={4}
              ry={4}
              fill={alpha(colors[setIndex], 0.1)}
              stroke={colors[setIndex]}
              strokeWidth={1}
            />
            <text
              x={point.x}
              y={chartHeight + 15}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fill={theme.palette.text.primary}
              style={{ fontFamily: theme.typography.fontFamily }}
            >
              {point.data.label || new Date(point.data.date).toLocaleDateString()}
            </text>
          </g>
        )}
      </g>
    ));
  };
  
  // Создаем легенду если есть сравнительные данные
  const createLegend = () => {
    if (!compareData) return null;
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 3, 
          mt: 2, 
          pb: 1 
        }}
      >
        {colors.map((color, index) => (
          <Box 
            key={`legend-${index}`} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box 
              sx={{ 
                width: 16, 
                height: 16, 
                borderRadius: '50%', 
                bgcolor: color
              }} 
            />
            <Typography variant="body2">
              {labels[index]}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };
  
  return (
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
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
          
          {data.length > 0 && (
            <Paper 
              elevation={0} 
              sx={{ 
                px: 2, 
                py: 0.5, 
                bgcolor: alpha(lineColor, 0.1),
                borderRadius: 10,
                border: `1px solid ${alpha(lineColor, 0.2)}`
              }}
            >
              <Typography variant="body2" fontWeight="medium" color="text.secondary">
                Сейчас: {valuePrefix}{data[data.length - 1].value}{valueSuffix}
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
            overflow: 'hidden'
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`-${paddingX} 0 ${chartWidth + paddingX * 2} ${chartHeight + paddingY * 2}`}
            preserveAspectRatio="none"
          >
            {/* Сетка и метки оси Y */}
            {createYGridLines()}
            
            {/* Отрисовка для всех наборов данных */}
            {pointSets.map((points, setIndex) => (
              <g key={`dataset-${setIndex}`}>
                {/* Область под линией */}
                {showArea && points.length > 0 && (
                  <path
                    d={createAreaPath(points)}
                    fill={alpha(colors[setIndex], 0.1)}
                    stroke="none"
                    style={{
                      animation: animation ? `fadeIn 1s ease-in-out` : 'none',
                      '@keyframes fadeIn': {
                        from: { opacity: 0 },
                        to: { opacity: 1 }
                      }
                    }}
                  />
                )}
                
                {/* Линия графика */}
                <path
                  d={createLinePath(points)}
                  fill="none"
                  stroke={colors[setIndex]}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: animation ? `${chartWidth * 2}` : '0',
                    strokeDashoffset: animation ? `${chartWidth * 2}` : '0',
                    animation: animation ? `drawLine 1.5s ease-in-out forwards` : 'none',
                    '@keyframes drawLine': {
                      to: { strokeDashoffset: '0' }
                    }
                  }}
                />
                
                {/* Точки данных */}
                {createDataPoints(points, setIndex)}
              </g>
            ))}
            
            {/* Метки оси X */}
            {createXLabels()}
          </svg>
        </Box>
        
        {/* Легенда */}
        {createLegend()}
      </CardContent>
    </Card>
  );
};

export default LineChart;