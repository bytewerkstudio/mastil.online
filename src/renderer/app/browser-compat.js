(function initMastilBrowserCompat() {
  const isHttp = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  const isNative = Boolean(window.mastilNative);
  const canUseServiceWorker = isHttp && !isNative && 'serviceWorker' in navigator;
  const status = {
    browserMode: isHttp && !isNative,
    online: navigator.onLine !== false,
    cacheReady: false,
    standalone: window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
  };

  function setViewportUnit() {
    document.documentElement.style.setProperty('--mastil-vh', `${window.innerHeight * 0.01}px`);
  }

  function setRuntimeClasses() {
    document.documentElement.classList.toggle('mastil-web-runtime', status.browserMode);
    document.documentElement.classList.toggle('mastil-native-runtime', isNative);
    document.documentElement.classList.toggle('mastil-offline-runtime', !status.online);
    document.documentElement.classList.toggle('mastil-installed-runtime', status.standalone);
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function refreshStatusText() {
    if (!status.browserMode) {
      setText('mastil-menu-platform-state', 'Windows-Spiel');
      setText('mastil-menu-web-state', 'EXE bereit');
      setText('mastil-menu-web-detail', 'Lokale Spieldaten werden im Windows-Profil gespeichert.');
      return;
    }

    const platform = status.standalone ? 'Installiert' : status.online ? 'Browser-Spiel' : 'Offline-Modus';
    const webState = status.online ? 'Live spielbar' : 'Offline spielbar';
    const cacheDetail = status.cacheReady
      ? 'Offline-Cache bereit'
      : canUseServiceWorker
        ? 'Offline-Cache wird vorbereitet'
        : 'Browser-Cache nicht verfügbar';

    setText('mastil-menu-platform-state', platform);
    setText('mastil-menu-web-state', webState);
    setText('mastil-menu-web-detail', cacheDetail);
    setText('mastil-menu-web-footer', 'mastil.online ist als Web-Spiel live. Online-Duelle folgen ueber den MASTIL-Server.');
  }

  async function registerServiceWorker() {
    if (!canUseServiceWorker) return;

    try {
      const registration = await navigator.serviceWorker.register(new URL('../../sw.js', window.location.href).href, {
        scope: new URL('../../', window.location.href).href
      });
      status.cacheReady = Boolean(registration.active || registration.waiting || registration.installing);
      refreshStatusText();

      if (registration.installing) {
        registration.installing.addEventListener('statechange', () => {
          status.cacheReady = registration.installing.state === 'activated' || status.cacheReady;
          refreshStatusText();
        });
      }

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        status.cacheReady = true;
        refreshStatusText();
      });
    } catch {
      status.cacheReady = false;
      refreshStatusText();
    }
  }

  function bindNetworkEvents() {
    window.addEventListener('online', () => {
      status.online = true;
      setRuntimeClasses();
      refreshStatusText();
    });
    window.addEventListener('offline', () => {
      status.online = false;
      setRuntimeClasses();
      refreshStatusText();
    });
  }

  function observeMenu() {
    if (!('MutationObserver' in window)) return;
    const observer = new MutationObserver(refreshStatusText);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 10000);
  }

  window.MastilBrowserCompat = {
    status,
    refreshStatusText
  };

  setViewportUnit();
  setRuntimeClasses();
  bindNetworkEvents();
  window.addEventListener('resize', setViewportUnit, { passive: true });
  document.addEventListener('DOMContentLoaded', () => {
    refreshStatusText();
    observeMenu();
    registerServiceWorker();
  });
})();
