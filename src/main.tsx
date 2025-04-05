import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorker';
import { register as registerSW } from 'virtual:pwa-register';

// Регистрируем сервис-воркер для PWA
if ('serviceWorker' in navigator) {
  registerSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });
}

// Стили для полноэкранного режима на мобильных устройствах
const addFullscreenStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    body {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
      position: fixed;
      width: 100%;
      max-width: 100%;
      touch-action: manipulation;
      -webkit-user-select: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }
    
    html {
      height: 100%;
      overflow: hidden;
    }
    
    #root {
      height: 100%;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
  `;
  document.head.appendChild(style);
};

// Добавляем стили для мобильных устройств
if (/Mobi|Android/i.test(navigator.userAgent)) {
  addFullscreenStyles();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Регистрация сервис-воркера для работы как PWA
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('PWA успешно зарегистрирован:', registration);
  },
  onUpdate: (registration) => {
    console.log('Обнаружено обновление PWA:', registration);
    // Здесь можно добавить уведомление для пользователя о новой версии
  }
});