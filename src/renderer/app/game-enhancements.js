(function initMastilGameEnhancements() {
  const worldImage = new Image();
  worldImage.decoding = 'async';
  let worldImageReady = false;
  let worldBackgroundCache = null;
  let worldBackgroundCacheWidth = 0;
  let worldBackgroundCacheHeight = 0;
  let worldBackgroundCacheRatio = 1;
  let worldBackgroundRevision = 0;
  let worldBackgroundCacheRevision = -1;
  let activeWorldPath = '';
  const WORLD_REGIONS = [
    { id: 'startgebiet', title: 'Startgebiet', waves: [1, 5], boss: 'Grenzwacht Roderich', image: '../../assets/backgrounds/worlds/world-01-startgebiet.png' },
    { id: 'grenzlande', title: 'Grenzlande', waves: [6, 10], boss: 'Der Eisenvogt', image: '../../assets/backgrounds/worlds/world-02-grenzlande.png' },
    { id: 'wuestenreich', title: 'Wuestenreich', waves: [11, 15], boss: 'Sultan der Sandkrone', image: '../../assets/backgrounds/worlds/world-03-wuestenreich.png' },
    { id: 'nachtfestung', title: 'Nachtfestung', waves: [16, 20], boss: 'Nachtgraf Malrec', image: '../../assets/backgrounds/worlds/world-04-nachtfestung.png' },
    { id: 'endboss', title: 'Endboss-Zitadelle', waves: [21, 25], boss: 'Kaiser Veyron', image: '../../assets/backgrounds/worlds/world-05-endboss-zitadelle.png' }
  ];
  const MAP_NODES = [
    { x: 0.16, y: 0.52, role: 'player', type: 'normal', rank: 0, terrain: 'keep' },
    { x: 0.29, y: 0.39, role: 'neutral', type: 'watch', rank: 1, terrain: 'hill' },
    { x: 0.30, y: 0.66, role: 'neutral', type: 'gold', rank: 1, terrain: 'market' },
    { x: 0.43, y: 0.27, role: 'neutral', type: 'troop', rank: 2, terrain: 'barracks' },
    { x: 0.46, y: 0.53, role: 'neutral', type: 'normal', rank: 2, terrain: 'road' },
    { x: 0.46, y: 0.78, role: 'neutral', type: 'watch', rank: 2, terrain: 'ford' },
    { x: 0.60, y: 0.37, role: 'neutral', type: 'gold', rank: 3, terrain: 'market' },
    { x: 0.62, y: 0.64, role: 'neutral', type: 'troop', rank: 3, terrain: 'forest' },
    { x: 0.74, y: 0.23, role: 'enemy', type: 'troop', rank: 4, terrain: 'barracks' },
    { x: 0.79, y: 0.52, role: 'enemy', type: 'normal', rank: 4, terrain: 'road' },
    { x: 0.72, y: 0.80, role: 'enemy', type: 'gold', rank: 4, terrain: 'market' },
    { x: 0.88, y: 0.36, role: 'enemy', type: 'watch', rank: 5, terrain: 'hill' },
    { x: 0.90, y: 0.68, role: 'enemy', type: 'troop', rank: 5, terrain: 'forest' },
    { x: 0.22, y: 0.20, role: 'neutral', type: 'gold', rank: 6, terrain: 'quarry' },
    { x: 0.22, y: 0.84, role: 'neutral', type: 'troop', rank: 6, terrain: 'ford' },
    { x: 0.55, y: 0.16, role: 'enemy', type: 'watch', rank: 7, terrain: 'hill' },
    { x: 0.56, y: 0.88, role: 'enemy', type: 'normal', rank: 7, terrain: 'keep' },
    { x: 0.38, y: 0.13, role: 'neutral', type: 'watch', rank: 8, terrain: 'forest' },
    { x: 0.39, y: 0.90, role: 'neutral', type: 'gold', rank: 8, terrain: 'market' },
    { x: 0.93, y: 0.50, role: 'enemy', type: 'normal', rank: 9, terrain: 'keep' }
  ];
  const TERRAIN = {
    keep: { label: 'Burggrund', short: 'B', color: '#e4c56b', detail: 'stabiler Startpunkt' },
    hill: { label: 'Höhenzug', short: 'H', color: '#b7d394', detail: 'bessere Verteidigung' },
    market: { label: 'Markt', short: 'M', color: '#f0c85c', detail: 'zusätzliches Gold' },
    barracks: { label: 'Kasernenhof', short: 'K', color: '#8fc3f0', detail: 'zusätzliche Truppen' },
    road: { label: 'Königsweg', short: 'W', color: '#d8c49a', detail: 'schnellere Befehle' },
    ford: { label: 'Flussfurt', short: 'F', color: '#8fc7d8', detail: 'zäher Widerstand' },
    forest: { label: 'Waldsaum', short: 'W', color: '#9ed6a2', detail: 'Hinterhaltsschutz' },
    quarry: { label: 'Steinbruch', short: 'S', color: '#c9c0aa', detail: 'billigere Befestigung' }
  };
  const SIZE_LIMITS = { compact: 10, standard: 13, large: 16, war: 20 };
  const DIFFICULTY = {
    easy: { gold: 155, enemyUnits: 0.48, enemyLevel: 0, label: 'Training' },
    normal: { gold: 130, enemyUnits: 0.62, enemyLevel: 0, label: 'Normal' },
    hard: { gold: 115, enemyUnits: 0.76, enemyLevel: 1, label: 'Hart' },
    brutal: { gold: 100, enemyUnits: 0.9, enemyLevel: 1, label: 'Brutal' }
  };
  worldImage.onload = () => {
    worldImageReady = true;
    worldBackgroundRevision += 1;
    worldBackgroundCache = null;
  };
  worldImage.onerror = () => {
    worldImageReady = false;
    worldBackgroundRevision += 1;
    worldBackgroundCache = null;
  };
  setWorldImage('../../assets/backgrounds/worlds/world-01-startgebiet.png');
  const ACHIEVEMENTS_KEY = 'mastil-achievements';
  const HIGHSCORES_KEY = 'highscores';
  const ACHIEVEMENTS = {
    firstCommand: {
      title: 'Feldbefehl',
      detail: 'Erster Angriffsbefehl erteilt.'
    },
    firstUpgrade: {
      title: 'Baumeister',
      detail: 'Erster Turm ausgebaut.'
    },
    masterBuilder: {
      title: 'Steinmeister',
      detail: 'Drei Ausbauten in einer Partie.'
    },
    firstCapture: {
      title: 'Grenzbrecher',
      detail: 'Erster Turm erobert.'
    },
    bannerLord: {
      title: 'Bannerherr',
      detail: 'Drei Eroberungen in einer Partie.'
    },
    firstFortify: {
      title: 'Schildwall',
      detail: 'Erster Turm befestigt.'
    },
    waveThree: {
      title: 'Standhafte Linie',
      detail: 'Welle 3 erreicht.'
    },
    trialBreaker: {
      title: 'Prüfung gemeistert',
      detail: 'Die freie Demo-Grenze erreicht.'
    },
    ironLine: {
      title: 'Eiserne Linie',
      detail: 'Partie ohne verlorenen Turm beendet.'
    },
    firstEdict: {
      title: 'Königlicher Beschluss',
      detail: 'Erstes Edikt zwischen zwei Wellen gewählt.'
    },
    councilMaster: {
      title: 'Rat der Krone',
      detail: 'Drei Edikte in einer Partie genutzt.'
    },
    firstSpecialist: {
      title: 'Gildenmeister',
      detail: 'Ersten Turm spezialisiert.'
    },
    tacticalCommander: {
      title: 'Kriegsrat',
      detail: 'Drei taktische Befehle in einer Partie geführt.'
    },
    grandOffensive: {
      title: 'Großer Heerzug',
      detail: 'Ersten koordinierten Frontalangriff befohlen.'
    },
    bossBreaker: {
      title: 'Bossbrecher',
      detail: 'Ersten Boss-Turm gebrochen.'
    },
    terrainLord: {
      title: 'Landesherr',
      detail: 'Drei unterschiedliche Gelände gehalten.'
    }
  };
  const TOTAL_ACHIEVEMENTS = Object.keys(ACHIEVEMENTS).length;
  const EDICTS = [
    {
      id: 'treasury',
      title: 'Kriegsschatz',
      detail: 'Sofortiger Goldschub für Ausbau und Befestigungen.',
      effect: 'Gold'
    },
    {
      id: 'muster',
      title: 'Heerbann',
      detail: 'Alle eigenen Türme erhalten frische Truppen.',
      effect: 'Truppen'
    },
    {
      id: 'engineers',
      title: 'Baumeistergilde',
      detail: 'Der Heimatturm wächst sofort um eine Stufe.',
      effect: 'Ausbau'
    },
    {
      id: 'bulwark',
      title: 'Steinerner Eid',
      detail: 'Eigene Türme starten befestigt in die neue Welle.',
      effect: 'Schutz'
    },
    {
      id: 'scouts',
      title: 'Spähernetz',
      detail: 'Die feindliche Vorhut beginnt geschwächt.',
      effect: 'Taktik'
    }
  ];

  let controlsReady = false;
  let strategyPanelReady = false;
  let objectivePanelReady = false;
  let achievementToastReady = false;
  let edictModalReady = false;
  let minimapEnabled = true;
  let effectsReady = false;
  let matchSummarySaved = false;
  let lastImpactSoundAt = 0;
  let lastStrategyUpdate = 0;
  let lastObjectiveUpdate = 0;
  let lastLowUnitWarningAt = 0;
  const visualEffects = [];
  const impactThrottle = new Map();
  const commandCooldowns = new Map();
  const eventLog = [];
  const matchAchievements = new Set();
  const unlockedAchievements = new Set(loadAchievementIds());
  const edictState = {
    pending: false,
    nextWave: 0,
    choices: [],
    continueWave: null
  };
  const matchStats = {
    captured: 0,
    lost: 0,
    upgrades: 0,
    fortified: 0,
    edicts: 0,
    waves: 1,
    commands: 0,
    specialized: 0,
    assaults: 0,
    rallies: 0
  };

  function safe(fn, fallback) {
    try {
      return fn();
    } catch {
      return fallback;
    }
  }

  function setWorldImage(path) {
    if (!path || activeWorldPath === path) return;
    activeWorldPath = path;
    worldImageReady = false;
    worldBackgroundCache = null;
    worldBackgroundRevision += 1;
    worldImage.src = path;
  }

  function getMatchConfig() {
    return {
      mode: 'campaign',
      mapId: 'startgebiet',
      size: 'standard',
      difficulty: 'normal',
      opponents: 2,
      color: '#2f6fa5',
      ...(window.MASTIL_MATCH_CONFIG || {})
    };
  }

  function getRegionForWave(waveNumber) {
    const current = Math.max(1, Number(waveNumber) || 1);
    return WORLD_REGIONS.find((region) => current >= region.waves[0] && current <= region.waves[1]) || WORLD_REGIONS[WORLD_REGIONS.length - 1];
  }

  function getRegionById(id) {
    return WORLD_REGIONS.find((region) => region.id === id) || WORLD_REGIONS[0];
  }

  function getActiveRegion() {
    const config = getMatchConfig();
    const currentWave = safe(() => wave, 1);
    if (config.mode === 'skirmish' && currentWave <= 5) return getRegionById(config.mapId);
    return getRegionForWave(currentWave);
  }

  function updateWorldImageForCurrentWave() {
    const region = getActiveRegion();
    setWorldImage(region.image);
    return region;
  }

  function isBossWave(waveNumber) {
    return [5, 10, 15, 20, 25].includes(Number(waveNumber) || 0);
  }

  function typeFromKey(type) {
    const types = safe(() => TOWER_TYPES, null);
    if (!types) return type;
    if (type === 'gold') return types.GOLD;
    if (type === 'troop') return types.TROOP;
    if (type === 'watch') return types.WATCH;
    return types.NORMAL;
  }

  function readJsonStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Speicherung darf das Spiel nicht blockieren.
    }
  }

  function loadAchievementIds() {
    const saved = readJsonStorage(ACHIEVEMENTS_KEY, []);
    if (!Array.isArray(saved)) return [];
    return saved.filter((id) => Object.prototype.hasOwnProperty.call(ACHIEVEMENTS, id));
  }

  function getPlayerName() {
    const name = String(window.PLAYER_NAME || '').trim();
    return name || 'Herrscher';
  }

  function getAchievementProgress() {
    return Object.entries(ACHIEVEMENTS).map(([id, achievement]) => ({
      id,
      title: achievement.title,
      detail: achievement.detail,
      unlocked: unlockedAchievements.has(id)
    }));
  }

  function colorForFaction(faction) {
    if (faction === 'player') return getMatchConfig().color || '#2f6fa5';
    const configured = safe(() => FACTION_COLORS && FACTION_COLORS[faction], '');
    if (configured) return configured;
    const palette = {
      player: '#2f6fa5',
      enemy1: '#b8483f',
      enemy2: '#c87735',
      enemy3: '#7651a6',
      neutral: '#a89a82'
    };
    return palette[faction] || '#888';
  }

  function shade(hex, amount) {
    const normalized = hex.replace('#', '');
    const num = parseInt(normalized, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (num & 255) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function rgba(hex, alpha) {
    const normalized = hex.replace('#', '');
    const num = parseInt(normalized, 16);
    const r = num >> 16;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function playSound(name) {
    if (window.MastilAudio && typeof window.MastilAudio.play === 'function') {
      window.MastilAudio.play(name);
    }
  }

  function roundRect(context, x, y, w, h, radius) {
    const r = Math.min(radius, w / 2, h / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();
  }

  function drawImageCover(context, image, width, height) {
    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    context.drawImage(image, x, y, drawWidth, drawHeight);
  }

  function spawnEffect(x, y, type, options = {}) {
    visualEffects.push({
      x,
      y,
      type,
      color: options.color || '#e2bd5a',
      text: options.text || '',
      duration: options.duration || 900,
      createdAt: performance.now(),
      size: options.size || 1
    });
    if (visualEffects.length > 80) visualEffects.splice(0, visualEffects.length - 80);
  }

  function drawWorldLandmarks() {
    const time = performance.now() * 0.001;
    const landmarks = [
      { x: 0.14, y: 0.28, type: 'forest', scale: 1.1 },
      { x: 0.25, y: 0.72, type: 'camp', scale: 0.95 },
      { x: 0.52, y: 0.16, type: 'ruin', scale: 1 },
      { x: 0.74, y: 0.68, type: 'harbor', scale: 1.05 },
      { x: 0.88, y: 0.34, type: 'mountain', scale: 1.15 }
    ];

    for (const mark of landmarks) {
      const x = gameWidth * mark.x;
      const y = gameHeight * mark.y;
      const s = Math.min(gameWidth, gameHeight) * 0.035 * mark.scale;
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = 0.58;

      if (mark.type === 'forest') {
        for (let i = 0; i < 7; i += 1) {
          const px = (i - 3) * s * 0.42;
          const py = Math.sin(i * 1.7) * s * 0.18;
          ctx.fillStyle = i % 2 ? 'rgba(42, 94, 50, 0.72)' : 'rgba(54, 118, 58, 0.7)';
          ctx.beginPath();
          ctx.moveTo(px, py - s * 0.7);
          ctx.lineTo(px - s * 0.38, py + s * 0.28);
          ctx.lineTo(px + s * 0.38, py + s * 0.28);
          ctx.closePath();
          ctx.fill();
        }
      }

      if (mark.type === 'camp') {
        ctx.fillStyle = 'rgba(91, 54, 26, 0.76)';
        roundRect(ctx, -s * 0.7, -s * 0.22, s * 1.4, s * 0.44, 5);
        ctx.fill();
        ctx.fillStyle = 'rgba(217, 169, 75, 0.72)';
        ctx.beginPath();
        ctx.moveTo(-s * 0.62, -s * 0.22);
        ctx.lineTo(0, -s * 0.9);
        ctx.lineTo(s * 0.62, -s * 0.22);
        ctx.closePath();
        ctx.fill();
      }

      if (mark.type === 'ruin') {
        ctx.strokeStyle = 'rgba(72, 47, 28, 0.72)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i += 1) {
          ctx.beginPath();
          ctx.moveTo((i - 1.5) * s * 0.34, s * 0.3);
          ctx.lineTo((i - 1.5) * s * 0.34, -s * (0.38 + i * 0.08));
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(-s * 0.68, -s * 0.45);
        ctx.lineTo(s * 0.56, -s * 0.62);
        ctx.stroke();
      }

      if (mark.type === 'harbor') {
        ctx.strokeStyle = 'rgba(61, 91, 105, 0.74)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.72, Math.PI * 0.15, Math.PI * 1.3);
        ctx.stroke();
        ctx.fillStyle = 'rgba(230, 210, 154, 0.72)';
        ctx.beginPath();
        ctx.moveTo(-s * 0.2, -s * 0.75);
        ctx.lineTo(s * 0.52, -s * 0.1);
        ctx.lineTo(-s * 0.12, s * 0.1);
        ctx.closePath();
        ctx.fill();
      }

      if (mark.type === 'mountain') {
        ctx.fillStyle = 'rgba(92, 82, 67, 0.74)';
        ctx.beginPath();
        ctx.moveTo(-s * 0.9, s * 0.45);
        ctx.lineTo(-s * 0.15, -s * 0.72);
        ctx.lineTo(s * 0.24, s * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(221, 214, 187, 0.55)';
        ctx.beginPath();
        ctx.moveTo(-s * 0.15, -s * 0.72);
        ctx.lineTo(s * 0.07, -s * 0.08);
        ctx.lineTo(-s * 0.36, -s * 0.08);
        ctx.closePath();
        ctx.fill();
      }

      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = 'rgba(255, 236, 179, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, s * (1.3 + Math.sin(time + x) * 0.05), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawFallbackWorld() {
    const land = ctx.createLinearGradient(0, 0, gameWidth, gameHeight);
    land.addColorStop(0, '#7f8b45');
    land.addColorStop(0.48, '#b5a35f');
    land.addColorStop(1, '#4b7139');
    ctx.fillStyle = land;
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    ctx.strokeStyle = 'rgba(73, 113, 146, 0.55)';
    ctx.lineWidth = Math.max(16, gameWidth * 0.018);
    ctx.beginPath();
    ctx.moveTo(gameWidth * 0.04, gameHeight * 0.75);
    ctx.bezierCurveTo(gameWidth * 0.26, gameHeight * 0.45, gameWidth * 0.38, gameHeight * 0.55, gameWidth * 0.52, gameHeight * 0.22);
    ctx.bezierCurveTo(gameWidth * 0.68, gameHeight * 0.02, gameWidth * 0.78, gameHeight * 0.42, gameWidth * 0.96, gameHeight * 0.22);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(221, 190, 125, 0.52)';
    ctx.lineWidth = 5;
    ctx.setLineDash([18, 12]);
    ctx.beginPath();
    ctx.moveTo(gameWidth * 0.16, gameHeight * 0.5);
    ctx.quadraticCurveTo(gameWidth * 0.48, gameHeight * 0.28, gameWidth * 0.82, gameHeight * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawWorldOverlayBase() {
    const vignette = ctx.createRadialGradient(
      gameWidth * 0.5,
      gameHeight * 0.48,
      Math.min(gameWidth, gameHeight) * 0.12,
      gameWidth * 0.5,
      gameHeight * 0.5,
      Math.max(gameWidth, gameHeight) * 0.74
    );
    vignette.addColorStop(0, 'rgba(255, 239, 184, 0.08)');
    vignette.addColorStop(0.72, 'rgba(19, 12, 8, 0.08)');
    vignette.addColorStop(1, 'rgba(5, 4, 3, 0.36)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    ctx.strokeStyle = 'rgba(250, 229, 172, 0.11)';
    ctx.lineWidth = 1;
    const gridSize = Math.max(70, Math.min(110, gameWidth / 12));
    for (let x = -gridSize; x < gameWidth + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + gridSize * 0.42, gameHeight);
      ctx.stroke();
    }
    for (let y = 0; y < gameHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(gameWidth, y + Math.sin(y * 0.01) * 12);
      ctx.stroke();
    }

    drawWorldLandmarks();
  }

  function buildWorldBackgroundCache() {
    const width = Math.max(1, Math.floor(safe(() => gameWidth, window.innerWidth || 1280)));
    const height = Math.max(1, Math.floor(safe(() => gameHeight, window.innerHeight || 720)));
    const ratio = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));
    const cacheValid =
      worldBackgroundCache &&
      worldBackgroundCacheWidth === width &&
      worldBackgroundCacheHeight === height &&
      worldBackgroundCacheRatio === ratio &&
      worldBackgroundCacheRevision === worldBackgroundRevision;

    if (cacheValid) return worldBackgroundCache;

    const cache = document.createElement('canvas');
    cache.width = Math.ceil(width * ratio);
    cache.height = Math.ceil(height * ratio);
    const cacheContext = cache.getContext('2d');
    if (!cacheContext) return null;
    cacheContext.setTransform(ratio, 0, 0, ratio, 0, 0);

    const previousCtx = ctx;
    const previousWidth = gameWidth;
    const previousHeight = gameHeight;
    ctx = cacheContext;
    gameWidth = width;
    gameHeight = height;
    try {
      if (worldImageReady && worldImage.complete && worldImage.naturalWidth > 0) {
        drawImageCover(ctx, worldImage, width, height);
      } else {
        drawFallbackWorld();
      }
      drawWorldOverlayBase();
    } finally {
      ctx = previousCtx;
      gameWidth = previousWidth;
      gameHeight = previousHeight;
    }

    worldBackgroundCache = cache;
    worldBackgroundCacheWidth = width;
    worldBackgroundCacheHeight = height;
    worldBackgroundCacheRatio = ratio;
    worldBackgroundCacheRevision = worldBackgroundRevision;
    return worldBackgroundCache;
  }

  function drawWorldMist() {
    // Bewegter Nebel sah gut aus, konnte aber auf einigen Displays leicht flackern.
    // Die Welt bleibt deshalb bewusst als ruhige, gecachte Karte stehen.
  }

  function renderEnhancedWorld() {
    updateWorldImageForCurrentWave();
    ctx.save();
    const cache = buildWorldBackgroundCache();
    if (cache) {
      ctx.drawImage(cache, 0, 0, gameWidth, gameHeight);
    } else if (worldImageReady && worldImage.complete && worldImage.naturalWidth > 0) {
      drawImageCover(ctx, worldImage, gameWidth, gameHeight);
      drawWorldOverlayBase();
    } else {
      drawFallbackWorld();
      drawWorldOverlayBase();
    }
    drawWorldMist();
    ctx.restore();
  }

  function drawEnhancedConnections() {
    const currentTowers = safe(() => towers, []);
    if (!currentTowers || currentTowers.length < 2) return;

    const threshold = (gameWidth + gameHeight) / 6.2;
    let drawn = 0;
    const limit = safe(() => getQualitySetting('connectionLimit'), 240) || 240;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < currentTowers.length && drawn < limit; i += 1) {
      const a = currentTowers[i];
      for (let j = i + 1; j < currentTowers.length && drawn < limit; j += 1) {
        const b = currentTowers[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        if (distance > threshold) continue;

        drawn += 1;
        const sameFaction = a.faction === b.faction;
        const activePath = sameFaction && a.faction !== safe(() => FACTIONS.NEUTRAL, 'neutral');
        const color = activePath ? colorForFaction(a.faction) : '#8b7355';

        ctx.globalAlpha = activePath ? 0.46 : 0.22;
        ctx.strokeStyle = rgba(color, activePath ? 0.58 : 0.28);
        ctx.lineWidth = activePath ? 5 : 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        const mx = (a.x + b.x) / 2 + Math.sin((a.x + b.y) * 0.01) * 12;
        const my = (a.y + b.y) / 2 + Math.cos((a.y + b.x) * 0.01) * 9;
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.stroke();

        if (activePath) {
          ctx.globalAlpha = 0.46;
          ctx.strokeStyle = rgba('#fff0a8', 0.32);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(mx, my, b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function drawEnhancedTower(tower) {
    if (!tower || typeof tower.x !== 'number' || typeof tower.y !== 'number') return;

    const level = tower.level || 1;
    const x = tower.x;
    const y = tower.y;
    const faction = tower.faction || 'neutral';
    const base = colorForFaction(faction);
    const size = Math.min(74, 34 + level * 7);
    const height = size * 1.05;
    const width = size * 0.88;
    const isSelected = safe(() => selectedTower === tower, false);

    ctx.save();
    ctx.translate(x, y);

    drawTerrainPlate(tower, width, height);

    if (tower.boss && faction !== safe(() => FACTIONS.PLAYER, 'player')) {
      const pulse = 0.76 + Math.sin(performance.now() * 0.004) * 0.12;
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255, 177, 126, ${pulse})`;
      ctx.lineWidth = 4;
      ctx.setLineDash([9, 6]);
      ctx.beginPath();
      ctx.ellipse(0, 0, width * 1.12, height * 0.9, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(4, height * 0.34, width * 0.82, height * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    const foundation = ctx.createLinearGradient(-width, height * 0.14, width, height * 0.58);
    foundation.addColorStop(0, 'rgba(56, 43, 31, 0.88)');
    foundation.addColorStop(1, 'rgba(18, 12, 8, 0.92)');
    ctx.fillStyle = foundation;
    roundRect(ctx, -width * 0.54, height * 0.16, width * 1.08, height * 0.38, 9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 222, 158, 0.22)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    if (level >= 4) {
      ctx.fillStyle = 'rgba(36, 23, 14, 0.92)';
      roundRect(ctx, -width * 0.28, -height * 0.92, width * 0.56, height * 0.42, 7);
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 222, 158, 0.24)';
      ctx.stroke();
    }

    if (isSelected) {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 226, 136, 0.95)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(0, 0, width * 0.9, height * 0.74, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    const aura = ctx.createRadialGradient(0, -height * 0.15, 4, 0, -height * 0.1, width * 1.1);
    aura.addColorStop(0, `${base}55`);
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -height * 0.12, width * 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    const wallGradient = ctx.createLinearGradient(-width, -height, width, height);
    wallGradient.addColorStop(0, shade(base, 74));
    wallGradient.addColorStop(0.38, shade(base, 28));
    wallGradient.addColorStop(1, shade(base, -50));

    const mainW = width * 0.7;
    const mainH = height * 0.8;
    ctx.fillStyle = wallGradient;
    roundRect(ctx, -mainW / 2, -mainH * 0.58, mainW, mainH, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(42, 25, 14, 0.78)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = shade(base, 88);
    const crenels = level >= 5 ? 7 : level >= 3 ? 6 : 5;
    for (let i = 0; i < crenels; i += 1) {
      const cx = -mainW / 2 + i * (mainW / (crenels - 1)) - 4;
      ctx.fillRect(cx, -mainH * 0.66, 8, level >= 4 ? 14 : 11);
    }

    if (level >= 2) {
      const roof = faction === 'player' ? '#254a6f' : faction === 'neutral' ? '#77684f' : '#70302a';
      ctx.fillStyle = roof;
      ctx.beginPath();
      ctx.moveTo(-mainW * 0.6, -mainH * 0.66);
      ctx.lineTo(0, -mainH * (level >= 4 ? 1.02 : 0.88));
      ctx.lineTo(mainW * 0.6, -mainH * 0.66);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(38, 24, 14, 0.8)';
      ctx.stroke();
    }

    const sideCount = level >= 4 ? 4 : 2;
    for (let i = 0; i < sideCount; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const row = i < 2 ? 0 : 1;
      const tx = side * width * (row ? 0.47 : 0.38);
      const ty = row ? -height * 0.02 : -height * 0.15;
      drawSideTurret(tx, ty, width * 0.23, height * (row ? 0.56 : 0.68), base, faction);
    }

    ctx.fillStyle = 'rgba(35, 22, 14, 0.82)';
    roundRect(ctx, -mainW * 0.15, mainH * 0.03, mainW * 0.3, mainH * 0.32, 7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 214, 137, 0.62)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fff0a8';
    for (let i = 0; i < Math.min(4, level); i += 1) {
      const wx = -mainW * 0.25 + (i % 2) * mainW * 0.5;
      const wy = -mainH * 0.34 + Math.floor(i / 2) * mainH * 0.22;
      roundRect(ctx, wx - 4, wy - 6, 8, 12, 3);
      ctx.fill();
    }

    if (level >= 3 || faction !== 'neutral') {
      const flagColor = faction === 'player' ? '#e8c65d' : faction === 'neutral' ? '#d8c49a' : base;
      ctx.strokeStyle = '#3b2615';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -mainH * 0.8);
      ctx.lineTo(0, -mainH * 1.08);
      ctx.stroke();
      ctx.fillStyle = flagColor;
      ctx.beginPath();
      ctx.moveTo(1, -mainH * 1.06);
      ctx.lineTo(width * 0.28, -mainH * 0.99);
      ctx.lineTo(1, -mainH * 0.91);
      ctx.closePath();
      ctx.fill();
    }

    if (level >= 5) {
      ctx.strokeStyle = 'rgba(255, 226, 136, 0.72)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-mainW * 0.58, -mainH * 0.54);
      ctx.lineTo(-mainW * 0.72, -mainH * 0.18);
      ctx.lineTo(-mainW * 0.58, mainH * 0.2);
      ctx.moveTo(mainW * 0.58, -mainH * 0.54);
      ctx.lineTo(mainW * 0.72, -mainH * 0.18);
      ctx.lineTo(mainW * 0.58, mainH * 0.2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 225, 138, 0.72)';
      for (const sx of [-mainW * 0.72, mainW * 0.72]) {
        ctx.beginPath();
        ctx.arc(sx, mainH * 0.24, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (level >= 7) {
      ctx.strokeStyle = 'rgba(255, 239, 188, 0.58)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, -mainH * 0.72, width * 0.7, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 239, 188, 0.86)';
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.arc(i * width * 0.18, -mainH * 0.88 - Math.abs(i) * 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawTowerRoleDetails(tower, width, height, base);
    drawTowerBadges(tower, width, height, level);
    ctx.restore();
  }

  function drawTerrainPlate(tower, width, height) {
    const terrain = getTerrainInfo(tower.terrain);
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'rgba(18, 11, 7, 0.42)';
    ctx.beginPath();
    ctx.ellipse(0, height * 0.4, width * 0.92, height * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(terrain.color, 0.58);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, height * 0.4, width * 0.82, height * 0.2, 0, Math.PI * 0.12, Math.PI * 1.88);
    ctx.stroke();

    ctx.fillStyle = rgba(terrain.color, 0.88);
    ctx.strokeStyle = 'rgba(18, 11, 7, 0.75)';
    ctx.lineWidth = 1.4;
    roundRect(ctx, -width * 0.48, height * 0.48, 20, 17, 6);
    ctx.fill();
    ctx.stroke();
    drawTerrainIcon(tower.terrain, -width * 0.48 + 10, height * 0.48 + 8.5, terrain.color);
    ctx.restore();
  }

  function drawTerrainIcon(terrain, x, y, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#171009';
    ctx.fillStyle = '#171009';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (terrain === 'market') {
      ctx.beginPath();
      ctx.arc(-3, 1, 3, 0, Math.PI * 2);
      ctx.arc(4, -1, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (terrain === 'barracks') {
      ctx.beginPath();
      ctx.moveTo(-5, 5);
      ctx.lineTo(0, -6);
      ctx.lineTo(5, 5);
      ctx.closePath();
      ctx.fill();
    } else if (terrain === 'hill') {
      ctx.beginPath();
      ctx.moveTo(-7, 5);
      ctx.lineTo(-1, -5);
      ctx.lineTo(7, 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-1, -5);
      ctx.lineTo(2, -1);
      ctx.lineTo(-3, -1);
      ctx.closePath();
      ctx.fill();
    } else if (terrain === 'forest') {
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * 4, -6);
        ctx.lineTo(i * 4 - 4, 3);
        ctx.lineTo(i * 4 + 4, 3);
        ctx.closePath();
        ctx.fill();
      }
    } else if (terrain === 'ford') {
      ctx.beginPath();
      ctx.moveTo(-7, -2);
      ctx.quadraticCurveTo(-3, -6, 0, -2);
      ctx.quadraticCurveTo(4, 2, 7, -2);
      ctx.moveTo(-7, 4);
      ctx.quadraticCurveTo(-3, 0, 0, 4);
      ctx.quadraticCurveTo(4, 8, 7, 4);
      ctx.stroke();
    } else if (terrain === 'quarry') {
      ctx.beginPath();
      ctx.moveTo(-6, 5);
      ctx.lineTo(-2, -5);
      ctx.lineTo(5, -1);
      ctx.lineTo(6, 5);
      ctx.closePath();
      ctx.fill();
    } else if (terrain === 'keep') {
      roundRect(ctx, -5, -5, 10, 10, 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-2, -2, 4, 7);
    } else {
      ctx.beginPath();
      ctx.moveTo(-7, 3);
      ctx.lineTo(7, -3);
      ctx.moveTo(-6, -2);
      ctx.lineTo(6, 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTowerRoleDetails(tower, width, height, base) {
    const type = tower.type || 'normal';

    if (tower.fortifiedUntil && tower.fortifiedUntil > performance.now()) {
      ctx.strokeStyle = 'rgba(244, 230, 191, 0.76)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.ellipse(0, 0, width * 1.02, height * 0.78, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (type === 'gold') {
      ctx.fillStyle = '#f0c85c';
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(-width * 0.44 + i * 8, height * 0.28 + (i % 2) * 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#624013';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    if (type === 'troop') {
      ctx.strokeStyle = shade(base, -70);
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * 7, -height * 0.52);
        ctx.lineTo(i * 7, -height * 0.78);
        ctx.stroke();
        ctx.fillStyle = i === 0 ? '#f1cf6b' : shade(base, 48);
        ctx.beginPath();
        ctx.moveTo(i * 7 + 1, -height * 0.77);
        ctx.lineTo(i * 7 + 14, -height * 0.72);
        ctx.lineTo(i * 7 + 1, -height * 0.66);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (type === 'watch') {
      const pulse = 0.62;
      ctx.fillStyle = `rgba(255, 194, 87, ${pulse})`;
      ctx.beginPath();
      ctx.arc(0, -height * 0.74, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 226, 151, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -height * 0.74, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawTowerRoleIcon(type, centerX, centerY, color) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.strokeStyle = '#171009';
    ctx.fillStyle = '#171009';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (type === 'gold') {
      ctx.beginPath();
      ctx.arc(-3, 1, 4.5, 0, Math.PI * 2);
      ctx.arc(4, -2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-6, 1);
      ctx.lineTo(-1, 1);
      ctx.moveTo(1, -2);
      ctx.lineTo(7, -2);
      ctx.stroke();
    } else if (type === 'troop') {
      ctx.beginPath();
      ctx.moveTo(-6, 6);
      ctx.lineTo(0, -7);
      ctx.lineTo(6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 7);
      ctx.stroke();
    } else if (type === 'watch') {
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(0, -5);
      ctx.moveTo(0, 5);
      ctx.lineTo(0, 8);
      ctx.moveTo(-8, 0);
      ctx.lineTo(-5, 0);
      ctx.moveTo(5, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
    } else {
      roundRect(ctx, -6, -5, 12, 10, 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-3, -2, 2, 4);
      ctx.fillRect(1, -2, 2, 4);
    }
    ctx.restore();
  }

  function drawSideTurret(x, y, w, h, base, faction) {
    const gradient = ctx.createLinearGradient(x - w, y - h, x + w, y + h);
    gradient.addColorStop(0, shade(base, 92));
    gradient.addColorStop(1, shade(base, -42));
    ctx.fillStyle = gradient;
    roundRect(ctx, x - w / 2, y - h * 0.62, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(43, 26, 14, 0.82)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const roof = faction === 'player' ? '#274b6f' : faction === 'neutral' ? '#77684f' : '#6d2420';
    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.65, y - h * 0.62);
    ctx.lineTo(x + w * 0.65, y - h * 0.62);
    ctx.lineTo(x, y - h * 0.94);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 232, 156, 0.86)';
    roundRect(ctx, x - 3, y - h * 0.33, 6, 9, 2);
    ctx.fill();
  }

  function drawTowerBadges(tower, width, height, level) {
    const unitsText = `${Math.floor(tower.units)}/${tower.maxUnits}`;
    ctx.font = '800 12px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textWidth = ctx.measureText(unitsText).width + 20;
    const badgeY = -height * 0.92;
    ctx.fillStyle = 'rgba(18, 11, 7, 0.78)';
    roundRect(ctx, -textWidth / 2, badgeY - 13, textWidth, 26, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(236, 196, 93, 0.72)';
    ctx.stroke();
    ctx.fillStyle = '#fff2bf';
    ctx.fillText(unitsText, 0, badgeY);

    const levelText = `L${level}`;
    ctx.font = '800 11px Segoe UI';
    ctx.fillStyle = 'rgba(18, 11, 7, 0.72)';
    roundRect(ctx, -16, height * 0.48, 32, 20, 8);
    ctx.fill();
    ctx.fillStyle = '#f2cf69';
    ctx.fillText(levelText, 0, height * 0.58);

    const roleLabels = {
      gold: 'G',
      troop: 'T',
      watch: 'W'
    };
    const roleText = roleLabels[tower.type];
    if (roleText) {
      ctx.font = '900 10px Segoe UI';
      const roleColor = tower.type === 'gold' ? '#d8b13d' : tower.type === 'troop' ? '#8fc3f0' : '#9ed6a2';
      ctx.fillStyle = roleColor;
      roundRect(ctx, width * 0.2, height * 0.34, 22, 18, 7);
      ctx.fill();
      drawTowerRoleIcon(tower.type, width * 0.2 + 11, height * 0.34 + 9, roleColor);
    }

    if (tower.fortifiedUntil && tower.fortifiedUntil > performance.now()) {
      ctx.font = '900 10px Segoe UI';
      ctx.fillStyle = 'rgba(244, 230, 191, 0.9)';
      roundRect(ctx, -width * 0.2 - 22, height * 0.34, 22, 18, 7);
      ctx.fill();
      ctx.fillStyle = '#171009';
      ctx.fillText('S', -width * 0.2 - 11, height * 0.34 + 9);
    }
  }

  function drawEnhancedMinimap() {
    if (!minimapEnabled) return;
    const currentTowers = safe(() => towers, []);
    if (!currentTowers || !currentTowers.length) return;

    const w = Math.min(190, gameWidth * 0.2);
    const h = Math.min(126, gameHeight * 0.18);
    const x = gameWidth - w - 18;
    const y = gameHeight - h - 18;

    ctx.save();
    ctx.globalAlpha = 0.94;
    ctx.fillStyle = 'rgba(17, 10, 7, 0.72)';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(236, 196, 93, 0.52)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(236, 196, 93, 0.85)';
    ctx.font = '800 11px Segoe UI';
    ctx.textAlign = 'left';
    ctx.fillText('Karte', x + 10, y + 15);

    for (const tower of currentTowers) {
      const px = x + 12 + (tower.x / gameWidth) * (w - 24);
      const py = y + 24 + (tower.y / gameHeight) * (h - 34);
      ctx.fillStyle = colorForFaction(tower.faction);
      ctx.beginPath();
      ctx.arc(px, py, tower.faction === safe(() => FACTIONS.PLAYER, 'player') ? 4.2 : 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawEnhancedUnits() {
    const currentUnits = safe(() => units, []);
    if (!currentUnits || !currentUnits.length) return;

    const maxUnits = safe(() => getQualitySetting('maxUnits'), 140);
    const animationDetail = safe(() => getQualitySetting('animationDetail'), 'medium');
    const limit = Number.isFinite(maxUnits) ? maxUnits : currentUnits.length;
    const unitsToDraw = currentUnits.length > limit ? currentUnits.slice(0, limit) : currentUnits;

    ctx.save();
    for (const unit of unitsToDraw) {
      const base = colorForFaction(unit.faction);
      const dx = unit.targetX - unit.x;
      const dy = unit.targetY - unit.y;
      const angle = Math.atan2(dy, dx);
      const pulse = 1;
      const size = 5.8 * pulse;

      if (animationDetail !== 'low') {
        ctx.strokeStyle = rgba(base, 0.35);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(unit.x - Math.cos(angle) * 16, unit.y - Math.sin(angle) * 16);
        ctx.lineTo(unit.x - Math.cos(angle) * 5, unit.y - Math.sin(angle) * 5);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(unit.x, unit.y);
      ctx.rotate(angle);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.moveTo(size + 3, 0);
      ctx.lineTo(-size, -size * 0.72);
      ctx.lineTo(-size * 0.55, 0);
      ctx.lineTo(-size, size * 0.72);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 242, 190, 0.62)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 241, 178, 0.72)';
      ctx.beginPath();
      ctx.arc(-size * 0.1, -size * 0.18, size * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawEffects() {
    if (!visualEffects.length) return;
    const now = performance.now();
    ctx.save();

    for (let i = visualEffects.length - 1; i >= 0; i -= 1) {
      const effect = visualEffects[i];
      const p = (now - effect.createdAt) / effect.duration;
      if (p >= 1) {
        visualEffects.splice(i, 1);
        continue;
      }

      const ease = 1 - Math.pow(1 - p, 3);
      const alpha = 1 - p;
      ctx.save();
      ctx.translate(effect.x, effect.y);
      ctx.globalAlpha = alpha;

      if (effect.type === 'attack') {
        ctx.strokeStyle = rgba(effect.color, 0.8);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 16 + ease * 26 * effect.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = rgba(effect.color, 0.2);
        ctx.beginPath();
        ctx.arc(0, 0, 10 + ease * 16, 0, Math.PI * 2);
        ctx.fill();
      }

      if (effect.type === 'impact') {
        ctx.strokeStyle = rgba(effect.color, 0.85);
        ctx.lineWidth = 2.5;
        for (let r = 0; r < 3; r += 1) {
          ctx.beginPath();
          ctx.arc(0, 0, 8 + ease * (16 + r * 9), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (effect.type === 'shield') {
        ctx.strokeStyle = 'rgba(244, 230, 191, 0.92)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20 + ease * 20, 15 + ease * 16, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(244, 230, 191, 0.18)';
        ctx.fill();
      }

      if (effect.type === 'upgrade' || effect.type === 'capture' || effect.type === 'fortify' || effect.type === 'achievement') {
        const radius = 18 + ease * 36 * effect.size;
        ctx.strokeStyle = rgba(effect.color, 0.82);
        ctx.lineWidth = effect.type === 'capture' ? 4 : 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = rgba(effect.color, 0.16);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.62, 0, Math.PI * 2);
        ctx.fill();

        if (effect.type === 'achievement') {
          ctx.strokeStyle = 'rgba(255, 242, 190, 0.82)';
          ctx.lineWidth = 2;
          for (let i = 0; i < 10; i += 1) {
            const angle = (Math.PI * 2 * i) / 10;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * radius * 0.34, Math.sin(angle) * radius * 0.34);
            ctx.lineTo(Math.cos(angle) * radius * 0.82, Math.sin(angle) * radius * 0.82);
            ctx.stroke();
          }
        }
      }

      if (effect.text) {
        ctx.globalAlpha = alpha;
        ctx.font = '900 13px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff2bf';
        ctx.strokeStyle = 'rgba(14, 8, 5, 0.82)';
        ctx.lineWidth = 4;
        const textY = -24 - ease * 22;
        ctx.strokeText(effect.text, 0, textY);
        ctx.fillText(effect.text, 0, textY);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  function showEnhancementNotice(text) {
    if (typeof showNotification === 'function') {
      showNotification(text, 2200);
    }
  }

  function pushEvent(text, kind = 'info') {
    eventLog.unshift({
      text,
      kind,
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    });
    if (eventLog.length > 6) eventLog.length = 6;
    updateEventLogDom();
  }

  function updateEventLogDom() {
    const list = document.getElementById('mastil-event-list');
    if (!list) return;
    list.innerHTML = eventLog.map((entry) => `
      <div class="mastil-event-item mastil-event-${entry.kind}">
        <span>${entry.time}</span>
        <strong>${entry.text}</strong>
      </div>
    `).join('');
  }

  function createAchievementToast() {
    if (achievementToastReady || document.getElementById('mastil-achievement-toast')) return;
    achievementToastReady = true;

    const toast = document.createElement('div');
    toast.id = 'mastil-achievement-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <span class="mastil-achievement-mark" aria-hidden="true"></span>
      <span class="mastil-achievement-copy">
        <em>Auszeichnung freigeschaltet</em>
        <strong></strong>
        <small></small>
      </span>
    `;
    document.body.appendChild(toast);
  }

  function showAchievementToast(achievement) {
    createAchievementToast();
    const toast = document.getElementById('mastil-achievement-toast');
    if (!toast) return;

    const title = toast.querySelector('strong');
    const detail = toast.querySelector('small');
    if (title) title.textContent = achievement.title;
    if (detail) detail.textContent = achievement.detail;

    toast.classList.remove('active');
    void toast.offsetWidth;
    toast.classList.add('active');
    clearTimeout(toast.__mastilTimer);
    toast.__mastilTimer = setTimeout(() => toast.classList.remove('active'), 4200);
  }

  function unlockAchievement(id, options = {}) {
    const achievement = ACHIEVEMENTS[id];
    if (!achievement || unlockedAchievements.has(id)) return false;

    unlockedAchievements.add(id);
    matchAchievements.add(id);
    writeJsonStorage(ACHIEVEMENTS_KEY, Array.from(unlockedAchievements));
    showAchievementToast(achievement);
    pushEvent(`Auszeichnung: ${achievement.title}`, 'achievement');
    playSound('achievement');

    const point = options.tower || safe(() => selectedTower, null);
    if (point && typeof point.x === 'number' && typeof point.y === 'number') {
      spawnEffect(point.x, point.y, 'achievement', {
        color: '#f6d873',
        text: achievement.title,
        duration: 1500,
        size: 1.2
      });
    } else {
      spawnEffect(gameWidth * 0.5, gameHeight * 0.44, 'achievement', {
        color: '#f6d873',
        text: achievement.title,
        duration: 1500,
        size: 1.25
      });
    }
    return true;
  }

  function calculateMatchScore() {
    const currentWave = Math.max(matchStats.waves, safe(() => wave, 1));
    const currentGold = Math.max(0, Math.floor(safe(() => gold, 0)));
    const score =
      currentWave * 1000 +
      matchStats.captured * 260 +
      matchStats.upgrades * 140 +
      matchStats.fortified * 95 +
      matchAchievements.size * 420 +
      currentGold * 2 -
      matchStats.lost * 220;
    return Math.max(0, Math.round(score));
  }

  function saveMatchScore(score) {
    if (matchSummarySaved) return;
    matchSummarySaved = true;

    const existing = readJsonStorage(HIGHSCORES_KEY, []);
    const highscores = Array.isArray(existing) ? existing.filter((entry) => entry && Number.isFinite(Number(entry.score))) : [];
    highscores.push({
      name: getPlayerName(),
      score,
      wave: Math.max(matchStats.waves, safe(() => wave, 1)),
      date: new Date().toISOString().slice(0, 10),
      source: 'mastil'
    });
    highscores.sort((a, b) => Number(b.score) - Number(a.score));
    writeJsonStorage(HIGHSCORES_KEY, highscores.slice(0, 25));
  }

  function renderMatchSummary() {
    const screen = document.getElementById('game-over');
    if (!screen) return;

    const score = calculateMatchScore();
    saveMatchScore(score);

    let summary = document.getElementById('mastil-match-summary');
    if (!summary) {
      summary = document.createElement('div');
      summary.id = 'mastil-match-summary';
      const restartButton = document.getElementById('restart-button');
      screen.insertBefore(summary, restartButton || null);
    }

    const awards = Array.from(matchAchievements)
      .map((id) => ACHIEVEMENTS[id])
      .filter(Boolean);

    summary.innerHTML = `
      <div class="mastil-summary-score">
        <span>Ruhm</span>
        <strong>${score.toLocaleString('de-DE')}</strong>
      </div>
      <div class="mastil-summary-grid">
        <span><strong>${Math.max(matchStats.waves, safe(() => wave, 1))}</strong> Welle</span>
        <span><strong>${matchStats.captured}</strong> erobert</span>
        <span><strong>${matchStats.upgrades}</strong> ausgebaut</span>
        <span><strong>${matchStats.fortified}</strong> befestigt</span>
        <span><strong>${matchStats.edicts}</strong> Edikte</span>
        <span><strong>${matchStats.lost}</strong> verloren</span>
        <span><strong>${unlockedAchievements.size}/${TOTAL_ACHIEVEMENTS}</strong> Auszeichnungen</span>
      </div>
      <div class="mastil-summary-awards">
        <span>Neue Auszeichnungen</span>
        <strong>${awards.length ? awards.map((award) => award.title).join(' | ') : 'Keine neue Auszeichnung'}</strong>
      </div>
    `;
  }

  function resetMatchProgress() {
    eventLog.length = 0;
    impactThrottle.clear();
    matchAchievements.clear();
    matchSummarySaved = false;
    lastLowUnitWarningAt = 0;
    matchStats.captured = 0;
    matchStats.lost = 0;
    matchStats.upgrades = 0;
    matchStats.fortified = 0;
    matchStats.edicts = 0;
    matchStats.waves = 1;
    matchStats.commands = 0;
    matchStats.specialized = 0;
    matchStats.assaults = 0;
    matchStats.rallies = 0;
    commandCooldowns.clear();
    edictState.pending = false;
    edictState.nextWave = 0;
    edictState.choices = [];
    edictState.continueWave = null;
    const edictModal = document.getElementById('mastil-edict-modal');
    if (edictModal) edictModal.classList.remove('active');
    const summary = document.getElementById('mastil-match-summary');
    if (summary) summary.remove();
    updateEventLogDom();
    setTimeout(() => {
      if (document.getElementById('mastil-event-list')) {
        pushEvent('Einsatz bereit', 'info');
      }
    }, 0);
  }

  function getTowerRoleName(type) {
    const names = {
      gold: 'Goldturm',
      troop: 'Truppenturm',
      watch: 'Wachturm',
      normal: 'Bastion'
    };
    return names[type] || 'Bastion';
  }

  function getTowerTierName(level) {
    const current = Number(level) || 1;
    if (current >= 9) return 'Kaiserzitadelle';
    if (current >= 7) return 'Hochfeste';
    if (current >= 5) return 'Zitadelle';
    if (current >= 4) return 'Festung';
    if (current >= 3) return 'Burg';
    if (current >= 2) return 'Wehrturm';
    return 'Vorposten';
  }

  function getNextTowerType(type) {
    const types = safe(() => TOWER_TYPES, { NORMAL: 'normal', TROOP: 'troop', GOLD: 'gold', WATCH: 'watch' });
    const order = [types.NORMAL, types.TROOP, types.GOLD, types.WATCH];
    const index = Math.max(0, order.indexOf(type));
    return order[(index + 1) % order.length];
  }

  function getTerrainInfo(terrain) {
    return TERRAIN[terrain] || TERRAIN.road;
  }

  function getHeldTerrainTypes(towerList = getPlayerTowers()) {
    return new Set(towerList.map((tower) => tower.terrain).filter(Boolean));
  }

  function applyTerrainEconomy(tower, deltaTime) {
    if (!tower || tower.faction !== safe(() => FACTIONS.PLAYER, 'player')) return;
    tower.mastilTerrainTimer = (tower.mastilTerrainTimer || 0) + deltaTime;

    if (tower.terrain === 'market') {
      tower.mastilMarketTimer = (tower.mastilMarketTimer || 0) + deltaTime * (0.36 + tower.level * 0.05);
      if (tower.mastilMarketTimer >= 1) {
        const bonus = Math.floor(tower.mastilMarketTimer);
        safe(() => {
          gold += bonus;
        });
        tower.mastilMarketTimer -= bonus;
      }
    }

    if (tower.terrain === 'barracks' && tower.mastilTerrainTimer >= 5.6 && tower.units < tower.maxUnits) {
      tower.units = Math.min(tower.maxUnits, tower.units + 1);
      tower.mastilTerrainTimer = 0;
    }
  }

  function getBossTowers() {
    return safe(() => towers.filter((tower) => tower.boss && tower.faction !== FACTIONS.PLAYER), []);
  }

  function promoteBossTower(waveNumber) {
    const region = getRegionForWave(waveNumber);
    const enemies = getEnemyTowers();
    if (!enemies.length) return null;
    enemies.forEach((tower) => {
      tower.boss = false;
      tower.bossName = '';
    });
    const boss = enemies
      .map((tower) => ({
        tower,
        score: (tower.level || 1) * 20 + tower.units + tower.routeRank * 3 + (tower.type === 'watch' ? 12 : 0)
      }))
      .sort((a, b) => b.score - a.score)[0].tower;
    boss.boss = true;
    boss.bossName = region.boss;
    boss.level = Math.min(7, Math.max(boss.level || 1, 3 + Math.floor(waveNumber / 5)));
    if (typeof getTowerMaxUnits === 'function') {
      boss.maxUnits = getTowerMaxUnits(boss.faction, boss.type, boss.level);
    }
    boss.units = Math.min(boss.maxUnits, Math.max(boss.units, Math.floor(boss.maxUnits * 0.88)));
    boss.fortifiedUntil = performance.now() + 18000;
    return boss;
  }

  function createEdictModal() {
    if (edictModalReady || document.getElementById('mastil-edict-modal')) return;
    edictModalReady = true;

    const modal = document.createElement('div');
    modal.id = 'mastil-edict-modal';
    modal.className = 'mastil-modal mastil-edict-modal';
    modal.innerHTML = `
      <div class="mastil-dialog mastil-edict-dialog" role="dialog" aria-modal="true" aria-labelledby="mastil-edict-title">
        <span class="mastil-edict-kicker">Königlicher Rat</span>
        <h2 id="mastil-edict-title">Edikt wählen</h2>
        <p id="mastil-edict-detail">Eine Entscheidung stärkt Euer Reich für die nächste Welle.</p>
        <div class="mastil-edict-grid" id="mastil-edict-grid"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (event) => {
      const button = event.target && event.target.closest ? event.target.closest('[data-edict-id]') : null;
      if (!button) return;
      chooseEdict(button.dataset.edictId);
    });
  }

  function getEdictChoices(nextWave) {
    const pool = EDICTS.slice();
    const seed = nextWave + matchStats.captured + matchStats.upgrades + matchStats.edicts;
    const choices = [];
    let index = seed % pool.length;
    while (choices.length < 3 && pool.length) {
      index %= pool.length;
      choices.push(pool.splice(index, 1)[0]);
      index += 2;
    }
    return choices;
  }

  function showEdictModal(nextWave, continueWave) {
    createEdictModal();
    const modal = document.getElementById('mastil-edict-modal');
    const title = document.getElementById('mastil-edict-title');
    const detail = document.getElementById('mastil-edict-detail');
    const grid = document.getElementById('mastil-edict-grid');
    if (!modal || !title || !detail || !grid) {
      if (typeof continueWave === 'function') continueWave();
      return;
    }

    edictState.pending = true;
    edictState.nextWave = nextWave;
    edictState.choices = getEdictChoices(nextWave);
    edictState.continueWave = continueWave;
    title.textContent = `Edikt für Welle ${nextWave}`;
    detail.textContent = 'Wähle einen Beschluss. Danach beginnt die nächste Welle.';
    grid.innerHTML = edictState.choices.map((edict) => `
      <button class="mastil-edict-card" type="button" data-edict-id="${edict.id}">
        <span>${edict.effect}</span>
        <strong>${edict.title}</strong>
        <small>${edict.detail}</small>
      </button>
    `).join('');
    modal.classList.add('active');
    pushEvent('Königlicher Rat einberufen', 'edict');
    playSound('wave');
  }

  function getOwnTowers() {
    return safe(() => towers.filter((tower) => tower.faction === FACTIONS.PLAYER), []);
  }

  function getEnemyTowers() {
    return safe(() => towers.filter((tower) => tower.faction !== FACTIONS.PLAYER && tower.faction !== FACTIONS.NEUTRAL), []);
  }

  function applyEdictEffect(edict, nextWave) {
    const own = getOwnTowers();
    const enemy = getEnemyTowers();
    if (!edict) return;

    if (edict.id === 'treasury') {
      const bonus = 70 + nextWave * 10;
      safe(() => {
        gold += bonus;
        updateUI();
      });
      showEnhancementNotice(`Kriegsschatz: +${bonus} Gold`);
    }

    if (edict.id === 'muster') {
      own.forEach((tower) => {
        const amount = 5 + Math.floor(nextWave / 2);
        tower.units = Math.min(tower.maxUnits, tower.units + amount);
        spawnEffect(tower.x, tower.y, 'achievement', { color: '#8fc3f0', text: `+${amount}`, duration: 1150, size: 0.9 });
      });
      showEnhancementNotice('Heerbann: Truppen verstärkt.');
    }

    if (edict.id === 'engineers') {
      const home = own.sort((a, b) => a.x - b.x)[0];
      if (home) {
        home.level = Math.min(5, (home.level || 1) + 1);
        home.maxUnits = typeof getTowerMaxUnits === 'function'
          ? getTowerMaxUnits(home.faction, home.type, home.level)
          : home.maxUnits + 8;
        home.units = Math.min(home.maxUnits, home.units + 8);
        spawnEffect(home.x, home.y, 'upgrade', { color: '#e2bd5a', text: `Level ${home.level}`, duration: 1250, size: 1.05 });
      }
      showEnhancementNotice('Baumeistergilde: Heimatturm ausgebaut.');
    }

    if (edict.id === 'bulwark') {
      own.forEach((tower) => {
        tower.fortifiedUntil = performance.now() + 24000 + nextWave * 900;
        spawnEffect(tower.x, tower.y, 'fortify', { color: '#f4e6bf', text: 'Schutz', duration: 1050, size: 0.92 });
      });
      matchStats.fortified += own.length;
      showEnhancementNotice('Steinerner Eid: Türme befestigt.');
    }

    if (edict.id === 'scouts') {
      enemy.forEach((tower) => {
        tower.units = Math.max(1, Math.floor(tower.units * 0.76));
        spawnEffect(tower.x, tower.y, 'impact', { color: '#f1cf6b', text: 'Späher', duration: 1000, size: 0.84 });
      });
      showEnhancementNotice('Spähernetz: Feindliche Vorhut geschwächt.');
    }

    pushEvent(`Edikt: ${edict.title}`, 'edict');
    playSound('achievement');
  }

  function chooseEdict(id) {
    if (!edictState.pending) return;
    const edict = edictState.choices.find((choice) => choice.id === id);
    const continueWave = edictState.continueWave;
    const nextWave = edictState.nextWave;
    const modal = document.getElementById('mastil-edict-modal');

    edictState.pending = false;
    edictState.continueWave = null;
    edictState.choices = [];
    if (modal) modal.classList.remove('active');

    matchStats.edicts += 1;
    unlockAchievement('firstEdict');
    if (matchStats.edicts >= 3) unlockAchievement('councilMaster');

    if (typeof continueWave === 'function') {
      continueWave();
    }
    setTimeout(() => applyEdictEffect(edict, nextWave), 420);
  }

  function getTacticalAdvice(own, enemy, neutral, selected) {
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const currentGold = Math.floor(safe(() => gold, 0));
    if (!own.length) return 'Verteidigung gebrochen.';
    if (!selected) return 'Wähle einen Turm, dann Angriff oder Ausbau.';
    if (selected.faction !== playerFaction) return 'Wähle zuerst einen eigenen Turm.';

    const upgradeCost = typeof getUpgradeCost === 'function' ? getUpgradeCost(selected) : 65;
    const pressure = enemy.length - own.length;
    const fortified = selected.fortifiedUntil && selected.fortifiedUntil > performance.now();

    if (pressure >= 2 && !fortified && currentGold >= 28 + selected.level * 7) {
      return 'Frontdruck hoch: wichtigen Turm befestigen.';
    }
    if (currentGold >= upgradeCost && selected.units >= Math.ceil(selected.maxUnits * 0.45)) {
      return 'Ausbau bereit: dieser Turm kann stärker werden.';
    }
    if (own.length >= 3 && enemy.length && selected.units < selected.maxUnits * 0.32) {
      return 'Reserveturm schwach: Sammeln bündelt Truppen an der Front.';
    }
    if (own.length >= 3 && enemy.length && own.some((tower) => tower.units > tower.maxUnits * 0.55)) {
      return 'Mehrere Türme bereit: Frontangriff kann die Linie brechen.';
    }
    if (currentGold >= 42 + selected.level * 16 && selected.level >= 2) {
      return 'Gilde verfügbar: Spezialisiere Türme für Gold, Truppen oder Wacht.';
    }
    if (neutral.length && own.length < 3) {
      return 'Früh expandieren: neutrale Türme sichern.';
    }
    if (selected.type === 'gold' && currentGold < upgradeCost) {
      return 'Goldturm halten, Einkommen wächst langsam aber stetig.';
    }
    if (selected.type === 'watch') {
      return 'Wachturm schützt Nachbarn: Umgebung ausbauen.';
    }
    if (selected.terrain === 'market') {
      return 'Markt halten: dieser Standort finanziert lange Gefechte.';
    }
    if (selected.terrain === 'barracks') {
      return 'Kasernenhof halten: hier wachsen Reserven schneller.';
    }
    if (['hill', 'forest', 'ford'].includes(selected.terrain)) {
      return `${getTerrainInfo(selected.terrain).label}: guter Ort für Schild oder Sammelbefehl.`;
    }
    if (selected.units >= Math.ceil(selected.maxUnits * 0.7)) {
      return 'Genug Truppen: ein gezielter Angriff lohnt sich.';
    }
    return 'Truppen sammeln und kurze Wege nutzen.';
  }

  function getObjectiveState(own, enemy, neutral) {
    const currentWave = safe(() => wave, 1);
    if (isBossWave(currentWave) && enemy.length > 0) {
      const region = getRegionForWave(currentWave);
      const bossCount = getBossTowers().length;
      return {
        title: `Boss: ${region.boss}`,
        detail: bossCount
          ? `Breche den markierten Boss-Turm. ${enemy.length} Feindposten stehen noch.`
          : `Halte die Linien und besiege ${enemy.length} Feindposten.`,
        progress: Math.min(1, own.length / Math.max(1, enemy.length + own.length))
      };
    }

    if (!own.length) {
      return {
        title: 'Reich retten',
        detail: 'Halte mindestens einen Turm.',
        progress: 0
      };
    }

    if (own.length < 3 && neutral.length > 0) {
      return {
        title: 'Grenzen sichern',
        detail: `Erobere ${Math.min(2, neutral.length)} neutrale Türme.`,
        progress: Math.min(1, Math.max(0, (own.length - 1) / 2))
      };
    }

    if (enemy.length > 0) {
      const totalFront = enemy.length + own.length;
      return {
        title: `Welle ${currentWave} brechen`,
        detail: `${enemy.length} gegnerische Türme verbleiben.`,
        progress: Math.min(1, own.length / Math.max(1, totalFront))
      };
    }

    return {
      title: 'Sieg sichern',
      detail: 'Bereite die nächste Welle vor.',
      progress: 1
    };
  }

  function applyBossWavePressure(waveNumber) {
    if (!isBossWave(waveNumber)) return;
    const region = getRegionForWave(waveNumber);
    const enemy = getEnemyTowers();
    const boss = promoteBossTower(waveNumber);
    enemy.forEach((tower) => {
      tower.level = Math.min(tower === boss ? 7 : 5, (tower.level || 1) + 1);
      tower.maxUnits = typeof getTowerMaxUnits === 'function'
        ? getTowerMaxUnits(tower.faction, tower.type, tower.level)
        : tower.maxUnits + 8;
      tower.units = Math.min(tower.maxUnits, Math.max(tower.units, Math.floor(tower.maxUnits * (tower === boss ? 0.92 : 0.72))));
      spawnEffect(tower.x, tower.y, 'achievement', {
        color: tower === boss ? '#ffb17e' : '#e2bd5a',
        text: tower === boss ? 'Boss' : 'Wache',
        duration: 1400,
        size: 1.12
      });
    });
    pushEvent(boss ? `Bosswelle: ${region.boss} erscheint` : `Bosswelle: ${region.boss}`, 'danger');
    showEnhancementNotice(`Bosswelle ${waveNumber}: ${region.boss} betritt die Karte.`);
    playSound('wave');
  }

  function getPlayerTowers() {
    return safe(() => towers.filter((tower) => tower.faction === FACTIONS.PLAYER), []);
  }

  function getAttackTargets() {
    return safe(() => towers.filter((tower) => tower.faction !== FACTIONS.PLAYER), []);
  }

  function getEnemyFaction(index, opponentCount) {
    const factions = safe(() => [FACTIONS.ENEMY_1, FACTIONS.ENEMY_2, FACTIONS.ENEMY_3], ['enemy1', 'enemy2', 'enemy3']);
    return factions[index % Math.max(1, Math.min(opponentCount, factions.length))];
  }

  function applyPlayerColor(config) {
    const color = config.color || '#2f6fa5';
    window.MASTIL_PLAYER_COLOR = color;
    safe(() => {
      FACTION_COLORS[FACTIONS.PLAYER] = color;
    });
  }

  function createBattleTower(node, faction, level, unitFactor) {
    const tower = createTower(
      gameWidth * node.x,
      gameHeight * node.y,
      faction,
      typeFromKey(node.type),
      Math.max(1, Math.min(5, level))
    );
    if (faction !== safe(() => FACTIONS.PLAYER, 'player')) {
      tower.units = Math.max(1, Math.floor(tower.maxUnits * unitFactor));
    }
    tower.routeRank = node.rank;
    tower.terrain = node.terrain || 'road';
    tower.boss = false;
    tower.bossName = '';
    return tower;
  }

  function buildBattleMap(options = {}) {
    const config = getMatchConfig();
    const difficulty = DIFFICULTY[config.difficulty] || DIFFICULTY.normal;
    const currentWave = Math.max(1, safe(() => wave, 1));
    const bossWave = isBossWave(currentWave);
    const limit = SIZE_LIMITS[config.size] || SIZE_LIMITS.standard;
    const skirmishStartRank = config.mode === 'skirmish'
      ? ({ compact: 0, standard: 1, large: 1, war: 2 }[config.size] || 1)
      : 0;
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const neutralFaction = safe(() => FACTIONS.NEUTRAL, 'neutral');
    const opponentCount = Math.max(1, Math.min(3, Number(config.opponents) || 2));

    applyPlayerColor(config);
    updateWorldImageForCurrentWave();

    const previousHome = safe(() => towers.find((tower) => tower.faction === playerFaction), null);
    const previousGold = safe(() => gold, 0);
    towers = [];
    units = [];
    gold = options.preserveHome ? previousGold : (config.mode === 'skirmish' ? difficulty.gold : 120);

    const activeNodes = MAP_NODES
      .slice(0, limit)
      .filter((node) => node.role !== 'enemy' || node.rank <= 3 + opponentCount + Math.floor(currentWave / 4) || config.mode === 'skirmish');

    let enemyIndex = 0;
    for (const node of activeNodes) {
      const playerStartNode = node.role === 'player' || (config.mode === 'skirmish' && node.role === 'neutral' && node.rank <= skirmishStartRank);
      if (playerStartNode) {
        const home = createBattleTower(node, playerFaction, previousHome && options.preserveHome ? previousHome.level : 1, 0.65);
        if (previousHome && options.preserveHome) {
          home.units = Math.min(home.maxUnits, Math.max(10, Math.floor(previousHome.units * 0.65)));
          home.type = previousHome.type || home.type;
        } else if (config.mode === 'skirmish' && node.role !== 'player') {
          home.units = Math.min(home.maxUnits, Math.max(home.units, Math.floor(home.maxUnits * 0.54)));
        }
        towers.push(home);
        continue;
      }

      if (node.role === 'enemy') {
        const faction = getEnemyFaction(enemyIndex, opponentCount);
        const level = 1 + difficulty.enemyLevel + Math.floor(currentWave / 6) + (bossWave ? 1 : 0);
        const factor = Math.min(0.96, difficulty.enemyUnits + currentWave * 0.018 + (bossWave ? 0.16 : 0));
        towers.push(createBattleTower(node, faction, level, factor));
        enemyIndex += 1;
        continue;
      }

      const neutralLevel = currentWave >= 10 && node.rank >= 4 ? 2 : 1;
      towers.push(createBattleTower(node, neutralFaction, neutralLevel, 0.36 + Math.min(0.16, currentWave * 0.01)));
    }

    if (enemyIndex === 0) {
      const front = MAP_NODES.find((node) => node.role === 'enemy') || { x: 0.82, y: 0.5, type: 'normal', rank: 4 };
      towers.push(createBattleTower(front, getEnemyFaction(0, opponentCount), 1 + difficulty.enemyLevel, difficulty.enemyUnits));
    }

    if (bossWave) {
      promoteBossTower(currentWave);
    }

    window.MASTIL_ACTIVE_REGION = getActiveRegion();
    window.MASTIL_ACTIVE_BOSS_WAVE = bossWave;
    const graceByDifficulty = { easy: 22000, normal: 17000, hard: 12500, brutal: 9000 };
    window.mastilAiGraceUntil = performance.now() + (config.mode === 'skirmish' ? (graceByDifficulty[config.difficulty] || 15000) : 12000);
    safe(() => saveGameState());
    pushEvent(config.mode === 'skirmish' ? `Gefecht: ${difficulty.label}` : 'Kampagne gestartet', 'wave');
  }

  function installMapOverrides() {
    if (typeof initMap === 'function' && !initMap.__mastilMapWrapped) {
      initMap = function enhancedInitMap() {
        buildBattleMap({ preserveHome: false });
      };
      initMap.__mastilMapWrapped = true;
    }
    if (typeof resetGameBoard === 'function' && !resetGameBoard.__mastilMapWrapped) {
      resetGameBoard = function enhancedResetGameBoard() {
        buildBattleMap({ preserveHome: true });
      };
      resetGameBoard.__mastilMapWrapped = true;
    }
  }

  function selectStrongestTower() {
    const candidates = getPlayerTowers().filter((tower) => tower.units > 1);
    if (!candidates.length) {
      showEnhancementNotice('Kein eigener Turm mit Einheiten verfügbar.');
      playSound('error');
      return null;
    }
    const best = candidates.sort((a, b) => b.units - a.units)[0];
    safe(() => {
      selectedTower = best;
      hideTowerMenu();
    });
    showEnhancementNotice('Stärkster Turm ausgewählt.');
    playSound('select');
    return best;
  }

  function quickAttackWeakest() {
    const source = safe(() => selectedTower && selectedTower.faction === FACTIONS.PLAYER ? selectedTower : null, null) || selectStrongestTower();
    if (!source || source.units <= 1) return;

    const targets = getAttackTargets();
    if (!targets.length) {
      showEnhancementNotice('Keine Ziele verfügbar.');
      playSound('error');
      return;
    }
    const target = targets
      .map((tower) => ({
        tower,
        score: tower.units + Math.hypot(tower.x - source.x, tower.y - source.y) / 80
      }))
      .sort((a, b) => a.score - b.score)[0].tower;

    const amount = Math.max(1, Math.floor(source.units * 0.5));
    safe(() => sendUnitsFromTower(source, target, amount));
    unlockAchievement('firstCommand', { tower: source });
    spawnEffect(source.x, source.y, 'attack', { color: colorForFaction(source.faction), text: `-${amount}` });
    spawnEffect(target.x, target.y, 'impact', { color: '#f1cf6b', duration: 650, size: 0.75 });
    showEnhancementNotice(`Schnellangriff: ${amount} Einheiten entsandt.`);
  }

  function isCommandReady(key, cooldownMs, label) {
    const now = performance.now();
    const readyAt = commandCooldowns.get(key) || 0;
    if (now < readyAt) {
      const seconds = Math.ceil((readyAt - now) / 1000);
      showEnhancementNotice(`${label} wieder bereit in ${seconds}s.`);
      playSound('error');
      return false;
    }
    commandCooldowns.set(key, now + cooldownMs);
    return true;
  }

  function recordTacticalCommand(text, kind = 'info') {
    matchStats.commands += 1;
    pushEvent(text, kind);
    if (matchStats.commands >= 3) {
      unlockAchievement('tacticalCommander');
    }
  }

  function getNearestTargetFor(source, candidates) {
    return candidates
      .map((tower) => ({
        tower,
        score:
          tower.units +
          Math.hypot(tower.x - source.x, tower.y - source.y) / 95 +
          (tower.faction === safe(() => FACTIONS.NEUTRAL, 'neutral') ? 8 : 0)
      }))
      .sort((a, b) => a.score - b.score)[0]?.tower || null;
  }

  function coordinatedAssault() {
    if (!isCommandReady('assault', 14000, 'Frontalangriff')) return;

    const own = getPlayerTowers().filter((tower) => tower.units >= Math.max(4, tower.maxUnits * 0.24));
    const enemies = getEnemyTowers();
    const neutral = safe(() => towers.filter((tower) => tower.faction === FACTIONS.NEUTRAL), []);
    const candidates = enemies.length ? enemies : neutral;
    if (!own.length || !candidates.length) {
      commandCooldowns.delete('assault');
      showEnhancementNotice('Frontalangriff braucht eigene Truppen und ein Ziel.');
      playSound('error');
      return;
    }

    let sentTotal = 0;
    own.forEach((source) => {
      const target = getNearestTargetFor(source, candidates);
      if (!target) return;
      const pressure = source.type === safe(() => TOWER_TYPES && TOWER_TYPES.TROOP, 'troop') ? 0.45 : 0.34;
      const amount = Math.max(1, Math.floor(source.units * pressure));
      if (amount <= 0) return;
      sentTotal += amount;
      safe(() => sendUnitsFromTower(source, target, amount));
      spawnEffect(source.x, source.y, 'attack', { color: colorForFaction(source.faction), text: `-${amount}`, duration: 850, size: 1.05 });
      spawnEffect(target.x, target.y, 'impact', { color: '#f1cf6b', duration: 760, size: 0.85 });
    });

    if (sentTotal <= 0) {
      commandCooldowns.delete('assault');
      showEnhancementNotice('Keine Truppen für den Frontalangriff bereit.');
      playSound('error');
      return;
    }

    matchStats.assaults += 1;
    recordTacticalCommand(`Frontalangriff: ${sentTotal} Einheiten`, 'danger');
    unlockAchievement('grandOffensive');
    showEnhancementNotice(`Frontalangriff: ${sentTotal} Einheiten marschieren.`);
    playSound('attack');
  }

  function rallyToSelectedTower() {
    if (!isCommandReady('rally', 11000, 'Sammelbefehl')) return;

    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const own = getPlayerTowers();
    let target = safe(() => selectedTower && selectedTower.faction === playerFaction ? selectedTower : null, null);
    if (!target) {
      target = own
        .map((tower) => ({ tower, need: tower.maxUnits - tower.units }))
        .sort((a, b) => b.need - a.need)[0]?.tower || null;
    }

    if (!target) {
      commandCooldowns.delete('rally');
      showEnhancementNotice('Kein Sammelziel gefunden.');
      playSound('error');
      return;
    }

    let sentTotal = 0;
    own
      .filter((source) => source !== target && source.units >= 5)
      .forEach((source) => {
        const amount = Math.max(1, Math.floor(source.units * 0.28));
        sentTotal += amount;
        safe(() => sendUnitsFromTower(source, target, amount));
        spawnEffect(source.x, source.y, 'attack', { color: colorForFaction(source.faction), text: `-${amount}`, duration: 820, size: 0.86 });
      });

    if (sentTotal <= 0) {
      commandCooldowns.delete('rally');
      showEnhancementNotice('Keine Reserven zum Sammeln bereit.');
      playSound('error');
      return;
    }

    selectedTower = target;
    matchStats.rallies += 1;
    recordTacticalCommand(`Sammelbefehl: ${sentTotal} Reserven`, 'defense');
    spawnEffect(target.x, target.y, 'fortify', { color: '#8fc3f0', text: `+${sentTotal}`, duration: 1150, size: 1.05 });
    showEnhancementNotice(`Sammelbefehl: ${sentTotal} Reserven zum ${getTowerTierName(target.level)}.`);
    playSound('select');
  }

  function upgradeSelectedTower() {
    const selected = safe(() => selectedTower, null);
    if (!selected || selected.faction !== safe(() => FACTIONS.PLAYER, 'player')) {
      showEnhancementNotice('Bitte zuerst einen eigenen Turm auswählen.');
      playSound('error');
      return;
    }
    safe(() => handleUpgrade());
  }

  function specializeSelectedTower() {
    const selected = safe(() => selectedTower, null);
    if (!selected || selected.faction !== safe(() => FACTIONS.PLAYER, 'player')) {
      showEnhancementNotice('Bitte zuerst einen eigenen Turm auswählen.');
      playSound('error');
      return;
    }

    const currentGold = safe(() => gold, 0);
    const cost = 42 + selected.level * 16 + matchStats.specialized * 6;
    if (currentGold < cost) {
      showEnhancementNotice(`Spezialisierung benötigt ${cost} Gold.`);
      playSound('error');
      return;
    }

    const nextType = getNextTowerType(selected.type);
    safe(() => {
      gold -= cost;
      selected.type = nextType;
      if (typeof getTowerMaxUnits === 'function') {
        selected.maxUnits = getTowerMaxUnits(selected.faction, selected.type, selected.level);
      }
      selected.units = Math.min(selected.maxUnits, Math.ceil(selected.units + selected.level * 2));
      hideTowerMenu();
    });
    matchStats.specialized += 1;
    recordTacticalCommand(`Spezialisierung: ${getTowerRoleName(nextType)}`, 'upgrade');
    unlockAchievement('firstSpecialist', { tower: selected });
    spawnEffect(selected.x, selected.y, 'upgrade', {
      color: '#e2bd5a',
      text: getTowerRoleName(nextType),
      duration: 1300,
      size: 1.05
    });
    showEnhancementNotice(`${getTowerTierName(selected.level)} ist jetzt ${getTowerRoleName(nextType)}. -${cost} Gold`);
    playSound('upgrade');
  }

  function fortifySelectedTower() {
    const selected = safe(() => selectedTower, null);
    if (!selected || selected.faction !== safe(() => FACTIONS.PLAYER, 'player')) {
      showEnhancementNotice('Bitte zuerst einen eigenen Turm auswählen.');
      playSound('error');
      return;
    }

    const cost = 28 + (selected.level * 7);
    const currentGold = safe(() => gold, 0);
    if (currentGold < cost) {
      showEnhancementNotice(`Befestigen benötigt ${cost} Gold.`);
      playSound('error');
      return;
    }

    safe(() => {
      gold -= cost;
      selected.fortifiedUntil = performance.now() + 18000 + (selected.level * 2000);
      hideTowerMenu();
    });
    spawnEffect(selected.x, selected.y, 'fortify', { color: '#f4e6bf', text: 'Befestigt', duration: 1050, size: 1.08 });
    playSound('fortify');
    matchStats.fortified += 1;
    pushEvent('Turm befestigt', 'defense');
    unlockAchievement('firstFortify', { tower: selected });
    showEnhancementNotice(`Turm befestigt. -${cost} Gold`);
  }

  function installMechanicFeedback() {
    if (effectsReady) return;
    effectsReady = true;

    if (typeof sendUnitsFromTower === 'function' && !sendUnitsFromTower.__mastilFxWrapped) {
      const originalSendUnits = sendUnitsFromTower;
      sendUnitsFromTower = function enhancedSendUnits(sourceTower, targetTower, unitCount) {
        const available = Math.floor(sourceTower && sourceTower.units ? sourceTower.units : 0);
        let requested = Math.max(0, Math.floor(unitCount || 0));
        if (sourceTower && sourceTower.terrain === 'road') requested = Math.ceil(requested * 1.08);
        if (sourceTower && sourceTower.terrain === 'barracks') requested += requested >= 6 ? 1 : 0;
        const sent = Math.max(0, Math.min(requested, available));
        const result = originalSendUnits.call(this, sourceTower, targetTower, sent);
        if (sourceTower && targetTower && sent > 0) {
          spawnEffect(sourceTower.x, sourceTower.y, 'attack', {
            color: colorForFaction(sourceTower.faction),
            text: `-${sent}`,
            duration: 780,
            size: Math.min(1.6, 0.85 + sent / 28)
          });
          if (sourceTower.faction === safe(() => FACTIONS.PLAYER, 'player')) {
            unlockAchievement('firstCommand', { tower: sourceTower });
          }
          playSound('attack');
        }
        return result;
      };
      sendUnitsFromTower.__mastilFxWrapped = true;
    }

    if (typeof handleUpgrade === 'function' && !handleUpgrade.__mastilFxWrapped) {
      const originalUpgrade = handleUpgrade;
      handleUpgrade = function enhancedUpgrade() {
        const tower = safe(() => selectedTower, null);
        const beforeLevel = tower ? tower.level : 0;
        const result = originalUpgrade.apply(this, arguments);
        if (tower && tower.level > beforeLevel) {
          matchStats.upgrades += 1;
          spawnEffect(tower.x, tower.y, 'upgrade', {
            color: '#e2bd5a',
            text: `Level ${tower.level}`,
            duration: 1150,
            size: 1.05
          });
          pushEvent(`Turm auf Level ${tower.level}`, 'upgrade');
          playSound('upgrade');
          unlockAchievement('firstUpgrade', { tower });
          if (matchStats.upgrades >= 3) {
            unlockAchievement('masterBuilder', { tower });
          }
        } else {
          playSound('error');
        }
        return result;
      };
      handleUpgrade.__mastilFxWrapped = true;
    }

    if (typeof processUnitArrival === 'function' && !processUnitArrival.__mastilFxWrapped) {
      const originalArrival = processUnitArrival;
      processUnitArrival = function enhancedArrival(unit, targetTower) {
        const beforeUnits = targetTower ? targetTower.units : 0;
        const beforeFaction = targetTower ? targetTower.faction : null;
        const wasFortified = targetTower && targetTower.fortifiedUntil && targetTower.fortifiedUntil > performance.now();
        if (unit && targetTower && unit.faction !== targetTower.faction) {
          const terrainBlock = {
            hill: 0.13,
            ford: 0.11,
            forest: 0.08,
            keep: 0.06,
            quarry: 0.04
          }[targetTower.terrain] || 0;
          if (terrainBlock > 0 && Math.random() < terrainBlock) {
            spawnEffect(targetTower.x, targetTower.y, 'shield', {
              color: getTerrainInfo(targetTower.terrain).color,
              text: getTerrainInfo(targetTower.terrain).short,
              duration: 620,
              size: 0.85
            });
            return undefined;
          }
        }
        const result = originalArrival.apply(this, arguments);
        if (unit && targetTower && unit.faction !== beforeFaction) {
          const key = `${Math.round(targetTower.x)}:${Math.round(targetTower.y)}`;
          const now = performance.now();
          if ((impactThrottle.get(key) || 0) + 180 < now) {
            impactThrottle.set(key, now);
            if (targetTower.units === beforeUnits && wasFortified) {
              spawnEffect(targetTower.x, targetTower.y, 'shield', { color: '#f4e6bf', duration: 620 });
              playSound('blocked');
            } else {
              spawnEffect(targetTower.x, targetTower.y, 'impact', {
                color: colorForFaction(unit.faction),
                duration: 580,
                size: 0.86
              });
              if (now - lastImpactSoundAt > 260) {
                playSound('impact');
                lastImpactSoundAt = now;
              }
            }
          }
        }
        return result;
      };
      processUnitArrival.__mastilFxWrapped = true;
    }

    if (typeof updateTowers === 'function' && !updateTowers.__mastilFxWrapped) {
      const originalUpdateTowers = updateTowers;
      updateTowers = function enhancedUpdateTowers(deltaTime) {
        const before = new Map();
        safe(() => towers.forEach((tower) => before.set(tower, { faction: tower.faction, boss: Boolean(tower.boss), terrain: tower.terrain })));
        const result = originalUpdateTowers.apply(this, arguments);
        safe(() => towers.forEach((tower) => applyTerrainEconomy(tower, deltaTime || 0)));
        safe(() => towers.forEach((tower) => {
          const previous = before.get(tower);
          if (previous && previous.faction !== tower.faction) {
            if (tower.faction === safe(() => FACTIONS.PLAYER, 'player')) {
              matchStats.captured += 1;
              pushEvent(`${getTowerRoleName(tower.type)} erobert`, 'capture');
              unlockAchievement('firstCapture', { tower });
              if (previous.boss) {
                tower.boss = false;
                tower.bossName = '';
                pushEvent('Boss-Turm gebrochen', 'achievement');
                unlockAchievement('bossBreaker', { tower });
              }
              if (getHeldTerrainTypes().size >= 3) {
                unlockAchievement('terrainLord', { tower });
              }
              if (matchStats.captured >= 3) {
                unlockAchievement('bannerLord', { tower });
              }
            } else if (previous.faction === safe(() => FACTIONS.PLAYER, 'player')) {
              matchStats.lost += 1;
              pushEvent('Eigener Turm verloren', 'danger');
            }
            spawnEffect(tower.x, tower.y, 'capture', {
              color: colorForFaction(tower.faction),
              text: 'Erobert',
              duration: 1300,
              size: 1.18
            });
            playSound('capture');
          }
        }));
        return result;
      };
      updateTowers.__mastilFxWrapped = true;
    }

    if (typeof checkGameState === 'function' && !checkGameState.__mastilEdictWrapped) {
      const originalCheckGameState = checkGameState;
      checkGameState = function enhancedCheckGameState() {
        if (edictState.pending) return undefined;
        return originalCheckGameState.apply(this, arguments);
      };
      checkGameState.__mastilEdictWrapped = true;
    }

    if (typeof startNextWave === 'function' && !startNextWave.__mastilObjectiveWrapped) {
      const originalStartNextWave = startNextWave;
      startNextWave = function enhancedStartNextWave() {
        const beforeWave = safe(() => wave, matchStats.waves);
        const runWaveStart = () => {
          const result = originalStartNextWave.apply(this, arguments);
          scheduleWaveFeedback(beforeWave);
          return result;
        };

        if (!edictState.pending && beforeWave >= 1) {
          showEdictModal(beforeWave + 1, runWaveStart);
          return undefined;
        }

        return runWaveStart();
      };
      startNextWave.__mastilObjectiveWrapped = true;
    }

    function scheduleWaveFeedback(beforeWave) {
      setTimeout(() => {
          const afterWave = safe(() => wave, beforeWave);
          matchStats.waves = Math.max(matchStats.waves, afterWave);
          if (afterWave > beforeWave) {
            pushEvent(`Welle ${afterWave} beginnt`, 'wave');
            playSound('wave');
            if (afterWave >= 3) {
              unlockAchievement('waveThree');
            }
            if (afterWave >= 5) {
              unlockAchievement('trialBreaker');
            }
            applyBossWavePressure(afterWave);
          }
        }, 160);
    }

    if (typeof gameOver === 'function' && !gameOver.__mastilFxWrapped) {
      const originalGameOver = gameOver;
      gameOver = function enhancedGameOver() {
        playSound('gameover');
        const result = originalGameOver.apply(this, arguments);
        setTimeout(() => {
          if (matchStats.lost === 0 && matchStats.waves >= 2) {
            unlockAchievement('ironLine');
          }
          renderMatchSummary();
        }, 0);
        return result;
      };
      gameOver.__mastilFxWrapped = true;
    }

    if (typeof initGame === 'function' && !initGame.__mastilProgressWrapped) {
      const originalInitGame = initGame;
      initGame = function enhancedInitGame() {
        resetMatchProgress();
        return originalInitGame.apply(this, arguments);
      };
      initGame.__mastilProgressWrapped = true;
    }
  }

  function createGameControls() {
    if (controlsReady || document.getElementById('mastil-game-controls')) return;
    controlsReady = true;

    const controls = document.createElement('div');
    controls.id = 'mastil-game-controls';
    controls.innerHTML = `
      <button type="button" data-action="select" title="Wählt deinen stärksten Turm"><span class="mastil-command-icon mastil-icon-select" aria-hidden="true"></span><span>Stärkster</span></button>
      <button type="button" data-action="attack" title="Sendet 50% zum schwächsten nahen Ziel"><span class="mastil-command-icon mastil-icon-attack" aria-hidden="true"></span><span>Schnell</span></button>
      <button type="button" data-action="assault" data-cooldown-key="assault" title="Mehrere eigene Türme greifen koordinierte Ziele an"><span class="mastil-command-icon mastil-icon-assault" aria-hidden="true"></span><span>Front</span><small></small></button>
      <button type="button" data-action="rally" data-cooldown-key="rally" title="Sammelt Reserven am gewählten oder schwächsten Turm"><span class="mastil-command-icon mastil-icon-rally" aria-hidden="true"></span><span>Sammeln</span><small></small></button>
      <button type="button" data-action="upgrade" title="Verbessert den gewählten Turm"><span class="mastil-command-icon mastil-icon-upgrade" aria-hidden="true"></span><span>Ausbau</span></button>
      <button type="button" data-action="specialize" title="Wechselt die Rolle des gewählten Turms"><span class="mastil-command-icon mastil-icon-specialize" aria-hidden="true"></span><span>Gilde</span></button>
      <button type="button" data-action="fortify" title="Befestigt den gewählten Turm kurzzeitig"><span class="mastil-command-icon mastil-icon-fortify" aria-hidden="true"></span><span>Schild</span></button>
      <button type="button" data-action="map" title="Mini-Karte ein- oder ausblenden"><span class="mastil-command-icon mastil-icon-map" aria-hidden="true"></span><span>Karte</span></button>
    `;
    document.body.appendChild(controls);

    controls.addEventListener('click', (event) => {
      const button = event.target && event.target.closest ? event.target.closest('button[data-action]') : null;
      const action = button && button.dataset ? button.dataset.action : '';
      if (action === 'select') selectStrongestTower();
      if (action === 'attack') quickAttackWeakest();
      if (action === 'assault') coordinatedAssault();
      if (action === 'rally') rallyToSelectedTower();
      if (action === 'upgrade') upgradeSelectedTower();
      if (action === 'specialize') specializeSelectedTower();
      if (action === 'fortify') fortifySelectedTower();
      if (action === 'map') {
        minimapEnabled = !minimapEnabled;
        button.classList.toggle('off', !minimapEnabled);
        showEnhancementNotice(minimapEnabled ? 'Mini-Karte sichtbar.' : 'Mini-Karte ausgeblendet.');
      }
    });
  }

  function updateCommandButtons() {
    const controls = document.getElementById('mastil-game-controls');
    if (!controls) return;
    const now = performance.now();
    controls.querySelectorAll('button[data-cooldown-key]').forEach((button) => {
      const key = button.dataset.cooldownKey;
      const readyAt = commandCooldowns.get(key) || 0;
      const remaining = Math.max(0, readyAt - now);
      const small = button.querySelector('small');
      button.classList.toggle('cooling', remaining > 0);
      button.style.setProperty('--cooldown-progress', remaining > 0 ? String(Math.min(1, remaining / (key === 'assault' ? 14000 : 11000))) : '0');
      if (small) small.textContent = remaining > 0 ? `${Math.ceil(remaining / 1000)}s` : '';
    });
  }

  function createStrategyPanel() {
    if (strategyPanelReady || document.getElementById('mastil-strategy-panel')) return;
    strategyPanelReady = true;

    const panel = document.createElement('div');
    panel.id = 'mastil-strategy-panel';
    panel.innerHTML = `
      <div class="mastil-strategy-row">
        <span class="mastil-strategy-label">Reich</span>
        <span id="mastil-strategy-domain">-</span>
      </div>
      <div class="mastil-strategy-row">
        <span class="mastil-strategy-label">Front</span>
        <span id="mastil-strategy-front">-</span>
      </div>
      <div class="mastil-strategy-row mastil-strategy-selected">
        <span class="mastil-strategy-label">Turm</span>
        <span id="mastil-strategy-selected">keiner gewählt</span>
      </div>
      <div class="mastil-strategy-row mastil-strategy-advice">
        <span class="mastil-strategy-label">Rat</span>
        <span id="mastil-strategy-advice">Wähle einen Turm.</span>
      </div>
    `;
    document.body.appendChild(panel);
  }

  function createObjectivePanel() {
    if (objectivePanelReady || document.getElementById('mastil-objective-panel')) return;
    objectivePanelReady = true;

    const panel = document.createElement('div');
    panel.id = 'mastil-objective-panel';
    panel.innerHTML = `
      <div class="mastil-objective-head">
        <span>Auftrag</span>
        <strong id="mastil-objective-title">Grenzen sichern</strong>
      </div>
      <div class="mastil-objective-detail" id="mastil-objective-detail">Erobere neutrale Türme.</div>
      <div class="mastil-boss-status" id="mastil-boss-status">Keine Bosswelle</div>
      <div class="mastil-objective-bar" aria-hidden="true">
        <span id="mastil-objective-progress"></span>
      </div>
      <div class="mastil-objective-stats">
        <span id="mastil-stat-captured">0 erobert</span>
        <span id="mastil-stat-upgrades">0 Ausbau</span>
        <span id="mastil-stat-commands">0 Befehle</span>
        <span id="mastil-stat-edicts">0 Edikte</span>
        <span id="mastil-stat-awards">0 Ausz.</span>
      </div>
      <div class="mastil-event-list" id="mastil-event-list"></div>
    `;
    document.body.appendChild(panel);
    if (!eventLog.length) pushEvent('Einsatz bereit', 'info');
  }

  function updateStrategyPanel() {
    const now = performance.now();
    if (now - lastStrategyUpdate < 260) return;
    lastStrategyUpdate = now;

    const currentTowers = safe(() => towers, []);
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const neutralFaction = safe(() => FACTIONS.NEUTRAL, 'neutral');
    const own = currentTowers.filter((tower) => tower.faction === playerFaction);
    const enemy = currentTowers.filter((tower) => tower.faction !== playerFaction && tower.faction !== neutralFaction);
    const neutral = currentTowers.filter((tower) => tower.faction === neutralFaction);
    const selected = safe(() => selectedTower, null);

    const domain = document.getElementById('mastil-strategy-domain');
    const front = document.getElementById('mastil-strategy-front');
    const selectedNode = document.getElementById('mastil-strategy-selected');
    const adviceNode = document.getElementById('mastil-strategy-advice');
    if (!domain || !front || !selectedNode || !adviceNode) return;

    domain.textContent = `${own.length} eigene | ${Math.floor(safe(() => gold, 0))} Gold`;
    front.textContent = `${enemy.length} Gegner | ${neutral.length} neutral`;
    if (selected && selected.faction === playerFaction) {
      const fortified = selected.fortifiedUntil && selected.fortifiedUntil > now ? ' | befestigt' : '';
      const terrain = getTerrainInfo(selected.terrain);
      selectedNode.textContent = `${getTowerTierName(selected.level)} | ${getTowerRoleName(selected.type)} | ${terrain.label} | ${Math.floor(selected.units)}/${selected.maxUnits}${fortified}`;
    } else {
      selectedNode.textContent = 'keiner gewählt';
    }
    adviceNode.textContent = getTacticalAdvice(own, enemy, neutral, selected);
  }

  function updateObjectivePanel() {
    const now = performance.now();
    if (now - lastObjectiveUpdate < 420) return;
    lastObjectiveUpdate = now;

    const currentTowers = safe(() => towers, []);
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const neutralFaction = safe(() => FACTIONS.NEUTRAL, 'neutral');
    const own = currentTowers.filter((tower) => tower.faction === playerFaction);
    const enemy = currentTowers.filter((tower) => tower.faction !== playerFaction && tower.faction !== neutralFaction);
    const neutral = currentTowers.filter((tower) => tower.faction === neutralFaction);
    const objective = getObjectiveState(own, enemy, neutral);

    const title = document.getElementById('mastil-objective-title');
    const detail = document.getElementById('mastil-objective-detail');
    const bossStatus = document.getElementById('mastil-boss-status');
    const progress = document.getElementById('mastil-objective-progress');
    const captured = document.getElementById('mastil-stat-captured');
    const upgrades = document.getElementById('mastil-stat-upgrades');
    const commands = document.getElementById('mastil-stat-commands');
    const edicts = document.getElementById('mastil-stat-edicts');
    const awards = document.getElementById('mastil-stat-awards');
    if (!title || !detail || !progress || !captured || !upgrades || !commands || !edicts || !awards) return;

    title.textContent = objective.title;
    detail.textContent = objective.detail;
    if (bossStatus) {
      const currentWave = safe(() => wave, 1);
      const region = getRegionForWave(currentWave);
      bossStatus.textContent = isBossWave(currentWave)
        ? `Boss aktiv: ${region.boss}`
        : `Naechster Boss: ${region.boss} in Welle ${region.waves[1]}`;
      bossStatus.classList.toggle('active', isBossWave(currentWave));
    }
    progress.style.width = `${Math.round(objective.progress * 100)}%`;
    captured.textContent = `${matchStats.captured} erobert`;
    upgrades.textContent = `${matchStats.upgrades} Ausbau`;
    commands.textContent = `${matchStats.commands} Befehle`;
    edicts.textContent = `${matchStats.edicts} Edikte`;
    awards.textContent = `${matchAchievements.size} Ausz.`;

    const weakTower = own.find((tower) => tower.units <= Math.max(2, tower.maxUnits * 0.22));
    if (weakTower && enemy.length && now - lastLowUnitWarningAt > 14000) {
      lastLowUnitWarningAt = now;
      pushEvent('Ein Turm ist schwach besetzt', 'danger');
      spawnEffect(weakTower.x, weakTower.y, 'shield', { color: '#e2bd5a', duration: 850 });
      playSound('blocked');
    }
  }

  function installRenderOverrides() {
    if (typeof renderGrid === 'function') {
      renderGrid = renderEnhancedWorld;
    }

    if (typeof renderConnections === 'function') {
      renderConnections = drawEnhancedConnections;
    }

    if (typeof renderTower === 'function') {
      renderTower = drawEnhancedTower;
    }

    if (typeof renderUnits === 'function') {
      renderUnits = drawEnhancedUnits;
    }

    if (typeof renderUI === 'function' && !renderUI.__mastilEnhanced) {
      const originalRenderUI = renderUI;
      renderUI = function enhancedRenderUI() {
        originalRenderUI();
        updateStrategyPanel();
        updateObjectivePanel();
        updateCommandButtons();
        drawEffects();
        drawEnhancedMinimap();
      };
      renderUI.__mastilEnhanced = true;
    }
  }

  function init() {
    installRenderOverrides();
    installMapOverrides();
    installMechanicFeedback();
    createGameControls();
    createStrategyPanel();
    createObjectivePanel();
    createAchievementToast();
    createEdictModal();
  }

  window.MastilGameEnhancements = {
    init,
    selectStrongestTower,
    quickAttackWeakest,
    coordinatedAssault,
    rallyToSelectedTower,
    upgradeSelectedTower,
    specializeSelectedTower,
    fortifySelectedTower,
    unlockAchievement,
    getAchievementProgress,
    spawnEffect
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
