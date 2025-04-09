// src/hooks/useWebSocketIntegration.ts
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import websocketService from '../api/services/websocket.service';
import { updateTaskFromWebSocket, addTaskLogFromWebSocket, updateTaskStatusFromWebSocket } from '../store/slices/tasksSlice';
import { updateProjectFromWebSocket } from '../store/slices/projectsSlice';

const useWebSocketIntegration = () => {
  const dispatch = useAppDispatch();
  const { isLoggedIn, token } = useAppSelector(state => state.auth);
  const { selectedTask } = useAppSelector(state => state.tasks);
  const { selectedProject } = useAppSelector(state => state.projects);
  const isInitializedRef = useRef(false);
  
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
    // Проверяем, что мы ещё не инициализировали соединение
    if (isLoggedIn && token && !isInitializedRef.current) {
      isInitializedRef.current = true;
      
      // Устанавливаем токен для аутентификации WebSocket
      websocketService.setAuthToken(token);
      
      // Подключаемся к WebSocket серверу только однажды
      websocketService.connect();
      
      // Отключение при размонтировании компонента App или при выходе пользователя
      return () => {
        isInitializedRef.current = false;
        websocketService.disconnect();
      };
    }
  }, [isLoggedIn, token]);
  
  // Эффект для подписки на обновления выбранной задачи
  useEffect(() => {
    // Проверяем что пользователь авторизован и есть выбранная задача
    if (isLoggedIn && selectedTask?.id) {
      // Отписываемся от всех предыдущих подписок для определенности
      websocketService.unsubscribe(`task`, selectedTask.id);
      websocketService.unsubscribe(`task_logs`, selectedTask.id);
      websocketService.unsubscribe(`task_status`, selectedTask.id);
      
      // Подписываемся на новые обновления
      websocketService.subscribe(`task`, selectedTask.id, handleTaskUpdate);
      websocketService.subscribe(`task_logs`, selectedTask.id, handleTaskLogUpdate);
      websocketService.subscribe(`task_status`, selectedTask.id, handleTaskStatusUpdate);
      
      return () => {
        // Отписываемся при размонтировании или изменении задачи
        websocketService.unsubscribe(`task`, selectedTask.id);
        websocketService.unsubscribe(`task_logs`, selectedTask.id);
        websocketService.unsubscribe(`task_status`, selectedTask.id);
      };
    }
  }, [isLoggedIn, selectedTask?.id]);
  
  // Эффект для подписки на обновления выбранного проекта
  useEffect(() => {
    // Проверяем что пользователь авторизован и есть выбранный проект
    if (isLoggedIn && selectedProject?.id) {
      // Отписываемся от предыдущей подписки
      websocketService.unsubscribe(`project`, selectedProject.id);
      
      // Подписываемся на обновления проекта
      websocketService.subscribe(`project`, selectedProject.id, handleProjectUpdate);
      
      return () => {
        // Отписываемся при размонтировании или изменении проекта
        websocketService.unsubscribe(`project`, selectedProject.id);
      };
    }
  }, [isLoggedIn, selectedProject?.id]);
  
  return null; // Хук не возвращает ничего, он только настраивает подписки
};

export default useWebSocketIntegration;