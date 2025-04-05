// src/hooks/useWebSocketIntegration.ts

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import websocketService from '../api/services/websocket.service';
import { updateTaskFromWebSocket, addTaskLogFromWebSocket, updateTaskStatusFromWebSocket } from '../store/slices/tasksSlice';
import { updateProjectFromWebSocket } from '../store/slices/projectsSlice';

const useWebSocketIntegration = () => {
  const dispatch = useAppDispatch();
  const { isLoggedIn, token } = useAppSelector(state => state.auth);
  const { selectedTask } = useAppSelector(state => state.tasks);
  const { selectedProject } = useAppSelector(state => state.projects);

  // Обработчик для данных задачи
  const handleTaskUpdate = (data) => {
    dispatch(updateTaskFromWebSocket(data));
  };

  // Обработчик для логов задачи
  const handleTaskLogUpdate = (data) => {
    // Обработка двух возможных форматов данных
    const log = 'log' in data ? data.log : data;
    
    if (log && log.taskId) {
      dispatch(addTaskLogFromWebSocket({ taskId: log.taskId, log }));
    }
  };

  // Обработчик для статуса задачи
  const handleTaskStatusUpdate = (data) => {
    if (data && data.taskId && data.status) {
      dispatch(updateTaskStatusFromWebSocket({ 
        taskId: data.taskId, 
        status: data.status 
      }));
    }
  };

  // Обработчик для данных проекта
  const handleProjectUpdate = (data) => {
    dispatch(updateProjectFromWebSocket(data));
  };

  // Эффект для подключения к WebSocket и настройки авторизации
  useEffect(() => {
    if (isLoggedIn && token) {
      // Устанавливаем токен для аутентификации WebSocket
      websocketService.setAuthToken(token);
      
      // Подключаемся к WebSocket серверу
      websocketService.connect();
      
      // Отключение при размонтировании
      return () => {
        websocketService.disconnect();
      };
    }
  }, [isLoggedIn, token]);

  // Эффект для глобальных подписок (статусы, уведомления)
  useEffect(() => {
    if (isLoggedIn) {
      // Подписка на уведомления и общие статусы
      websocketService.subscribe('notifications', 'all', (data) => {
        // Обработка уведомлений, может использовать enqueueSnackbar
        console.log('Notification received:', data);
      });
      
      return () => {
        websocketService.unsubscribe('notifications', 'all');
      };
    }
  }, [isLoggedIn]);

  // Эффект для подписки на обновления выбранной задачи
  useEffect(() => {
    if (selectedTask && selectedTask.id) {
      // Подписка на обновления задачи и её логов
      websocketService.subscribe(`task`, selectedTask.id, handleTaskUpdate);
      websocketService.subscribe(`task_logs`, selectedTask.id, handleTaskLogUpdate);
      websocketService.subscribe(`task_status`, selectedTask.id, handleTaskStatusUpdate);
      
      // Отписка при размонтировании или изменении задачи
      return () => {
        websocketService.unsubscribe(`task`, selectedTask.id, handleTaskUpdate);
        websocketService.unsubscribe(`task_logs`, selectedTask.id, handleTaskLogUpdate);
        websocketService.unsubscribe(`task_status`, selectedTask.id, handleTaskStatusUpdate);
      };
    }
  }, [selectedTask?.id]);

  // Эффект для подписки на обновления выбранного проекта
  useEffect(() => {
    if (selectedProject && selectedProject.id) {
      // Подписка на обновления проекта
      websocketService.subscribe(`project`, selectedProject.id, handleProjectUpdate);
      
      // Отписка при размонтировании или изменении проекта
      return () => {
        websocketService.unsubscribe(`project`, selectedProject.id, handleProjectUpdate);
      };
    }
  }, [selectedProject?.id]);

  return null; // Хук не возвращает ничего, он только настраивает подписки
};

export default useWebSocketIntegration;