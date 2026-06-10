(function initMastilShell() {
  const state = {
    initialized: false,
    licenseActive: false
  };
  const SKIRMISH_KEY = 'mastil-skirmish-config';
  const CAMPAIGN_PROGRESS_KEY = 'mastil-campaign-progress';
  const WORLD_REGIONS = [
    {
      id: 'startgebiet',
      title: 'Startgebiet',
      waves: '1-5',
      boss: 'Grenzwacht Roderich',
      difficulty: 'Einsteiger',
      terrain: 'Wiesen, Wege, erste Burgen',
      style: 'Ausgewogen',
      goal: 'Kronlande sichern',
      reward: 'Startreserve und sicherer Ausbau',
      tactic: 'Neutrale Orte nehmen, dann Wege schließen.',
      image: '../../assets/backgrounds/worlds/world-01-startgebiet.png'
    },
    {
      id: 'grenzlande',
      title: 'Grenzlande',
      waves: '6-10',
      boss: 'Der Eisenvogt',
      difficulty: 'Normal',
      terrain: 'Engpässe, Signalhöhen, Frontdruck',
      style: 'Verteidigung',
      goal: 'Grenzstraßen halten',
      reward: 'Schnellere Befehle und stärkere Front',
      tactic: 'Engpässe befestigen, bevor der Eisenvogt drückt.',
      image: '../../assets/backgrounds/worlds/world-02-grenzlande.png'
    },
    {
      id: 'wuestenreich',
      title: 'Wüstenreich',
      waves: '11-15',
      boss: 'Sultan der Sandkrone',
      difficulty: 'Hart',
      terrain: 'Märkte, Steinbrüche, weite Wege',
      style: 'Wirtschaft',
      goal: 'Sandschatz sichern',
      reward: 'Großer Goldzug für Festungen',
      tactic: 'Märkte halten, sonst werden lange Wege teuer.',
      image: '../../assets/backgrounds/worlds/world-03-wuestenreich.png'
    },
    {
      id: 'nachtfestung',
      title: 'Nachtfestung',
      waves: '16-20',
      boss: 'Nachtgraf Malrec',
      difficulty: 'Sehr hart',
      terrain: 'Waldsaum, Hinterhalte, Nachtwege',
      style: 'Taktik',
      goal: 'Schattenwall brechen',
      reward: 'Befestigte Linien und Gegenmanöver',
      tactic: 'Ziele markieren und Nebenwege nie offen lassen.',
      image: '../../assets/backgrounds/worlds/world-04-nachtfestung.png'
    },
    {
      id: 'endboss',
      title: 'Endboss-Zitadelle',
      waves: '21-25',
      boss: 'Kaiser Veyron',
      difficulty: 'Endboss',
      terrain: 'Zitadellen, Aschefelder, Bossfront',
      style: 'Belagerung',
      goal: 'Kaisersturz',
      reward: 'Letzter Heerbann und Ruhm der Reiche',
      tactic: 'Außenburgen brechen, dann die Zitadelle stürmen.',
      image: '../../assets/backgrounds/worlds/world-05-endboss-zitadelle.png'
    }
  ];
  const SKIRMISH_SIZES = {
    compact: { label: 'Kompakt', towers: '10 Orte', detail: 'schnelle Trainingsrunde mit kurzer Front' },
    standard: { label: 'Standard', towers: '14 Orte', detail: 'klassische Karte mit klarer Mitte und Nebenroute' },
    large: { label: 'Groß', towers: '18 Orte', detail: 'mehr Burgen, Außenposten und längere Versorgungslinien' },
    war: { label: 'Kriegskarte', towers: '21 Orte', detail: 'volle Weltkarte mit seitlicher Vorburg' },
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
  const SKIRMISH_SCENARIOS = {
    training: {
      label: 'Training',
      detail: 'ruhige Übung gegen ein KI-Reich mit klaren Wegen.',
      mapId: 'startgebiet',
      size: 'compact',
      difficulty: 'easy',
      opponents: 1,
      plan: 'balanced',
      color: '#2f6fa5'
    },
    siege: {
      label: 'Belagerung',
      detail: 'harte Burgfront mit mehr Mauern, Wachtürmen und Belagerungszielen.',
      mapId: 'grenzlande',
      size: 'large',
      difficulty: 'hard',
      opponents: 2,
      plan: 'fortress',
      color: '#8f4d2e'
    },
    trade: {
      label: 'Handelskrieg',
      detail: 'lange Routen, Märkte und Goldentscheidungen auf weiter Karte.',
      mapId: 'wuestenreich',
      size: 'large',
      difficulty: 'normal',
      opponents: 2,
      plan: 'economy',
      color: '#2e7a68'
    },
    shadow: {
      label: 'Schattenkrieg',
      detail: 'schnelle Überfälle, Waldwege und drei aktive KI-Kommandanten.',
      mapId: 'nachtfestung',
      size: 'war',
      difficulty: 'hard',
      opponents: 3,
      plan: 'raiders',
      color: '#4f5f95'
    },
    boss: {
      label: 'Endboss-Schlacht',
      detail: 'maximale Karte mit Zitadellen, drei KI-Reichen und Bossdruck ab Start.',
      mapId: 'endboss',
      size: 'epic',
      difficulty: 'brutal',
      opponents: 3,
      plan: 'conquest',
      color: '#7b2f2a'
    }
  };
  const SKIRMISH_PREVIEW_NODES = [
    { x: 0.16, y: 0.52, role: 'player', rank: 0, terrain: 'keep' },
    { x: 0.29, y: 0.39, role: 'neutral', rank: 1, terrain: 'hill' },
    { x: 0.30, y: 0.66, role: 'neutral', rank: 1, terrain: 'market' },
    { x: 0.43, y: 0.27, role: 'neutral', rank: 2, terrain: 'barracks' },
    { x: 0.46, y: 0.53, role: 'neutral', rank: 2, terrain: 'road' },
    { x: 0.46, y: 0.78, role: 'neutral', rank: 2, terrain: 'ford' },
    { x: 0.60, y: 0.37, role: 'neutral', rank: 3, terrain: 'market' },
    { x: 0.62, y: 0.64, role: 'neutral', rank: 3, terrain: 'forest' },
    { x: 0.74, y: 0.23, role: 'enemy', rank: 4, terrain: 'barracks' },
    { x: 0.79, y: 0.52, role: 'enemy', rank: 4, terrain: 'road' },
    { x: 0.72, y: 0.80, role: 'enemy', rank: 4, terrain: 'market' },
    { x: 0.88, y: 0.36, role: 'enemy', rank: 5, terrain: 'hill' },
    { x: 0.90, y: 0.68, role: 'enemy', rank: 5, terrain: 'forest' },
    { x: 0.22, y: 0.20, role: 'neutral', rank: 6, terrain: 'quarry' },
    { x: 0.22, y: 0.84, role: 'neutral', rank: 6, terrain: 'ford' },
    { x: 0.55, y: 0.16, role: 'enemy', rank: 7, terrain: 'hill' },
    { x: 0.56, y: 0.88, role: 'enemy', rank: 7, terrain: 'keep' },
    { x: 0.38, y: 0.13, role: 'neutral', rank: 8, terrain: 'forest' },
    { x: 0.39, y: 0.90, role: 'neutral', rank: 8, terrain: 'market' },
    { x: 0.93, y: 0.50, role: 'enemy', rank: 9, terrain: 'keep' },
    { x: 0.08, y: 0.30, role: 'neutral', rank: 10, terrain: 'hill' },
    { x: 0.08, y: 0.74, role: 'neutral', rank: 10, terrain: 'market' },
    { x: 0.68, y: 0.08, role: 'enemy', rank: 10, terrain: 'keep' },
    { x: 0.68, y: 0.92, role: 'enemy', rank: 10, terrain: 'keep' }
  ];
  const SKIRMISH_PREVIEW_LINKS = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5],
    [3, 6], [4, 6], [4, 7], [5, 7], [6, 8], [6, 9],
    [7, 9], [7, 10], [8, 11], [9, 11], [9, 12], [10, 12],
    [3, 13], [5, 14], [13, 17], [14, 18], [8, 15], [10, 16],
    [15, 11], [16, 12], [11, 19], [12, 19], [4, 9],
    [0, 20], [20, 1], [20, 13], [0, 21], [21, 2], [21, 14],
    [15, 22], [22, 8], [22, 11], [22, 19], [16, 23], [23, 10], [23, 12], [23, 19]
  ];
  const SKIRMISH_FORMATIONS = {
    compact: {
      startRank: 0,
      sideStarts: [],
      enemyForward: [8],
      strongholds: [9],
      objectives: [4, 6, 7],
      extraLinks: [[4, 8], [7, 10]]
    },
    standard: {
      startRank: 1,
      sideStarts: [],
      enemyForward: [8, 10],
      strongholds: [11, 12],
      objectives: [4, 6, 7, 9],
      extraLinks: [[4, 8], [6, 10], [7, 12]]
    },
    large: {
      startRank: 1,
      sideStarts: [],
      enemyForward: [8, 10, 15, 16],
      strongholds: [11, 12, 16],
      objectives: [4, 6, 7, 13, 14],
      extraLinks: [[13, 4], [14, 7], [15, 6], [16, 7], [17, 3], [18, 5]]
    },
    war: {
      startRank: 1,
      sideStarts: [20],
      enemyForward: [8, 10, 15, 16, 19],
      strongholds: [11, 12, 19],
      objectives: [4, 6, 7, 13, 14, 20],
      extraLinks: [[20, 4], [20, 13], [13, 6], [14, 7], [15, 9], [16, 9]]
    },
    epic: {
      startRank: 2,
      sideStarts: [20, 21],
      enemyForward: [8, 10, 15, 16, 19, 22, 23],
      strongholds: [11, 12, 19, 22, 23],
      objectives: [4, 6, 7, 13, 14, 17, 18, 20, 21],
      extraLinks: [[20, 4], [21, 4], [13, 6], [14, 7], [17, 3], [18, 5], [22, 9], [23, 9]]
    }
  };
  const SKIRMISH_TERRAIN_LABELS = {
    keep: 'Burg',
    hill: 'Höhe',
    market: 'Markt',
    barracks: 'Heer',
    road: 'Weg',
    ford: 'Furt',
    forest: 'Wald',
    quarry: 'Stein'
  };
  const DEFAULT_SKIRMISH = {
    mode: 'campaign',
    scenario: 'training',
    mapId: 'startgebiet',
    size: 'standard',
    difficulty: 'normal',
    opponents: 2,
    plan: 'balanced',
    color: '#2f6fa5'
  };
  const STAR_COUNCIL_PERKS = [
    {
      id: 'treasury',
      stars: 3,
      title: 'Kronkasse',
      detail: 'Startgold für frühe Ausbauten'
    },
    {
      id: 'vanguard',
      stars: 6,
      title: 'Vorhut',
      detail: 'Mehr Truppen auf Startburgen'
    },
    {
      id: 'bulwark',
      stars: 9,
      title: 'Sternenwall',
      detail: 'Startschutz für die Front'
    },
    {
      id: 'warCouncil',
      stars: 12,
      title: 'Kriegsrat',
      detail: 'Mehr Zeit vor KI-Druck'
    },
    {
      id: 'realmLegend',
      stars: 15,
      title: 'Reichslegende',
      detail: 'Ruhm und Reserve für die Kronburg'
    }
  ];
  const START_MENU_ITEMS = {
    campaign: {
      label: 'Kampagne gegen KI',
      detail: 'Starte vom Weltpfad aus, besiege Bosswellen und sichere Reich um Reich.',
      command: 'Feldzug starten',
      tone: 'blue',
      rank: 'primary'
    },
    skirmish: {
      label: 'Gefechtsmodus',
      detail: 'Karte, Reichsfarbe, Gegnerzahl und Schwierigkeit frei wählen.',
      command: 'Krieg üben',
      tone: 'red',
      rank: 'primary'
    },
    online: {
      label: 'Online 1v1',
      detail: 'Räume erstellen oder betreten, sobald dein MASTIL-Server verbunden ist.',
      command: 'Duell öffnen',
      tone: 'green',
      rank: 'primary'
    },
    map: {
      label: 'Weltkarte',
      detail: 'Regionen, Bosse und deinen Feldzug ansehen.',
      command: 'Karte ansehen',
      tone: 'gold',
      rank: 'secondary'
    },
    license: {
      label: 'Lizenz aktivieren',
      detail: 'Vollversion freischalten und Welle 6+ spielen.',
      command: 'Freischalten',
      tone: 'violet',
      rank: 'secondary'
    },
    buy: {
      label: 'Kaufen 10,99 EUR',
      detail: 'Einmaliger Kauf für die Vollversion.',
      command: 'Kauf öffnen',
      tone: 'gold',
      rank: 'secondary'
    },
    legends: {
      label: 'Legenden von MASTIL',
      detail: 'Reiche, Helden, Bosse, Spielweise und Ursprung der Welt.',
      command: 'Archiv',
      tone: 'blue',
      rank: 'secondary'
    },
    options: {
      label: 'Optionen',
      detail: 'Grafik, Audio und Online-Server einstellen.',
      command: 'Einstellen',
      tone: 'green',
      rank: 'utility'
    },
    highscores: {
      label: 'Highscore-Liste',
      detail: 'Beste Herrscher und erreichte Wellen.',
      command: 'Rangliste',
      tone: 'gold',
      rank: 'utility'
    },
    progress: {
      label: 'Ruhm und Kampagne',
      detail: 'Regionen, Sterne, Erfolge und freigeschalteter Ruhm.',
      command: 'Fortschritt',
      tone: 'red',
      rank: 'utility'
    },
    credits: {
      label: 'Credits',
      detail: 'Studio, Versionen und Projektinformationen.',
      command: 'Projekt',
      tone: 'violet',
      rank: 'utility'
    }
  };

  const MENU_BRIEFINGS = {
    startgebiet: 'Sichere zuerst die nahen Wege, nimm neutrale Orte sauber ein und baue eine stabile Linie vor der Grenzwacht.',
    grenzlande: 'Halte Engpässe, verstärke Kreuzungen und greife nicht einzeln an. Der Eisenvogt bestraft offene Flanken.',
    wuestenreich: 'Schütze Märkte und lange Straßen. Einkommen gewinnt hier nur, wenn deine Versorgung nicht aufbricht.',
    nachtfestung: 'Plane langsamer, markiere Ziele und rechne mit Gegenangriffen aus Nebenwegen. Die Nachtfestung lebt von Hinterhalten.',
    endboss: 'Sammle Reserven, breche Außenburgen und schlage erst dann gegen die Zitadelle. Kaiser Veyron duldet keine halben Angriffe.'
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
        <h2 id="mastil-progress-title">Ruhm und Kampagne</h2>
        <p>Dein Feldzug, deine Sterne und dein Ruhm bleiben lokal auf diesem Gerät gespeichert.</p>
        <div class="mastil-campaign-progress">
          <div class="mastil-campaign-progress-head">
            <span>Kampagnenpfad</span>
            <strong id="mastil-campaign-progress-title">Startgebiet</strong>
            <small id="mastil-campaign-progress-detail">Welle 1 | Ziel: Kronlande sichern</small>
          </div>
          <div class="mastil-progress-track" aria-hidden="true"><span id="mastil-campaign-progress-fill"></span></div>
          <div class="mastil-campaign-region-grid" id="mastil-campaign-region-grid"></div>
        </div>
        <div class="mastil-star-council" id="mastil-star-council">
          <div class="mastil-star-council-head">
            <span>Sternenrat</span>
            <strong id="mastil-star-council-title">0 Sterne aktiv</strong>
            <small id="mastil-star-council-detail">Sterne schalten Startboni für die Kampagne frei.</small>
          </div>
          <div class="mastil-star-council-grid" id="mastil-star-council-grid"></div>
        </div>
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
    const campaign = getCampaignOverview();
    const campaignTitle = byId('mastil-campaign-progress-title');
    const campaignDetail = byId('mastil-campaign-progress-detail');
    const campaignFill = byId('mastil-campaign-progress-fill');
    const campaignGrid = byId('mastil-campaign-region-grid');
    const count = byId('mastil-progress-count');
    const fill = byId('mastil-progress-fill');
    const grid = byId('mastil-awards-grid');
    const starCouncil = getStarCouncilOverview();
    const starTitle = byId('mastil-star-council-title');
    const starDetail = byId('mastil-star-council-detail');
    const starGrid = byId('mastil-star-council-grid');
    if (campaignTitle && campaign.current) {
      campaignTitle.textContent = `${campaign.current.region.title} | ${campaign.totalStars}/${campaign.maxStars} Sterne`;
    }
    if (campaignDetail && campaign.current) {
      campaignDetail.textContent = `Bestwelle ${getBestWave()} | Ziel: ${campaign.current.region.goal} | Belohnung: ${campaign.current.region.reward}`;
    }
    if (campaignFill) campaignFill.style.width = `${Math.round(campaign.ratio * 100)}%`;
    if (campaignGrid) {
      campaignGrid.innerHTML = campaign.states.map(({ region, state: regionState }) => `
        <article class="mastil-campaign-region ${regionState.statusClass}">
          <span>Kapitel ${WORLD_REGIONS.indexOf(region) + 1}</span>
          <strong>${region.title}</strong>
          ${renderCampaignStars(regionState.stars)}
          <small>${regionState.label} | Wellen ${region.waves}</small>
          <small>${regionState.bestScore ? `${regionState.bestScore.toLocaleString('de-DE')} Ruhm` : `${regionState.plays} Einsätze`}</small>
          <em>${region.goal}</em>
        </article>
      `).join('');
    }
    if (starTitle) {
      starTitle.textContent = `${starCouncil.unlocked.length}/${STAR_COUNCIL_PERKS.length} Segen aktiv | ${starCouncil.stars}/${starCouncil.maxStars} Sterne`;
    }
    if (starDetail) {
      starDetail.textContent = starCouncil.next
        ? `Nächster Segen: ${starCouncil.next.title} in ${starCouncil.next.remaining} Stern${starCouncil.next.remaining === 1 ? '' : 'en'}.`
        : 'Alle Sternenrat-Segen sind aktiv und wirken beim Kampagnenstart.';
    }
    if (starGrid) {
      starGrid.innerHTML = starCouncil.perks.map((perk) => `
        <article class="mastil-star-perk ${perk.unlocked ? 'unlocked' : 'locked'}">
          <span>${perk.stars} Sterne</span>
          <strong>${perk.title}</strong>
          <small>${perk.unlocked ? perk.detail : `Noch ${perk.remaining} Stern${perk.remaining === 1 ? '' : 'e'}`}</small>
        </article>
      `).join('');
    }
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
    const campaign = getStoredCampaignProgress();
    try {
      const highscores = JSON.parse(localStorage.getItem('highscores') || '[]');
      const highscoreBest = Array.isArray(highscores)
        ? highscores.reduce((best, entry) => Math.max(best, Number(entry.wave) || 1), 1)
        : 1;
      return Math.max(highscoreBest, Number(campaign.bestWave) || 1);
    } catch {
      return Math.max(1, Number(campaign.bestWave) || 1);
    }
  }

  function getStoredCampaignProgress() {
    if (window.MastilGameEnhancements && typeof window.MastilGameEnhancements.getCampaignProgress === 'function') {
      return window.MastilGameEnhancements.getCampaignProgress();
    }
    try {
      const raw = localStorage.getItem(CAMPAIGN_PROGRESS_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      if (saved && typeof saved === 'object') {
        return {
          bestWave: Math.max(1, Number(saved.bestWave) || 1),
          totalStars: Math.max(0, Number(saved.totalStars) || 0),
          regions: saved.regions && typeof saved.regions === 'object' ? saved.regions : {}
        };
      }
    } catch {
      // Alte oder beschädigte Speicherdaten werden ignoriert.
    }
    return { bestWave: 1, totalStars: 0, regions: {} };
  }

  function getRegionCampaignState(region, bestWave = getBestWave()) {
    const stored = getStoredCampaignProgress();
    const savedRegion = stored.regions && stored.regions[region.id] ? stored.regions[region.id] : null;
    const range = parseRegionWaveRange(region);
    const span = Math.max(1, range.end - range.start + 1);
    const regionBestWave = Math.max(Number(savedRegion && savedRegion.bestWave) || 0, Math.min(bestWave, range.end));
    const reached = Math.max(0, Math.min(span, regionBestWave - range.start + 1));
    const ratio = Math.max(0, Math.min(1, reached / span));
    const computedStars = bestWave >= range.end
      ? 3
      : bestWave >= range.start
        ? Math.max(1, Math.min(2, Math.ceil(ratio * 3)))
        : 0;
    const stars = Math.max(computedStars, Math.max(0, Math.min(3, Number(savedRegion && savedRegion.stars) || 0)));
    const cleared = Boolean(savedRegion && savedRegion.cleared) || stars >= 3 || bestWave >= range.end;
    const active = bestWave >= range.start && !cleared;
    const unlocked = state.licenseActive || range.start <= 5 || bestWave >= range.start || Boolean(savedRegion);
    const label = cleared ? 'Gesichert' : active ? 'Aktiv' : unlocked ? 'Bereit' : 'Verschlossen';
    const nextWave = cleared ? range.end : Math.max(range.start, Math.min(range.end, bestWave + 1));

    return {
      range,
      ratio,
      stars,
      label,
      statusClass: label.toLowerCase(),
      cleared,
      active,
      unlocked,
      nextWave,
      wavesDone: reached,
      wavesTotal: span,
      bestWave: regionBestWave,
      bestScore: Number(savedRegion && savedRegion.bestScore) || 0,
      plays: Number(savedRegion && savedRegion.plays) || 0
    };
  }

  function getCampaignOverview(bestWave = getBestWave()) {
    const states = WORLD_REGIONS.map((region) => ({
      region,
      state: getRegionCampaignState(region, bestWave)
    }));
    const current = states.find((entry) => entry.state.active) || states.find((entry) => entry.state.unlocked && !entry.state.cleared) || states[states.length - 1];
    const totalStars = states.reduce((sum, entry) => sum + entry.state.stars, 0);
    const maxStars = states.length * 3;
    const cleared = states.filter((entry) => entry.state.cleared).length;

    return {
      states,
      current,
      totalStars,
      maxStars,
      cleared,
      ratio: maxStars ? totalStars / maxStars : 0
    };
  }

  function getStarCouncilOverview() {
    if (window.MastilGameEnhancements && typeof window.MastilGameEnhancements.getStarCouncilState === 'function') {
      return window.MastilGameEnhancements.getStarCouncilState();
    }
    const stored = getStoredCampaignProgress();
    const regionStars = stored.regions && typeof stored.regions === 'object'
      ? Object.values(stored.regions).reduce((sum, entry) => sum + Math.max(0, Math.min(3, Number(entry.stars) || 0)), 0)
      : 0;
    const stars = Math.max(0, Number(stored.totalStars) || 0, regionStars);
    const perks = STAR_COUNCIL_PERKS.map((perk) => ({
      ...perk,
      unlocked: stars >= perk.stars,
      remaining: Math.max(0, perk.stars - stars)
    }));

    return {
      stars,
      maxStars: WORLD_REGIONS.length * 3,
      unlocked: perks.filter((perk) => perk.unlocked),
      next: perks.find((perk) => !perk.unlocked) || null,
      perks
    };
  }

  function renderCampaignStars(stars) {
    return `<span class="mastil-campaign-stars" aria-label="${stars} von 3 Sternen">${[0, 1, 2].map((index) => `<i class="${index < stars ? 'filled' : ''}"></i>`).join('')}</span>`;
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
      scenario: (byId('mastil-skirmish-scenario') && byId('mastil-skirmish-scenario').value) || saved.scenario,
      color: (byId('mastil-skirmish-color') && byId('mastil-skirmish-color').value) || saved.color
    };
  }

  function getSkirmishRouteEstimate(values) {
    const size = SKIRMISH_SIZES[values.size] || SKIRMISH_SIZES.standard;
    const towerCount = Number((size.towers || '13').match(/\d+/)?.[0]) || 13;
    return Math.max(7, getSkirmishPreviewLinks(values).filter(([a, b]) => a < towerCount && b < towerCount).length);
  }

  function getSkirmishTowerCount(values) {
    const size = SKIRMISH_SIZES[values.size] || SKIRMISH_SIZES.standard;
    return Number((size.towers || '13').match(/\d+/)?.[0]) || 13;
  }

  function getSafeSkirmishColor(color) {
    const value = String(color || '').trim();
    return /^#[0-9a-f]{6}$/i.test(value) ? value : '#2f6fa5';
  }

  function getSkirmishFormation(values) {
    return SKIRMISH_FORMATIONS[values.size] || SKIRMISH_FORMATIONS.standard;
  }

  function hasPreviewIndex(list, index) {
    return Array.isArray(list) && list.includes(Number(index));
  }

  function isSkirmishSideStartNode(node, index, values) {
    if (!node) return false;
    return hasPreviewIndex(getSkirmishFormation(values).sideStarts, index);
  }

  function getSkirmishPreviewLinks(values) {
    const formation = getSkirmishFormation(values);
    const links = [...SKIRMISH_PREVIEW_LINKS, ...(formation.extraLinks || [])];
    if (values.plan === 'raiders' || values.scenario === 'shadow') links.push([8, 9], [10, 9], [15, 8], [16, 10]);
    if (values.plan === 'fortress' || values.scenario === 'siege' || values.scenario === 'boss') links.push([11, 19], [12, 19], [22, 19], [23, 19]);
    if (values.plan === 'economy' || values.scenario === 'trade') links.push([6, 13], [7, 14], [18, 14]);
    if (values.plan === 'conquest' || values.scenario === 'boss') links.push([22, 11], [23, 12], [20, 21]);
    const seen = new Set();
    return links.filter(([a, b]) => {
      const key = `${Math.min(a, b)}:${Math.max(a, b)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getSkirmishPreviewNodes(values, towerCount) {
    const formation = getSkirmishFormation(values);
    const startRank = formation.startRank;
    const opponentCount = Math.max(1, Math.min(3, Number(values.opponents) || 1));
    let enemyIndex = 0;

    return SKIRMISH_PREVIEW_NODES
      .slice(0, towerCount)
      .map((node, index) => {
        const sideStart = isSkirmishSideStartNode(node, index, values);
        const forward = hasPreviewIndex(formation.enemyForward, index);
        const stronghold = hasPreviewIndex(formation.strongholds, index);
        const objective = hasPreviewIndex(formation.objectives, index);
        let role = node.role;
        let terrain = node.terrain;
        if (sideStart) {
          role = 'player';
          terrain = 'keep';
        } else if (forward && role !== 'player') {
          role = 'enemy';
          terrain = values.plan === 'raiders' || values.scenario === 'shadow' ? 'forest' : terrain;
        }
        if (stronghold && role !== 'player') terrain = 'keep';
        if ((values.plan === 'economy' || values.scenario === 'trade') && objective && role !== 'player') terrain = index % 2 === 0 ? 'market' : 'quarry';
        if ((values.plan === 'fortress' || values.scenario === 'siege' || values.scenario === 'boss') && stronghold) terrain = 'keep';
        if ((values.plan === 'raiders' || values.scenario === 'shadow') && forward) terrain = index % 2 === 0 ? 'forest' : 'road';

        let owner = role;
        let ownerIndex = 0;
        if (role === 'neutral' && node.rank <= startRank) {
          owner = 'player';
        } else if (role === 'enemy') {
          ownerIndex = enemyIndex % opponentCount;
          enemyIndex += 1;
        }
        return { ...node, index, role, terrain, owner, ownerIndex, objective, stronghold, forward, sideStart };
      });
  }

  function getPreviewRoadStyle(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.sqrt(dx * dx + dy * dy) * 100;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return `--x:${(a.x * 100).toFixed(2)}%;--y:${(a.y * 100).toFixed(2)}%;--w:${length.toFixed(2)}%;--angle:${angle.toFixed(2)}deg;`;
  }

  function renderSkirmishMapPreview(values, region, scenario, size, difficulty, plan, routeEstimate, towerCount) {
    const preview = byId('mastil-skirmish-map-preview');
    if (!preview) return;

    const safeColor = getSafeSkirmishColor(values.color);
    const nodes = getSkirmishPreviewNodes(values, towerCount);
    const byIndex = new Map(nodes.map((node) => [node.index, node]));
    const roads = getSkirmishPreviewLinks(values)
      .filter(([a, b]) => byIndex.has(a) && byIndex.has(b))
      .map(([a, b]) => {
        const from = byIndex.get(a);
        const to = byIndex.get(b);
        const contested = from.owner !== to.owner;
        return `<span class="mastil-preview-road ${contested ? 'contested' : ''}" style="${getPreviewRoadStyle(from, to)}"></span>`;
      }).join('');
    const markers = nodes.map((node) => {
      const label = SKIRMISH_TERRAIN_LABELS[node.terrain] || 'Ort';
      const ownerClass = node.owner === 'enemy' ? `enemy enemy-${node.ownerIndex + 1}` : node.owner;
      const title = node.owner === 'player'
        ? 'Eigene Startstellung'
        : node.owner === 'enemy' ? `Feindburg ${node.ownerIndex + 1}` : label;
      const flags = `${node.objective ? ' objective' : ''}${node.stronghold ? ' stronghold' : ''}${node.forward ? ' forward' : ''}${node.sideStart ? ' side-start' : ''}`;
      return `
        <span class="mastil-preview-node ${ownerClass} terrain-${node.terrain}${flags}" style="--x:${(node.x * 100).toFixed(2)}%;--y:${(node.y * 100).toFixed(2)}%;--chosen-color:${safeColor};" title="${title}">
          <i>${label.slice(0, 1)}</i>
        </span>
      `;
    }).join('');
    const ownCount = nodes.filter((node) => node.owner === 'player').length;
    const enemyCount = nodes.filter((node) => node.owner === 'enemy').length;
    const neutralCount = nodes.length - ownCount - enemyCount;
    const objectiveCount = nodes.filter((node) => node.objective).length;

    preview.style.setProperty('--skirmish-map-image', `url("${region.image}")`);
    preview.style.setProperty('--skirmish-map-color', safeColor);
    preview.innerHTML = `
      <div class="mastil-skirmish-map-stage" aria-label="Kartenaufbau">
        ${roads}
        ${markers}
        <span class="mastil-preview-front">Bossfront</span>
      </div>
      <div class="mastil-skirmish-map-intel">
        <span>Kartenplan</span>
        <strong>${region.title} | ${size.label}</strong>
        <p>${scenario.label}: ${plan.label}. ${difficulty.detail}. ${routeEstimate} Wege verbinden ${towerCount} Orte mit ${objectiveCount} Schlüsselorten.</p>
        <div class="mastil-preview-ledger" aria-label="Kartenwerte">
          <b>${ownCount}<small>Startburgen</small></b>
          <b>${neutralCount}<small>neutral</small></b>
          <b>${enemyCount}<small>Feindorte</small></b>
          <b>${values.opponents}<small>KI-Reiche</small></b>
        </div>
      </div>
    `;
  }

  function renderSkirmishBrief() {
    const brief = byId('mastil-skirmish-brief');
    const values = getSkirmishFieldValues();
    const region = getRegionById(values.mapId);
    const size = SKIRMISH_SIZES[values.size] || SKIRMISH_SIZES.standard;
    const difficulty = SKIRMISH_DIFFICULTIES[values.difficulty] || SKIRMISH_DIFFICULTIES.normal;
    const plan = SKIRMISH_PLANS[values.plan] || SKIRMISH_PLANS.balanced;
    const scenario = SKIRMISH_SCENARIOS[values.scenario] || SKIRMISH_SCENARIOS.training;
    const opponentText = `${Math.max(1, Math.min(3, values.opponents || 1))} KI-Reich${Number(values.opponents) === 1 ? '' : 'e'}`;
    const routeEstimate = getSkirmishRouteEstimate(values);
    const towerCount = getSkirmishTowerCount(values);
    const safeColor = getSafeSkirmishColor(values.color);

    document.querySelectorAll('.mastil-world-card[data-region-id]').forEach((card) => {
      card.classList.toggle('selected', card.dataset.regionId === region.id);
    });
    document.querySelectorAll('.mastil-skirmish-preset[data-scenario]').forEach((button) => {
      button.classList.toggle('selected', button.dataset.scenario === values.scenario);
    });
    renderSkirmishMapPreview(values, region, scenario, size, difficulty, plan, routeEstimate, towerCount);
    if (!brief) return;
    brief.innerHTML = `
      <strong>${scenario.label} auf ${region.title}</strong>
      <span>${scenario.detail} ${region.terrain}. ${size.detail}. ${opponentText}, ${difficulty.label.toLowerCase()}: ${difficulty.detail}. ${plan.label}: ${plan.detail}</span>
      <div class="mastil-skirmish-stats" aria-label="Gefechtsvorschau">
        <b>${towerCount}<small>Orte</small></b>
        <b>${routeEstimate}<small>Wege</small></b>
        <b>${values.opponents}<small>KI</small></b>
        <b>${region.boss.split(' ')[0]}<small>Boss</small></b>
      </div>
      <em style="--chosen-color:${safeColor}"><i></i> Eure Reichsfarbe wird auf eigene Türme, Banner und Gefechtsbefehle übertragen.</em>
    `;
  }

  function applySkirmishScenario(id) {
    const scenario = SKIRMISH_SCENARIOS[id] || SKIRMISH_SCENARIOS.training;
    const fields = {
      scenario: byId('mastil-skirmish-scenario'),
      mapId: byId('mastil-skirmish-map'),
      size: byId('mastil-skirmish-size'),
      difficulty: byId('mastil-skirmish-difficulty'),
      opponents: byId('mastil-skirmish-opponents'),
      plan: byId('mastil-skirmish-plan'),
      color: byId('mastil-skirmish-color')
    };
    if (fields.scenario) fields.scenario.value = id;
    if (fields.mapId) fields.mapId.value = scenario.mapId;
    if (fields.size) fields.size.value = scenario.size;
    if (fields.difficulty) fields.difficulty.value = scenario.difficulty;
    if (fields.opponents) fields.opponents.value = String(scenario.opponents);
    if (fields.plan) fields.plan.value = scenario.plan;
    if (fields.color) fields.color.value = scenario.color;
    renderSkirmishBrief();
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
          <div class="mastil-skirmish-panel-head">
            <h3>Gefechtsmodus</h3>
            <p>Wähle eine Vorlage oder stelle Karte, Größe, Gegner und Farbe selbst ein.</p>
          </div>
          <div class="mastil-skirmish-presets" id="mastil-skirmish-presets">
            ${Object.entries(SKIRMISH_SCENARIOS).map(([id, scenario]) => `
              <button class="mastil-skirmish-preset" type="button" data-scenario="${id}">
                <strong>${scenario.label}</strong>
                <small>${scenario.detail}</small>
              </button>
            `).join('')}
          </div>
          <div class="mastil-skirmish-map-preview" id="mastil-skirmish-map-preview"></div>
          <div class="mastil-skirmish-options">
            <label>Gefechtsart<select id="mastil-skirmish-scenario">
              ${Object.entries(SKIRMISH_SCENARIOS).map(([id, scenario]) => `<option value="${id}">${scenario.label}</option>`).join('')}
            </select></label>
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
    byId('mastil-skirmish-presets').addEventListener('click', (event) => {
      const preset = event.target && event.target.closest ? event.target.closest('[data-scenario]') : null;
      if (!preset) return;
      applySkirmishScenario(preset.dataset.scenario);
    });
    byId('mastil-skirmish-scenario').addEventListener('change', (event) => {
      applySkirmishScenario(event.target.value);
    });
    byId('mastil-world-grid').addEventListener('click', (event) => {
      const card = event.target && event.target.closest ? event.target.closest('[data-region-id]') : null;
      if (!card) return;
      const mapSelect = byId('mastil-skirmish-map');
      if (mapSelect) mapSelect.value = card.dataset.regionId;
      renderSkirmishBrief();
    });
    ['mastil-skirmish-scenario', 'mastil-skirmish-map', 'mastil-skirmish-size', 'mastil-skirmish-difficulty', 'mastil-skirmish-opponents', 'mastil-skirmish-plan', 'mastil-skirmish-color']
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
        const progress = getRegionCampaignState(region, bestWave);
        return `
          <button class="mastil-world-card ${progress.statusClass}" type="button" data-region-id="${region.id}" style="--world-image: url('${region.image}');--region-progress:${progress.ratio};">
            <span>Kapitel ${index + 1}</span>
            <strong>${region.title}</strong>
            <small>Wellen ${region.waves} | ${region.difficulty}</small>
            <small>Ziel: ${region.goal}</small>
            <em>${region.tactic}</em>
            ${renderCampaignStars(progress.stars)}
            <b>${progress.label}</b>
            <small>Bestwelle: ${progress.bestWave || 0} | Ruhm: ${progress.bestScore ? progress.bestScore.toLocaleString('de-DE') : '-'}</small>
            <small>Boss: ${region.boss}</small>
            <small>Belohnung: ${region.reward}</small>
            <i class="mastil-world-card-progress" aria-hidden="true"></i>
          </button>
        `;
      }).join('');
    }

    const fields = {
      scenario: byId('mastil-skirmish-scenario'),
      mapId: byId('mastil-skirmish-map'),
      size: byId('mastil-skirmish-size'),
      difficulty: byId('mastil-skirmish-difficulty'),
      opponents: byId('mastil-skirmish-opponents'),
      plan: byId('mastil-skirmish-plan'),
      color: byId('mastil-skirmish-color')
    };
    if (fields.scenario) fields.scenario.value = config.scenario || DEFAULT_SKIRMISH.scenario;
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
      scenario: values.scenario,
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
    const campaign = getCampaignOverview(bestWave);
    const region = campaign.current ? campaign.current.region : getMenuRegion(bestWave);
    const progress = campaign.current ? campaign.current.state : getRegionCampaignState(region, bestWave);
    const current = byId('mastil-menu-current-region');
    const boss = byId('mastil-menu-next-boss');
    const license = byId('mastil-menu-license-state');
    const online = byId('mastil-menu-online-state');
    const skirmish = byId('mastil-menu-skirmish-state');
    const skirmishDetail = byId('mastil-menu-skirmish-detail');
    const councilState = byId('mastil-menu-council-state');
    const councilDetail = byId('mastil-menu-council-detail');
    const footer = byId('mastil-menu-footer-state');
    const briefingTitle = byId('mastil-menu-briefing-title');
    const briefingCopy = byId('mastil-menu-briefing-copy');
    const briefingWave = byId('mastil-menu-briefing-wave');
    const briefingBoss = byId('mastil-menu-briefing-boss');
    const briefingPlan = byId('mastil-menu-briefing-plan');
    const commandTitle = byId('mastil-menu-command-title');
    const commandCopy = byId('mastil-menu-command-copy');
    const commandRoute = byId('mastil-menu-command-route');
    const commandBoss = byId('mastil-menu-command-boss');
    const commandSkirmish = byId('mastil-menu-command-skirmish');
    const saved = readSkirmishConfig();
    const savedRegion = getRegionById(saved.mapId);
    const savedSize = SKIRMISH_SIZES[saved.size] || SKIRMISH_SIZES.standard;
    const savedDifficulty = SKIRMISH_DIFFICULTIES[saved.difficulty] || SKIRMISH_DIFFICULTIES.normal;
    const savedPlan = SKIRMISH_PLANS[saved.plan] || SKIRMISH_PLANS.balanced;
    const savedScenario = SKIRMISH_SCENARIOS[saved.scenario] || SKIRMISH_SCENARIOS.training;
    const starCouncil = getStarCouncilOverview();

    if (current) current.textContent = `${region.title} | ${progress.label} | ${campaign.totalStars}/${campaign.maxStars} Sterne`;
    if (boss) boss.textContent = `Bestwelle ${bestWave} | Ziel: ${region.goal} | Boss: ${region.boss}`;
    if (license) license.textContent = state.licenseActive ? 'Vollversion aktiv' : 'Demo bis Welle 5';
    if (online) online.textContent = getBackendStatusText();
    if (skirmish) skirmish.textContent = `${savedScenario.label} | ${savedSize.label}`;
    if (skirmishDetail) skirmishDetail.textContent = `${savedRegion.title}, ${saved.opponents} KI, ${savedDifficulty.label}, ${savedPlan.label}`;
    if (councilState) councilState.textContent = `${starCouncil.unlocked.length}/${STAR_COUNCIL_PERKS.length} Segen aktiv`;
    if (councilDetail) {
      councilDetail.textContent = starCouncil.next
        ? `${starCouncil.stars}/${starCouncil.maxStars} Sterne | nächster Segen: ${starCouncil.next.title}`
        : `${starCouncil.stars}/${starCouncil.maxStars} Sterne | alle Startboni aktiv`;
    }
    if (briefingTitle) briefingTitle.textContent = `${region.title}: ${region.goal}`;
    if (briefingCopy) briefingCopy.textContent = `${MENU_BRIEFINGS[region.id] || region.terrain} Belohnung: ${region.reward}.`;
    if (briefingWave) briefingWave.textContent = `Wellen ${region.waves} | ${progress.stars}/3 Sterne`;
    if (briefingBoss) briefingBoss.textContent = `Boss: ${region.boss}`;
    if (briefingPlan) briefingPlan.textContent = `${savedScenario.label}, ${savedDifficulty.label}`;
    if (commandTitle) commandTitle.textContent = `${region.goal}`;
    if (commandCopy) commandCopy.textContent = region.tactic || MENU_BRIEFINGS[region.id] || 'Lies die Wege, sammle Reserven und führe Angriffe nur mit klarem Ziel.';
    if (commandRoute) commandRoute.textContent = `Route: Welle ${progress.nextWave}/${progress.range.end}`;
    if (commandBoss) commandBoss.textContent = `Bossziel: ${region.boss}`;
    if (commandSkirmish) commandSkirmish.textContent = `Gefecht: ${savedScenario.label} | ${savedDifficulty.label}`;
    if (footer) footer.textContent = state.licenseActive
      ? 'Vollversion: alle Wellen freigeschaltet'
      : 'Demo aktiv: Kampagne frei bis Welle 5';

    const setMenuDetail = (key, value) => {
      const detail = document.querySelector(`#start-screen [data-menu-detail="${key}"]`);
      if (detail) detail.textContent = value;
    };
    setMenuDetail('campaign', `Nächste Front: ${region.title}. Ziel: ${region.goal}. ${progress.stars}/3 Sterne.`);
    setMenuDetail('skirmish', `${savedScenario.label}: ${savedRegion.title}, ${savedSize.label}, ${saved.opponents} KI, ${savedDifficulty.label}.`);
    setMenuDetail('online', `${getBackendStatusText()}: Duellräume über den MASTIL-Server.`);
    setMenuDetail('map', `Weltpfad: ${campaign.totalStars}/${campaign.maxStars} Sterne. ${region.title} ist dein aktueller Einsatz.`);
    setMenuDetail('legends', `Story, Reiche und Bossfronten aus ${region.title} nachlesen.`);
    setMenuDetail('progress', `Sternenrat: ${starCouncil.unlocked.length}/${STAR_COUNCIL_PERKS.length} Segen, ${starCouncil.stars}/${starCouncil.maxStars} Sterne.`);

    const menu = document.querySelector('#start-screen .menu-container');
    if (menu) {
      menu.dataset.currentRegion = region.id;
      menu.style.setProperty('--menu-current-image', `url("${region.image}")`);
    }

    document.querySelectorAll('.mastil-menu-region-step').forEach((step) => {
      const stepRegion = getRegionById(step.dataset.regionId || '');
      if (!stepRegion) return;
      const regionState = getRegionCampaignState(stepRegion, bestWave);
      step.classList.toggle('active', stepRegion.id === region.id && regionState.active);
      step.classList.toggle('cleared', regionState.cleared);
      step.classList.toggle('locked', !regionState.unlocked);
      const stateLabel = step.querySelector('.mastil-menu-region-state');
      if (stateLabel) {
        stateLabel.textContent = `${regionState.label} | ${regionState.stars}/3`;
      }
      const stars = step.querySelector('.mastil-campaign-stars');
      if (stars) {
        stars.outerHTML = renderCampaignStars(regionState.stars);
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
        <span class="mastil-menu-command">${item.command || 'Öffnen'}</span>
        <span class="button-text" data-menu-label="${key}">${item.label}</span>
        <small data-menu-detail="${key}">${item.detail}</small>
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
            <span>Kriegszentrale</span>
            <strong>Kartentisch von MASTIL</strong>
            <p>Plane deinen Feldzug wie an einem echten Kommandotisch: Front lesen, Reich wählen, Gefecht trainieren und dann mit klaren Befehlen in die Karte gehen.</p>
          </div>
          <div class="mastil-menu-seal" aria-hidden="true">
            <img src="../../assets/branding/mastil-logo.png" alt="">
          </div>
        </div>
        <div class="mastil-menu-badges" aria-label="Spielstatus">
          <small>Offline spielbar</small>
          <small id="mastil-menu-footer-state">Demo aktiv</small>
          <small id="mastil-menu-platform-state">Browser-Spiel</small>
        </div>
      `;
      menu.prepend(header);
    }

    if (!menu.querySelector('.mastil-menu-briefing')) {
      const briefing = document.createElement('section');
      briefing.className = 'mastil-menu-briefing';
      briefing.innerHTML = `
        <div class="mastil-menu-briefing-map" aria-hidden="true">
          <span></span>
          <i></i>
        </div>
        <div class="mastil-menu-briefing-copy">
          <span>Nächster Einsatz</span>
          <strong id="mastil-menu-briefing-title">Startgebiet: Ausgewogen</strong>
          <p id="mastil-menu-briefing-copy">Sichere zuerst die nahen Wege und baue eine stabile Linie vor der Grenzwacht.</p>
          <div class="mastil-menu-briefing-tags" aria-label="Einsatzdaten">
            <small id="mastil-menu-briefing-wave">Wellen 1-5</small>
            <small id="mastil-menu-briefing-boss">Boss: Grenzwacht Roderich</small>
            <small id="mastil-menu-briefing-plan">Training, Normal</small>
          </div>
        </div>
      `;
      const header = menu.querySelector('.mastil-menu-header');
      if (header && header.nextSibling) {
        menu.insertBefore(briefing, header.nextSibling);
      } else if (header) {
        menu.appendChild(briefing);
      } else {
        menu.prepend(briefing);
      }
    }

    if (!menu.querySelector('.mastil-menu-command-table')) {
      const commandTable = document.createElement('section');
      commandTable.className = 'mastil-menu-command-table';
      commandTable.setAttribute('aria-label', 'Kommandotisch');
      commandTable.innerHTML = `
        <div class="mastil-command-table-map" aria-hidden="true">
          <span class="mastil-table-route"></span>
          <i></i><i></i><i></i><i></i>
        </div>
        <div class="mastil-command-table-copy">
          <span>Befehlsrat</span>
          <strong id="mastil-menu-command-title">Front lesen, dann befehlen</strong>
          <p id="mastil-menu-command-copy">Nutze die Kampagne für Fortschritt, den Gefechtsmodus zum Trainieren und die Weltkarte, um Bossfronten vorab zu planen.</p>
        </div>
        <div class="mastil-command-table-orders" aria-label="Schnellstatus">
          <small id="mastil-menu-command-route">Route: Wellen 1-5</small>
          <small id="mastil-menu-command-boss">Bossziel: Grenzwacht Roderich</small>
          <small id="mastil-menu-command-skirmish">Gefecht: Training</small>
        </div>
      `;
      const briefing = menu.querySelector('.mastil-menu-briefing');
      if (briefing && briefing.nextSibling) {
        menu.insertBefore(commandTable, briefing.nextSibling);
      } else if (briefing) {
        menu.appendChild(commandTable);
      } else {
        menu.prepend(commandTable);
      }
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
          <span>Sternenrat</span>
          <strong id="mastil-menu-council-state">0/5 Segen aktiv</strong>
          <small id="mastil-menu-council-detail">Sterne schalten Kampagnen-Startboni frei.</small>
        </article>
        <article>
          <span>Web-Status</span>
          <strong id="mastil-menu-web-state">Live spielbar</strong>
          <small id="mastil-menu-web-detail">Offline-Cache wird vorbereitet.</small>
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
              ${renderCampaignStars(0)}
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
        <strong id="mastil-menu-web-footer">mastil.online ist als Web-Spiel live. MASTIL-Server spaeter fuer Online-Spiel</strong>
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
