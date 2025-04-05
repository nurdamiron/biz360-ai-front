// src/hooks/useWebSocketIntegration.ts
import { useEffect } from 'react';
import { useAppDispatch } from './redux';
import websocketService, { WebSocketState } from '../api/services/websocket.service';
import { updateTaskFromWebSocket, addTaskLogFromWebSocket } from '../store/slices/tasksSlice';
import { updateProjectFromWebSocket } from '../store/slices/projectsSlice';
import { Task, TaskLog } from '../types/task.types';
import { Project } from '../types/project.types';
import { enqueueSnackbar } from 'notistack';

/**
 * Хук для глобальной интеграции WebSocket с Redux
 * Этот хук следует использовать один раз в App компоненте
 */
export const useWebSocketIntegration = () => {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Обработчик изменения состояния WebSocket
    const handleWebSocketStateChange = (event: CustomEvent) => {
      const { state } = event.detail;
      
      if (state === WebSocketState.OPEN) {
        enqueueSnackbar('Установлено соединение с сервером', { 
          variant: 'success',
          autoHideDuration: 3000
        });
      } else if (state === WebSocketState.CLOSED) {
        enqueueSnackbar('Соединение с сервером разорвано', { 
          variant: 'warning',
          autoHideDuration: 3000
        });
      }
    };
    
    // Обработчик обновления задачи
    const handleTaskUpdate = (data: Task) => {
      dispatch(updateTaskFromWebSocket(data));
    };
    
    // Обработчик обновления логов задачи
    const handleTaskLogUpdate = (data: { log: TaskLog } | TaskLog) => {
      // Обработка двух возможных форматов данных от WebSocket
      const log = 'log' in data ? data.log : data;
      
      if (log && log.taskId) {
        dispatch(addTaskLogFromWebSocket({
          taskId: log.taskId,
          log
        }));
      }
    };
    
    // Обработчик обновления проекта
    const handleProjectUpdate = (data: Project) => {
      dispatch(updateProjectFromWebSocket(data));
    };
    
    // Обработчик событий статуса задачи
    const handleTaskStarted = (data: any) => {
      enqueueSnackbar(`Задача #${data.taskId} начала выполняться`, { 
        variant: 'info',
        autoHideDuration: 3000
      });
    };
    
    const handleTaskCompleted = (data: any) => {
      enqueueSnackbar(`Задача #${data.taskId} успешно завершена`, { 
        variant: 'success',
        autoHideDuration: 3000
      });
    };
    
    const handleTaskFailed = (data: any) => {
      enqueueSnackbar(`Задача #${data.taskId} завершилась с ошибкой`, { 
        variant: 'error',
        autoHideDuration: 5000
      });
    };
    
    // Подписка на изменение состояния WebSocket
    window.addEventListener('websocket-state-changed', handleWebSocketStateChange as EventListener);
    
    // Подписка на обновления ресурсов
    websocketService.subscribe('task', 'all', handleTaskUpdate);
    websocketService.subscribe('task_log', 'all', handleTaskLogUpdate);
    websocketService.subscribe('project', 'all', handleProjectUpdate);
    
    // Подписка на события статуса задачи
    websocketService.subscribe('task_started', 'all', handleTaskStarted);
    websocketService.subscribe('task_completed', 'all', handleTaskCompleted);
    websocketService.subscribe('task_failed', 'all', handleTaskFailed);
    
    // Инициализация соединения, если есть токен
    if (localStorage.getItem('auth_token')) {
      websocketService.setAuthToken(localStorage.getItem('auth_token') || '');
      websocketService.connect();
    }
    
    // Отписка при размонтировании
    return () => {
      window.removeEventListener('websocket-state-changed', handleWebSocketStateChange as EventListener);
      
      websocketService.unsubscribe('task', 'all', handleTaskUpdate);
      websocketService.unsubscribe('task_log', 'all', handleTaskLogUpdate);
      websocketService.unsubscribe('project', 'all', handleProjectUpdate);
      
      websocketService.unsubscribe('task_started', 'all', handleTaskStarted);
      websocketService.unsubscribe('task_completed', 'all', handleTaskCompleted);
      websocketService.unsubscribe('task_failed', 'all', handleTaskFailed);
      
      // Закрываем соединение
      websocketService.disconnect();
    };
  }, [dispatch]);
  
  // Этот хук не возвращает никаких значений
  return null;
};

export default useWebSocketIntegration;