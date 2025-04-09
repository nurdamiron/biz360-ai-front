// src/hooks/useWebSocket.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import websocketService, { 
  WebSocketState, 
  MessageHandler 
} from '../api/services/websocket.service';
import { useAppDispatch } from './redux';
import { updateTaskFromWebSocket, addTaskLogFromWebSocket } from '../store/slices/tasksSlice';
import { Task, TaskLog } from '../types/task.types';

// Интерфейс для возвращаемых значений
interface UseWebSocketResult {
  state: WebSocketState;
  subscribe: (resource: string, id: number | string, handler: MessageHandler) => void;
  unsubscribe: (resource: string, id: number | string, handler?: MessageHandler) => void;
  isConnected: boolean;
}

/**
 * Хук для работы с WebSocket соединением
 */
export const useWebSocket = (): UseWebSocketResult => {
  const [state, setState] = useState<WebSocketState>(websocketService.getState());
  const dispatch = useAppDispatch();
  const subscriptionsRef = useRef<Array<{resource: string, id: number | string, handler: MessageHandler}>>([]);
  
  // Обработчик изменения состояния WebSocket
  useEffect(() => {
    const handleStateChange = (event: CustomEvent) => {
      setState(event.detail.state);
    };
    
    // Подписываемся на событие изменения состояния
    window.addEventListener('websocket-state-changed', handleStateChange as EventListener);
    
    // Проверяем состояние при монтировании
    setState(websocketService.getState());
    
    // Отписываемся при размонтировании
    return () => {
      window.removeEventListener('websocket-state-changed', handleStateChange as EventListener);
    };
  }, []);
  
  // Метод для подписки на обновления ресурса
  const subscribe = useCallback((resource: string, id: number | string, handler: MessageHandler) => {
    // Запоминаем подписку для контроля дубликатов
    const subscription = { resource, id, handler };
    const exists = subscriptionsRef.current.some(
      sub => sub.resource === resource && sub.id === id && sub.handler === handler
    );
    
    if (!exists) {
      subscriptionsRef.current.push(subscription);
      websocketService.subscribe(resource, id, handler);
    }
  }, []);
  
  // Метод для отписки от обновлений ресурса
  const unsubscribe = useCallback((resource: string, id: number | string, handler?: MessageHandler) => {
    if (handler) {
      // Удаляем конкретную подписку
      subscriptionsRef.current = subscriptionsRef.current.filter(
        sub => !(sub.resource === resource && sub.id === id && sub.handler === handler)
      );
    } else {
      // Удаляем все подписки для ресурса и ID
      subscriptionsRef.current = subscriptionsRef.current.filter(
        sub => !(sub.resource === resource && sub.id === id)
      );
    }
    
    websocketService.unsubscribe(resource, id, handler);
  }, []);
  
  return {
    state,
    subscribe,
    unsubscribe,
    isConnected: websocketService.isConnected()
  };
};

export default useWebSocket;