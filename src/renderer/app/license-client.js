(function initLicenseClient() {
  const DEMO_MAX_WAVE = 5;
  const STORAGE_KEY = 'mastil-license-cache';
  let cachedConfig = null;
  let cachedLicense = null;

  async function nativeCall(name, ...args) {
    if (window.mastilNative && typeof window.mastilNative[name] === 'function') {
      return window.mastilNative[name](...args);
    }
    return null;
  }

  async function getConfig() {
    if (cachedConfig) return cachedConfig;
    const nativeConfig = await nativeCall('getConfig');
    const webConfig = window.MASTIL_WEB_CONFIG || {};
    const storedBackend = localStorage.getItem('mastil-backend-url') || '';
    cachedConfig = nativeConfig || {
      backendUrl: storedBackend || webConfig.backendUrl || '',
      websiteMode: !window.mastilNative
    };
    return cachedConfig;
  }

  function setBackendUrl(url) {
    const backendUrl = String(url || '').trim().replace(/\/+$/, '');
    localStorage.setItem('mastil-backend-url', backendUrl);
    const webConfig = window.MASTIL_WEB_CONFIG || {};
    cachedConfig = {
      ...(cachedConfig || webConfig),
      backendUrl,
      websiteMode: !window.mastilNative
    };
    window.MASTIL_WEB_CONFIG = {
      ...webConfig,
      backendUrl
    };
    return cachedConfig;
  }

  function getBackendUrl(config) {
    const backendUrl = String(config.backendUrl || '').trim().replace(/\/+$/, '');
    if (!backendUrl) {
      throw new Error('Diese Website ist offline spielbar. Für Kauf, Aktivierung und Online 1v1 muss später eine MASTIL-Server-Adresse hinterlegt werden.');
    }
    return backendUrl;
  }

  async function getDeviceId() {
    const nativeId = await nativeCall('getDeviceId');
    if (nativeId) return nativeId;
    let id = localStorage.getItem('mastil-device-id');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `browser-${Date.now()}-${Math.random()}`;
      localStorage.setItem('mastil-device-id', id);
    }
    return id;
  }

  function parseToken(token) {
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalized));
    } catch {
      return null;
    }
  }

  function isTokenActive(token) {
    const payload = parseToken(token);
    if (!payload || payload.licensed !== true) return false;
    if (payload.exp && Date.now() / 1000 > payload.exp) return false;
    return true;
  }

  async function getStoredLicense() {
    if (cachedLicense) return cachedLicense;
    const nativeLicense = await nativeCall('getLicense');
    if (nativeLicense) {
      cachedLicense = nativeLicense;
      return cachedLicense;
    }
    try {
      cachedLicense = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      cachedLicense = null;
    }
    return cachedLicense;
  }

  async function saveLicense(license) {
    cachedLicense = license;
    await nativeCall('saveLicense', license);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
  }

  async function clearLicense() {
    cachedLicense = null;
    await nativeCall('clearLicense');
    localStorage.removeItem(STORAGE_KEY);
  }

  async function isActive() {
    const license = await getStoredLicense();
    return Boolean(license && isTokenActive(license.token));
  }

  async function status() {
    const license = await getStoredLicense();
    return {
      active: Boolean(license && isTokenActive(license.token)),
      license
    };
  }

  async function activate(email, licenseKey) {
    const config = await getConfig();
    const deviceId = await getDeviceId();
    const backendUrl = getBackendUrl(config);
    const response = await fetch(`${backendUrl}/api/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, licenseKey, deviceId })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Aktivierung fehlgeschlagen.');
    await saveLicense(result);
    return result;
  }

  async function checkout(email) {
    const config = await getConfig();
    const backendUrl = getBackendUrl(config);
    const response = await fetch(`${backendUrl}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Kauf konnte nicht gestartet werden.');
    if (result.url) {
      if (window.mastilNative) await window.mastilNative.openExternal(result.url);
      else window.open(result.url, '_blank', 'noopener');
    }
    return result;
  }

  window.MastilLicense = {
    DEMO_MAX_WAVE,
    getConfig,
    setBackendUrl,
    getDeviceId,
    getStoredLicense,
    saveLicense,
    clearLicense,
    isActive,
    status,
    activate,
    checkout
  };
})();
