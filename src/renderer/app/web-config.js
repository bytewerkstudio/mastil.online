(function initMastilWebConfig() {
  const existing = window.MASTIL_WEB_CONFIG || {};

  function readStoredBackend() {
    try {
      return localStorage.getItem('mastil-backend-url') || '';
    } catch {
      return '';
    }
  }

  function isLocalHost() {
    const host = window.location.hostname;
    return !host || host === 'localhost' || host === '127.0.0.1' || host === '::1';
  }

  const storedBackend = readStoredBackend().trim();
  const configuredBackend = typeof existing.backendUrl === 'string' ? existing.backendUrl.trim() : '';
  const localBackend = isLocalHost() ? 'http://localhost:3787' : '';

  window.MASTIL_WEB_CONFIG = {
    backendUrl: storedBackend || configuredBackend || localBackend,
    websiteMode: !window.mastilNative,
    offlineMessage: 'Website-Version: Offline gegen KI spielbar. Online 1v1, Kauf und Aktivierung werden verbunden, sobald ein MASTIL-Server hinterlegt ist.'
  };
})();
