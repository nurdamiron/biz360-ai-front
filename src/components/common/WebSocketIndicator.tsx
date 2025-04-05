// src/components/common/WebSocketIndicator.tsx
import React from 'react';
import { Badge, Tooltip, Box, Typography } from '@mui/material';
import useWebSocket from '../../hooks/useWebSocket';
import { WebSocketState } from '../../api/services/websocket.service';

const WebSocketIndicator: React.FC = () => {
  const { state, isConnected } = useWebSocket();
  
  // Определение цвета и текста в зависимости от состояния
  const getIndicatorProps = () => {
    switch (state) {
      case WebSocketState.OPEN:
        return {
          color: 'success',
          text: 'Подключено',
          tooltipText: 'WebSocket соединение активно'
        };
      case WebSocketState.CONNECTING:
        return {
          color: 'warning',
          text: 'Подключение...',
          tooltipText: 'Устанавливается WebSocket соединение'
        };
      case WebSocketState.CLOSING:
        return {
          color: 'warning',
          text: 'Закрытие...',
          tooltipText: 'Закрывается WebSocket соединение'
        };
      case WebSocketState.CLOSED:
      default:
        return {
          color: 'error',
          text: 'Отключено',
          tooltipText: 'WebSocket соединение закрыто или недоступно'
        };
    }
  };
  
  const { color, text, tooltipText } = getIndicatorProps();
  
  return (
    <Tooltip 
      title={tooltipText} 
      placement="bottom" 
      arrow
    >
      <Box display="flex" alignItems="center" sx={{ cursor: 'help' }}>
        <Badge 
          variant="dot" 
          color={color as 'success' | 'warning' | 'error' | 'info'} 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Typography variant="caption" sx={{ ml: 1, fontWeight: 'medium' }}>
            {text}
          </Typography>
        </Badge>
      </Box>
    </Tooltip>
  );
};

export default WebSocketIndicator;