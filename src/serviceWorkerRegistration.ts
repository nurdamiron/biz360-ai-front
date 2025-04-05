// src/serviceWorkerRegistration.ts

// Этот код используется для регистрации сервис-воркера.
// register() будет вызван при сборке для production.

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config?: Config): void {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // URL сервис-воркера похож на origin сайта
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Сервис-воркер не будет работать, если PUBLIC_URL находится на другом домене
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Проверяем существование сервис-воркера на локальном хосте
        checkValidServiceWorker(swUrl, config);

        // Дополнительные логи для разработчика
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        // Не локальный хост - просто регистрируем сервис-воркер
        registerValidSW(swUrl, config);
      }
    });
    
    // Добавляем обработчик для 'appinstalled' события
    window.addEventListener('appinstalled', (event) => {
      console.log('PWA было успешно установлено на устройство');
      
      // Устанавливаем флаг установки в localStorage
      localStorage.setItem('pwa_installed', 'true');
      
      // Здесь можно отправить аналитику
    });
    
    // Подписываемся на контрольные сообщения от сервис-воркера
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Если сервис-воркер обновился и мы сообщили пользователю об обновлении,
      // предотвращаем автоматическую перезагрузку
      if (window.updateServiceWorker) {
        // Ничего не делаем
      } else {
        // Автоматическая перезагрузка для применения обновлений
        window.location.reload();
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config): void {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Помещаем регистрацию в глобальную переменную для доступа из других частей приложения
      window.serviceWorkerRegistration = registration;
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // В этот момент установлена новая версия сервис-воркера
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Выполняем callback при обновлении
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Первая установка сервис-воркера
              console.log('Content is cached for offline use.');

              // Выполняем callback при успешной установке
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config): void {
  // Проверяем, доступен ли сервис-воркер по URL
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Проверяем, что сервис-воркер существует и получаем JS-файл
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Сервис-воркер не найден. Возможно, другое приложение.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Сервис-воркер найден. Продолжаем как обычно.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Объявление глобальных типов для TypeScript
declare global {
  interface Window {
    serviceWorkerRegistration?: ServiceWorkerRegistration;
    updateServiceWorker?: boolean;
  }
}

// Функция для проверки, можно ли установить приложение как PWA
export function checkPWAInstallability(): Promise<boolean> {
  return new Promise((resolve) => {
    // Проверка наличия свойства 'BeforeInstallPromptEvent'
    if ('BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window) {
      // Проверка, было ли приложение уже установлено
      if (localStorage.getItem('pwa_installed') === 'true') {
        resolve(false);
        return;
      }
      
      // Проверка поддержки дисплейного режима 'standalone' или 'fullscreen'
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.matchMedia('(display-mode: fullscreen)').matches) {
        // Приложение уже запущено как PWA
        localStorage.setItem('pwa_installed', 'true');
        resolve(false);
        return;
      }
      
      // Проверка для iOS (не подержка BeforeInstallPromptEvent)
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        if (
          // PWA критерии для iOS:
          'standalone' in window.navigator && 
          (window.navigator as any).standalone === false // Не запущено в режиме standalone
        ) {
          resolve(true); // Можно установить на iOS
          return;
        }
      }
      
      // Для других браузеров мы полагаемся на событие beforeinstallprompt
      let deferredPrompt: BeforeInstallPromptEvent | null = null;
      
      const handleBeforeInstallPrompt = (e: Event) => {
        // Предотвращаем показ стандартного баннера установки
        e.preventDefault();
        deferredPrompt = e as BeforeInstallPromptEvent;
        resolve(true);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
      
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      // Если событие не сработало в течение 3 секунд, считаем что установка невозможна
      setTimeout(() => {
        if (!deferredPrompt) {
          resolve(false);
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        }
      }, 3000);
    } else {
      // Браузер не поддерживает установку PWA
      resolve(false);
    }
  });
}

// Интерфейс для события BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}