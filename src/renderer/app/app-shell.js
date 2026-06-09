(function initMastilShell() {
  const state = {
    initialized: false,
    licenseActive: false
  };
  const SKIRMISH_KEY = 'mastil-skirmish-config';
  const WORLD_REGIONS = [
    { id: 'startgebiet', title: 'Startgebiet', waves: '1-5', boss: 'Grenzwacht Roderich', difficulty: 'Einsteiger', terrain: 'Wiesen, Wege, erste Burgen', style: 'Ausgewogen', image: '../../assets/backgrounds/worlds/world-01-startgebiet.png' },
    { id: 'grenzlande', title: 'Grenzlande', waves: '6-10', boss: 'Der Eisenvogt', difficulty: 'Normal', terrain: 'Engpässe, Signalhöhen, Frontdruck', style: 'Verteidigung', image: '../../assets/backgrounds/worlds/world-02-grenzlande.png' },
    { id: 'wuestenreich', title: 'Wüstenreich', waves: '11-15', boss: 'Sultan der Sandkrone', difficulty: 'Hart', terrain: 'Märkte, Steinbrüche, weite Wege', style: 'Wirtschaft', image: '../../assets/backgrounds/worlds/world-03-wuestenreich.png' },
    { id: 'nachtfestung', title: 'Nachtfestung', waves: '16-20', boss: 'Nachtgraf Malrec', difficulty: 'Sehr hart', terrain: 'Waldsaum, Hinterhalte, Nachtwege', style: 'Taktik', image: '../../assets/backgrounds/worlds/world-04-nachtfestung.png' },
    { id: 'endboss', title: 'Endboss-Zitadelle', waves: '21-25', boss: 'Kaiser Veyron', difficulty: 'Endboss', terrain: 'Zitadellen, Aschefelder, Bossfront', style: 'Belagerung', image: '../../assets/backgrounds/worlds/world-05-endboss-zitadelle.png' }
  ];
  const SKIRMISH_SIZES = {
    compact: { label: 'Kompakt', towers: '10 Orte', detail: 'schnelle Trainingsrunde mit kurzer Front' },
    standard: { label: 'Standard', towers: '13 Orte', detail: 'klassische Karte mit klarer Mitte' },
    large: { label: 'Groß', towers: '16 Orte', detail: 'mehr Burgen, längere Versorgungslinien' },
    war: { label: 'Kriegskarte', towers: '20 Orte', detail: 'volle Weltkarte mit mehreren Fronten' },
    epic: { label: 'Reichskrieg', towers: '24 Orte', detail: 'große Kriegskarte mit Außenburgen und Nebenfronten' }
  };
  const SKIRMISH_DIFFICULTIES = {
    easy: { label: 'Training', detail: 'ruhiger KI-Start zum Ueben' },
    normal: { label: 'Normal', detail: 'ausgewogene Kriegsführung' },
    hard: { label: 'Hart', detail: 'starker Gegnerdruck' },
    brutal: { label: 'Brutal', detail: 'kaum Schonzeit, harte Front' }
  };
  const SKIRMISH_PLANS = {
    balanced: { label: 'Ausgewogen', detail: 'KI baut, sammelt und greift gemischt an.' },
    raiders: { label: 'Plünderer', detail: 'mehr Truppentürme, schnellere Angriffe.' },
    fortress: { label: 'Festungskrieg', detail: 'stärkere Burgen, mehr Belagerungsziele.' },
    economy: { label: 'Handelskrieg', detail: 'mehr Märkte, Gold und lange Wege.' },
    conquest: { label: 'Reichskrieg', detail: 'mehr Burgen, längere Fronten und harte Endstellungen.' }
  };
  const DEFAULT_SKIRMISH = {
    mode: 'campaign',
    mapId: 'startgebiet',
    size: 'standard',
    difficulty: 'normal',
    opponents: 2,
    plan: 'balanced',
    color: '#2f6fa5'
  };
  const START_MENU_ITEMS = {
    campaign: {
      label: 'Kampagne gegen KI',
      detail: 'Weltkarte, Bosswellen und Reichsfortschritt.',
      tone: 'blue',
      rank: 'primary'
    },
    skirmish: {
      label: 'Gefechtsmodus',
      detail: 'Trainiere Kriege gegen KI mit Karte, Gegnern und Schwierigkeit.',
      tone: 'red',
      rank: 'primary'
    },
    online: {
      label: 'Online 1v1',
      detail: 'Erstelle oder betrete Räume für echte Duelle.',
      tone: 'green',
      rank: 'primary'
    },
    map: {
      label: 'Weltkarte',
      detail: 'Regionen, Bosse und deinen Feldzug ansehen.',
      tone: 'gold',
      rank: 'secondary'
    },
    license: {
      label: 'Lizenz aktivieren',
      detail: 'Vollversion freischalten und Welle 6+ spielen.',
      tone: 'violet',
      rank: 'secondary'
    },
    buy: {
      label: 'Kaufen 10,99 EUR',
      detail: 'Einmaliger Kauf für die Vollversion.',
      tone: 'gold',
      rank: 'secondary'
    },
    legends: {
      label: 'Legenden von MASTIL',
      detail: 'Reiche, Helden, Bosse und Geschichte.',
      tone: 'blue',
      rank: 'secondary'
    },
    options: {
      label: 'Optionen',
      detail: 'Grafik, Audio und Online-Server einstellen.',
      tone: 'green',
      rank: 'utility'
    },
    highscores: {
      label: 'Highscore-Liste',
      detail: 'Beste Herrscher und erreichte Wellen.',
      tone: 'gold',
      rank: 'utility'
    },
    progress: {
      label: 'Auszeichnungen',
      detail: 'Erfolge, Ziele und freigeschalteter Ruhm.',
      tone: 'red',
      rank: 'utility'
    },
    credits: {
      label: 'Credits',
      detail: 'Studio, Versionen und Projektinformationen.',
      tone: 'violet',
      rank: 'utility'
    }
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
    updateMenuDashboard();
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

  function readSkirmishConfig() {
    try {
      return { ...DEFAULT_SKIRMISH, ...JSON.parse(localStorage.getItem(SKIRMISH_KEY) || '{}') };
    } catch {
      return { ...DEFAULT_SKIRMISH };
    }
  }

  function saveSkirmishConfig(config) {
    const next = { ...DEFAULT_SKIRMISH, ...config };
    try {
      localStorage.setItem(SKIRMISH_KEY, JSON.stringify(next));
    } catch {
      // Lokale Speicherung darf den Spielstart nicht blockieren.
    }
    window.MASTIL_MATCH_CONFIG = next;
    return next;
  }

  function getBestWave() {
    try {
      const highscores = JSON.parse(localStorage.getItem('highscores') || '[]');
      return Array.isArray(highscores)
        ? highscores.reduce((best, entry) => Math.max(best, Number(entry.wave) || 1), 1)
        : 1;
    } catch {
      return 1;
    }
  }

  function getRegionProgress(region, bestWave) {
    const start = Number(region.waves.split('-')[0]);
    const end = Number(region.waves.split('-')[1]);
    if (bestWave >= end) return 'Gesichert';
    if (bestWave >= start) return 'Aktiv';
    return 'Verschlossen';
  }

  function getRegionById(id) {
    return WORLD_REGIONS.find((region) => region.id === id) || WORLD_REGIONS[0];
  }

  function getSkirmishFieldValues() {
    const saved = readSkirmishConfig();
    return {
      mapId: (byId('mastil-skirmish-map') && byId('mastil-skirmish-map').value) || saved.mapId,
      size: (byId('mastil-skirmish-size') && byId('mastil-skirmish-size').value) || saved.size,
      difficulty: (byId('mastil-skirmish-difficulty') && byId('mastil-skirmish-difficulty').value) || saved.difficulty,
      opponents: Number((byId('mastil-skirmish-opponents') && byId('mastil-skirmish-opponents').value) || saved.opponents),
      plan: (byId('mastil-skirmish-plan') && byId('mastil-skirmish-plan').value) || saved.plan,
      color: (byId('mastil-skirmish-color') && byId('mastil-skirmish-color').value) || saved.color
    };
  }

  function renderSkirmishBrief() {
    const brief = byId('mastil-skirmish-brief');
    const values = getSkirmishFieldValues();
    const region = getRegionById(values.mapId);
    const size = SKIRMISH_SIZES[values.size] || SKIRMISH_SIZES.standard;
    const difficulty = SKIRMISH_DIFFICULTIES[values.difficulty] || SKIRMISH_DIFFICULTIES.normal;
    const plan = SKIRMISH_PLANS[values.plan] || SKIRMISH_PLANS.balanced;
    const opponentText = `${Math.max(1, Math.min(3, values.opponents || 1))} KI-Reich${Number(values.opponents) === 1 ? '' : 'e'}`;

    document.querySelectorAll('.mastil-world-card[data-region-id]').forEach((card) => {
      card.classList.toggle('selected', card.dataset.regionId === region.id);
    });
    if (!brief) return;
    brief.innerHTML = `
      <strong>${region.title}: ${region.style}</strong>
      <span>${region.terrain}. ${size.towers}, ${size.detail}. ${opponentText}, ${difficulty.label.toLowerCase()}: ${difficulty.detail}. ${plan.label}: ${plan.detail}</span>
      <em style="--chosen-color:${values.color || '#2f6fa5'}"><i></i> Eure Reichsfarbe wird auf alle eigenen Türme übertragen.</em>
    `;
  }

  function createWorldMapModal() {
    if (byId('mastil-world-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'mastil-world-modal';
    modal.className = 'mastil-modal mastil-world-modal';
    modal.innerHTML = `
      <div class="mastil-dialog mastil-world-dialog" role="dialog" aria-modal="true" aria-labelledby="mastil-world-title">
        <button class="mastil-action secondary mastil-close-x" id="mastil-world-x-btn" type="button" aria-label="Schließen">×</button>
        <div class="mastil-world-head">
          <span>Weltkarte</span>
          <h2 id="mastil-world-title">Die Reiche von MASTIL</h2>
          <p>Wähle Kampagne oder Gefecht. Im Gefechtsmodus bestimmst du Karte, Gegner, Größe, Farbe und Kriegsart.</p>
        </div>
        <div class="mastil-world-grid" id="mastil-world-grid"></div>
        <div class="mastil-skirmish-panel">
          <h3>Gefechtsmodus</h3>
          <div class="mastil-skirmish-options">
            <label>Karte<select id="mastil-skirmish-map"></select></label>
            <label>Größe<select id="mastil-skirmish-size">
              <option value="compact">Kompakt</option>
              <option value="standard">Standard</option>
              <option value="large">Groß</option>
              <option value="war">Kriegskarte</option>
              <option value="epic">Reichskrieg</option>
            </select></label>
            <label>Schwierigkeit<select id="mastil-skirmish-difficulty">
              <option value="easy">Training</option>
              <option value="normal">Normal</option>
              <option value="hard">Hart</option>
              <option value="brutal">Brutal</option>
            </select></label>
            <label>Gegner<select id="mastil-skirmish-opponents">
              <option value="1">1 KI-Reich</option>
              <option value="2">2 KI-Reiche</option>
              <option value="3">3 KI-Reiche</option>
            </select></label>
            <label>KI-Plan<select id="mastil-skirmish-plan">
              <option value="balanced">Ausgewogen</option>
              <option value="raiders">Plünderer</option>
              <option value="fortress">Festungskrieg</option>
              <option value="economy">Handelskrieg</option>
              <option value="conquest">Reichskrieg</option>
            </select></label>
            <label>Farbe<input id="mastil-skirmish-color" type="color" value="#2f6fa5"></label>
          </div>
          <div class="mastil-skirmish-brief" id="mastil-skirmish-brief"></div>
        </div>
        <div class="mastil-actions">
          <button class="mastil-action" id="mastil-start-campaign-btn" type="button">Kampagne starten</button>
          <button class="mastil-action" id="mastil-start-skirmish-btn" type="button">Gefecht starten</button>
          <button class="mastil-action secondary" id="mastil-world-close-btn" type="button">Schließen</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const mapSelect = byId('mastil-skirmish-map');
    if (mapSelect) {
      mapSelect.innerHTML = WORLD_REGIONS.map((region) => `<option value="${region.id}">${region.title}</option>`).join('');
    }

    byId('mastil-world-close-btn').addEventListener('click', hideWorldMap);
    byId('mastil-world-x-btn').addEventListener('click', hideWorldMap);
    byId('mastil-start-campaign-btn').addEventListener('click', () => startConfiguredMatch('campaign'));
    byId('mastil-start-skirmish-btn').addEventListener('click', () => startConfiguredMatch('skirmish'));
    byId('mastil-world-grid').addEventListener('click', (event) => {
      const card = event.target && event.target.closest ? event.target.closest('[data-region-id]') : null;
      if (!card) return;
      const mapSelect = byId('mastil-skirmish-map');
      if (mapSelect) mapSelect.value = card.dataset.regionId;
      renderSkirmishBrief();
    });
    ['mastil-skirmish-map', 'mastil-skirmish-size', 'mastil-skirmish-difficulty', 'mastil-skirmish-opponents', 'mastil-skirmish-plan', 'mastil-skirmish-color']
      .forEach((id) => {
        const field = byId(id);
        if (field) {
          field.addEventListener('input', renderSkirmishBrief);
          field.addEventListener('change', renderSkirmishBrief);
        }
      });
  }

  function renderWorldMap(mode = 'campaign') {
    createWorldMapModal();
    const bestWave = getBestWave();
    const config = readSkirmishConfig();
    const grid = byId('mastil-world-grid');
    if (grid) {
      grid.innerHTML = WORLD_REGIONS.map((region, index) => {
        const progress = getRegionProgress(region, bestWave);
        return `
          <button class="mastil-world-card ${progress.toLowerCase()}" type="button" data-region-id="${region.id}" style="--world-image: url('${region.image}')">
            <span>Kapitel ${index + 1}</span>
            <strong>${region.title}</strong>
            <small>Wellen ${region.waves} | ${region.difficulty}</small>
            <small>${region.terrain}</small>
            <em>Boss: ${region.boss}</em>
            <b>${progress}</b>
          </button>
        `;
      }).join('');
    }

    const fields = {
      mapId: byId('mastil-skirmish-map'),
      size: byId('mastil-skirmish-size'),
      difficulty: byId('mastil-skirmish-difficulty'),
      opponents: byId('mastil-skirmish-opponents'),
      plan: byId('mastil-skirmish-plan'),
      color: byId('mastil-skirmish-color')
    };
    if (fields.mapId) fields.mapId.value = config.mapId;
    if (fields.size) fields.size.value = config.size;
    if (fields.difficulty) fields.difficulty.value = config.difficulty;
    if (fields.opponents) fields.opponents.value = String(config.opponents);
    if (fields.plan) fields.plan.value = config.plan || DEFAULT_SKIRMISH.plan;
    if (fields.color) fields.color.value = config.color;

    const campaign = byId('mastil-start-campaign-btn');
    if (campaign) campaign.style.display = mode === 'skirmish' ? 'none' : '';
    renderSkirmishBrief();
  }

  function showWorldMap(mode = 'campaign') {
    renderWorldMap(mode);
    const modal = byId('mastil-world-modal');
    if (modal) modal.classList.add('active');
  }

  function hideWorldMap() {
    const modal = byId('mastil-world-modal');
    if (modal) modal.classList.remove('active');
  }

  function readBattleOptions(mode) {
    const values = getSkirmishFieldValues();
    if (mode === 'campaign') return { ...DEFAULT_SKIRMISH, mode: 'campaign', color: values.color };
    return {
      mode: 'skirmish',
      mapId: values.mapId,
      size: values.size,
      difficulty: values.difficulty,
      opponents: Math.max(1, Math.min(3, values.opponents)),
      plan: values.plan,
      color: values.color
    };
  }

  function startConfiguredMatch(mode) {
    saveSkirmishConfig(readBattleOptions(mode));
    hideWorldMap();
    if (typeof window.startGame === 'function') {
      window.startGame();
    } else if (typeof startGame === 'function') {
      startGame();
    }
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

  function getBackendInputValue() {
    return String(localStorage.getItem('mastil-backend-url') || (window.MASTIL_WEB_CONFIG && window.MASTIL_WEB_CONFIG.backendUrl) || '').trim();
  }

  function installBackendOptions() {
    const modal = byId('options-modal');
    if (!modal || byId('mastil-backend-url')) return;
    const closeButton = byId('options-close-btn');
    const row = document.createElement('div');
    row.className = 'mastil-backend-options';
    row.innerHTML = `
      <span class="option-label">Online-Server:</span>
      <div class="mastil-backend-control">
        <input id="mastil-backend-url" type="url" placeholder="https://api.mastil.online">
        <button class="option-btn" id="mastil-backend-save-btn" type="button">Speichern</button>
        <button class="option-btn" id="mastil-backend-test-btn" type="button">Test</button>
        <small id="mastil-backend-status">Offline gegen KI funktioniert ohne Server.</small>
      </div>
    `;
    modal.insertBefore(row, closeButton || null);
    const input = byId('mastil-backend-url');
    if (input) input.value = getBackendInputValue();
    byId('mastil-backend-save-btn').addEventListener('click', () => {
      const value = input.value.trim().replace(/\/+$/, '');
      localStorage.setItem('mastil-backend-url', value);
      if (window.MastilLicense && typeof window.MastilLicense.setBackendUrl === 'function') {
        window.MastilLicense.setBackendUrl(value);
      }
      byId('mastil-backend-status').textContent = value ? 'Server-Adresse gespeichert.' : 'Server entfernt. Offline bleibt spielbar.';
    });
    byId('mastil-backend-test-btn').addEventListener('click', testBackendConnection);
  }

  async function testBackendConnection() {
    const input = byId('mastil-backend-url');
    const status = byId('mastil-backend-status');
    const value = input ? input.value.trim().replace(/\/+$/, '') : '';
    if (!status) return;
    if (!value) {
      status.textContent = 'Keine Server-Adresse eingetragen.';
      return;
    }
    status.textContent = 'Verbindung wird geprüft...';
    try {
      const response = await fetch(`${value}/health`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      status.textContent = 'Online-Server erreichbar.';
    } catch {
      status.textContent = 'Noch nicht erreichbar. Offline-Spiel bleibt aktiv.';
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

  function getMenuRegion(bestWave) {
    return WORLD_REGIONS.find((region) => {
      const end = Number(region.waves.split('-')[1]);
      return bestWave <= end;
    }) || WORLD_REGIONS[WORLD_REGIONS.length - 1];
  }

  function parseRegionWaveRange(region) {
    const parts = String(region.waves || '1-1').split('-').map((value) => Number(value) || 1);
    return { start: parts[0], end: parts[1] || parts[0] };
  }

  function getBackendStatusText() {
    const webConfig = window.MASTIL_WEB_CONFIG || {};
    const value = String(localStorage.getItem('mastil-backend-url') || webConfig.backendUrl || '').trim();
    if (!value) return 'Offline bereit';
    return value.includes('localhost') || value.includes('127.0.0.1') ? 'Lokaler Server' : 'Server gesetzt';
  }

  function updateMenuDashboard() {
    const bestWave = getBestWave();
    const region = getMenuRegion(bestWave);
    const progress = getRegionProgress(region, bestWave);
    const current = byId('mastil-menu-current-region');
    const boss = byId('mastil-menu-next-boss');
    const license = byId('mastil-menu-license-state');
    const online = byId('mastil-menu-online-state');
    const skirmish = byId('mastil-menu-skirmish-state');
    const skirmishDetail = byId('mastil-menu-skirmish-detail');
    const footer = byId('mastil-menu-footer-state');
    const saved = readSkirmishConfig();
    const savedRegion = getRegionById(saved.mapId);
    const savedSize = SKIRMISH_SIZES[saved.size] || SKIRMISH_SIZES.standard;
    const savedDifficulty = SKIRMISH_DIFFICULTIES[saved.difficulty] || SKIRMISH_DIFFICULTIES.normal;
    const savedPlan = SKIRMISH_PLANS[saved.plan] || SKIRMISH_PLANS.balanced;

    if (current) current.textContent = `${region.title} | ${progress}`;
    if (boss) boss.textContent = `Bestwelle ${bestWave} | Boss: ${region.boss}`;
    if (license) license.textContent = state.licenseActive ? 'Vollversion aktiv' : 'Demo bis Welle 5';
    if (online) online.textContent = getBackendStatusText();
    if (skirmish) skirmish.textContent = `${savedSize.label} | ${savedDifficulty.label}`;
    if (skirmishDetail) skirmishDetail.textContent = `${savedRegion.title}, ${saved.opponents} KI, ${savedPlan.label}`;
    if (footer) footer.textContent = state.licenseActive
      ? 'Vollversion: alle Wellen freigeschaltet'
      : 'Demo aktiv: Kampagne frei bis Welle 5';

    const menu = document.querySelector('#start-screen .menu-container');
    if (menu) {
      menu.dataset.currentRegion = region.id;
      menu.style.setProperty('--menu-current-image', `url("${region.image}")`);
    }

    document.querySelectorAll('.mastil-menu-region-step').forEach((step) => {
      const stepRegion = getRegionById(step.dataset.regionId || '');
      if (!stepRegion) return;
      const range = parseRegionWaveRange(stepRegion);
      const unlocked = state.licenseActive || range.start <= 5 || bestWave >= range.start;
      const cleared = bestWave > range.end;
      const active = stepRegion.id === region.id && !cleared;
      step.classList.toggle('active', active);
      step.classList.toggle('cleared', cleared);
      step.classList.toggle('locked', !unlocked);
      const stateLabel = step.querySelector('.mastil-menu-region-state');
      if (stateLabel) {
        stateLabel.textContent = cleared ? 'Gesichert' : active ? 'Aktiv' : unlocked ? 'Bereit' : 'Gesperrt';
      }
    });
  }

  function decorateMenuButton(button, key, handler) {
    const item = START_MENU_ITEMS[key] || {
      label: button.textContent.trim(),
      detail: '',
      tone: 'gold',
      rank: 'utility'
    };

    button.classList.add('mastil-menu-item', `mastil-menu-${item.rank}`, `mastil-menu-tone-${item.tone}`);
    button.dataset.menuKey = key;
    button.type = 'button';
    button.innerHTML = `
      <span class="mastil-menu-icon mastil-menu-icon-${key}" aria-hidden="true"></span>
      <span class="mastil-menu-copy">
        <span class="button-text">${item.label}</span>
        <small>${item.detail}</small>
      </span>
    `;

    if (handler) {
      button.removeAttribute('onclick');
      button.addEventListener('click', handler);
    }
  }

  function buildMenuButton(key, handler) {
    const item = START_MENU_ITEMS[key];
    const button = document.createElement('button');
    button.className = 'menu-button';
    decorateMenuButton(button, key, handler);
    return button;
  }

  function ensureMenuFrame(menu) {
    if (!menu.querySelector('.mastil-menu-header')) {
      const header = document.createElement('div');
      header.className = 'mastil-menu-header';
      header.innerHTML = `
        <div class="mastil-menu-titleline">
          <div>
            <span>Kommandozelt</span>
            <strong>Hauptquartier von MASTIL</strong>
            <p>Plane deinen Feldzug, starte ein Gefecht oder öffne Archiv, Weltkarte und Online-Duell direkt aus einer Zentrale.</p>
          </div>
          <div class="mastil-menu-seal" aria-hidden="true">
            <img src="../../assets/branding/mastil-logo.png" alt="">
          </div>
        </div>
        <div class="mastil-menu-badges" aria-label="Spielstatus">
          <small>Offline spielbar</small>
          <small id="mastil-menu-footer-state">Demo aktiv</small>
          <small>Web und Windows</small>
        </div>
      `;
      menu.prepend(header);
    }

    if (!menu.querySelector('.mastil-menu-dashboard')) {
      const dashboard = document.createElement('div');
      dashboard.className = 'mastil-menu-dashboard';
      dashboard.innerHTML = `
        <article>
          <span>Aktuelle Front</span>
          <strong id="mastil-menu-current-region">Startgebiet</strong>
          <small id="mastil-menu-next-boss">Bestwelle 1 | Boss: Grenzwacht Roderich</small>
        </article>
        <article>
          <span>Freischaltung</span>
          <strong id="mastil-menu-license-state">Demo bis Welle 5</strong>
          <small>Kauf und Aktivierung bleiben im Spielmenü erreichbar.</small>
        </article>
        <article>
          <span>Online-Basis</span>
          <strong id="mastil-menu-online-state">Offline bereit</strong>
          <small>GitHub hostet die Seite, der MASTIL-Server die Duelle.</small>
        </article>
        <article>
          <span>Gefechtsplan</span>
          <strong id="mastil-menu-skirmish-state">Standard | Normal</strong>
          <small id="mastil-menu-skirmish-detail">Startgebiet, 2 KI, Ausgewogen</small>
        </article>
      `;
      const header = menu.querySelector('.mastil-menu-header');
      if (header && header.nextSibling) {
        menu.insertBefore(dashboard, header.nextSibling);
      } else if (header) {
        menu.appendChild(dashboard);
      } else {
        menu.prepend(dashboard);
      }
    }

    if (!menu.querySelector('.mastil-menu-warpath')) {
      const warpath = document.createElement('div');
      warpath.className = 'mastil-menu-warpath';
      warpath.innerHTML = `
        <div class="mastil-menu-warpath-head">
          <span>Weltpfad</span>
          <strong>5 Reiche, 5 Bossfronten</strong>
        </div>
        <div class="mastil-menu-region-list" aria-label="Weltpfad und Bossfronten"></div>
      `;

      const list = warpath.querySelector('.mastil-menu-region-list');
      if (list) {
        WORLD_REGIONS.forEach((region, index) => {
          const step = document.createElement('button');
          step.className = 'mastil-menu-region-step';
          step.type = 'button';
          step.dataset.regionId = region.id;
          step.style.setProperty('--region-image', `url("${region.image}")`);
          step.innerHTML = `
            <span class="mastil-menu-region-index">${index + 1}</span>
            <span class="mastil-menu-region-copy">
              <strong>${region.title}</strong>
              <small>Wellen ${region.waves} | ${region.boss}</small>
              <em>${region.terrain}</em>
            </span>
            <span class="mastil-menu-region-state">Bereit</span>
          `;
          step.addEventListener('click', () => showWorldMap('campaign'));
          list.appendChild(step);
        });
      }

      const dashboard = menu.querySelector('.mastil-menu-dashboard');
      if (dashboard && dashboard.nextSibling) {
        menu.insertBefore(warpath, dashboard.nextSibling);
      } else if (dashboard) {
        menu.appendChild(warpath);
      } else {
        menu.prepend(warpath);
      }
    }

    if (!menu.querySelector('.mastil-menu-footer')) {
      const footer = document.createElement('div');
      footer.className = 'mastil-menu-footer';
      footer.innerHTML = `
        <span>MASTIL Weltstatus</span>
        <strong>GitHub Pages für Website, MASTIL-Server für Online-Spiel</strong>
      `;
      menu.appendChild(footer);
    }

    updateMenuDashboard();
  }

  function enhanceMenu() {
    const menu = document.querySelector('#start-screen .menu-container');
    if (!menu || menu.dataset.mastilEnhanced === 'true') return;
    menu.dataset.mastilEnhanced = 'true';
    ensureMenuFrame(menu);

    const firstButton = menu.querySelector('.menu-button');
    if (firstButton) {
      decorateMenuButton(firstButton, 'campaign', () => showWorldMap('campaign'));
    }

    const insertAfter = firstButton ? firstButton.nextSibling : null;
    menu.insertBefore(buildMenuButton('skirmish', () => showWorldMap('skirmish')), insertAfter);
    menu.insertBefore(buildMenuButton('online', () => window.MastilOnline.open()), insertAfter);
    menu.insertBefore(buildMenuButton('map', () => showWorldMap('campaign')), insertAfter);
    menu.insertBefore(buildMenuButton('license', () => showLicenseModal('')), insertAfter);
    menu.insertBefore(buildMenuButton('buy', () => showLicenseModal('Zum Kaufen bitte E-Mail eintragen.')), insertAfter);

    const legacyButtons = Array.from(menu.querySelectorAll('.menu-button:not([data-menu-key])'));
    legacyButtons.forEach((button) => {
      const text = button.textContent.trim();
      if (text.includes('Legenden')) decorateMenuButton(button, 'legends');
      else if (text.includes('Optionen')) decorateMenuButton(button, 'options');
      else if (text.includes('Highscore')) decorateMenuButton(button, 'highscores');
      else if (text.includes('Credits')) decorateMenuButton(button, 'credits');
    });

    const highscoreButton = Array.from(menu.querySelectorAll('.menu-button')).find((button) => button.textContent.includes('Highscore'));
    const progressButton = buildMenuButton('progress', showProgressModal);
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
    createWorldMapModal();
    addBranding();
    enhanceMenu();
    installBackendOptions();
    installDemoGate();
    await refreshLicenseBadge();
  }

  window.MastilShell = {
    init,
    showLicenseModal,
    hideLicenseModal,
    showProgressModal,
    showWorldMap,
    refreshLicenseBadge
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
