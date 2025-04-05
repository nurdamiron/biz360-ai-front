import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  alpha
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
  smoothing = true
}) => {
  const theme = useTheme();
  
  // Используем цвет из темы, если не указан
  const lineColor = color || theme.palette.primary.main;
  
  // Находим минимальное и максимальное значение для масштабирования
  const values = data.map(point => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
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
  const getXCoordinate = (index: number): number => {
    // Если всего одна точка, размещаем в центре графика
    if (data.length === 1) {
      return chartWidth / 2;
    }
    
    // Равномерно распределяем точки по ширине графика
    return (index / (data.length - 1)) * chartWidth;
  };
  
  // Создаем точки для линии
  const points = data.map((point, index) => ({
    x: getXCoordinate(index),
    y: getYCoordinate(point.value),
    data: point
  }));
  
  // Создаем строку для path элемента
  const createLinePath = (): string => {
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
  const createAreaPath = (): string => {
    if (points.length === 0) return '';
    
    const linePath = createLinePath();
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
    if (!showLabels) return null;
    
    // Если данных слишком много, показываем не все метки
    const step = data.length > 12 ? Math.ceil(data.length / 12) : 1;
    
    return points.map((point, i) => {
      // Пропускаем точки, чтобы избежать перекрытия меток
      if (i % step !== 0 && i !== points.length - 1) return null;
      
      const label = point.data.label || new Date(point.data.date).toLocaleDateString();
      
      return (
        <text
          key={`label-x-${i}`}
          x={point.x}
          y={chartHeight + 20}
          textAnchor="middle"
          fontSize={12}
          fill={theme.palette.text.secondary}
        >
          {label}
        </text>
      );
    });
  };
  
  // Создаем точки на линии
  const createDataPoints = () => {
    return points.map((point, i) => (
      <circle
        key={`point-${i}`}
        cx={point.x}
        cy={point.y}
        r={4}
        fill={theme.palette.background.paper}
        stroke={lineColor}
        strokeWidth={2}
      />
    ));
  };
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        
        {description && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {description}
          </Typography>
        )}
        
        <Box 
          sx={{ 
            height: height, 
            width: '100%', 
            position: 'relative', 
            mt: 2,
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
            
            {/* Основная группа для графика */}
            <g transform={`translate(0, 0)`}>
              {/* Область под линией */}
              {showArea && points.length > 0 && (
                <path
                  d={createAreaPath()}
                  fill={alpha(lineColor, 0.1)}
                  stroke="none"
                />
              )}
              
              {/* Линия графика */}
              <path
                d={createLinePath()}
                fill="none"
                stroke={lineColor}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Точки данных */}
              {createDataPoints()}
            </g>
            
            {/* Метки оси X */}
            {createXLabels()}
          </svg>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LineChart;