// src/services/websocket.service.ts
import { getWsUrl } from '../../config/api.config';

export enum WebSocketState {
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSING = 'closing',
  CLOSED = 'closed',
}

export type MessageHandler = (data: any) => void;

export type WebSocketMessageType = 
  | 'auth'
  | 'auth_success'
  | 'subscribe'
  | 'subscribed'
  | 'unsubscribe'
  | 'unsubscribed'
  | 'update'
  | 'error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  resource?: string;
  id?: number | string;
  data?: any;
  timestamp?: number;
}

export interface WebSocketSubscription {
  resource: string;
  id: number | string;
  handler: MessageHandler;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private state: WebSocketState = WebSocketState.CLOSED;
  private subscriptions: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 3000; // 3 seconds
  private reconnectTimeoutId: number | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private authToken: string | null = null;
  
  private constructor() {
    // Приватный конструктор для реализации Singleton
  }
  
  /**
   * Получение экземпляра WebSocketService (Singleton)
   */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
  
  /**
   * Установка токена авторизации
   * @param token JWT токен
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    
    // Если соединение уже открыто, отправляем авторизацию
    if (this.isConnected()) {
      this.sendAuth();
    }
  }
  
  /**
   * Открытие WebSocket соединения
   */
  public connect(): void {
    if (this.socket && (this.state === WebSocketState.OPEN || this.state === WebSocketState.CONNECTING)) {
      return; // Уже подключен или подключается
    }
    
    try {
      this.state = WebSocketState.CONNECTING;
      this.socket = new WebSocket(getWsUrl());
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      
      // Уведомляем подписчиков о изменении состояния
      this.notifyStateChange();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }
  
  /**
   * Закрытие WebSocket соединения
   */
  public disconnect(): void {
    if (!this.socket) return;
    
    this.state = WebSocketState.CLOSING;
    this.notifyStateChange();
    
    // Отменяем запланированное переподключение
    if (this.reconnectTimeoutId !== null) {
      window.clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    
    try {
      this.socket.close();
    } catch (error) {
      console.error('Error closing WebSocket:', error);
    }
    
    this.socket = null;
    this.state = WebSocketState.CLOSED;
    this.notifyStateChange();
  }
  
  /**
   * Подписка на ресурс
   * @param resource тип ресурса (task, project и т.д.)
   * @param id идентификатор ресурса
   * @param handler обработчик сообщений
   */
  public subscribe(resource: string, id: number | string, handler: MessageHandler): void {
    const key = `${resource}:${id}`;
    
    // Добавляем обработчик в список подписок
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
    }
    this.subscriptions.get(key)?.push(handler);
    
    // Отправляем запрос на подписку, если соединение открыто
    if (this.isConnected()) {
      this.send({
        type: 'subscribe',
        resource,
        id
      });
    } else {
      // Добавляем запрос в очередь
      this.messageQueue.push({
        type: 'subscribe',
        resource,
        id
      });
      
      // Пытаемся подключиться, если нет активного соединения
      if (this.state === WebSocketState.CLOSED) {
        this.connect();
      }
    }
  }
  
  /**
   * Отписка от ресурса
   * @param resource тип ресурса
   * @param id идентификатор ресурса
   * @param handler обработчик сообщений (если не указан, отписываемся от всех)
   */
  public unsubscribe(resource: string, id: number | string, handler?: MessageHandler): void {
    const key = `${resource}:${id}`;
    
    if (this.subscriptions.has(key)) {
      if (handler) {
        // Удаляем конкретный обработчик
        const handlers = this.subscriptions.get(key) || [];
        const index = handlers.indexOf(handler);
        
        if (index !== -1) {
          handlers.splice(index, 1);
        }
        
        if (handlers.length === 0) {
          this.subscriptions.delete(key);
          
          // Отправляем запрос на отписку
          if (this.isConnected()) {
            this.send({
              type: 'unsubscribe',
              resource,
              id
            });
          }
        }
      } else {
        // Удаляем все обработчики
        this.subscriptions.delete(key);
        
        // Отправляем запрос на отписку
        if (this.isConnected()) {
          this.send({
            type: 'unsubscribe',
            resource,
            id
          });
        }
      }
    }
  }
  
  /**
   * Проверка активного соединения
   */
  public isConnected(): boolean {
    return this.socket !== null && this.state === WebSocketState.OPEN;
  }
  
  /**
   * Получение текущего состояния
   */
  public getState(): WebSocketState {
    return this.state;
  }
  
  /**
   * Отправка сообщения
   * @param message сообщение для отправки
   */
  private send(message: WebSocketMessage): void {
    if (!this.isConnected()) {
      this.messageQueue.push(message);
      
      if (this.state === WebSocketState.CLOSED) {
        this.connect();
      }
      
      return;
    }
    
    try {
      this.socket?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      this.messageQueue.push(message);
    }
  }
  
  /**
   * Обработчик открытия соединения
   */
  private handleOpen(): void {
    console.log('WebSocket connection established');
    this.state = WebSocketState.OPEN;
    this.reconnectAttempts = 0;
    this.notifyStateChange();
    
    // Отправляем авторизацию, если есть токен
    this.sendAuth();
    
    // Отправляем накопленные сообщения
    this.processPendingMessages();
  }
  
  /**
   * Отправка авторизации
   */
  private sendAuth(): void {
    if (this.authToken) {
      this.send({
        type: 'auth',
        data: { token: this.authToken }
      });
    }
  }
  
  /**
   * Отправка накопленных сообщений
   */
  private processPendingMessages(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }
  
  /**
   * Обработчик входящих сообщений
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Обрабатываем разные типы сообщений
      switch (message.type) {
        case 'auth_success':
          console.log('WebSocket authentication successful');
          break;
          
        case 'update':
          if (message.resource && message.id) {
            const key = `${message.resource}:${message.id}`;
            const handlers = this.subscriptions.get(key);
            
            if (handlers) {
              handlers.forEach(handler => {
                try {
                  handler(message.data);
                } catch (err) {
                  console.error('Error in message handler:', err);
                }
              });
            }
          }
          break;
          
        case 'error':
          console.error('WebSocket error from server:', message.data);
          break;
          
        default:
          // Другие типы сообщений
          break;
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }
  
  /**
   * Обработчик закрытия соединения
   */
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    this.socket = null;
    this.state = WebSocketState.CLOSED;
    this.notifyStateChange();
    
    // Планируем переподключение, если закрытие не было намеренным
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }
  
  /**
   * Обработчик ошибок
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    this.notifyStateChange();
  }
  
  /**
   * Планирование переподключения
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeoutId !== null || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    
    const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts);
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    this.reconnectTimeoutId = window.setTimeout(() => {
      this.reconnectTimeoutId = null;
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
  
  /**
   * Уведомление о изменении состояния
   */
  private notifyStateChange(): void {
    const event = new CustomEvent('websocket-state-changed', {
      detail: { state: this.state }
    });
    window.dispatchEvent(event);
  }
}

// Экспортируем singleton экземпляр
export default WebSocketService.getInstance();