import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { registerSW } from 'virtual:pwa-register';

// Регистрируем сервис-воркер для PWA
if ('serviceWorker' in navigator) {
  // Используем Vite-плагин PWA для регистрации
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('Доступно обновление приложения. Обновить сейчас?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('Приложение готово к работе офлайн');
    },
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
    :root {
      --vh: 1vh;
    }
    
    html, body {
      position: fixed;
      width: 100%;
      height: 100vh;
      height: calc(var(--vh, 1vh) * 100);
      margin: 0;
      padding: 0;
      overflow: hidden;
      overscroll-behavior: none;
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      touch-action: manipulation;
    }
    
    #root {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    /* Исправляет проблемы с высотой на мобильных устройствах */
    @supports (-webkit-touch-callout: none) {
      body {
        height: -webkit-fill-available;
      }
      #root {
        height: -webkit-fill-available;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Установка правильной высоты на мобильных устройствах
  const setAppHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  // Вызов функции при загрузке и изменении размера окна
  setAppHeight();
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', setAppHeight);
};

// Добавляем стили для мобильных устройств
if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  addFullscreenStyles();
  
  // Для iOS устраняем задержку касания
  document.addEventListener('touchstart', function() {}, {passive: true});
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Регистрация сервис-воркера для работы как PWA
// Используем стандартный serviceWorker в дополнение к VitePWA
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('PWA успешно зарегистрирован:', registration);
  },
  onUpdate: (registration) => {
    // Показываем уведомление пользователю о наличии обновления
    if (registration && registration.waiting) {
      console.log('Обнаружено обновление PWA');
      
      if (confirm('Доступна новая версия приложения. Обновить сейчас?')) {
        // Отправка сообщения для активации нового SW
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Перезагрузка страницы для применения изменений
        window.location.reload();
      }
    }
  }
});