// src/hooks/useWebSocket.ts
import { useEffect, useState, useCallback } from 'react';
import websocketService, { 
  WebSocketState, 
  MessageHandler 
} from '../services/websocket.service';
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
    websocketService.subscribe(resource, id, handler);
  }, []);
  
  // Метод для отписки от обновлений ресурса
  const unsubscribe = useCallback((resource: string, id: number | string, handler?: MessageHandler) => {
    websocketService.unsubscribe(resource, id, handler);
  }, []);
  
  // Автоматическая обработка обновлений задач
  useEffect(() => {
    const handleTaskUpdate = (data: Task) => {
      dispatch(updateTaskFromWebSocket(data));
    };
    
    const handleTaskLogUpdate = (data: { log: TaskLog }) => {
      // Предполагаем, что в данных есть ссылка на ID задачи
      if (data.log && data.log.taskId) {
        dispatch(addTaskLogFromWebSocket({
          taskId: data.log.taskId,
          log: data.log
        }));
      }
    };
    
    // Глобальная подписка на обновления задач
    // В реальном приложении лучше подписываться на конкретные задачи
    // Здесь показан простой пример
    websocketService.subscribe('task_updates', 'all', handleTaskUpdate);
    websocketService.subscribe('task_logs', 'all', handleTaskLogUpdate);
    
    return () => {
      websocketService.unsubscribe('task_updates', 'all', handleTaskUpdate);
      websocketService.unsubscribe('task_logs', 'all', handleTaskLogUpdate);
    };
  }, [dispatch]);
  
  return {
    state,
    subscribe,
    unsubscribe,
    isConnected: websocketService.isConnected()
  };
};

export default useWebSocket;