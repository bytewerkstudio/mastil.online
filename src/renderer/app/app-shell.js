(function initMastilShell() {
  const state = {
    initialized: false,
    licenseActive: false
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function showMessage(text) {
    const target = byId('mastil-license-message');
    if (target) target.textContent = text || '';
  }

  async function refreshLicenseBadge() {
    const status = await window.MastilLicense.status();
    state.licenseActive = status.active;
    const badge = byId('mastil-license-badge');
    if (!badge) return;
    badge.classList.toggle('active', status.active);
    badge.textContent = status.active ? 'Lizenz aktiv' : 'Demo: Wellen 1-5 frei';
  }

  function createBadge() {
    if (byId('mastil-license-badge')) return;
    const badge = document.createElement('div');
    badge.id = 'mastil-license-badge';
    badge.className = 'mastil-license-badge';
    badge.textContent = 'Demo: Wellen 1-5 frei';
    document.body.appendChild(badge);
  }

  function createLicenseModal() {
    if (byId('mastil-license-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'mastil-license-modal';
    modal.className = 'mastil-modal';
    modal.innerHTML = `
      <div class="mastil-dialog" role="dialog" aria-modal="true" aria-labelledby="mastil-license-title">
        <button class="mastil-action secondary mastil-close-x" id="mastil-license-x-btn" type="button" aria-label="Schließen">×</button>
        <h2 id="mastil-license-title">MASTIL freischalten</h2>
        <p>Die Demo enthält Wellen 1 bis 5. Ab Welle 6 wird eine Lizenz benötigt. Der Kaufpreis ist 10,99 EUR.</p>
        <div class="mastil-grid">
          <div>
            <h3>Lizenz aktivieren</h3>
            <div class="mastil-field">
              <label for="mastil-license-email">E-Mail</label>
              <input id="mastil-license-email" type="email" autocomplete="email" placeholder="name@example.com">
            </div>
            <div class="mastil-field">
              <label for="mastil-license-key">Lizenzcode</label>
              <input id="mastil-license-key" type="text" autocomplete="off" placeholder="MASTIL-XXXX-XXXX-XXXX">
            </div>
            <div class="mastil-actions">
              <button class="mastil-action" id="mastil-activate-btn" type="button">Aktivieren</button>
              <button class="mastil-action secondary" id="mastil-clear-license-btn" type="button">Zurücksetzen</button>
            </div>
          </div>
          <div>
            <h3>Kaufen</h3>
            <p>Starte den Stripe-Testkauf. Nach erfolgreicher Zahlung erzeugt der Server automatisch einen Lizenzcode.</p>
            <div class="mastil-field">
              <label for="mastil-checkout-email">E-Mail für Kauf</label>
              <input id="mastil-checkout-email" type="email" autocomplete="email" placeholder="name@example.com">
            </div>
            <div class="mastil-actions">
              <button class="mastil-action" id="mastil-buy-btn" type="button">Für 10,99 EUR kaufen</button>
            </div>
          </div>
        </div>
        <div class="mastil-message" id="mastil-license-message"></div>
        <div class="mastil-actions">
          <button class="mastil-action secondary" id="mastil-license-close-btn" type="button">Schließen</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    byId('mastil-license-close-btn').addEventListener('click', hideLicenseModal);
    byId('mastil-license-x-btn').addEventListener('click', hideLicenseModal);
    byId('mastil-activate-btn').addEventListener('click', activateFromModal);
    byId('mastil-buy-btn').addEventListener('click', checkoutFromModal);
    byId('mastil-clear-license-btn').addEventListener('click', async () => {
      await window.MastilLicense.clearLicense();
      await refreshLicenseBadge();
      showMessage('Lizenzdaten wurden lokal entfernt.');
    });
  }

  function createProgressModal() {
    if (byId('mastil-progress-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'mastil-progress-modal';
    modal.className = 'mastil-modal';
    modal.innerHTML = `
      <div class="mastil-dialog mastil-progress-dialog" role="dialog" aria-modal="true" aria-labelledby="mastil-progress-title">
        <button class="mastil-action secondary mastil-close-x" id="mastil-progress-x-btn" type="button" aria-label="Schließen">×</button>
        <h2 id="mastil-progress-title">Auszeichnungen</h2>
        <p>Dein Ruhm bleibt lokal gespeichert und erscheint in Web-Version und EXE auf diesem Gerät.</p>
        <div class="mastil-progress-overview">
          <span id="mastil-progress-count">0/0 freigeschaltet</span>
          <div class="mastil-progress-track" aria-hidden="true"><span id="mastil-progress-fill"></span></div>
        </div>
        <div class="mastil-awards-grid" id="mastil-awards-grid"></div>
        <div class="mastil-actions">
          <button class="mastil-action secondary" id="mastil-progress-close-btn" type="button">Schließen</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    byId('mastil-progress-close-btn').addEventListener('click', hideProgressModal);
    byId('mastil-progress-x-btn').addEventListener('click', hideProgressModal);
  }

  function renderProgressModal() {
    createProgressModal();
    const progress = window.MastilGameEnhancements && typeof window.MastilGameEnhancements.getAchievementProgress === 'function'
      ? window.MastilGameEnhancements.getAchievementProgress()
      : [];
    const unlocked = progress.filter((entry) => entry.unlocked).length;
    const total = progress.length || 1;
    const count = byId('mastil-progress-count');
    const fill = byId('mastil-progress-fill');
    const grid = byId('mastil-awards-grid');
    if (count) count.textContent = `${unlocked}/${total} freigeschaltet`;
    if (fill) fill.style.width = `${Math.round((unlocked / total) * 100)}%`;
    if (grid) {
      grid.innerHTML = progress.map((entry) => `
        <article class="mastil-award ${entry.unlocked ? 'unlocked' : 'locked'}">
          <span class="mastil-award-mark" aria-hidden="true"></span>
          <strong>${entry.title}</strong>
          <small>${entry.unlocked ? entry.detail : 'Noch nicht freigeschaltet'}</small>
        </article>
      `).join('');
    }
  }

  function showProgressModal() {
    renderProgressModal();
    const modal = byId('mastil-progress-modal');
    if (modal) modal.classList.add('active');
  }

  function hideProgressModal() {
    const modal = byId('mastil-progress-modal');
    if (modal) modal.classList.remove('active');
  }

  function showLicenseModal(message) {
    createLicenseModal();
    const modal = byId('mastil-license-modal');
    modal.classList.add('active');
    showMessage(message || '');
  }

  function hideLicenseModal() {
    const modal = byId('mastil-license-modal');
    if (modal) modal.classList.remove('active');
  }

  async function activateFromModal() {
    const email = byId('mastil-license-email').value.trim();
    const licenseKey = byId('mastil-license-key').value.trim();
    if (!email || !licenseKey) {
      showMessage('Bitte E-Mail und Lizenzcode eingeben.');
      return;
    }
    try {
      showMessage('Aktivierung wird geprüft...');
      await window.MastilLicense.activate(email, licenseKey);
      await refreshLicenseBadge();
      showMessage('Lizenz aktiviert. Viel Erfolg in Welle 6 und darüber hinaus.');
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function checkoutFromModal() {
    const email = byId('mastil-checkout-email').value.trim() || byId('mastil-license-email').value.trim();
    if (!email) {
      showMessage('Bitte eine E-Mail für den Kauf eingeben.');
      return;
    }
    try {
      showMessage('Kaufseite wird geöffnet...');
      await window.MastilLicense.checkout(email);
    } catch (error) {
      showMessage(error.message);
    }
  }

  function addBranding() {
    const titleContainer = document.querySelector('.start-title-container');
    if (titleContainer && !titleContainer.querySelector('.mastil-brand-mark')) {
      const image = document.createElement('img');
      image.className = 'mastil-brand-mark';
      image.src = '../../assets/branding/mastil-logo.png';
      image.alt = 'MASTIL';
      titleContainer.prepend(image);
    }

    if (!document.querySelector('.mastil-top-note')) {
      const note = document.createElement('div');
      note.className = 'mastil-top-note';
      const webConfig = window.MASTIL_WEB_CONFIG || {};
      note.textContent = webConfig.offlineMessage || 'Offline spielbar. Online 1v1 und Lizenzserver laufen über den MASTIL-Server.';
      document.body.appendChild(note);
    }

    const copyright = document.querySelector('#start-screen .copyright');
    if (copyright) copyright.textContent = '2026 Bytewerk Studio | MASTIL';

    if (!document.querySelector('.mastil-publisher-mark')) {
      const publisher = document.createElement('div');
      publisher.className = 'mastil-publisher-mark';
      publisher.textContent = 'Bytewerk Studio';
      document.body.appendChild(publisher);
    }
  }

  function buildMenuButton(label, handler) {
    const button = document.createElement('button');
    button.className = 'menu-button';
    button.type = 'button';
    button.innerHTML = `<span class="button-text">${label}</span>`;
    button.addEventListener('click', handler);
    return button;
  }

  function enhanceMenu() {
    const menu = document.querySelector('#start-screen .menu-container');
    if (!menu || menu.dataset.mastilEnhanced === 'true') return;
    menu.dataset.mastilEnhanced = 'true';

    const firstButton = menu.querySelector('.menu-button');
    if (firstButton) {
      const text = firstButton.querySelector('.button-text');
      if (text) text.textContent = 'Offline gegen KI';
    }

    const insertAfter = firstButton ? firstButton.nextSibling : null;
    menu.insertBefore(buildMenuButton('Online 1v1', () => window.MastilOnline.open()), insertAfter);
    menu.insertBefore(buildMenuButton('Lizenz aktivieren', () => showLicenseModal('')), insertAfter);
    menu.insertBefore(buildMenuButton('Kaufen 10,99 EUR', () => showLicenseModal('Zum Kaufen bitte E-Mail eintragen.')), insertAfter);
    const highscoreButton = Array.from(menu.querySelectorAll('.menu-button')).find((button) => button.textContent.includes('Highscore'));
    const progressButton = buildMenuButton('Auszeichnungen', showProgressModal);
    if (highscoreButton) {
      menu.insertBefore(progressButton, highscoreButton.nextSibling);
    } else {
      menu.appendChild(progressButton);
    }
  }

  function parseCurrentWave() {
    const text = (byId('wave-display') && byId('wave-display').textContent) || '1';
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : 1;
  }

  function installDemoGate() {
    const install = () => {
      if (typeof window.startNextWave !== 'function' || window.startNextWave.__mastilGated) return;
      const original = window.startNextWave;
      window.startNextWave = async function gatedStartNextWave(...args) {
        const currentWave = parseCurrentWave();
        const active = await window.MastilLicense.isActive();
        if (!active && currentWave >= window.MastilLicense.DEMO_MAX_WAVE) {
          if (typeof window.hideWaveTransitionScreen === 'function') window.hideWaveTransitionScreen();
          showLicenseModal('Die Demo endet nach Welle 5. Bitte kaufe oder aktiviere MASTIL, um weiterzuspielen.');
          return undefined;
        }
        return original.apply(this, args);
      };
      window.startNextWave.__mastilGated = true;
    };

    install();
    window.addEventListener('load', install);
    setTimeout(install, 500);
  }

  async function init() {
    if (state.initialized) return;
    state.initialized = true;
    createBadge();
    createLicenseModal();
    createProgressModal();
    addBranding();
    enhanceMenu();
    installDemoGate();
    await refreshLicenseBadge();
  }

  window.MastilShell = {
    init,
    showLicenseModal,
    hideLicenseModal,
    showProgressModal,
    refreshLicenseBadge
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
