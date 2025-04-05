import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { registerSW } from 'virtual:pwa-register';

// Импорт стилей PWA
import './styles/pwa.css';

// Функция для настройки высоты для мобильных устройств
const setupMobileViewport = () => {
  // Установка правильной высоты на мобильных устройствах
  const setAppHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
  };
  
  // Вызов функции при загрузке и изменении размера окна
  setAppHeight();
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', setAppHeight);
};

// Настройка мета-тегов для PWA
const setupPWAMetaTags = () => {
  const metaTags = [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'theme-color', content: '#0085FF' },
    { name: 'format-detection', content: 'telephone=no' }
  ];

  metaTags.forEach(tag => {
    let metaTag = document.querySelector(`meta[name="${tag.name}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', tag.name);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', tag.content);
  });
};

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

// Определяем, запущено ли приложение в режиме PWA
const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone || 
         document.referrer.includes('android-app://');
};

// Применяем специальные настройки для мобильных устройств
if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || isPWA()) {
  setupMobileViewport();
  setupPWAMetaTags();
  
  // Для iOS устраняем задержку касания
  document.addEventListener('touchstart', function(){}, {passive: true});
  
  // Предотвращаем двойной тап для масштабирования
  document.addEventListener('dblclick', (e) => {
    e.preventDefault();
  }, { passive: false });
  
  // Предотвращаем перетаскивание (pull-to-refresh) на iOS
  document.body.style.overscrollBehavior = 'none';
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