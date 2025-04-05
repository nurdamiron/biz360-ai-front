// src/components/common/WebSocketIndicator.tsx
import React from 'react';
import { Badge, Tooltip, HStack, Text } from '@chakra-ui/react';
import useWebSocket from '../../hooks/useWebSocket';
import { WebSocketState } from '../../services/websocket.service';

const WebSocketIndicator: React.FC = () => {
  const { state, isConnected } = useWebSocket();
  
  // Определение цвета и текста в зависимости от состояния
  const getIndicatorProps = () => {
    switch (state) {
      case WebSocketState.OPEN:
        return {
          colorScheme: 'green',
          text: 'Подключено',
          tooltipText: 'WebSocket соединение активно'
        };
      case WebSocketState.CONNECTING:
        return {
          colorScheme: 'yellow',
          text: 'Подключение...',
          tooltipText: 'Устанавливается WebSocket соединение'
        };
      case WebSocketState.CLOSING:
        return {
          colorScheme: 'orange',
          text: 'Закрытие...',
          tooltipText: 'Закрывается WebSocket соединение'
        };
      case WebSocketState.CLOSED:
      default:
        return {
          colorScheme: 'red',
          text: 'Отключено',
          tooltipText: 'WebSocket соединение закрыто или недоступно'
        };
    }
  };
  
  const { colorScheme, text, tooltipText } = getIndicatorProps();
  
  return (
    <Tooltip 
      label={tooltipText} 
      placement="bottom" 
      hasArrow 
      openDelay={500}
    >
      <HStack spacing={1} align="center">
        <Badge 
          colorScheme={colorScheme} 
          variant="solid" 
          borderRadius="full" 
          px={2}
          display="flex"
          alignItems="center"
        >
          <Text fontSize="xs">{text}</Text>
        </Badge>
      </HStack>
    </Tooltip>
  );
};

export default WebSocketIndicator;