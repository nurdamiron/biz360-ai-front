// Этот необязательный код используется для регистрации сервис-воркера.
// register() не будет вызвано по умолчанию.

// Это позволяет приложению работать быстрее при повторных посещениях в production
// и дает возможность работать офлайн.

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );
  
  type Config = {
    onSuccess?: (registration: ServiceWorkerRegistration) => void;
    onUpdate?: (registration: ServiceWorkerRegistration) => void;
  };
  
  export function register(config?: Config): void {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        // Сервис-воркер не будет работать, если PUBLIC_URL находится в другом домене
        return;
      }
  
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
        if (isLocalhost) {
          // Это локальный сервер. Проверим, существует ли сервис-воркер
          checkValidServiceWorker(swUrl, config);
  
          // Добавим дополнительное логирование для отображения разработчику
          navigator.serviceWorker.ready.then(() => {
            console.log(
              'Это приложение обслуживается кэшем через сервис-воркер.'
            );
          });
        } else {
          // Не локальный сервер. Просто регистрируем сервис-воркер
          registerValidSW(swUrl, config);
        }
      });
    }
  }
  
  function registerValidSW(swUrl: string, config?: Config): void {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Новый контент доступен; уведомим пользователя
                console.log('Новый контент доступен.');
  
                // Выполним обратный вызов
                if (config && config.onUpdate) {
                  config.onUpdate(registration);
                }
              } else {
                // Все было кэшировано для использования офлайн
                console.log('Контент кэширован для использования офлайн.');
  
                // Выполним обратный вызов
                if (config && config.onSuccess) {
                  config.onSuccess(registration);
                }
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('Ошибка при регистрации сервис-воркера:', error);
      });
  }
  
  function checkValidServiceWorker(swUrl: string, config?: Config): void {
    // Проверка, можно ли найти сервис-воркер
    fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    })
      .then((response) => {
        // Убедитесь, что сервис-воркер существует и что мы действительно получаем файл JS.
        const contentType = response.headers.get('content-type');
        if (
          response.status === 404 ||
          (contentType != null && contentType.indexOf('javascript') === -1)
        ) {
          // Сервис-воркер не найден. Возможно, это другое приложение. Перезагрузка страницы.
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
        console.log('Интернет не обнаружен. Приложение работает в автономном режиме.');
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