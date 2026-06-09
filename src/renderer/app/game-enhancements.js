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
  const BATTLEFIELD_CONDITIONS = {
    startgebiet: {
      id: 'morning-mist',
      title: 'Morgennebel',
      short: 'Nebel',
      detail: 'Ruhiger Anfang: Maerkte arbeiten normal, Befestigungen halten etwas laenger.',
      color: '#d8e9ff',
      particle: 'mist',
      marketRate: 1,
      barracksInterval: 1,
      siegePower: 1,
      fortifyDuration: 1.12,
      washAlpha: 0.08
    },
    grenzlande: {
      id: 'iron-frost',
      title: 'Eiswind',
      short: 'Frost',
      detail: 'Zaehe Grenzluft: Kasernen sammeln langsamer, Schilde halten staerker.',
      color: '#bde3ff',
      particle: 'snow',
      marketRate: 0.96,
      barracksInterval: 1.12,
      siegePower: 0.96,
      fortifyDuration: 1.2,
      washAlpha: 0.11
    },
    wuestenreich: {
      id: 'sandstorm',
      title: 'Sandsturm',
      short: 'Sand',
      detail: 'Sicht schwer, Mauern trocken: Maerkte schwanken, Belagerungen schlagen haerter ein.',
      color: '#f0c875',
      particle: 'sand',
      marketRate: 0.88,
      barracksInterval: 1.04,
      siegePower: 1.14,
      fortifyDuration: 0.94,
      washAlpha: 0.13
    },
    nachtfestung: {
      id: 'night-rain',
      title: 'Nachtregen',
      short: 'Regen',
      detail: 'Dunkle Wege: Maerkte liefern weniger, Kasernen fuehren schneller Reserven heran.',
      color: '#8fc3f0',
      particle: 'rain',
      marketRate: 0.9,
      barracksInterval: 0.84,
      siegePower: 1.04,
      fortifyDuration: 1.06,
      washAlpha: 0.16
    },
    endboss: {
      id: 'ashfall',
      title: 'Aschefall',
      short: 'Asche',
      detail: 'Endkampf-Luft: Einkommen sinkt, Belagerungen und Kasernen werden entscheidend.',
      color: '#ffb17e',
      particle: 'ash',
      marketRate: 0.82,
      barracksInterval: 0.9,
      siegePower: 1.2,
      fortifyDuration: 0.98,
      washAlpha: 0.18
    }
  };
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
    { x: 0.93, y: 0.50, role: 'enemy', type: 'normal', rank: 9, terrain: 'keep' },
    { x: 0.08, y: 0.30, role: 'neutral', type: 'watch', rank: 10, terrain: 'hill' },
    { x: 0.08, y: 0.74, role: 'neutral', type: 'gold', rank: 10, terrain: 'market' },
    { x: 0.68, y: 0.08, role: 'enemy', type: 'watch', rank: 10, terrain: 'keep' },
    { x: 0.68, y: 0.92, role: 'enemy', type: 'troop', rank: 10, terrain: 'keep' }
  ];
  const MAP_LINKS = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5],
    [3, 6], [4, 6], [4, 7], [5, 7], [6, 8], [6, 9],
    [7, 9], [7, 10], [8, 11], [9, 11], [9, 12], [10, 12],
    [3, 13], [5, 14], [13, 17], [14, 18], [8, 15], [10, 16],
    [15, 11], [16, 12], [11, 19], [12, 19], [4, 9],
    [0, 20], [20, 1], [20, 13], [0, 21], [21, 2], [21, 14],
    [15, 22], [22, 8], [22, 11], [22, 19], [16, 23], [23, 10], [23, 12], [23, 19]
  ];
  const MAP_VARIANTS = {
    startgebiet: {
      spreadX: 0.96,
      spreadY: 0.94,
      xShift: 0,
      yShift: 0,
      jitterX: 0.006,
      jitterY: 0.004,
      terrains: ['keep', 'hill', 'market', 'barracks', 'road', 'ford', 'market', 'forest', 'barracks', 'road', 'market', 'hill', 'forest', 'quarry', 'ford', 'hill', 'keep', 'forest', 'market', 'keep', 'hill', 'market', 'keep', 'keep']
    },
    grenzlande: {
      spreadX: 0.9,
      spreadY: 1.06,
      xShift: -0.01,
      yShift: -0.006,
      jitterX: 0.012,
      jitterY: 0.01,
      terrains: ['keep', 'hill', 'ford', 'hill', 'road', 'ford', 'barracks', 'forest', 'barracks', 'road', 'ford', 'hill', 'forest', 'quarry', 'ford', 'hill', 'keep', 'forest', 'market', 'keep', 'hill', 'ford', 'keep', 'keep']
    },
    wuestenreich: {
      spreadX: 1.03,
      spreadY: 0.88,
      xShift: 0.008,
      yShift: 0.03,
      jitterX: 0.016,
      jitterY: 0.014,
      terrains: ['keep', 'road', 'market', 'quarry', 'market', 'road', 'market', 'barracks', 'quarry', 'road', 'market', 'hill', 'barracks', 'quarry', 'market', 'hill', 'keep', 'road', 'market', 'keep', 'market', 'quarry', 'keep', 'market']
    },
    nachtfestung: {
      spreadX: 0.98,
      spreadY: 1.02,
      xShift: 0.015,
      yShift: 0,
      jitterX: 0.02,
      jitterY: 0.018,
      terrains: ['keep', 'forest', 'ford', 'forest', 'road', 'forest', 'market', 'barracks', 'forest', 'road', 'ford', 'hill', 'forest', 'quarry', 'ford', 'forest', 'keep', 'forest', 'market', 'keep', 'forest', 'ford', 'keep', 'keep']
    },
    endboss: {
      spreadX: 1.02,
      spreadY: 0.98,
      xShift: 0.01,
      yShift: -0.005,
      jitterX: 0.01,
      jitterY: 0.006,
      terrains: ['keep', 'hill', 'quarry', 'barracks', 'road', 'ford', 'market', 'barracks', 'keep', 'road', 'quarry', 'hill', 'barracks', 'quarry', 'ford', 'hill', 'keep', 'forest', 'market', 'keep', 'keep', 'quarry', 'keep', 'keep']
    }
  };
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
  const STRATEGIC_SITES = {
    keep: {
      id: 'crownkeep',
      title: 'Kronburg',
      short: 'Krone',
      mark: 'K',
      color: '#e8c65d',
      bonus: 'Ausbau und Verteidigung bleiben stabil.'
    },
    hill: {
      id: 'signal',
      title: 'Signalfeuer',
      short: 'Signal',
      mark: 'S',
      color: '#b7d394',
      bonus: 'Fronttürme erhalten bessere Warnung und Reserven.'
    },
    market: {
      id: 'trade',
      title: 'Handelsstadt',
      short: 'Handel',
      mark: 'H',
      color: '#f0c85c',
      bonus: 'Regelmäßiges Zusatzgold.'
    },
    barracks: {
      id: 'warcamp',
      title: 'Heerlager',
      short: 'Heer',
      mark: 'L',
      color: '#8fc3f0',
      bonus: 'Schwache Türme bekommen Reserven.'
    },
    road: {
      id: 'royalroad',
      title: 'Königsstraße',
      short: 'Straße',
      mark: 'R',
      color: '#d8c49a',
      bonus: 'Befehle laden schneller auf.'
    },
    ford: {
      id: 'rivergate',
      title: 'Flusstor',
      short: 'Tor',
      mark: 'F',
      color: '#8fc7d8',
      bonus: 'Gefährdete Linien halten länger.'
    },
    forest: {
      id: 'hunterwood',
      title: 'Jägerhain',
      short: 'Jäger',
      mark: 'J',
      color: '#9ed6a2',
      bonus: 'Frontposten werden aus dem Hinterland gestützt.'
    },
    quarry: {
      id: 'stoneworks',
      title: 'Steinwerk',
      short: 'Stein',
      mark: 'W',
      color: '#c9c0aa',
      bonus: 'Befestigungen werden günstiger.'
    }
  };
  const VETERAN_RANKS = [
    { threshold: 8, title: 'Bewährt', mark: 'I', color: '#d8e9ff' },
    { threshold: 18, title: 'Veteran', mark: 'II', color: '#f4d77a' },
    { threshold: 34, title: 'Legendär', mark: 'III', color: '#ffb17e' }
  ];
  const SIZE_LIMITS = { compact: 10, standard: 13, large: 16, war: 20, epic: 24 };
  const DIFFICULTY = {
    easy: { gold: 155, enemyUnits: 0.48, enemyLevel: 0, label: 'Training' },
    normal: { gold: 130, enemyUnits: 0.62, enemyLevel: 0, label: 'Normal' },
    hard: { gold: 115, enemyUnits: 0.76, enemyLevel: 1, label: 'Hart' },
    brutal: { gold: 100, enemyUnits: 0.9, enemyLevel: 1, label: 'Brutal' }
  };
  const WAR_PLANS = {
    balanced: {
      label: 'Ausgewogen',
      enemyUnits: 1,
      enemyLevel: 0,
      goldBonus: 0,
      graceFactor: 1,
      commanderTempo: 1,
      detail: 'gemischte Fronten'
    },
    raiders: {
      label: 'Pluenderer',
      enemyUnits: 0.94,
      enemyLevel: 0,
      goldBonus: 10,
      graceFactor: 0.82,
      commanderTempo: 0.82,
      detail: 'schnelle Truppentuerme und Ueberfaelle'
    },
    fortress: {
      label: 'Festungskrieg',
      enemyUnits: 1.1,
      enemyLevel: 1,
      goldBonus: 22,
      graceFactor: 1.08,
      commanderTempo: 1.08,
      detail: 'starke Burgen und Belagerungsziele'
    },
    economy: {
      label: 'Handelskrieg',
      enemyUnits: 0.92,
      enemyLevel: 0,
      goldBonus: 34,
      graceFactor: 1.02,
      commanderTempo: 1,
      detail: 'mehr Maerkte und laengere Versorgungslinien'
    },
    conquest: {
      label: 'Reichskrieg',
      enemyUnits: 1.05,
      enemyLevel: 1,
      goldBonus: 24,
      graceFactor: 1.14,
      commanderTempo: 0.96,
      detail: 'grosse Karten, Burgen und mehrere Fronten'
    }
  };
  const SKIRMISH_SCENARIOS = {
    training: {
      id: 'training',
      label: 'Training',
      goldBonus: 28,
      graceFactor: 1.32,
      startUnits: 1.14,
      enemyUnits: 0.86,
      enemyLevel: 0,
      neutralUnits: 0.88,
      commanderTempo: 1.18
    },
    siege: {
      id: 'siege',
      label: 'Belagerung',
      goldBonus: 22,
      graceFactor: 1.08,
      startUnits: 1.06,
      enemyUnits: 1.08,
      enemyLevel: 1,
      neutralUnits: 1,
      commanderTempo: 1.02,
      fortressBias: true
    },
    trade: {
      id: 'trade',
      label: 'Handelskrieg',
      goldBonus: 42,
      graceFactor: 1.04,
      startUnits: 1.02,
      enemyUnits: 0.94,
      enemyLevel: 0,
      neutralUnits: 1.04,
      commanderTempo: 1,
      tradeBias: true
    },
    shadow: {
      id: 'shadow',
      label: 'Schattenkrieg',
      goldBonus: 16,
      graceFactor: 0.92,
      startUnits: 0.98,
      enemyUnits: 1.06,
      enemyLevel: 0,
      neutralUnits: 1.02,
      commanderTempo: 0.82,
      shadowBias: true
    },
    boss: {
      id: 'boss',
      label: 'Endboss-Schlacht',
      goldBonus: 30,
      graceFactor: 0.9,
      startUnits: 1,
      enemyUnits: 1.18,
      enemyLevel: 1,
      neutralUnits: 1.05,
      commanderTempo: 0.92,
      fortressBias: true,
      bossAtStart: true
    }
  };
  const FACTION_TRAITS = {
    england: {
      name: 'Ritter von Albion',
      short: 'Albion',
      passive: 'Stärkere Starttruppen und längere Befestigung.',
      ability: 'Greifenbanner',
      cooldown: 36000,
      color: '#e8c65d'
    },
    spain: {
      name: 'Solterraner',
      short: 'Solterra',
      passive: 'Märkte und Königswege bringen mehr Einkommen.',
      ability: 'Sonnenkonvoi',
      cooldown: 33000,
      color: '#f0b45a'
    },
    maya: {
      name: 'Sternenleser',
      short: 'Yaxtun',
      passive: 'Wachtürme und Waldstellungen sind stärker.',
      ability: 'Sternenritual',
      cooldown: 39000,
      color: '#9e7bd8'
    },
    abbasid: {
      name: 'Al-Kimiya',
      short: 'Al-Kimiya',
      passive: 'Spezialisierungen sind günstiger.',
      ability: 'Alchemiefeuer',
      cooldown: 34000,
      color: '#63c7a2'
    },
    hre: {
      name: 'Aethelgard',
      short: 'Aethelgard',
      passive: 'Ausbau und Burgen sind robuster.',
      ability: 'Kaiserlicher Erlass',
      cooldown: 41000,
      color: '#d8c49a'
    }
  };
  const ENEMY_COMMANDERS = {
    enemy1: {
      name: 'Rotmarschall Vargan',
      tactic: 'Sturmkeil',
      detail: 'führt kurze, harte Angriffe auf schwache Fronttürme.',
      short: 'V',
      color: '#ff8a6d',
      interval: 13800,
      stagger: 1200,
      pressure: 16
    },
    enemy2: {
      name: 'Fürst Orondo',
      tactic: 'Goldene Reserve',
      detail: 'füllt entfernte Burgen mit frischen Reserven.',
      short: 'O',
      color: '#f0b45a',
      interval: 16500,
      stagger: 4300,
      pressure: 12
    },
    enemy3: {
      name: 'Nachtseher Miral',
      tactic: 'Schattenschritt',
      detail: 'schwächt isolierte Türme vor dem nächsten Angriff.',
      short: 'M',
      color: '#b99cff',
      interval: 17800,
      stagger: 7200,
      pressure: 14
    }
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
    firstSiege: {
      title: 'Belagerer',
      detail: 'Erste feindliche Stellung mit Belagerungsgerät gebrochen.'
    },
    firstBattlePlan: {
      title: 'Schlachtplan',
      detail: 'Erstes wichtiges Ziel markiert.'
    },
    firstFlank: {
      title: 'Flankenritt',
      detail: 'Ersten Flankenangriff geführt.'
    },
    firstMoraleSurge: {
      title: 'Kriegslaune',
      detail: 'Die Moral des Reiches steigt erstmals über 75.'
    },
    lastStand: {
      title: 'Letztes Aufgebot',
      detail: 'Bei niedriger Moral eine Notreserve erhalten.'
    },
    firstWarIncident: {
      title: 'Kriegschance',
      detail: 'Erstes dynamisches Kriegsereignis erfolgreich genutzt.'
    },
    crisisBreaker: {
      title: 'Krisenbrecher',
      detail: 'Drei Kriegsereignisse in einer Partie gemeistert.'
    },
    masterTactician: {
      title: 'Feldherr',
      detail: 'Fünf taktische Manöver in einer Partie befohlen.'
    },
    siegeMaster: {
      title: 'Mauerbrecher',
      detail: 'Drei Belagerungen in einer Partie geführt.'
    },
    supplyNetwork: {
      title: 'Versorgungsnetz',
      detail: 'Vier eigene Türme gleichzeitig über sichere Wege versorgt.'
    },
    bossBreaker: {
      title: 'Bossbrecher',
      detail: 'Ersten Boss-Turm gebrochen.'
    },
    terrainLord: {
      title: 'Landesherr',
      detail: 'Drei unterschiedliche Gelände gehalten.'
    },
    firstFactionPower: {
      title: 'Wunder des Reiches',
      detail: 'Erste Reichsfähigkeit eingesetzt.'
    },
    factionMaster: {
      title: 'Herrscherkunst',
      detail: 'Drei Reichsfähigkeiten in einer Partie genutzt.'
    },
    firstSpoils: {
      title: 'Kriegsbeute',
      detail: 'Erste Geländebeute gesichert.'
    },
    quartermaster: {
      title: 'Quartiermeister',
      detail: 'Drei Geländebeuten in einer Partie gesammelt.'
    },
    warPlanner: {
      title: 'Kartenherr',
      detail: 'Vier strategische Orte in einer Partie gehalten.'
    },
    firstVeteran: {
      title: 'Bewährter Turm',
      detail: 'Ein Turm steigt durch Ruhm zum Veteranen auf.'
    },
    legendKeep: {
      title: 'Legendenfeste',
      detail: 'Ein Turm erreicht den höchsten Veteranenrang.'
    },
    firstEnemyOrder: {
      title: 'Feindkontakt',
      detail: 'Ersten KI-Kommandantenbefehl überstanden.'
    },
    breakCommander: {
      title: 'Kommandantur gebrochen',
      detail: 'Einen feindlichen Kommandantenposten erobert.'
    },
    skirmishVictor: {
      title: 'Gefechtsfürst',
      detail: 'Ein Gefecht gegen die KI vollständig gewonnen.'
    },
    citadelBreaker: {
      title: 'Zitadellenbrecher',
      detail: 'Die Endboss-Schlacht im Gefechtsmodus gewonnen.'
    },
    contractMaster: {
      title: 'Auftragsherr',
      detail: 'Drei Kriegsaufträge in einer Partie erfüllt.'
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
  let skirmishVictoryShown = false;
  let lastImpactSoundAt = 0;
  let lastStrategyUpdate = 0;
  let lastObjectiveUpdate = 0;
  let lastLowUnitWarningAt = 0;
  let lastSupplyWarningAt = 0;
  let lastFrontWarningAt = 0;
  let lastFormationEventAt = 0;
  let lastMoraleEventAt = 0;
  let lastMoraleAidAt = 0;
  let lastBreachEventAt = 0;
  let lastCounterEventAt = 0;
  let formationCounter = 0;
  let warMorale = 54;
  let moralePulseTimer = 0;
  let battlefieldParticleKey = '';
  let battlefieldParticles = [];
  const visualEffects = [];
  const impactThrottle = new Map();
  const battleFormations = new Map();
  const commandCooldowns = new Map();
  const eventLog = [];
  const matchAchievements = new Set();
  const unlockedAchievements = new Set(loadAchievementIds());
  const completedContracts = new Set();
  const edictState = {
    pending: false,
    nextWave: 0,
    choices: [],
    continueWave: null
  };
  const strategicState = {
    pulseTimer: 0,
    lastHeldCount: 0,
    lastSignature: ''
  };
  const warIncidentState = {
    active: null,
    nextAt: 0,
    counter: 0
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
    rallies: 0,
    abilities: 0,
    spoils: 0,
    sieges: 0,
    plans: 0,
    flanks: 0,
    breaches: 0,
    counters: 0,
    moraleSurges: 0,
    moraleAids: 0,
    maxMorale: 54,
    warEvents: 0,
    incidentFailures: 0,
    enemyOrders: 0,
    veterans: 0,
    contracts: 0
  };
  const enemyCommandState = {
    readyAt: new Map(),
    lastOrderText: 'Feindliche Kommandanten sondieren die Front.',
    lastCommanderId: '',
    globalReadyAt: 0,
    warningUntil: 0
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
      scenario: 'training',
      mapId: 'startgebiet',
      size: 'standard',
      difficulty: 'normal',
      opponents: 2,
      plan: 'balanced',
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

  function getBossRegionForWave(waveNumber) {
    const config = getMatchConfig();
    if (config.mode === 'skirmish') return getRegionById(config.mapId);
    return getRegionForWave(waveNumber);
  }

  function getActiveRegion() {
    const config = getMatchConfig();
    const currentWave = safe(() => wave, 1);
    if (config.mode === 'skirmish' && currentWave <= 5) return getRegionById(config.mapId);
    return getRegionForWave(currentWave);
  }

  function getBattlefieldCondition() {
    const region = getActiveRegion();
    return BATTLEFIELD_CONDITIONS[region.id] || BATTLEFIELD_CONDITIONS.startgebiet;
  }

  function updateWorldImageForCurrentWave() {
    const region = getActiveRegion();
    setWorldImage(region.image);
    return region;
  }

  function clampMap(value, min = 0.08, max = 0.94) {
    return Math.max(min, Math.min(max, value));
  }

  function getMapProfileId(config, waveNumber) {
    if (config.mode === 'skirmish') return config.mapId || 'startgebiet';
    return getRegionForWave(waveNumber).id;
  }

  function getWarPlan(config) {
    return WAR_PLANS[config.plan] || WAR_PLANS.balanced;
  }

  function getSkirmishScenario(config) {
    return SKIRMISH_SCENARIOS[config.scenario] || SKIRMISH_SCENARIOS.training;
  }

  function getMapNodeForConfig(baseNode, index, config, waveNumber) {
    const profileId = getMapProfileId(config, waveNumber);
    const variant = MAP_VARIANTS[profileId] || MAP_VARIANTS.startgebiet;
    const angle = (index * 1.618 + (profileId.length * 0.17)) * Math.PI;
    const plan = getWarPlan(config);
    const node = {
      ...baseNode,
      index,
      mapProfileId: profileId,
      terrain: variant.terrains[index] || baseNode.terrain
    };

    node.x = clampMap(
      0.5 + (baseNode.x - 0.5) * (variant.spreadX || 1) +
      (variant.xShift || 0) +
      Math.sin(angle) * (variant.jitterX || 0)
    );
    node.y = clampMap(
      0.5 + (baseNode.y - 0.5) * (variant.spreadY || 1) +
      (variant.yShift || 0) +
      Math.cos(angle * 0.78) * (variant.jitterY || 0)
    );

    if (config.mode === 'skirmish') {
      const scenario = getSkirmishScenario(config);
      if (plan === WAR_PLANS.raiders && node.role === 'enemy') {
        node.type = 'troop';
        node.terrain = index % 2 ? 'forest' : 'road';
      }
      if (plan === WAR_PLANS.fortress && node.role === 'enemy') {
        node.type = index % 3 === 0 ? 'watch' : 'normal';
        node.terrain = index % 2 ? 'hill' : 'keep';
      }
      if (plan === WAR_PLANS.economy && node.role !== 'player') {
        node.type = index % 3 === 0 ? 'gold' : node.type;
        node.terrain = index % 3 === 0 ? 'market' : index % 4 === 0 ? 'quarry' : node.terrain;
      }
      if (plan === WAR_PLANS.conquest) {
        if (node.role === 'enemy' && node.rank >= 4) {
          node.type = index % 2 === 0 ? 'watch' : node.type;
          node.terrain = node.rank >= 7 ? 'keep' : index % 3 === 0 ? 'hill' : node.terrain;
        } else if (node.role === 'neutral' && node.rank >= 2) {
          node.type = index % 2 === 0 ? 'troop' : node.type;
          node.terrain = index % 3 === 0 ? 'road' : node.terrain;
        }
      }
      if (scenario.fortressBias && node.role !== 'player' && node.rank >= 3) {
        node.terrain = node.rank >= 7 || index % 2 === 0 ? 'keep' : 'hill';
        node.type = node.role === 'enemy' ? (index % 3 === 0 ? 'watch' : 'normal') : node.type;
      }
      if (scenario.tradeBias && node.role !== 'player') {
        node.terrain = index % 3 === 0 ? 'market' : index % 4 === 0 ? 'quarry' : node.terrain;
        node.type = node.terrain === 'market' || node.terrain === 'quarry' ? 'gold' : node.type;
      }
      if (scenario.shadowBias && node.role !== 'player') {
        node.terrain = index % 2 === 0 ? 'forest' : node.terrain;
        node.type = node.role === 'enemy' ? 'troop' : node.type;
      }
    }

    if (profileId === 'wuestenreich' && node.role !== 'player' && index % 4 === 0) {
      node.type = 'gold';
      node.terrain = 'market';
    }
    if (profileId === 'nachtfestung' && node.role === 'enemy' && index % 2 === 0) {
      node.type = 'troop';
      node.terrain = 'forest';
    }
    if (profileId === 'endboss' && node.role === 'enemy') {
      node.type = index % 2 ? 'watch' : 'normal';
      node.terrain = 'keep';
    }

    return node;
  }

  function getActiveRoutePairs(towerList) {
    const byIndex = new Map();
    towerList.forEach((tower) => {
      if (typeof tower.mastilNodeIndex === 'number') byIndex.set(tower.mastilNodeIndex, tower);
    });
    return MAP_LINKS
      .map(([a, b]) => [byIndex.get(a), byIndex.get(b)])
      .filter(([a, b]) => a && b);
  }

  function getRouteStatus(a, b, playerFaction = safe(() => FACTIONS.PLAYER, 'player'), neutralFaction = safe(() => FACTIONS.NEUTRAL, 'neutral')) {
    const aPlayer = a && a.faction === playerFaction;
    const bPlayer = b && b.faction === playerFaction;
    const aNeutral = a && a.faction === neutralFaction;
    const bNeutral = b && b.faction === neutralFaction;
    const aEnemy = a && isEnemyFaction(a.faction);
    const bEnemy = b && isEnemyFaction(b.faction);

    if (aPlayer && bPlayer) return 'secured';
    if ((aPlayer && bEnemy) || (bPlayer && aEnemy)) return 'front';
    if ((aPlayer && bNeutral) || (bPlayer && aNeutral)) return 'open';
    if (aEnemy && bEnemy) return 'enemy';
    if ((aNeutral && bEnemy) || (bNeutral && aEnemy)) return 'enemy-open';
    return 'neutral';
  }

  function getRouteStyle(a, b, index, playerFaction = safe(() => FACTIONS.PLAYER, 'player'), neutralFaction = safe(() => FACTIONS.NEUTRAL, 'neutral')) {
    const status = getRouteStatus(a, b, playerFaction, neutralFaction);
    const roadLike = a.terrain === 'road' || b.terrain === 'road' || a.mastilRoadHub || b.mastilRoadHub;
    const fortressRoad = a.terrain === 'keep' || b.terrain === 'keep' || a.mastilCastleSite || b.mastilCastleSite;
    const mainRoad = roadLike || fortressRoad || Math.abs(Number(a.routeRank || 0) - Number(b.routeRank || 0)) <= 1;
    const colors = {
      secured: '#ffe18a',
      front: '#ff8a6d',
      open: '#d8c49a',
      enemy: '#cf6256',
      'enemy-open': '#b78062',
      neutral: '#a98a62'
    };
    return {
      status,
      mainRoad,
      roadLike,
      fortressRoad,
      color: colors[status] || colors.neutral,
      width: status === 'front' ? 7.5 : mainRoad ? 6.2 : 4.8,
      alpha: status === 'front' ? 0.68 : status === 'secured' ? 0.58 : status === 'open' ? 0.42 : status === 'enemy' ? 0.36 : 0.28,
      label: status === 'secured' ? 'gesichert' : status === 'front' ? 'Frontweg' : status === 'open' ? 'offener Weg' : status === 'enemy' ? 'Feindweg' : 'Weg',
      bend: {
        x: (a.x + b.x) / 2 + Math.sin(index * 1.9) * (mainRoad ? 9 : 12),
        y: (a.y + b.y) / 2 + Math.cos(index * 1.37) * (mainRoad ? 6 : 8)
      }
    };
  }

  function computeRouteControlState(towerList = safe(() => towers, [])) {
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const neutralFaction = safe(() => FACTIONS.NEUTRAL, 'neutral');
    const routes = getActiveRoutePairs(towerList);
    const state = {
      total: routes.length,
      secured: 0,
      front: 0,
      open: 0,
      enemy: 0,
      neutral: 0,
      next: null,
      detail: 'Keine Wege.'
    };

    routes.forEach(([a, b], index) => {
      const status = getRouteStatus(a, b, playerFaction, neutralFaction);
      if (status === 'secured') state.secured += 1;
      else if (status === 'front') state.front += 1;
      else if (status === 'open') {
        state.open += 1;
        if (!state.next) {
          const target = a.faction === neutralFaction ? a : b;
          state.next = { tower: target, index };
        }
      } else if (status === 'enemy' || status === 'enemy-open') state.enemy += 1;
      else state.neutral += 1;
    });

    const visibleTotal = Math.max(1, state.total);
    state.ratio = Math.min(1, state.secured / visibleTotal);
    state.detail = state.total
      ? `${state.secured}/${state.total} gesichert | ${state.open} offen | ${state.front} Front`
      : 'Keine aktiven Wege.';
    return state;
  }

  function annotateRouteNetwork(towerList = safe(() => towers, [])) {
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const neutralFaction = safe(() => FACTIONS.NEUTRAL, 'neutral');
    towerList.forEach((tower) => {
      tower.mastilRouteDegree = 0;
      tower.mastilSecuredRoutes = 0;
      tower.mastilFrontRoutes = 0;
      tower.mastilOpenRoutes = 0;
    });

    getActiveRoutePairs(towerList).forEach(([a, b]) => {
      const status = getRouteStatus(a, b, playerFaction, neutralFaction);
      [a, b].forEach((tower) => {
        tower.mastilRouteDegree = (tower.mastilRouteDegree || 0) + 1;
        if (status === 'secured') tower.mastilSecuredRoutes = (tower.mastilSecuredRoutes || 0) + 1;
        if (status === 'front') tower.mastilFrontRoutes = (tower.mastilFrontRoutes || 0) + 1;
        if (status === 'open') tower.mastilOpenRoutes = (tower.mastilOpenRoutes || 0) + 1;
      });
    });
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

  function getPlayerFactionId() {
    return String(window.PLAYER_FACTION || window.selectedFaction || 'england');
  }

  function getFactionTrait() {
    return FACTION_TRAITS[getPlayerFactionId()] || FACTION_TRAITS.england;
  }

  function getEnemyCommander(faction) {
    return ENEMY_COMMANDERS[faction] || null;
  }

  function isEnemyFaction(faction) {
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const neutralFaction = safe(() => FACTIONS.NEUTRAL, 'neutral');
    return faction && faction !== playerFaction && faction !== neutralFaction;
  }

  function assignEnemyCommander(tower) {
    if (!tower || !isEnemyFaction(tower.faction)) {
      if (tower) tower.commander = null;
      return null;
    }
    tower.commander = getEnemyCommander(tower.faction);
    return tower.commander;
  }

  function getCommandCooldownMs(key) {
    if (key === 'plan') return 9000;
    if (key === 'assault') return 14000;
    if (key === 'flank') return 18000;
    if (key === 'rally') return 11000;
    if (key === 'siege') return 22000;
    if (key === 'ability') return getFactionTrait().cooldown;
    return 1;
  }

  function getSpecializationCost(tower) {
    const base = 42 + (tower.level || 1) * 16 + matchStats.specialized * 6;
    const factionDiscount = getPlayerFactionId() === 'abbasid' ? 0.82 : 1;
    const tradeDiscount = hasStrategicSite('trade') ? 0.94 : 1;
    return Math.max(28, Math.floor(base * factionDiscount * tradeDiscount));
  }

  function getFortifyCost(tower) {
    const base = 28 + ((tower.level || 1) * 7);
    const terrainDiscount = tower.terrain === 'quarry' ? 0.82 : 1;
    const factionDiscount = getPlayerFactionId() === 'england' || getPlayerFactionId() === 'hre' ? 0.9 : 1;
    const stoneworksDiscount = hasStrategicSite('stoneworks') ? 0.9 : 1;
    return Math.max(18, Math.floor(base * terrainDiscount * factionDiscount * stoneworksDiscount));
  }

  function getSiegeCost(tower) {
    const currentWave = Math.max(1, safe(() => wave, 1));
    const level = tower ? tower.level || 1 : 1;
    const quarryDiscount = tower && tower.terrain === 'quarry' ? 0.86 : 1;
    const abbasidDiscount = getPlayerFactionId() === 'abbasid' ? 0.9 : 1;
    return Math.max(38, Math.floor((46 + level * 6 + currentWave * 3) * quarryDiscount * abbasidDiscount));
  }

  function getFlankCost(tower) {
    const currentWave = Math.max(1, safe(() => wave, 1));
    const level = tower ? tower.level || 1 : 1;
    const roadDiscount = tower && tower.terrain === 'road' ? 0.86 : 1;
    const signalDiscount = hasStrategicSite('royalroad') ? 0.9 : 1;
    return Math.max(24, Math.floor((32 + level * 5 + currentWave * 2) * roadDiscount * signalDiscount));
  }

  function enrichFactionSelection() {
    document.querySelectorAll('.faction-button[data-faction]').forEach((button) => {
      if (button.querySelector('.mastil-faction-perk')) return;
      const trait = FACTION_TRAITS[button.dataset.faction] || FACTION_TRAITS.england;
      const perk = document.createElement('small');
      perk.className = 'mastil-faction-perk';
      perk.textContent = trait.passive;
      button.appendChild(perk);
      button.title = `${trait.name}: ${trait.passive} Fähigkeit: ${trait.ability}`;
    });
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
      size: options.size || 1,
      sourceX: options.sourceX,
      sourceY: options.sourceY,
      targetX: options.targetX,
      targetY: options.targetY,
      count: options.count || 0
    });
    if (visualEffects.length > 110) visualEffects.splice(0, visualEffects.length - 110);
  }

  function seededFraction(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }

  function ensureBattlefieldParticles(condition) {
    const width = Math.max(1, Math.floor(safe(() => gameWidth, window.innerWidth || 1280)));
    const height = Math.max(1, Math.floor(safe(() => gameHeight, window.innerHeight || 720)));
    const detail = safe(() => getQualitySetting('animationDetail'), 'medium');
    const count = detail === 'low' ? 24 : detail === 'high' ? 72 : 48;
    const key = `${condition.id}:${width}:${height}:${count}`;
    if (battlefieldParticleKey === key && battlefieldParticles.length) return;

    battlefieldParticleKey = key;
    battlefieldParticles = Array.from({ length: count }, (_, index) => {
      const seed = index + condition.id.length * 17;
      return {
        x: seededFraction(seed + 1) * width,
        y: seededFraction(seed + 2) * height,
        size: 0.45 + seededFraction(seed + 3) * 1.35,
        speed: 0.45 + seededFraction(seed + 4) * 0.9,
        drift: -0.55 + seededFraction(seed + 5) * 1.1,
        alpha: 0.34 + seededFraction(seed + 6) * 0.42,
        phase: seededFraction(seed + 7) * Math.PI * 2
      };
    });
  }

  function drawWorldConditionWash() {
    const condition = getBattlefieldCondition();
    if (!condition || !condition.washAlpha) return;
    ctx.save();
    ctx.fillStyle = rgba(condition.color, condition.washAlpha);
    ctx.fillRect(0, 0, gameWidth, gameHeight);
    ctx.globalAlpha = Math.min(0.22, condition.washAlpha * 1.15);
    const gradient = ctx.createLinearGradient(0, 0, gameWidth, gameHeight);
    gradient.addColorStop(0, rgba(condition.color, 0.18));
    gradient.addColorStop(0.52, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
    ctx.restore();
  }

  function drawBattlefieldAmbience() {
    const condition = getBattlefieldCondition();
    if (!condition) return;
    ensureBattlefieldParticles(condition);
    if (!battlefieldParticles.length) return;

    const time = performance.now() * 0.001;
    const width = Math.max(1, gameWidth);
    const height = Math.max(1, gameHeight);
    ctx.save();
    ctx.lineCap = 'round';

    for (const particle of battlefieldParticles) {
      const t = time * particle.speed + particle.phase;
      let x = particle.x;
      let y = particle.y;
      ctx.globalAlpha = particle.alpha;
      ctx.strokeStyle = rgba(condition.color, 0.72);
      ctx.fillStyle = rgba(condition.color, 0.62);

      if (condition.particle === 'mist') {
        x = (particle.x + Math.sin(t * 0.35) * 42 + width) % width;
        y = (particle.y + Math.cos(t * 0.24) * 18 + height) % height;
        ctx.globalAlpha = particle.alpha * 0.23;
        ctx.fillStyle = rgba(condition.color, 0.22);
        ctx.beginPath();
        ctx.ellipse(x, y, 52 * particle.size, 9 * particle.size, Math.sin(t) * 0.12, 0, Math.PI * 2);
        ctx.fill();
      } else if (condition.particle === 'snow') {
        x = (particle.x + Math.sin(t) * 16 + width) % width;
        y = (particle.y + t * 24) % height;
        ctx.globalAlpha = particle.alpha * 0.72;
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (condition.particle === 'sand') {
        x = (particle.x + t * 64 + width) % width;
        y = (particle.y + Math.sin(t * 0.7) * 24 + height) % height;
        ctx.globalAlpha = particle.alpha * 0.44;
        ctx.lineWidth = 1.2 + particle.size * 0.9;
        ctx.beginPath();
        ctx.moveTo(x - 34 * particle.size, y + 7 * particle.size);
        ctx.lineTo(x + 18 * particle.size, y - 3 * particle.size);
        ctx.stroke();
      } else if (condition.particle === 'rain') {
        x = (particle.x + t * 38 + width) % width;
        y = (particle.y + t * 96) % height;
        ctx.globalAlpha = particle.alpha * 0.5;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 12 * particle.size, y + 28 * particle.size);
        ctx.stroke();
      } else {
        x = (particle.x + Math.sin(t * 0.7) * 18 + width) % width;
        y = (particle.y + t * 31) % height;
        ctx.globalAlpha = particle.alpha * 0.6;
        ctx.fillStyle = rgba(condition.color, 0.72);
        ctx.beginPath();
        ctx.arc(x, y, 1.5 + particle.size * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
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
    drawWorldConditionWash();
    drawWorldMist();
    ctx.restore();
  }

  function drawPlannedRouteNetwork(currentTowers, playerFaction, neutralFaction) {
    const routes = getActiveRoutePairs(currentTowers);
    if (!routes.length) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    routes.forEach(([a, b], index) => {
      const route = getRouteStyle(a, b, index, playerFaction, neutralFaction);
      const { x: mx, y: my } = route.bend;

      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = 'rgba(16, 10, 7, 0.78)';
      ctx.lineWidth = route.width + 3.2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.stroke();

      ctx.globalAlpha = route.alpha;
      ctx.strokeStyle = rgba(route.color, 0.82);
      ctx.lineWidth = route.width;
      ctx.setLineDash(route.mainRoad ? [] : [8, 9]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.globalAlpha = route.status === 'front' ? 0.64 : route.status === 'secured' ? 0.5 : 0.32;
      ctx.strokeStyle = route.status === 'front' ? 'rgba(255, 238, 199, 0.58)' : 'rgba(255, 242, 191, 0.3)';
      ctx.lineWidth = route.mainRoad ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.stroke();
    });

    let routeLabelCount = 0;
    routes.forEach(([a, b], index) => {
      const route = getRouteStyle(a, b, index, playerFaction, neutralFaction);
      if (route.status === 'neutral' && !route.mainRoad) return;
      const { x: mx, y: my } = route.bend;
      const markerRadius = route.status === 'front' ? 6.5 : route.status === 'secured' ? 5.8 : 4.8;

      ctx.globalAlpha = route.status === 'front' ? 0.9 : route.status === 'secured' ? 0.72 : 0.54;
      ctx.fillStyle = 'rgba(18, 11, 7, 0.82)';
      ctx.strokeStyle = rgba(route.color, 0.88);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mx, my, markerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = rgba(route.color, 0.92);
      ctx.beginPath();
      ctx.arc(mx, my, markerRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      if ((route.status === 'front' || route.status === 'open') && routeLabelCount < 8) {
        routeLabelCount += 1;
        ctx.globalAlpha = route.status === 'front' ? 0.86 : 0.62;
        ctx.fillStyle = 'rgba(18, 11, 7, 0.82)';
        ctx.strokeStyle = rgba(route.color, 0.58);
        ctx.lineWidth = 1;
        roundRect(ctx, mx - 25, my - 24, 50, 16, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = route.status === 'front' ? '#ffcf9d' : '#fff2bf';
        ctx.font = '950 9px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(route.status === 'front' ? 'Front' : 'Zielweg', mx, my - 16);
      }
    });
    ctx.restore();
  }

  function drawBattleHotspots(ownTowers, enemyTowers) {
    const detail = safe(() => getQualitySetting('animationDetail'), 'medium');
    if (detail === 'low') return;
    const now = performance.now();
    const hotspots = ownTowers
      .filter((tower) => tower.frontPressure >= 0.36 && tower.frontNearest)
      .sort((a, b) => b.frontPressure - a.frontPressure)
      .slice(0, 4);
    if (!hotspots.length) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    hotspots.forEach((tower, index) => {
      const enemy = tower.frontNearest;
      if (!enemy || !enemyTowers.includes(enemy)) return;
      const pressure = Math.min(1, tower.frontPressure / 1.25);
      const pulse = 0.68 + Math.sin(now * 0.004 + index) * 0.18;
      const cx = (tower.x + enemy.x) / 2;
      const cy = (tower.y + enemy.y) / 2;
      const dx = enemy.x - tower.x;
      const dy = enemy.y - tower.y;
      const angle = Math.atan2(dy, dx);
      const radius = 24 + pressure * 34;

      ctx.globalAlpha = 0.12 + pressure * 0.18;
      ctx.fillStyle = rgba(pressure >= 0.76 ? '#ff5b5b' : '#ffb17e', 0.72);
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 1.6, radius * 0.72, angle, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.28 + pressure * 0.36;
      ctx.strokeStyle = pressure >= 0.76 ? 'rgba(255, 91, 91, 0.84)' : 'rgba(255, 177, 126, 0.68)';
      ctx.lineWidth = pressure >= 0.76 ? 4.4 : 3;
      ctx.setLineDash(pressure >= 0.76 ? [10, 6] : [6, 7]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * (1.3 + pulse * 0.1), radius * (0.52 + pulse * 0.05), angle, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (pressure >= 0.62) {
        ctx.globalAlpha = 0.74;
        ctx.fillStyle = 'rgba(18, 11, 7, 0.82)';
        ctx.strokeStyle = 'rgba(255, 226, 138, 0.42)';
        ctx.lineWidth = 1.2;
        roundRect(ctx, cx - 32, cy - radius - 18, 64, 18, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = pressure >= 0.76 ? '#ffb17e' : '#ffe18a';
        ctx.font = '950 10px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pressure >= 0.76 ? 'Brennpunkt' : 'Front', cx, cy - radius - 9);
      }
    });
    ctx.restore();
  }

  function drawEnhancedConnections() {
    const currentTowers = safe(() => towers, []);
    if (!currentTowers || currentTowers.length < 2) return;

    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const neutralFaction = safe(() => FACTIONS.NEUTRAL, 'neutral');
    const ownTowers = currentTowers.filter((tower) => tower.faction === playerFaction);
    const enemyTowers = currentTowers.filter((tower) => tower.faction !== playerFaction && tower.faction !== neutralFaction);
    annotateRouteNetwork(currentTowers);
    computeSupplyState(ownTowers);
    computeFrontPressure(ownTowers, enemyTowers);
    drawBattleHotspots(ownTowers, enemyTowers);
    drawPlannedRouteNetwork(currentTowers, playerFaction, neutralFaction);
    const threshold = getConnectionThreshold();
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
        const aPlayer = a.faction === playerFaction;
        const bPlayer = b.faction === playerFaction;
        const aEnemy = isEnemyFaction(a.faction);
        const bEnemy = isEnemyFaction(b.faction);
        const pressureTower = (aPlayer && bEnemy) ? a : (bPlayer && aEnemy) ? b : null;
        const enemyTower = pressureTower === a ? b : pressureTower === b ? a : null;
        const pressureValue = pressureTower ? pressureTower.frontPressure || 0 : 0;
        const pressurePath = Boolean(pressureTower && enemyTower && pressureValue >= 0.34 && distance <= threshold * 1.15);
        if (distance > threshold && !pressurePath) continue;

        drawn += 1;
        const mx = (a.x + b.x) / 2 + Math.sin((a.x + b.y) * 0.01) * 12;
        const my = (a.y + b.y) / 2 + Math.cos((a.y + b.x) * 0.01) * 9;

        if (distance <= threshold) {
        const sameFaction = a.faction === b.faction;
        const activePath = sameFaction && a.faction !== neutralFaction;
        const supplyPath = sameFaction && a.faction === playerFaction && a.supplyLinked && b.supplyLinked && distance <= getSupplyReach(a, b);
        const color = activePath ? colorForFaction(a.faction) : '#8b7355';

        ctx.globalAlpha = supplyPath ? 0.68 : activePath ? 0.46 : 0.22;
        ctx.strokeStyle = supplyPath ? 'rgba(142, 195, 240, 0.7)' : rgba(color, activePath ? 0.58 : 0.28);
        ctx.lineWidth = supplyPath ? 6 : activePath ? 5 : 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.stroke();

        if (activePath) {
          ctx.globalAlpha = supplyPath ? 0.7 : 0.46;
          ctx.strokeStyle = supplyPath ? 'rgba(255, 242, 190, 0.52)' : rgba('#fff0a8', 0.32);
          ctx.lineWidth = supplyPath ? 1.8 : 1.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(mx, my, b.x, b.y);
          ctx.stroke();
        }
        }

        if (pressurePath) {
          const intensity = Math.min(1, 0.35 + pressureValue * 0.42);
          ctx.globalAlpha = intensity;
          ctx.strokeStyle = pressureValue >= 0.76 ? 'rgba(255, 91, 91, 0.82)' : 'rgba(255, 177, 126, 0.62)';
          ctx.lineWidth = pressureValue >= 0.76 ? 4.4 : 2.8;
          ctx.setLineDash(pressureValue >= 0.76 ? [10, 6] : [6, 7]);
          ctx.beginPath();
          ctx.moveTo(pressureTower.x, pressureTower.y);
          ctx.quadraticCurveTo(mx, my, enemyTower.x, enemyTower.y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.globalAlpha = Math.min(0.72, intensity * 0.75);
          ctx.strokeStyle = 'rgba(255, 238, 199, 0.46)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(pressureTower.x, pressureTower.y);
          ctx.quadraticCurveTo(mx, my, enemyTower.x, enemyTower.y);
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
    const visualTier = getTowerVisualTier(level);
    const siteScale = tower.mastilCastleSite ? 1.1 : tower.mastilRoadHub ? 1.04 : 1;
    const size = Math.min(tower.mastilCastleSite ? 96 : 86, (34 + level * 7 + visualTier * 2) * siteScale);
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

    drawTowerTacticalMarkers(tower, width, height);
    drawTargetRecommendationCue(tower, width, height);
    drawTowerUpgradeCue(tower, width, height);

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

    if (visualTier >= 3 || tower.mastilCastleSite) {
      drawCastleCurtainWall(width, height, base, faction, Math.max(3, visualTier));
    }

    const mainW = width * (0.62 + visualTier * 0.035);
    const mainH = height * (0.72 + visualTier * 0.035);
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

    if (visualTier >= 5) {
      drawCitadelCrown(width, height, base, faction);
    }

    drawTowerRoleDetails(tower, width, height, base);
    drawTowerBadges(tower, width, height, level);
    ctx.restore();
  }

  function drawTowerUpgradeCue(tower, width, height) {
    const preview = getUpgradePreview(tower);
    if (!preview.available) return;

    const isSelected = safe(() => selectedTower === tower, false);
    if (!preview.enoughGold && !isSelected) return;

    const now = performance.now();
    const pulse = 0.62 + Math.sin(now * 0.006) * 0.16;
    const accent = preview.enoughGold ? '#ffe18a' : '#8fc3f0';
    const alpha = preview.enoughGold ? pulse : 0.34;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = rgba(accent, preview.enoughGold ? 0.9 : 0.62);
    ctx.lineWidth = preview.enoughGold ? 3 : 2;
    ctx.setLineDash(preview.enoughGold ? [10, 6] : [4, 7]);
    ctx.beginPath();
    ctx.ellipse(0, height * 0.18, width * 1.05, height * 0.66, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 1;
    const badgeX = width * 0.54;
    const badgeY = -height * 0.42;
    ctx.fillStyle = preview.enoughGold ? 'rgba(255, 225, 138, 0.94)' : 'rgba(142, 195, 240, 0.88)';
    ctx.strokeStyle = 'rgba(18, 11, 7, 0.82)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#171009';
    ctx.font = '950 9px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(preview.enoughGold ? 'L+' : `${Math.round(preview.progress * 100)}%`, badgeX, badgeY + 0.5);
    ctx.restore();
  }

  function drawTargetRecommendationCue(tower, width, height) {
    const recommendation = getRecommendedTargetForSelected();
    if (!recommendation || recommendation.tower !== tower || !recommendation.evaluation) return;
    if (tower.mastilMarkedUntil && tower.mastilMarkedUntil > performance.now()) return;

    const { evaluation } = recommendation;
    const now = performance.now();
    const pulse = 0.62 + Math.sin(now * 0.005) * 0.18;
    const color = evaluation.chance >= 1 ? '#ffe18a' : evaluation.chance >= 0.72 ? '#8fc3f0' : '#ffb17e';

    ctx.save();
    ctx.strokeStyle = rgba(color, 0.76);
    ctx.lineWidth = evaluation.chance >= 1 ? 3.2 : 2.4;
    ctx.setLineDash(evaluation.chance >= 1 ? [12, 6] : [5, 6]);
    ctx.beginPath();
    ctx.ellipse(0, height * 0.08, width * (1.16 + pulse * 0.08), height * (0.82 + pulse * 0.06), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(18, 11, 7, 0.84)';
    ctx.strokeStyle = rgba(color, 0.86);
    ctx.lineWidth = 1.5;
    roundRect(ctx, -42, -height * 1.2, 84, 20, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = '950 10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(evaluation.label, 0, -height * 1.2 + 10);
    ctx.restore();
  }

  function drawTowerTacticalMarkers(tower, width, height) {
    const now = performance.now();
    const marked = tower.mastilMarkedUntil && tower.mastilMarkedUntil > now;
    const flanked = tower.flankedUntil && tower.flankedUntil > now;
    const sieged = tower.siegedUntil && tower.siegedUntil > now;
    const incident = tower.mastilIncidentUntil && tower.mastilIncidentUntil > now;
    const weak = Number(tower.siegeWeakness || 0) > 0;
    const breached = tower.mastilBreachUntil && tower.mastilBreachUntil > now;
    if (!marked && !flanked && !sieged && !incident && !weak && !breached) return;

    ctx.save();
    ctx.shadowBlur = 0;
    const pulse = 0.62 + Math.sin(now * 0.006) * 0.16;
    const color = incident
      ? tower.mastilIncidentKind === 'sabotage' ? '#ff8a6d' : tower.mastilIncidentKind === 'convoy' ? '#f6d873' : '#ffbe67'
      : marked
      ? tower.mastilMarkedKind === 'flank' ? '#8fc3f0' : '#f1cf6b'
      : breached ? '#ffe18a'
      : flanked ? '#8fc3f0' : '#ffbe67';
    ctx.strokeStyle = rgba(color, marked || flanked || incident || breached ? pulse : 0.46);
    ctx.lineWidth = marked || flanked || incident || breached ? 3.2 : 2;
    ctx.setLineDash(incident ? [4, 6] : marked ? [12, 7] : flanked ? [5, 7] : breached ? [10, 5] : [3, 8]);
    ctx.beginPath();
    ctx.ellipse(0, 0, width * (marked || incident ? 1.14 : 1.04), height * (marked || incident ? 0.86 : 0.78), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (marked || flanked || incident || breached) {
      ctx.fillStyle = 'rgba(18, 11, 7, 0.82)';
      ctx.strokeStyle = rgba(color, 0.82);
      ctx.lineWidth = 1.4;
      roundRect(ctx, -36, -height * 0.98, 72, 18, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff2bf';
      ctx.font = '950 10px Segoe UI';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(incident ? tower.mastilIncidentTitle || 'Ereignis' : breached ? 'Bruch' : flanked ? 'Flanke' : 'Ziel', 0, -height * 0.98 + 9);
    }

    if (weak || sieged || breached) {
      ctx.strokeStyle = rgba('#ffbe67', 0.74);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-width * 0.32, -height * 0.2);
      ctx.lineTo(-width * 0.08, height * 0.04);
      ctx.lineTo(-width * 0.2, height * 0.22);
      ctx.moveTo(width * 0.28, -height * 0.26);
      ctx.lineTo(width * 0.08, -height * 0.04);
      ctx.lineTo(width * 0.22, height * 0.16);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawTerrainPlate(tower, width, height) {
    const terrain = getTerrainInfo(tower.terrain);
    const site = getStrategicSiteInfo(tower);
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

    ctx.fillStyle = tower.faction === safe(() => FACTIONS.PLAYER, 'player') ? rgba(site.color, 0.95) : 'rgba(22, 14, 9, 0.82)';
    ctx.strokeStyle = rgba(site.color, tower.faction === safe(() => FACTIONS.PLAYER, 'player') ? 0.86 : 0.58);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.48 - 10, height * 0.48);
    ctx.lineTo(width * 0.48, height * 0.48 + 8.5);
    ctx.lineTo(width * 0.48 - 10, height * 0.48 + 17);
    ctx.lineTo(width * 0.48 - 20, height * 0.48 + 8.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = tower.faction === safe(() => FACTIONS.PLAYER, 'player') ? '#171009' : rgba(site.color, 0.92);
    ctx.font = '950 9px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(site.mark, width * 0.48 - 10, height * 0.48 + 8.8);

    const routeDegree = Number(tower.mastilRouteDegree || 0);
    if (routeDegree >= 2) {
      const frontRoutes = Number(tower.mastilFrontRoutes || 0);
      const securedRoutes = Number(tower.mastilSecuredRoutes || 0);
      const openRoutes = Number(tower.mastilOpenRoutes || 0);
      const routeColor = frontRoutes ? '#ff8a6d' : securedRoutes ? '#ffe18a' : openRoutes ? '#8fc3f0' : '#d8c49a';
      ctx.fillStyle = 'rgba(18, 11, 7, 0.86)';
      ctx.strokeStyle = rgba(routeColor, 0.82);
      ctx.lineWidth = 1.4;
      roundRect(ctx, -13, height * 0.5, 26, 15, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = rgba(routeColor, 0.98);
      ctx.font = '950 8px Segoe UI';
      ctx.fillText(`${frontRoutes ? 'F' : 'W'}${routeDegree}`, 0, height * 0.5 + 7.8);
    }
    ctx.restore();
  }

  function drawCastleCurtainWall(width, height, base, faction, visualTier) {
    const wallY = height * 0.08;
    const wallW = width * (1.05 + visualTier * 0.08);
    const wallH = height * (0.24 + visualTier * 0.018);
    const towerRoof = faction === 'player' ? '#254a6f' : faction === 'neutral' ? '#79694f' : '#763129';

    ctx.save();
    ctx.fillStyle = shade(base, 32);
    roundRect(ctx, -wallW / 2, wallY - wallH / 2, wallW, wallH, 7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(42, 25, 14, 0.78)';
    ctx.lineWidth = 1.7;
    ctx.stroke();

    ctx.fillStyle = shade(base, 74);
    const crenels = visualTier >= 5 ? 9 : 7;
    for (let i = 0; i < crenels; i += 1) {
      const x = -wallW / 2 + 7 + i * ((wallW - 14) / Math.max(1, crenels - 1));
      ctx.fillRect(x - 4, wallY - wallH / 2 - 7, 8, 9);
    }

    [-0.5, 0.5].forEach((side) => {
      const tx = side * wallW * 0.46;
      const tw = width * 0.18;
      const th = height * (0.46 + visualTier * 0.035);
      const gradient = ctx.createLinearGradient(tx - tw, wallY - th, tx + tw, wallY + th);
      gradient.addColorStop(0, shade(base, 80));
      gradient.addColorStop(1, shade(base, -46));
      ctx.fillStyle = gradient;
      roundRect(ctx, tx - tw / 2, wallY - th * 0.72, tw, th, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = towerRoof;
      ctx.beginPath();
      ctx.moveTo(tx - tw * 0.62, wallY - th * 0.72);
      ctx.lineTo(tx + tw * 0.62, wallY - th * 0.72);
      ctx.lineTo(tx, wallY - th * 1.02);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  function drawCitadelCrown(width, height, base, faction) {
    const accent = faction === 'player' ? '#ffe18a' : faction === 'neutral' ? '#f4e6bf' : '#ffb17e';
    ctx.save();
    ctx.strokeStyle = rgba(accent, 0.68);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -height * 0.7, width * 0.42, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.fillStyle = rgba(accent, 0.92);
    for (let i = -2; i <= 2; i += 1) {
      const x = i * width * 0.12;
      const y = -height * 0.82 - (i === 0 ? 8 : Math.abs(i) === 1 ? 3 : 0);
      ctx.beginPath();
      ctx.moveTo(x, y - 7);
      ctx.lineTo(x + 5, y + 5);
      ctx.lineTo(x - 5, y + 5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = rgba(shade(base, 92), 0.94);
    roundRect(ctx, -width * 0.2, -height * 0.86, width * 0.4, height * 0.08, 5);
    ctx.fill();
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
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');

    if (tower.faction === playerFaction && tower.frontPressure > 0.24) {
      const pressure = Math.min(1, tower.frontPressure / 1.3);
      const dangerColor = pressure >= 0.74 ? '#ff5b5b' : '#ffb17e';
      const pulse = 0.72 + Math.sin(performance.now() * 0.006) * 0.12;
      const ringW = width * (1.02 + pressure * 0.24);
      const ringH = height * (0.7 + pressure * 0.18);

      ctx.save();
      ctx.globalAlpha = 0.12 + pressure * 0.2;
      ctx.fillStyle = rgba(dangerColor, 0.82);
      ctx.beginPath();
      ctx.ellipse(0, height * 0.16, ringW, ringH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = Math.min(0.84, pulse * (0.46 + pressure * 0.38));
      ctx.strokeStyle = rgba(dangerColor, 0.92);
      ctx.lineWidth = pressure >= 0.74 ? 3.4 : 2.2;
      ctx.setLineDash(pressure >= 0.74 ? [7, 5] : [4, 6]);
      ctx.beginPath();
      ctx.ellipse(0, height * 0.16, ringW, ringH, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = 'rgba(23, 16, 9, 0.78)';
      roundRect(ctx, -width * 0.38, height * 0.46, width * 0.76, 13, 5);
      ctx.fill();
      ctx.fillStyle = rgba(dangerColor, 0.96);
      ctx.font = '800 9px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pressure >= 0.74 ? 'HEISS' : 'FRONT', 0, height * 0.46 + 6.5);
      ctx.restore();
    }

    if (tower.siegedUntil && tower.siegedUntil > performance.now()) {
      ctx.strokeStyle = 'rgba(255, 190, 103, 0.82)';
      ctx.lineWidth = 3.2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.ellipse(0, height * 0.04, width * 1.08, height * 0.86, -0.08, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 190, 103, 0.16)';
      ctx.beginPath();
      ctx.arc(width * 0.3, -height * 0.22, 11, 0, Math.PI * 2);
      ctx.fill();
    }

    if (tower.faction === safe(() => FACTIONS.PLAYER, 'player')) {
      if (tower.supplyLinked) {
        ctx.strokeStyle = tower.supplyRoot ? 'rgba(244, 215, 122, 0.66)' : 'rgba(142, 195, 240, 0.58)';
        ctx.lineWidth = tower.supplyRoot ? 2.6 : 2;
        ctx.setLineDash(tower.supplyRoot ? [] : [4, 4]);
        ctx.beginPath();
        ctx.ellipse(0, height * 0.18, width * 0.94, height * 0.56, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = 'rgba(255, 138, 109, 0.72)';
        ctx.lineWidth = 3;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.ellipse(0, height * 0.12, width * 1.1, height * 0.68, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

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

    const veteran = getTowerVeteranInfo(tower);
    if (veteran) {
      const y = height * 0.58 + 18;
      ctx.fillStyle = rgba(veteran.color, 0.94);
      ctx.strokeStyle = 'rgba(18, 11, 7, 0.82)';
      ctx.lineWidth = 1.4;
      roundRect(ctx, -18, y - 8, 36, 16, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#171009';
      ctx.font = '950 9px Segoe UI';
      ctx.fillText(veteran.mark, 0, y);
    }

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

    const commander = tower.commander || getEnemyCommander(tower.faction);
    if (commander && isEnemyFaction(tower.faction)) {
      const x = width * 0.22 + 29;
      const y = height * 0.34 + 9;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = rgba(commander.color, 0.94);
      ctx.strokeStyle = 'rgba(23, 16, 9, 0.92)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(12, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(-12, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#171009';
      ctx.font = '950 10px Segoe UI';
      ctx.fillText(commander.short, 0, 1);
      ctx.restore();
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

  function drawFormationBanner(x, y, color, count, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(18, 11, 7, 0.76)';
    roundRect(ctx, -15, -24, 30, 17, 6);
    ctx.fill();
    ctx.strokeStyle = rgba(color, 0.88);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = '#2a1a0d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, -7);
    ctx.lineTo(-5, -27);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-4, -26);
    ctx.lineTo(14, -21);
    ctx.lineTo(-4, -16);
    ctx.closePath();
    ctx.fill();
    ctx.rotate(-angle);
    ctx.fillStyle = '#fff2bf';
    ctx.font = '900 10px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(count), 0, -15);
    ctx.restore();
  }

  function drawBattleFormationRoutes(unitsToDraw, animationDetail) {
    if (animationDetail === 'low') return;
    const groups = new Map();
    const aliveIds = new Set();
    const now = performance.now();

    for (const unit of unitsToDraw) {
      if (!unit.mastilFormationId) continue;
      const id = unit.mastilFormationId;
      aliveIds.add(id);
      if (!groups.has(id)) {
        const meta = battleFormations.get(id) || {
          sourceX: unit.sourceX || unit.x,
          sourceY: unit.sourceY || unit.y,
          targetX: unit.targetX,
          targetY: unit.targetY,
          faction: unit.faction,
          count: unit.mastilFormationSize || 1,
          createdAt: unit.mastilLaunchAt || now
        };
        groups.set(id, { ...meta, live: 0, x: 0, y: 0 });
      }
      const group = groups.get(id);
      group.live += 1;
      group.x += unit.x;
      group.y += unit.y;
    }

    battleFormations.forEach((formation, id) => {
      if (!aliveIds.has(id) && now - formation.createdAt > 4200) {
        battleFormations.delete(id);
      }
    });

    if (!groups.size) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    groups.forEach((group) => {
      if (!group.live) return;
      const color = colorForFaction(group.faction);
      const cx = group.x / group.live;
      const cy = group.y / group.live;
      const dx = group.targetX - group.sourceX;
      const dy = group.targetY - group.sourceY;
      const angle = Math.atan2(dy, dx);
      const age = Math.min(1, (now - group.createdAt) / 3200);
      const heavy = (group.count || group.live) >= 10;

      const routeGradient = ctx.createLinearGradient(group.sourceX, group.sourceY, group.targetX, group.targetY);
      routeGradient.addColorStop(0, rgba(color, 0.04));
      routeGradient.addColorStop(0.48, rgba(color, heavy ? 0.34 : 0.22));
      routeGradient.addColorStop(1, rgba('#fff2bf', heavy ? 0.28 : 0.16));
      ctx.globalAlpha = 0.38 + age * 0.18;
      ctx.strokeStyle = routeGradient;
      ctx.lineWidth = heavy ? 5.6 : 3.6;
      ctx.setLineDash(heavy ? [14, 9] : [8, 10]);
      ctx.beginPath();
      ctx.moveTo(group.sourceX, group.sourceY);
      const mx = (group.sourceX + group.targetX) / 2 + Math.sin(group.createdAt * 0.004) * 18;
      const my = (group.sourceY + group.targetY) / 2 + Math.cos(group.createdAt * 0.003) * 14;
      ctx.quadraticCurveTo(mx, my, group.targetX, group.targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.globalAlpha = heavy ? 0.78 : 0.58;
      ctx.strokeStyle = rgba('#fff2bf', heavy ? 0.48 : 0.32);
      ctx.lineWidth = heavy ? 1.8 : 1.2;
      ctx.beginPath();
      ctx.moveTo(group.sourceX, group.sourceY);
      ctx.quadraticCurveTo(mx, my, cx, cy);
      ctx.stroke();

      if (heavy || group.live >= 5) {
        ctx.globalAlpha = 0.92;
        drawFormationBanner(cx, cy, color, group.live, angle);
      }
    });
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
    drawBattleFormationRoutes(unitsToDraw, animationDetail);
    for (const unit of unitsToDraw) {
      const base = colorForFaction(unit.faction);
      const dx = unit.targetX - unit.x;
      const dy = unit.targetY - unit.y;
      const angle = Math.atan2(dy, dx);
      const lane = Number(unit.mastilLane || 0);
      const pulse = unit.mastilFormationId ? 1.08 : 1;
      const size = 5.8 * pulse;

      if (animationDetail !== 'low') {
        const heavy = (unit.mastilFormationSize || 0) >= 10;
        ctx.strokeStyle = rgba(base, heavy ? 0.48 : 0.35);
        ctx.lineWidth = heavy ? 2.8 : 2;
        ctx.beginPath();
        ctx.moveTo(unit.x - Math.cos(angle) * (heavy ? 22 : 16) + Math.cos(angle + Math.PI / 2) * lane, unit.y - Math.sin(angle) * (heavy ? 22 : 16) + Math.sin(angle + Math.PI / 2) * lane);
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

  function drawCommandTrail(effect, ease, progress) {
    if (typeof effect.targetX !== 'number' || typeof effect.targetY !== 'number') return;
    const tx = effect.targetX - effect.x;
    const ty = effect.targetY - effect.y;
    const distance = Math.sqrt(tx * tx + ty * ty);
    if (distance < 4) return;

    const angle = Math.atan2(ty, tx);
    const bend = Math.min(42, Math.max(14, distance * 0.12)) * (effect.count >= 12 ? 1 : 0.72);
    const midX = tx * 0.5 + Math.cos(angle + Math.PI / 2) * bend;
    const midY = ty * 0.5 + Math.sin(angle + Math.PI / 2) * bend;
    const heavy = effect.count >= 12;

    const trail = ctx.createLinearGradient(0, 0, tx, ty);
    trail.addColorStop(0, rgba(effect.color, 0.1));
    trail.addColorStop(0.42, rgba(effect.color, heavy ? 0.58 : 0.42));
    trail.addColorStop(1, rgba('#fff2bf', heavy ? 0.5 : 0.32));
    ctx.strokeStyle = trail;
    ctx.lineWidth = heavy ? 6 : 4;
    ctx.lineCap = 'round';
    ctx.setLineDash(heavy ? [18, 10] : [12, 9]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(midX, midY, tx, ty);
    ctx.stroke();
    ctx.setLineDash([]);

    const markerCount = heavy ? 4 : 3;
    for (let i = 0; i < markerCount; i += 1) {
      const t = (progress * 0.72 + i / markerCount) % 1;
      const inv = 1 - t;
      const px = inv * inv * 0 + 2 * inv * t * midX + t * t * tx;
      const py = inv * inv * 0 + 2 * inv * t * midY + t * t * ty;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      ctx.fillStyle = i === 0 ? '#fff2bf' : rgba(effect.color, 0.92);
      ctx.beginPath();
      ctx.moveTo(10 + effect.size * 2, 0);
      ctx.lineTo(-7, -5);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-7, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(angle);
    ctx.fillStyle = rgba('#fff2bf', 0.9);
    ctx.beginPath();
    ctx.moveTo(13 + ease * 5, 0);
    ctx.lineTo(-9, -8);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-9, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawTargetLock(effect, ease) {
    const radius = 18 + ease * 22 * effect.size;
    ctx.strokeStyle = rgba(effect.color, 0.88);
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 7]);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(255, 242, 190, 0.82)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      const angle = (Math.PI / 2) * i;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (radius - 5), Math.sin(angle) * (radius - 5));
      ctx.lineTo(Math.cos(angle) * (radius + 10), Math.sin(angle) * (radius + 10));
      ctx.stroke();
    }

    ctx.fillStyle = rgba(effect.color, 0.12);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.54, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawClashBurst(effect, ease) {
    const sparks = 9;
    ctx.strokeStyle = rgba(effect.color, 0.9);
    ctx.lineWidth = 2;
    for (let i = 0; i < sparks; i += 1) {
      const angle = (Math.PI * 2 * i) / sparks + effect.createdAt * 0.001;
      const inner = 5 + effect.size * 2;
      const outer = 16 + ease * (22 + effect.size * 8);
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.fillStyle = rgba('#fff2bf', 0.62);
    ctx.beginPath();
    ctx.arc(0, 0, 6 + ease * 8, 0, Math.PI * 2);
    ctx.fill();
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

      if (effect.type === 'commandTrail') {
        drawCommandTrail(effect, ease, p);
      }

      if (effect.type === 'targetLock') {
        drawTargetLock(effect, ease);
      }

      if (effect.type === 'clash') {
        drawClashBurst(effect, ease);
      }

      if (effect.type === 'breach') {
        const radius = 18 + ease * 46 * effect.size;
        ctx.strokeStyle = rgba(effect.color, 0.9);
        ctx.lineWidth = 4;
        ctx.setLineDash([14, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, radius, Math.PI * 0.1, Math.PI * 1.9);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = rgba(effect.color, 0.18);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.58, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 242, 190, 0.86)';
        ctx.lineWidth = 2.2;
        for (let i = 0; i < 8; i += 1) {
          const angle = (Math.PI * 2 * i) / 8 + 0.25;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * radius * 0.24, Math.sin(angle) * radius * 0.24);
          ctx.lineTo(Math.cos(angle) * radius * 0.88, Math.sin(angle) * radius * 0.88);
          ctx.stroke();
        }
      }

      if (effect.type === 'counter') {
        const radius = 17 + ease * 28 * effect.size;
        ctx.strokeStyle = rgba(effect.color, 0.86);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.1, radius * 0.78, -0.15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(244, 230, 191, 0.82)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.54, radius * 0.1);
        ctx.lineTo(-radius * 0.12, radius * 0.42);
        ctx.lineTo(radius * 0.58, -radius * 0.42);
        ctx.stroke();
      }

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

      if (effect.type === 'siege') {
        const sx = typeof effect.sourceX === 'number' ? effect.sourceX - effect.x : -48;
        const sy = typeof effect.sourceY === 'number' ? effect.sourceY - effect.y : -34;
        const arcY = Math.min(sy, -72) - 42 * effect.size;
        ctx.strokeStyle = rgba(effect.color, 0.78);
        ctx.lineWidth = 3.2;
        ctx.setLineDash([9, 6]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx * 0.42, arcY, 0, 0);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = rgba(effect.color, 0.18);
        ctx.beginPath();
        ctx.arc(0, 0, 18 + ease * 28 * effect.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rgba('#fff2bf', 0.8);
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i += 1) {
          const angle = (Math.PI * 2 * i) / 8;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
          ctx.lineTo(Math.cos(angle) * (26 + ease * 28), Math.sin(angle) * (26 + ease * 28));
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

      if (effect.type === 'plan' || effect.type === 'flank') {
        const radius = 22 + ease * 34 * effect.size;
        ctx.strokeStyle = rgba(effect.color, effect.type === 'flank' ? 0.88 : 0.78);
        ctx.lineWidth = effect.type === 'flank' ? 3.2 : 2.8;
        ctx.setLineDash(effect.type === 'flank' ? [6, 6] : [12, 7]);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = rgba('#fff2bf', 0.7);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.72, 0);
        ctx.lineTo(-radius * 0.28, 0);
        ctx.moveTo(radius * 0.28, 0);
        ctx.lineTo(radius * 0.72, 0);
        ctx.moveTo(0, -radius * 0.72);
        ctx.lineTo(0, -radius * 0.28);
        ctx.moveTo(0, radius * 0.28);
        ctx.lineTo(0, radius * 0.72);
        ctx.stroke();

        if (effect.type === 'flank') {
          ctx.fillStyle = rgba(effect.color, 0.18);
          ctx.beginPath();
          ctx.moveTo(-radius * 0.58, -radius * 0.32);
          ctx.quadraticCurveTo(0, -radius * 0.88, radius * 0.58, -radius * 0.32);
          ctx.quadraticCurveTo(0, -radius * 0.48, -radius * 0.58, -radius * 0.32);
          ctx.fill();
        }
      }

      if (effect.type === 'upgrade' || effect.type === 'capture' || effect.type === 'fortify' || effect.type === 'achievement' || effect.type === 'morale') {
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

        if (effect.type === 'achievement' || effect.type === 'morale') {
          ctx.strokeStyle = 'rgba(255, 242, 190, 0.82)';
          ctx.lineWidth = 2;
          const rays = effect.type === 'morale' ? 7 : 10;
          for (let i = 0; i < rays; i += 1) {
            const angle = (Math.PI * 2 * i) / rays;
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
      matchStats.spoils * 180 +
      matchStats.sieges * 150 +
      matchStats.breaches * 90 +
      matchStats.counters * 55 +
      matchStats.moraleSurges * 160 +
      matchStats.moraleAids * 85 +
      matchStats.warEvents * 210 -
      matchStats.incidentFailures * 120 +
      matchStats.contracts * 190 +
      Math.round(matchStats.maxMorale * 8) +
      Math.round(computeSupplyState().ratio * 220) +
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
        <span><strong>${matchStats.spoils}</strong> Beute</span>
        <span><strong>${matchStats.sieges}</strong> Belagerungen</span>
        <span><strong>${matchStats.breaches}</strong> Durchbrüche</span>
        <span><strong>${matchStats.counters}</strong> Paraden</span>
        <span><strong>${matchStats.edicts}</strong> Edikte</span>
        <span><strong>${Math.round(matchStats.maxMorale)}</strong> beste Moral</span>
        <span><strong>${matchStats.warEvents}</strong> Ereignisse</span>
        <span><strong>${matchStats.enemyOrders}</strong> Feindbefehle</span>
        <span><strong>${matchStats.contracts}</strong> Aufträge</span>
        <span><strong>${matchStats.veterans}</strong> Veteranenrang</span>
        <span><strong>${matchStats.lost}</strong> verloren</span>
        <span><strong>${unlockedAchievements.size}/${TOTAL_ACHIEVEMENTS}</strong> Auszeichnungen</span>
      </div>
      <div class="mastil-summary-awards">
        <span>Neue Auszeichnungen</span>
        <strong>${awards.length ? awards.map((award) => award.title).join(' | ') : 'Keine neue Auszeichnung'}</strong>
      </div>
    `;
  }

  function getEnemyUnitTransitCount() {
    return safe(() => units.filter((unit) => isEnemyFaction(unit.faction || unit.sourceFaction)).length, 0);
  }

  function showSkirmishVictory() {
    if (skirmishVictoryShown) return true;
    const config = getMatchConfig();
    if (config.mode !== 'skirmish') return false;

    const own = getPlayerTowers();
    const enemy = getEnemyTowers();
    if (!own.length || enemy.length || getEnemyUnitTransitCount() > 0) return false;

    skirmishVictoryShown = true;
    safe(() => {
      gameActive = false;
      window.isCheckingWaveTransition = false;
      window.isWaveTransitioning = false;
      window.currentWaveToTransition = null;
      if (window.fallbackWaveTimeout) {
        clearTimeout(window.fallbackWaveTimeout);
        window.fallbackWaveTimeout = null;
      }
      if (window.waveTransitionTimeout) {
        clearTimeout(window.waveTransitionTimeout);
        window.waveTransitionTimeout = null;
      }
      if (typeof hideWaveTransitionScreen === 'function') hideWaveTransitionScreen();
    });

    const screen = document.getElementById('game-over');
    if (!screen) return true;
    const title = screen.querySelector('h2.medieval-title');
    const message = screen.querySelector('.royal-message');
    const waveText = document.getElementById('gameover-wave');
    const scenario = getSkirmishScenario(config);
    const region = getActiveRegion();

    screen.classList.add('mastil-victory-screen');
    screen.style.display = 'flex';
    if (title) title.textContent = 'Sieg errungen!';
    if (message) message.textContent = `${scenario.label}: ${region.title} ist gesichert.`;
    if (waveText) {
      waveText.textContent = `${own.length} eigene Burgen stehen. ${matchStats.captured} Orte wurden erobert.`;
    }

    unlockAchievement('skirmishVictor', { tower: own[0] });
    if (scenario.id === 'boss') unlockAchievement('citadelBreaker', { tower: own[0] });
    renderMatchSummary();
    pushEvent(`Gefecht gewonnen: ${scenario.label}`, 'achievement');
    playSound('achievement');

    const controls = document.getElementById('mastil-game-controls');
    if (controls) controls.style.display = 'none';
    showEnhancementNotice('Gefecht gewonnen. Das Reich hält die Karte.');
    return true;
  }

  function resetMatchProgress() {
    eventLog.length = 0;
    impactThrottle.clear();
    enemyCommandState.readyAt.clear();
    enemyCommandState.lastOrderText = 'Feindliche Kommandanten sondieren die Front.';
    enemyCommandState.lastCommanderId = '';
    enemyCommandState.globalReadyAt = 0;
    enemyCommandState.warningUntil = 0;
    matchAchievements.clear();
    completedContracts.clear();
    matchSummarySaved = false;
    skirmishVictoryShown = false;
    safe(() => {
      const screen = document.getElementById('game-over');
      if (!screen) return;
      screen.classList.remove('mastil-victory-screen');
      const title = screen.querySelector('h2.medieval-title');
      const message = screen.querySelector('.royal-message');
      if (title) title.textContent = 'Spiel Vorbei!';
      if (message) message.textContent = 'Euer Reich ist gefallen, edler Herrscher!';
    });
    lastLowUnitWarningAt = 0;
    lastSupplyWarningAt = 0;
    lastFrontWarningAt = 0;
    lastFormationEventAt = 0;
    lastMoraleEventAt = 0;
    lastMoraleAidAt = 0;
    lastBreachEventAt = 0;
    lastCounterEventAt = 0;
    formationCounter = 0;
    warMorale = 54;
    moralePulseTimer = 0;
    battleFormations.clear();
    strategicState.pulseTimer = 0;
    strategicState.lastHeldCount = 0;
    strategicState.lastSignature = '';
    warIncidentState.active = null;
    warIncidentState.nextAt = 0;
    warIncidentState.counter = 0;
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
    matchStats.abilities = 0;
    matchStats.spoils = 0;
    matchStats.sieges = 0;
    matchStats.plans = 0;
    matchStats.flanks = 0;
    matchStats.breaches = 0;
    matchStats.counters = 0;
    matchStats.moraleSurges = 0;
    matchStats.moraleAids = 0;
    matchStats.maxMorale = 54;
    matchStats.warEvents = 0;
    matchStats.incidentFailures = 0;
    matchStats.enemyOrders = 0;
    matchStats.veterans = 0;
    matchStats.contracts = 0;
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

  function getTowerVisualTier(level) {
    const current = Number(level) || 1;
    if (current >= 8) return 5;
    if (current >= 6) return 4;
    if (current >= 4) return 3;
    if (current >= 2) return 2;
    return 1;
  }

  function getUpgradePreview(tower) {
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    if (!tower || tower.faction !== playerFaction) {
      return { available: false };
    }

    const level = Math.max(1, Number(tower.level) || 1);
    const nextLevel = level + 1;
    const currentGold = Math.floor(safe(() => gold, 0));
    const cost = typeof getUpgradeCost === 'function' ? getUpgradeCost(tower) : 65;
    const nextCap = typeof getTowerMaxUnits === 'function'
      ? getTowerMaxUnits(tower.faction, tower.type, nextLevel)
      : (tower.maxUnits || 0) + 5;
    const capGain = Math.max(1, nextCap - (tower.maxUnits || 0));
    let detail = `+${capGain} Garnison und schnellere Ausbildung`;

    if (tower.mastilCastleSite && level < 2) {
      detail = 'Burgstandort: mehr Garnison und längerer Schutz';
    } else if (level < 3 && nextLevel >= 3) {
      detail = 'Burgmauern: Schutz und frische Reserven';
    } else if (level < 5 && nextLevel >= 5) {
      if (tower.type === typeFromKey('gold')) detail = 'Zitadellenmarkt: Goldschub beim Ausbau';
      else if (tower.type === typeFromKey('troop')) detail = 'Heerhof: Truppen für alle eigenen Türme';
      else if (tower.type === typeFromKey('watch')) detail = 'Signalspitze: Befehle werden schneller bereit';
      else detail = 'Zitadellenkern: stärkere Garnison';
    } else if (level < 7 && nextLevel >= 7) {
      detail = 'Hochfeste: Ruhm und langer Schutz';
    }

    return {
      available: true,
      cost,
      currentGold,
      enoughGold: currentGold >= cost,
      missingGold: Math.max(0, cost - currentGold),
      progress: Math.min(1, currentGold / Math.max(1, cost)),
      level,
      nextLevel,
      nextTier: getTowerTierName(nextLevel),
      detail
    };
  }

  function getUpgradeCostModifier(tower) {
    if (!tower) return 1;
    let modifier = 1;
    if (tower.terrain === 'quarry') modifier *= 0.9;
    if (tower.terrain === 'keep') modifier *= 0.94;
    if (tower.supplyLinked) modifier *= 0.96;
    if (hasStrategicSite('stoneworks')) modifier *= 0.94;
    if (getPlayerFactionId() === 'hre') modifier *= 0.92;
    return Math.max(0.72, modifier);
  }

  function applyUpgradeMilestone(tower, beforeLevel) {
    if (!tower || tower.faction !== safe(() => FACTIONS.PLAYER, 'player')) return '';
    tower.mastilUpgradeMilestones = tower.mastilUpgradeMilestones || {};
    const level = Number(tower.level) || 1;
    const crossed = (target) => beforeLevel < target && level >= target && !tower.mastilUpgradeMilestones[`l${target}`];
    let message = '';

    if (crossed(3)) {
      tower.mastilUpgradeMilestones.l3 = true;
      tower.fortifiedUntil = Math.max(tower.fortifiedUntil || 0, performance.now() + 15000);
      tower.units = Math.min(tower.maxUnits, tower.units + 3);
      message = 'Burgmauern: Schutz und Reserven aktiviert';
    }

    if (crossed(5)) {
      tower.mastilUpgradeMilestones.l5 = true;
      if (tower.type === typeFromKey('gold')) {
        safe(() => {
          gold += 35;
          updateUI();
        });
        message = 'Zitadellenmarkt: +35 Gold';
      } else if (tower.type === typeFromKey('troop')) {
        getPlayerTowers().forEach((own) => {
          own.units = Math.min(own.maxUnits, own.units + 2);
        });
        message = 'Heerhof: +2 Truppen je eigenem Turm';
      } else if (tower.type === typeFromKey('watch')) {
        reduceCommandCooldowns(5000);
        message = 'Signalspitze: Befehle schneller bereit';
      } else {
        tower.maxUnits += 3;
        tower.units = Math.min(tower.maxUnits, tower.units + 3);
        message = 'Zitadellenkern: mehr Garnison';
      }
    }

    if (crossed(7)) {
      tower.mastilUpgradeMilestones.l7 = true;
      addTowerRenown(tower, 5, 'Hochfeste');
      tower.fortifiedUntil = Math.max(tower.fortifiedUntil || 0, performance.now() + 24000);
      message = 'Hochfeste: Ruhm und starker Schutz';
    }

    if (message) {
      spawnEffect(tower.x, tower.y, 'achievement', {
        color: '#ffe18a',
        text: 'Meilenstein',
        duration: 1350,
        size: 1.02
      });
    }
    return message;
  }

  function getNextTowerType(type) {
    const types = safe(() => TOWER_TYPES, { NORMAL: 'normal', TROOP: 'troop', GOLD: 'gold', WATCH: 'watch' });
    const order = [types.NORMAL, types.TROOP, types.GOLD, types.WATCH];
    const index = Math.max(0, order.indexOf(type));
    return order[(index + 1) % order.length];
  }

  function getTowerVeteranRank(tower) {
    return Math.max(0, Math.min(VETERAN_RANKS.length, Number(tower && tower.mastilVeteranRank) || 0));
  }

  function getTowerVeteranInfo(tower) {
    const rank = getTowerVeteranRank(tower);
    return rank > 0 ? VETERAN_RANKS[rank - 1] : null;
  }

  function getTowerRenownNeeded(tower) {
    const rank = getTowerVeteranRank(tower);
    return rank >= VETERAN_RANKS.length ? null : VETERAN_RANKS[rank].threshold;
  }

  function applyTowerVeteranBonus(tower) {
    if (!tower || tower.faction !== safe(() => FACTIONS.PLAYER, 'player')) return;
    const targetBonus = getTowerVeteranRank(tower) * 2;
    const applied = Number(tower.mastilVeteranCapacityApplied || 0);
    const delta = targetBonus - applied;
    if (!delta) return;
    tower.maxUnits = Math.max(1, (tower.maxUnits || 1) + delta);
    if (delta > 0) tower.units = Math.min(tower.maxUnits, (tower.units || 0) + delta);
    tower.mastilVeteranCapacityApplied = targetBonus;
  }

  function addTowerRenown(tower, amount, reason = 'Ruhm') {
    if (!tower || tower.faction !== safe(() => FACTIONS.PLAYER, 'player') || amount <= 0) return;
    tower.mastilRenown = Math.max(0, Number(tower.mastilRenown || 0) + amount);
    let rank = getTowerVeteranRank(tower);
    let promoted = false;
    while (rank < VETERAN_RANKS.length && tower.mastilRenown >= VETERAN_RANKS[rank].threshold) {
      rank += 1;
      tower.mastilVeteranRank = rank;
      tower.mastilVeteranCapacityApplied = 0;
      applyTowerVeteranBonus(tower);
      const info = getTowerVeteranInfo(tower);
      matchStats.veterans = Math.max(matchStats.veterans, rank);
      pushEvent(`${info.title}: ${getTowerTierName(tower.level)}`, 'veteran');
      spawnEffect(tower.x, tower.y, 'achievement', {
        color: info.color,
        text: info.title,
        duration: 1300,
        size: 1
      });
      unlockAchievement('firstVeteran', { tower });
      if (rank >= VETERAN_RANKS.length) unlockAchievement('legendKeep', { tower });
      promoted = true;
    }

    if (!promoted && amount >= 3) {
      spawnEffect(tower.x, tower.y, 'achievement', {
        color: '#d8e9ff',
        text: `+${amount} Ruhm`,
        duration: 850,
        size: 0.74
      });
    }
  }

  function getTerrainInfo(terrain) {
    return TERRAIN[terrain] || TERRAIN.road;
  }

  function getStrategicSiteInfo(towerOrTerrain) {
    const terrain = typeof towerOrTerrain === 'string' ? towerOrTerrain : towerOrTerrain && towerOrTerrain.terrain;
    return STRATEGIC_SITES[terrain] || STRATEGIC_SITES.road;
  }

  function computeStrategicSiteState(towerList = safe(() => towers, [])) {
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const allSites = new Map();
    const heldSites = new Map();
    const contestedSites = [];

    towerList.filter(Boolean).forEach((tower) => {
      const site = getStrategicSiteInfo(tower);
      if (!allSites.has(site.id)) {
        allSites.set(site.id, { ...site, towers: [] });
      }
      allSites.get(site.id).towers.push(tower);
      if (tower.faction === playerFaction) {
        if (!heldSites.has(site.id)) {
          heldSites.set(site.id, { ...site, towers: [] });
        }
        heldSites.get(site.id).towers.push(tower);
      } else {
        contestedSites.push({ tower, site });
      }
    });

    const held = Array.from(heldSites.values());
    const total = allSites.size || 1;
    const nextTarget = contestedSites
      .map((entry) => ({
        ...entry,
        score: (entry.tower.routeRank || 0) * 10 + Math.hypot(entry.tower.x - gameWidth * 0.16, entry.tower.y - gameHeight * 0.52) / 120
      }))
      .sort((a, b) => a.score - b.score)[0] || null;
    const labels = held.map((site) => site.short).slice(0, 3);

    return {
      held,
      heldIds: new Set(held.map((site) => site.id)),
      heldCount: held.length,
      total,
      ratio: Math.min(1, held.length / total),
      nextTarget,
      signature: held.map((site) => site.id).sort().join('|'),
      detail: held.length
        ? `${held.length}/${total} Orte: ${labels.join(', ')}${held.length > labels.length ? '...' : ''}`
        : `0/${total} strategische Orte.`
    };
  }

  function hasStrategicSite(id) {
    return computeStrategicSiteState().heldIds.has(id);
  }

  function getHeldTerrainTypes(towerList = getPlayerTowers()) {
    return new Set(towerList.map((tower) => tower.terrain).filter(Boolean));
  }

  function getConnectionThreshold() {
    return (gameWidth + gameHeight) / 6.2;
  }

  function getSupplyReach(a, b) {
    const base = getConnectionThreshold() * 0.98;
    const roadBonus = (a.terrain === 'road' || b.terrain === 'road') ? 28 : 0;
    const keepBonus = (a.terrain === 'keep' || b.terrain === 'keep') ? 18 : 0;
    const watchBonus = (a.type === typeFromKey('watch') || b.type === typeFromKey('watch')) ? 10 : 0;
    return base + roadBonus + keepBonus + watchBonus;
  }

  function computeSupplyState(own = getPlayerTowers()) {
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const playerTowers = own.filter((tower) => tower && tower.faction === playerFaction);
    playerTowers.forEach((tower) => {
      tower.supplyLinked = false;
      tower.supplyRoot = false;
      tower.supplyDepth = 0;
    });

    if (!playerTowers.length) {
      return { total: 0, linked: 0, isolated: 0, ratio: 0, roots: 0, weakest: null, detail: 'Keine Versorgung.' };
    }

    const lowestRank = Math.min(...playerTowers.map((tower) => Number(tower.routeRank || 0)));
    let roots = playerTowers.filter((tower) => tower.terrain === 'keep' || Number(tower.routeRank || 0) <= lowestRank + 1);
    if (!roots.length) {
      roots = [playerTowers.slice().sort((a, b) => a.x - b.x || (a.routeRank || 0) - (b.routeRank || 0))[0]];
    }

    const queue = [];
    roots.forEach((tower) => {
      tower.supplyLinked = true;
      tower.supplyRoot = true;
      tower.supplyDepth = 0;
      queue.push(tower);
    });

    const routeAdjacency = new Map(playerTowers.map((tower) => [tower, []]));
    getActiveRoutePairs(safe(() => towers, playerTowers)).forEach(([a, b]) => {
      if (!routeAdjacency.has(a) || !routeAdjacency.has(b)) return;
      const distance = Math.hypot(b.x - a.x, b.y - a.y);
      const routeBoost = (a.mastilRoadHub || b.mastilRoadHub || a.mastilCastleSite || b.mastilCastleSite) ? 1.24 : 1.08;
      if (distance <= getSupplyReach(a, b) * routeBoost) {
        routeAdjacency.get(a).push(b);
        routeAdjacency.get(b).push(a);
      }
    });

    while (queue.length) {
      const source = queue.shift();
      const routeNeighbors = routeAdjacency.get(source) || [];
      const candidates = routeNeighbors.length ? routeNeighbors : playerTowers;
      const routeSet = new Set(routeNeighbors);
      for (const target of candidates) {
        if (target.supplyLinked) continue;
        const distance = Math.hypot(target.x - source.x, target.y - source.y);
        if (routeSet.has(target) || distance <= getSupplyReach(source, target)) {
          target.supplyLinked = true;
          target.supplyDepth = (source.supplyDepth || 0) + 1;
          queue.push(target);
        }
      }
    }

    const linked = playerTowers.filter((tower) => tower.supplyLinked).length;
    const isolatedTowers = playerTowers.filter((tower) => !tower.supplyLinked);
    const weakest = isolatedTowers
      .map((tower) => ({ tower, score: tower.units + (tower.level || 1) * 3 }))
      .sort((a, b) => a.score - b.score)[0]?.tower || null;

    return {
      total: playerTowers.length,
      linked,
      isolated: isolatedTowers.length,
      ratio: linked / Math.max(1, playerTowers.length),
      roots: roots.length,
      weakest,
      detail: isolatedTowers.length
        ? `${linked}/${playerTowers.length} versorgt, ${isolatedTowers.length} isoliert.`
        : `${linked}/${playerTowers.length} Türme versorgt.`
    };
  }

  function computeFrontPressure(own = getPlayerTowers(), enemy = getEnemyTowers()) {
    const playerTowers = own.filter((tower) => tower && tower.faction === safe(() => FACTIONS.PLAYER, 'player'));
    const enemyTowers = enemy.filter(Boolean);
    playerTowers.forEach((tower) => {
      tower.frontPressure = 0;
      tower.frontThreatCount = 0;
      tower.frontNearest = null;
    });

    if (!playerTowers.length || !enemyTowers.length) {
      return {
        level: 'ruhig',
        ratio: 0,
        hotspots: 0,
        max: 0,
        detail: 'Keine aktive Feindfront.',
        hottest: null
      };
    }

    const reach = getConnectionThreshold() * 1.18;
    let hottest = null;
    let max = 0;
    let hotspots = 0;

    playerTowers.forEach((ownTower) => {
      let score = 0;
      let nearest = null;
      let nearestDistance = Infinity;
      enemyTowers.forEach((enemyTower) => {
        const distance = Math.hypot(enemyTower.x - ownTower.x, enemyTower.y - ownTower.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = enemyTower;
        }
        if (distance > reach) return;
        const proximity = 1 - (distance / reach);
        const enemyWeight = (enemyTower.units || 0) / Math.max(8, ownTower.maxUnits || 12);
        const bossWeight = enemyTower.boss ? 0.55 : 0;
        const commanderWeight = enemyTower.commander ? 0.22 : 0;
        score += Math.max(0, proximity) * (enemyWeight + bossWeight + commanderWeight + 0.28);
      });

      const supplyPenalty = ownTower.supplyLinked ? 0 : 0.22;
      const fortifyRelief = ownTower.fortifiedUntil && ownTower.fortifiedUntil > performance.now() ? 0.18 : 0;
      ownTower.frontPressure = Math.max(0, Math.min(1.8, score + supplyPenalty - fortifyRelief));
      ownTower.frontThreatCount = enemyTowers.filter((enemyTower) => Math.hypot(enemyTower.x - ownTower.x, enemyTower.y - ownTower.y) <= reach).length;
      ownTower.frontNearest = nearest;
      if (ownTower.frontPressure >= 0.72) hotspots += 1;
      if (ownTower.frontPressure > max) {
        max = ownTower.frontPressure;
        hottest = ownTower;
      }
    });

    const ratio = Math.min(1, max / 1.3);
    const level = ratio >= 0.76 ? 'kritisch' : ratio >= 0.48 ? 'angespannt' : ratio >= 0.24 ? 'wachsam' : 'ruhig';
    return {
      level,
      ratio,
      hotspots,
      max,
      detail: hottest
        ? `${level}: ${hotspots} Brennpunkt${hotspots === 1 ? '' : 'e'}, stärkster Druck bei ${getTowerTierName(hottest.level)}.`
        : 'Keine aktive Feindfront.',
      hottest
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getMoraleInfo(value = warMorale) {
    const morale = clamp(Number(value) || 0, 0, 100);
    if (morale >= 82) {
      return {
        title: 'Triumphzug',
        short: 'Triumph',
        detail: 'Das Reich marschiert geschlossen. Befehle laden etwas schneller.',
        color: '#f6d873',
        ratio: morale / 100
      };
    }
    if (morale >= 66) {
      return {
        title: 'Aufwind',
        short: 'Stark',
        detail: 'Die Front steht gut. Reserven reagieren zuverlässiger.',
        color: '#b7d394',
        ratio: morale / 100
      };
    }
    if (morale >= 42) {
      return {
        title: 'Gefasst',
        short: 'Stabil',
        detail: 'Die Truppen folgen den Befehlen, aber die Lage bleibt offen.',
        color: '#d8c49a',
        ratio: morale / 100
      };
    }
    if (morale >= 24) {
      return {
        title: 'Wankend',
        short: 'Druck',
        detail: 'Verluste drücken die Moral. Notreserven werden vorbereitet.',
        color: '#ffb17e',
        ratio: morale / 100
      };
    }
    return {
      title: 'Letztes Aufgebot',
      short: 'Notlage',
      detail: 'Das Reich kämpft ums Überleben. Schwache Türme erhalten Notreserven.',
      color: '#ff8a6d',
      ratio: morale / 100
    };
  }

  function computeMoraleTarget(own = getPlayerTowers(), enemy = getEnemyTowers(), neutral = []) {
    if (!own.length) return 0;
    const supply = computeSupplyState(own);
    const frontState = computeFrontPressure(own, enemy);
    const strategic = computeStrategicSiteState();
    const marked = getMarkedBattleTarget();
    const bossPressure = enemy.some((tower) => tower.boss) ? -5 : 0;
    const commanderPressure = getCommanderGroups(enemy).length * -1.4;
    const towerBalance = clamp((own.length - enemy.length) * 2.8, -18, 18);
    const neutralPressure = neutral.length > own.length ? -3 : neutral.length ? 2 : 4;
    const performance =
      matchStats.captured * 1.9 +
      matchStats.spoils * 1.7 +
      matchStats.sieges * 1.3 +
      matchStats.plans * 0.9 +
      matchStats.flanks * 1.2 -
      matchStats.lost * 4.4 -
      matchStats.enemyOrders * 0.9;
    const score =
      50 +
      towerBalance +
      supply.ratio * 14 +
      strategic.ratio * 12 -
      frontState.ratio * 18 +
      neutralPressure +
      performance +
      bossPressure +
      commanderPressure +
      (marked ? 3 : 0);
    return clamp(score, 6, 96);
  }

  function applyMoralePulse(deltaTime = 0) {
    const own = getPlayerTowers();
    const enemy = getEnemyTowers();
    const neutral = safe(() => towers.filter((tower) => tower.faction === FACTIONS.NEUTRAL), []);
    if (!own.length) {
      warMorale = 0;
      return;
    }

    const target = computeMoraleTarget(own, enemy, neutral);
    const rate = target > warMorale ? 0.22 : 0.28;
    warMorale += (target - warMorale) * Math.min(1, Math.max(0.02, deltaTime * rate));
    warMorale = clamp(warMorale, 0, 100);
    matchStats.maxMorale = Math.max(matchStats.maxMorale || 0, warMorale);

    moralePulseTimer += deltaTime || 0;
    if (moralePulseTimer < 7.5) return;
    moralePulseTimer = 0;

    const now = performance.now();
    const info = getMoraleInfo(warMorale);
    if (warMorale >= 75) {
      reduceCommandCooldowns(520);
      matchStats.moraleSurges += 1;
      unlockAchievement('firstMoraleSurge', { tower: own[0] });
      const targetTower = own
        .filter((tower) => tower.units < tower.maxUnits)
        .sort((a, b) => (a.units / Math.max(1, a.maxUnits)) - (b.units / Math.max(1, b.maxUnits)))[0];
      if (targetTower) {
        targetTower.units = Math.min(targetTower.maxUnits, targetTower.units + 1);
        spawnEffect(targetTower.x, targetTower.y, 'morale', { color: info.color, text: '+Moral', duration: 920, size: 0.78 });
      }
      if (now - lastMoraleEventAt > 18000) {
        lastMoraleEventAt = now;
        pushEvent(`Moral: ${info.title}`, 'morale');
      }
      return;
    }

    if (warMorale <= 28 && enemy.length && now - lastMoraleAidAt > 12500) {
      const weakest = own
        .filter((tower) => tower.units < tower.maxUnits)
        .sort((a, b) => a.units - b.units)[0];
      if (weakest) {
        const aid = warMorale <= 18 ? 3 : 2;
        weakest.units = Math.min(weakest.maxUnits, weakest.units + aid);
        weakest.fortifiedUntil = Math.max(weakest.fortifiedUntil || 0, now + 7200);
        matchStats.moraleAids += 1;
        lastMoraleAidAt = now;
        spawnEffect(weakest.x, weakest.y, 'morale', { color: info.color, text: `+${aid}`, duration: 1050, size: 0.9 });
        pushEvent(`Moral: ${info.title}`, 'morale');
        unlockAchievement('lastStand', { tower: weakest });
      }
    }
  }

  function getWarIncidentDelay() {
    const config = getMatchConfig();
    const difficultyFactor = { easy: 1.22, normal: 1, hard: 0.88, brutal: 0.78 }[config.difficulty] || 1;
    const sizeFactor = { compact: 1.12, standard: 1, large: 0.94, war: 0.86 }[config.size] || 1;
    const waveNumber = Math.max(1, safe(() => wave, 1));
    const jitter = 3600 + seededFraction(waveNumber * 19 + warIncidentState.counter * 7) * 5200;
    return Math.floor((16500 + jitter) * difficultyFactor * sizeFactor);
  }

  function getWarIncidentTarget(kind, own, enemy, neutral) {
    if (kind === 'sabotage') {
      const front = computeFrontPressure(own, enemy);
      return front.hottest || own
        .map((tower) => ({ tower, score: tower.units + (tower.supplyLinked ? 6 : 0) + (tower.fortifiedUntil && tower.fortifiedUntil > performance.now() ? 8 : 0) }))
        .sort((a, b) => a.score - b.score)[0]?.tower || null;
    }

    if (kind === 'convoy') {
      const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
      const candidates = [...neutral, ...enemy]
        .filter((tower) => ['market', 'road', 'ford'].includes(tower.terrain) || tower.type === typeFromKey('gold'));
      return candidates
        .map((tower) => ({
          tower,
          score:
            (tower.faction === playerFaction ? 20 : 0) +
            (tower.terrain === 'market' ? -10 : 0) +
            (tower.type === typeFromKey('gold') ? -6 : 0) +
            Math.abs((tower.routeRank || 0) - 3) * 2 +
            tower.units * 0.25
        }))
        .sort((a, b) => a.score - b.score)[0]?.tower || null;
    }

    const marked = getMarkedBattleTarget();
    if (marked && enemy.includes(marked)) return marked;
    return enemy
      .map((tower) => ({
        tower,
        score:
          tower.units +
          (tower.level || 1) * 7 -
          (tower.boss ? 26 : 0) -
          (tower.commander ? 15 : 0) -
          (tower.terrain === 'keep' ? 10 : 0)
      }))
      .sort((a, b) => b.score - a.score)[0]?.tower || null;
  }

  function chooseWarIncidentKind(own, enemy, neutral) {
    const front = computeFrontPressure(own, enemy);
    const hasConvoyTarget = [...neutral, ...enemy].some((tower) => ['market', 'road', 'ford'].includes(tower.terrain) || tower.type === typeFromKey('gold'));
    if (front.ratio >= 0.72 && own.length) return 'sabotage';
    if (hasConvoyTarget && (matchStats.warEvents + warIncidentState.counter) % 3 === 1) return 'convoy';
    if (enemy.length) return 'breach';
    if (hasConvoyTarget) return 'convoy';
    return own.length ? 'sabotage' : '';
  }

  function createWarIncident(kind, target) {
    if (!kind || !target) return null;
    const now = performance.now();
    const duration = kind === 'sabotage' ? 23000 : kind === 'convoy' ? 28000 : 24000;
    const incident = {
      id: `wi-${Date.now().toString(36)}-${warIncidentState.counter += 1}`,
      kind,
      target,
      targetNode: target.mastilNodeIndex,
      createdAt: now,
      expiresAt: now + duration,
      title: '',
      detail: ''
    };

    if (kind === 'breach') {
      incident.title = 'Mauerbruch';
      incident.detail = `${getTowerTierName(target.level)} ist verwundbar. Belagern oder stürmen, bevor die Lücke geschlossen wird.`;
      target.siegeWeakness = Math.min(4, (target.siegeWeakness || 0) + 1);
      target.reconWeakness = Math.min(3, (target.reconWeakness || 0) + 1);
      markBattleTarget(getPlayerTowers()[0], target, 'plan', duration);
    } else if (kind === 'convoy') {
      incident.title = 'Versorgungskonvoi';
      incident.detail = `${getStrategicSiteInfo(target).title} trägt Vorräte. Sichere den Ort für Gold, Truppen und Moral.`;
      markBattleTarget(getPlayerTowers()[0], target, 'plan', duration);
    } else {
      incident.title = 'Sabotage';
      incident.detail = `${getTowerTierName(target.level)} ist bedroht. Halte, befestige oder versorge ihn bis der Angriff verpufft.`;
    }

    target.mastilIncidentId = incident.id;
    target.mastilIncidentKind = kind;
    target.mastilIncidentTitle = incident.title;
    target.mastilIncidentUntil = incident.expiresAt;
    warIncidentState.active = incident;
    pushEvent(`Kriegsereignis: ${incident.title}`, kind === 'sabotage' ? 'danger' : 'incident');
    spawnEffect(target.x, target.y, kind === 'sabotage' ? 'impact' : 'plan', {
      color: kind === 'sabotage' ? '#ff8a6d' : kind === 'convoy' ? '#f6d873' : '#ffbe67',
      text: incident.title,
      duration: 1250,
      size: target.boss ? 1.2 : 1
    });
    return incident;
  }

  function clearWarIncident(incident = warIncidentState.active) {
    if (incident && incident.target) {
      const tower = incident.target;
      if (tower.mastilIncidentId === incident.id) {
        tower.mastilIncidentId = '';
        tower.mastilIncidentKind = '';
        tower.mastilIncidentTitle = '';
        tower.mastilIncidentUntil = 0;
      }
    }
    if (warIncidentState.active === incident) warIncidentState.active = null;
    warIncidentState.nextAt = performance.now() + getWarIncidentDelay();
  }

  function resolveWarIncident(success, reason = '') {
    const incident = warIncidentState.active;
    if (!incident || !incident.target) return;
    const target = incident.target;
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const enemyFaction = isEnemyFaction(target.faction);
    const now = performance.now();

    if (success) {
      matchStats.warEvents += 1;
      warMorale = clamp(warMorale + (incident.kind === 'sabotage' ? 6 : 7), 0, 100);
      if (incident.kind === 'breach') {
        const bonus = 34 + Math.max(1, safe(() => wave, 1)) * 4;
        safe(() => {
          gold += bonus;
          updateUI();
        });
        target.siegeWeakness = Math.min(4, (target.siegeWeakness || 0) + 1);
        pushEvent(`Mauerbruch genutzt: +${bonus} Gold`, 'incident');
      } else if (incident.kind === 'convoy') {
        const bonus = 58 + Math.max(1, safe(() => wave, 1)) * 5;
        safe(() => {
          gold += bonus;
          updateUI();
        });
        if (target.faction === playerFaction) {
          target.units = Math.min(target.maxUnits, target.units + 4);
        }
        pushEvent(`Konvoi gesichert: +${bonus} Gold`, 'incident');
      } else {
        target.units = Math.min(target.maxUnits, target.units + 3);
        target.fortifiedUntil = Math.max(target.fortifiedUntil || 0, now + 9000);
        pushEvent('Sabotage abgewehrt', 'incident');
      }
      spawnEffect(target.x, target.y, 'achievement', {
        color: '#f6d873',
        text: 'Erfolg',
        duration: 1200,
        size: 0.95
      });
      unlockAchievement('firstWarIncident', { tower: target });
      if (matchStats.warEvents >= 3) unlockAchievement('crisisBreaker', { tower: target });
      clearWarIncident(incident);
      return;
    }

    matchStats.incidentFailures += 1;
    if (incident.kind === 'convoy' && enemyFaction) {
      target.units = Math.min(target.maxUnits, target.units + 4);
      pushEvent('Feindlicher Konvoi erreicht die Front', 'threat');
    } else if (incident.kind === 'sabotage' && target.faction === playerFaction) {
      const loss = Math.min(Math.max(1, Math.floor(target.units - 1)), 2 + Math.floor((target.level || 1) / 2));
      target.units = Math.max(1, target.units - loss);
      warMorale = clamp(warMorale - 6, 0, 100);
      pushEvent(`Sabotage trifft: -${loss} Truppen`, 'danger');
      spawnEffect(target.x, target.y, 'impact', { color: '#ff8a6d', text: `-${loss}`, duration: 1050, size: 0.95 });
    } else {
      pushEvent(reason || 'Kriegsgelegenheit verpasst', 'incident');
    }
    clearWarIncident(incident);
  }

  function getWarIncidentPanelState() {
    const incident = warIncidentState.active;
    if (!incident || !incident.target) {
      return {
        active: false,
        title: 'Kriegsereignis',
        detail: 'Keine besondere Chance aktiv.',
        progress: 0,
        kind: ''
      };
    }
    const remaining = clamp((incident.expiresAt - performance.now()) / Math.max(1, incident.expiresAt - incident.createdAt), 0, 1);
    return {
      active: true,
      title: incident.title,
      detail: incident.detail,
      progress: remaining,
      kind: incident.kind
    };
  }

  function applyWarIncidentPulse(deltaTime = 0) {
    const now = performance.now();
    const own = getPlayerTowers();
    const enemy = getEnemyTowers();
    const neutral = safe(() => towers.filter((tower) => tower.faction === FACTIONS.NEUTRAL), []);
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    if (!own.length) {
      clearWarIncident();
      return;
    }

    const active = warIncidentState.active;
    if (active && active.target) {
      const target = active.target;
      if (!safe(() => towers.includes(target), false)) {
        clearWarIncident(active);
      } else if (active.kind === 'breach' && target.faction === playerFaction) {
        resolveWarIncident(true);
      } else if (active.kind === 'convoy' && target.faction === playerFaction) {
        resolveWarIncident(true);
      } else if (active.kind === 'sabotage') {
        const held = target.faction === playerFaction;
        const stable = held && (
          (target.fortifiedUntil && target.fortifiedUntil > now) ||
          target.supplyLinked ||
          target.units >= Math.max(4, target.maxUnits * 0.52)
        );
        if (stable && now - active.createdAt > 10500) {
          resolveWarIncident(true);
        } else if (now >= active.expiresAt) {
          resolveWarIncident(false);
        }
      } else if (now >= active.expiresAt) {
        resolveWarIncident(false, 'Kriegsgelegenheit verpasst');
      }
      return;
    }

    if (!warIncidentState.nextAt) {
      warIncidentState.nextAt = now + 9000 + seededFraction(Math.max(1, safe(() => wave, 1)) * 13) * 5000;
    }
    if (now < warIncidentState.nextAt) return;

    const kind = chooseWarIncidentKind(own, enemy, neutral);
    const target = getWarIncidentTarget(kind, own, enemy, neutral);
    if (!kind || !target) {
      warIncidentState.nextAt = now + getWarIncidentDelay();
      return;
    }
    createWarIncident(kind, target);
  }

  function applyTerrainEconomy(tower, deltaTime) {
    if (!tower || tower.faction !== safe(() => FACTIONS.PLAYER, 'player')) return;
    tower.mastilTerrainTimer = (tower.mastilTerrainTimer || 0) + deltaTime;
    const condition = getBattlefieldCondition();

    if (tower.terrain === 'market') {
      const solterra = getPlayerFactionId() === 'spain' ? 1.28 : 1;
      tower.mastilMarketTimer = (tower.mastilMarketTimer || 0) + deltaTime * (0.36 + tower.level * 0.05) * solterra * condition.marketRate;
      if (tower.mastilMarketTimer >= 1) {
        const bonus = Math.floor(tower.mastilMarketTimer);
        safe(() => {
          gold += bonus;
        });
        tower.mastilMarketTimer -= bonus;
      }
    }

    if (tower.terrain === 'barracks' && tower.mastilTerrainTimer >= 5.6 * condition.barracksInterval && tower.units < tower.maxUnits) {
      const bonus = getPlayerFactionId() === 'england' ? 2 : 1;
      tower.units = Math.min(tower.maxUnits, tower.units + bonus);
      tower.mastilTerrainTimer = 0;
    }

    if (tower.supplyLinked && !tower.supplyRoot && tower.units < tower.maxUnits) {
      tower.mastilSupplyTimer = (tower.mastilSupplyTimer || 0) + deltaTime;
      const interval = tower.terrain === 'road' ? 8.4 : 10.8;
      if (tower.mastilSupplyTimer >= interval) {
        tower.units = Math.min(tower.maxUnits, tower.units + 1);
        tower.mastilSupplyTimer = 0;
      }
    } else if (!tower.supplyLinked) {
      tower.mastilSupplyTimer = 0;
    }
  }

  function applyStrategicSitePulse(deltaTime) {
    const own = getPlayerTowers();
    const enemy = getEnemyTowers();
    if (!own.length) return;

    const state = computeStrategicSiteState();
    if (state.signature !== strategicState.lastSignature) {
      strategicState.lastSignature = state.signature;
      if (state.heldCount > strategicState.lastHeldCount) {
        pushEvent(`Strategische Orte: ${state.heldCount}/${state.total}`, 'site');
        if (state.heldCount >= 4) unlockAchievement('warPlanner', { tower: own[0] });
      }
      strategicState.lastHeldCount = state.heldCount;
    }

    strategicState.pulseTimer += deltaTime || 0;
    if (strategicState.pulseTimer < 8.5) return;
    strategicState.pulseTimer = 0;

    const ids = state.heldIds;
    const waveNumber = Math.max(1, safe(() => wave, 1));
    let pulseText = '';

    if (ids.has('trade')) {
      const bonus = 2 + Math.floor(state.heldCount / 2) + Math.floor(waveNumber / 6);
      safe(() => {
        gold += bonus;
        updateUI();
      });
      pulseText = `Handel +${bonus}`;
    }

    if (ids.has('warcamp')) {
      const weakest = own
        .filter((tower) => tower.units < tower.maxUnits)
        .sort((a, b) => (a.units / Math.max(1, a.maxUnits)) - (b.units / Math.max(1, b.maxUnits)))[0];
      if (weakest) {
        weakest.units = Math.min(weakest.maxUnits, weakest.units + 1);
        spawnEffect(weakest.x, weakest.y, 'achievement', { color: STRATEGIC_SITES.barracks.color, text: '+1', duration: 760, size: 0.72 });
        pulseText = pulseText || 'Heerlager +1';
      }
    }

    if (ids.has('royalroad')) {
      reduceCommandCooldowns(850);
    }

    if ((ids.has('signal') || ids.has('rivergate') || ids.has('hunterwood')) && enemy.length) {
      const front = computeFrontPressure(own, enemy);
      const target = front.hottest || own.sort((a, b) => a.units - b.units)[0];
      if (target && target.units < target.maxUnits) {
        target.units = Math.min(target.maxUnits, target.units + 1);
        spawnEffect(target.x, target.y, 'shield', { color: '#b7d394', text: 'Wache', duration: 780, size: 0.72 });
        pulseText = pulseText || 'Frontwache +1';
      }
    }

    if (pulseText && state.heldCount >= 3) {
      const anchor = own.find((tower) => getStrategicSiteInfo(tower).id === 'crownkeep') || own[0];
      spawnEffect(anchor.x, anchor.y, 'achievement', { color: '#e8c65d', text: pulseText, duration: 900, size: 0.82 });
    }
  }

  function getBossTowers() {
    return safe(() => towers.filter((tower) => tower.boss && tower.faction !== FACTIONS.PLAYER), []);
  }

  function promoteBossTower(waveNumber) {
    const region = getBossRegionForWave(waveNumber);
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

  function applyFactionStartBonus(options = {}) {
    if (options.preserveHome) return;
    const factionId = getPlayerFactionId();
    const trait = getFactionTrait();
    const own = getPlayerTowers();
    if (!own.length) return;

    if (factionId === 'england') {
      own.forEach((tower) => {
        tower.units = Math.min(tower.maxUnits, tower.units + 3);
        tower.fortifiedUntil = Math.max(tower.fortifiedUntil || 0, performance.now() + 9000);
      });
    }

    if (factionId === 'spain') {
      safe(() => {
        gold += 24 + own.filter((tower) => tower.terrain === 'market' || tower.terrain === 'road').length * 8;
      });
    }

    if (factionId === 'maya') {
      own.forEach((tower) => {
        if (tower.type === typeFromKey('watch') || tower.terrain === 'forest') {
          tower.units = Math.min(tower.maxUnits, tower.units + 2);
        }
      });
      window.mastilAiGraceUntil = Math.max(window.mastilAiGraceUntil || 0, performance.now() + 18000);
    }

    if (factionId === 'abbasid') {
      safe(() => {
        gold += 14;
      });
      const home = own[0];
      if (home) home.type = typeFromKey('gold');
    }

    if (factionId === 'hre') {
      const home = own[0];
      if (home) {
        home.level = Math.max(2, home.level || 1);
        if (typeof getTowerMaxUnits === 'function') {
          home.maxUnits = getTowerMaxUnits(home.faction, home.type, home.level);
        }
        home.units = Math.min(home.maxUnits, home.units + 4);
        home.fortifiedUntil = Math.max(home.fortifiedUntil || 0, performance.now() + 12000);
      }
    }

    pushEvent(`${trait.short}: ${trait.passive}`, 'edict');
  }

  function reduceCommandCooldowns(ms) {
    const now = performance.now();
    commandCooldowns.forEach((readyAt, key) => {
      if (readyAt > now) {
        commandCooldowns.set(key, Math.max(now + 900, readyAt - ms));
      }
    });
  }

  function claimTerrainSpoils(tower) {
    if (!tower || tower.lootClaimed || tower.faction !== safe(() => FACTIONS.PLAYER, 'player')) return;
    tower.lootClaimed = true;
    const terrain = getTerrainInfo(tower.terrain);
    const site = getStrategicSiteInfo(tower);
    const currentWave = safe(() => wave, 1);
    let message = '';

    if (tower.terrain === 'market') {
      const bonus = 48 + currentWave * 4 + (getPlayerFactionId() === 'spain' ? 18 : 0);
      safe(() => {
        gold += bonus;
        updateUI();
      });
      message = `${site.title}: +${bonus} Gold`;
    } else if (tower.terrain === 'barracks') {
      const amount = getPlayerFactionId() === 'england' ? 4 : 3;
      getPlayerTowers().forEach((own) => {
        own.units = Math.min(own.maxUnits, own.units + amount);
        spawnEffect(own.x, own.y, 'achievement', { color: '#8fc3f0', text: `+${amount}`, duration: 900, size: 0.72 });
      });
      message = `${site.title}: +${amount} Truppen je Turm`;
    } else if (tower.terrain === 'hill' || tower.terrain === 'ford' || tower.terrain === 'forest') {
      const duration = tower.terrain === 'hill' ? 24000 : 19000;
      tower.fortifiedUntil = Math.max(tower.fortifiedUntil || 0, performance.now() + duration);
      tower.units = Math.min(tower.maxUnits, tower.units + 4);
      message = `${site.title}: Verteidigung gesichert`;
    } else if (tower.terrain === 'quarry') {
      const bonus = 34 + currentWave * 3;
      safe(() => {
        gold += bonus;
        updateUI();
      });
      tower.fortifiedUntil = Math.max(tower.fortifiedUntil || 0, performance.now() + 22000);
      message = `${site.title}: +${bonus} Gold und Schutz`;
    } else if (tower.terrain === 'keep') {
      tower.level = Math.min(8, (tower.level || 1) + 1);
      if (typeof getTowerMaxUnits === 'function') {
        tower.maxUnits = getTowerMaxUnits(tower.faction, tower.type, tower.level);
      }
      tower.units = Math.min(tower.maxUnits, tower.units + 8);
      message = `${site.title}: ${getTowerTierName(tower.level)} gesichert`;
    } else {
      reduceCommandCooldowns(5200);
      message = `${site.title}: Befehle schneller bereit`;
    }

    const routeDegree = Number(tower.mastilRouteDegree || 0);
    if (routeDegree >= 3) {
      const routeBonus = 10 + routeDegree * 4;
      safe(() => {
        gold += routeBonus;
        updateUI();
      });
      reduceCommandCooldowns(1800 + routeDegree * 450);
      message += ` | Kreuzung +${routeBonus} Gold`;
      spawnEffect(tower.x, tower.y + 18, 'achievement', {
        color: '#ffe18a',
        text: `W${routeDegree}`,
        duration: 1100,
        size: 0.82
      });
    }

    matchStats.spoils += 1;
    pushEvent(message, 'spoils');
    spawnEffect(tower.x, tower.y, 'achievement', {
      color: site.color || terrain.color,
      text: site.short,
      duration: 1350,
      size: 1.05
    });
    unlockAchievement('firstSpoils', { tower });
    if (matchStats.spoils >= 3) unlockAchievement('quartermaster', { tower });
    showEnhancementNotice(message);
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
    const routeState = computeRouteControlState();
    if (!own.length) return 'Verteidigung gebrochen.';
    const incident = warIncidentState.active;
    if (incident && incident.target) {
      if (incident.kind === 'breach') return 'Kriegsereignis: Mauerbruch nutzen, jetzt belagern oder stürmen.';
      if (incident.kind === 'convoy') return 'Kriegsereignis: Konvoi sichern, Ziel schnell erobern.';
      if (incident.kind === 'sabotage') return 'Kriegsereignis: betroffenen Turm halten, versorgen oder befestigen.';
    }
    if (!selected) return 'Wähle einen Turm, dann Angriff oder Ausbau.';
    if (selected.faction !== playerFaction) return 'Wähle zuerst einen eigenen Turm.';

    const upgradeCost = typeof getUpgradeCost === 'function' ? getUpgradeCost(selected) : 65;
    const pressure = enemy.length - own.length;
    const fortified = selected.fortifiedUntil && selected.fortifiedUntil > performance.now();
    const selectedPressure = selected.frontPressure || 0;

    if (selectedPressure >= 0.78 && !fortified && currentGold >= getFortifyCost(selected)) {
      return 'Front heiß: diesen Turm befestigen und Reserven heranziehen.';
    }
    if (selectedPressure >= 0.58 && enemy.length && currentGold >= getSiegeCost(selected)) {
      return 'Feinddruck sichtbar: Belagerung schwächt den nächsten Gegner.';
    }
    if (selectedPressure >= 0.44 && selected.units < selected.maxUnits * 0.42) {
      return 'Frontposten dünn besetzt: erst Sammeln, dann angreifen.';
    }
    if (!selected.supplyLinked && own.length >= 3) {
      return 'Turm isoliert: benachbarte Wege sichern oder die Linie schließen.';
    }
    if (routeState.front > 0 && currentGold >= getSiegeCost(selected) && selected.units >= Math.max(4, selected.maxUnits * 0.24)) {
      return 'Frontweg bedroht: Belagerung oder Schnellangriff hält den Feind von der Straße fern.';
    }
    if (routeState.open > 0 && neutral.length) {
      return 'Offener Weg sichtbar: neutrale Wegpunkte erobern, dann Versorgung ausbauen.';
    }
    if (getTowerVeteranRank(selected) >= 2 && selectedPressure >= 0.32) {
      return `${getTowerVeteranInfo(selected).title} halten: Dieser Turm ist ein Schlüsselposten.`;
    }
    if (pressure >= 2 && !fortified && currentGold >= 28 + selected.level * 7) {
      return 'Frontdruck hoch: wichtigen Turm befestigen.';
    }
    if (enemy.length && currentGold >= getSiegeCost(selected) && selected.units >= Math.max(4, selected.maxUnits * 0.28)) {
      return 'Belagerung bereit: starken Feindposten erst schwächen, dann stürmen.';
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
    if (selected.lootClaimed || selected.supplyLinked) {
      const site = getStrategicSiteInfo(selected);
      return `${site.title} gehalten: ${site.bonus}`;
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
      const region = getBossRegionForWave(currentWave);
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

  function getWarContractState(own, enemy, neutral) {
    const currentTowers = safe(() => towers, []);
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const config = getMatchConfig();
    const plan = getWarPlan(config);
    const strategic = computeStrategicSiteState(currentTowers);
    const supply = computeSupplyState(own);
    const routes = computeRouteControlState(currentTowers);
    const hasMarket = own.some((tower) => tower.terrain === 'market');
    const capturableMarket = currentTowers.some((tower) => tower.terrain === 'market' && tower.faction !== playerFaction);

    if (routes.open > 0 && routes.secured < Math.min(5, routes.total)) {
      return {
        title: config.mode === 'skirmish' ? 'Gefecht: Straßen nehmen' : 'Kriegsauftrag: Königsweg',
        detail: `${routes.secured}/${routes.total} Wege gesichert. Erobere offene Wegpunkte fuer Versorgung.`,
        progress: Math.min(1, routes.secured / Math.max(1, Math.min(5, routes.total)))
      };
    }

    if (routes.front > 0 && enemy.length > 0) {
      return {
        title: 'Kriegsauftrag: Frontweg halten',
        detail: `${routes.front} Frontweg${routes.front === 1 ? '' : 'e'} bedroht. Schwäche den nächsten Feindposten.`,
        progress: Math.max(0.08, routes.secured / Math.max(1, routes.total))
      };
    }

    if (config.mode === 'skirmish' && plan === WAR_PLANS.raiders && supply.ratio < 0.82 && own.length >= 3) {
      return {
        title: 'Gefecht: Linien halten',
        detail: `${Math.round(supply.ratio * 100)}% Versorgung. Schließe Lücken gegen Plünderer.`,
        progress: supply.ratio
      };
    }

    if (config.mode === 'skirmish' && plan === WAR_PLANS.fortress && enemy.length > 0 && matchStats.sieges < 2) {
      return {
        title: 'Gefecht: Festung brechen',
        detail: `${matchStats.sieges}/2 Belagerungen geführt. Starke Burgen erst schwächen.`,
        progress: Math.min(1, matchStats.sieges / 2)
      };
    }

    if (config.mode === 'skirmish' && plan === WAR_PLANS.economy && !hasMarket && capturableMarket) {
      return {
        title: 'Gefecht: Handelsroute',
        detail: 'Sichere zuerst einen Markt, damit große Karten bezahlbar bleiben.',
        progress: 0
      };
    }

    if (config.mode === 'skirmish' && plan === WAR_PLANS.conquest && strategic.heldCount < Math.min(5, strategic.total) && strategic.nextTarget) {
      return {
        title: 'Gefecht: Reichskrieg',
        detail: `${strategic.heldCount}/${strategic.total} Schlüsselorte. Nächstes Ziel: ${strategic.nextTarget.site.title}.`,
        progress: strategic.ratio
      };
    }

    if (!hasMarket && capturableMarket) {
      return {
        title: 'Kriegsauftrag: Markt sichern',
        detail: 'Erobere einen Markt für Kriegsbeute und Einkommen.',
        progress: 0
      };
    }

    if (strategic.heldCount < Math.min(3, strategic.total) && strategic.nextTarget) {
      return {
        title: 'Kriegsauftrag: Kartenmacht',
        detail: `${strategic.heldCount}/${strategic.total} Orte. Ziel: ${strategic.nextTarget.site.title}.`,
        progress: strategic.ratio
      };
    }

    const terrainCount = getHeldTerrainTypes(own).size;
    if (terrainCount < 3) {
      return {
        title: 'Kriegsauftrag: Land beherrschen',
        detail: `${terrainCount}/3 Geländearten gehalten.`,
        progress: terrainCount / 3
      };
    }

    if (matchStats.spoils < 3 && neutral.length + enemy.length > 0) {
      return {
        title: 'Kriegsauftrag: Beutezug',
        detail: `${matchStats.spoils}/3 Geländebeuten gesichert.`,
        progress: Math.min(1, matchStats.spoils / 3)
      };
    }

    if (enemy.length > 0) {
      return {
        title: 'Kriegsauftrag: Front brechen',
        detail: `${enemy.length} feindliche Posten verbleiben.`,
        progress: own.length / Math.max(1, own.length + enemy.length)
      };
    }

    return {
      title: 'Kriegsauftrag: Welle vorbereiten',
      detail: 'Ausbauen, sammeln und Edikt wählen.',
      progress: 1
    };
  }

  function collectCompletedWarContracts(own, enemy, neutral) {
    const currentTowers = safe(() => towers, []);
    const config = getMatchConfig();
    const plan = getWarPlan(config);
    const strategic = computeStrategicSiteState(currentTowers);
    const supply = computeSupplyState(own);
    const routes = computeRouteControlState(currentTowers);
    const terrainCount = getHeldTerrainTypes(own).size;
    const hasMarket = own.some((tower) => tower.terrain === 'market');
    const hasPlayerAction = matchStats.captured + matchStats.sieges + matchStats.spoils + matchStats.upgrades + matchStats.commands > 0;
    const completions = [];

    if (!hasPlayerAction) return completions;

    if (routes.total > 0 && routes.secured >= Math.min(5, routes.total)) {
      completions.push({ id: 'roads', title: 'Königswege gesichert', type: 'command' });
    }
    if (hasMarket) {
      completions.push({ id: 'market', title: 'Markt gesichert', type: 'gold' });
    }
    if (strategic.total > 0 && strategic.heldCount >= Math.min(3, strategic.total)) {
      completions.push({ id: 'strategic', title: 'Kartenmacht errungen', type: 'troops' });
    }
    if (terrainCount >= 3) {
      completions.push({ id: 'terrain', title: 'Drei Geländearten gehalten', type: 'morale' });
    }
    if (matchStats.spoils >= 3) {
      completions.push({ id: 'spoils', title: 'Beutezug erfüllt', type: 'gold' });
    }
    if (config.mode === 'skirmish' && plan === WAR_PLANS.raiders && supply.ratio >= 0.82 && own.length >= 3) {
      completions.push({ id: 'raider-lines', title: 'Linien gegen Plünderer gehalten', type: 'command' });
    }
    if (config.mode === 'skirmish' && plan === WAR_PLANS.fortress && matchStats.sieges >= 2) {
      completions.push({ id: 'siege-contract', title: 'Festungskrieg vorbereitet', type: 'siege' });
    }
    if (config.mode === 'skirmish' && plan === WAR_PLANS.economy && hasMarket) {
      completions.push({ id: 'trade-contract', title: 'Handelsroute eröffnet', type: 'gold' });
    }
    if (config.mode === 'skirmish' && plan === WAR_PLANS.conquest && strategic.total > 0 && strategic.heldCount >= Math.min(5, strategic.total)) {
      completions.push({ id: 'conquest-contract', title: 'Reichskrieg-Schlüsselorte gehalten', type: 'troops' });
    }
    if (enemy.length === 0 && own.length > 0) {
      completions.push({ id: 'front-break', title: 'Front gebrochen', type: 'victory' });
    }

    return completions.filter((contract) => !completedContracts.has(contract.id) && contract.id !== 'front-break');
  }

  function grantWarContractReward(contract, own) {
    if (!contract || completedContracts.has(contract.id)) return;
    completedContracts.add(contract.id);
    matchStats.contracts += 1;

    let message = contract.title;
    if (contract.type === 'gold') {
      const bonus = 54 + Math.max(0, safe(() => wave, 1) - 1) * 6;
      safe(() => {
        gold += bonus;
        updateUI();
      });
      message += `: +${bonus} Gold`;
    } else if (contract.type === 'troops') {
      own.slice(0, 5).forEach((tower) => {
        const amount = 3 + Math.min(3, Math.floor((tower.level || 1) / 2));
        tower.units = Math.min(tower.maxUnits, tower.units + amount);
        spawnEffect(tower.x, tower.y, 'achievement', { color: '#8fc3f0', text: `+${amount}`, duration: 900, size: 0.78 });
      });
      message += ': Reserven verteilt';
    } else if (contract.type === 'siege') {
      reduceCommandCooldowns(6500);
      safe(() => {
        gold += 34;
        updateUI();
      });
      message += ': Belagerungen schneller bereit';
    } else if (contract.type === 'morale') {
      warMorale = clamp(warMorale + 7, 0, 100);
      matchStats.maxMorale = Math.max(matchStats.maxMorale, warMorale);
      own.forEach((tower) => spawnEffect(tower.x, tower.y, 'morale', { color: '#9ed6a2', text: '+Moral', duration: 820, size: 0.72 }));
      message += ': Kriegslaune steigt';
    } else {
      reduceCommandCooldowns(5200);
      message += ': Befehle schneller bereit';
    }

    pushEvent(`Auftrag erfüllt: ${message}`, 'achievement');
    showEnhancementNotice(`Auftrag erfüllt: ${message}`);
    playSound('achievement');
    if (matchStats.contracts >= 3) unlockAchievement('contractMaster', { tower: own[0] });
  }

  function applyWarContractRewards(own, enemy, neutral) {
    collectCompletedWarContracts(own, enemy, neutral).forEach((contract) => {
      grantWarContractReward(contract, own);
    });
  }

  function getCommanderGroups(enemy = getEnemyTowers()) {
    const groups = new Map();
    enemy.forEach((tower) => {
      const commander = assignEnemyCommander(tower);
      if (!commander) return;
      if (!groups.has(tower.faction)) {
        groups.set(tower.faction, {
          faction: tower.faction,
          commander,
          towers: [],
          units: 0,
          levelScore: 0,
          bossCount: 0
        });
      }
      const group = groups.get(tower.faction);
      group.towers.push(tower);
      group.units += Math.max(0, Math.floor(tower.units || 0));
      group.levelScore += (tower.level || 1) * 8;
      if (tower.boss) group.bossCount += 1;
    });
    return Array.from(groups.values()).map((group) => ({
      ...group,
      score: group.units + group.levelScore + group.towers.length * 7 + group.bossCount * 32 + group.commander.pressure
    }));
  }

  function getEnemyThreatState(own, enemy) {
    const groups = getCommanderGroups(enemy);
    if (!groups.length) {
      return {
        active: false,
        title: 'Feindkommando',
        detail: 'Keine feindliche Kommandantur aktiv.',
        progress: 0,
        color: '#8fc3f0',
        warning: false
      };
    }

    const ownStrength = Math.max(
      24,
      own.reduce((sum, tower) => sum + Math.max(0, Math.floor(tower.units || 0)) + (tower.level || 1) * 6, 0)
    );
    const lead = groups.sort((a, b) => b.score - a.score)[0];
    const ratio = lead.score / ownStrength;
    const level = ratio >= 1.28 ? 'kritisch' : ratio >= 0.92 ? 'hoch' : ratio >= 0.62 ? 'wachsend' : 'unter Kontrolle';
    const recentOrder = enemyCommandState.lastCommanderId === lead.faction
      ? enemyCommandState.lastOrderText
      : lead.commander.detail;

    return {
      active: true,
      title: `${lead.commander.name}`,
      detail: `${lead.commander.tactic}: ${level}. ${lead.towers.length} Posten, ${lead.units} Truppen. ${recentOrder}`,
      progress: Math.min(1, ratio / 1.45),
      color: lead.commander.color,
      warning: performance.now() < enemyCommandState.warningUntil
    };
  }

  function getWeakPlayerTarget(own, source) {
    return own
      .map((tower) => {
        const distance = source ? Math.hypot(tower.x - source.x, tower.y - source.y) : 0;
        const fortified = tower.fortifiedUntil && tower.fortifiedUntil > performance.now() ? 12 : 0;
        const terrainHold = ['hill', 'forest', 'ford', 'keep'].includes(tower.terrain) ? 5 : 0;
        return {
          tower,
          score: Math.max(0, tower.units || 0) + distance / 130 + fortified + terrainHold
        };
      })
      .sort((a, b) => a.score - b.score)[0]?.tower || null;
  }

  function executeStormCommander(group, own) {
    const source = group.towers
      .filter((tower) => tower.units >= 7)
      .sort((a, b) => (b.units + (b.level || 1) * 4) - (a.units + (a.level || 1) * 4))[0];
    const target = source ? getWeakPlayerTarget(own, source) : null;
    if (!source || !target) return '';

    const waveBonus = Math.min(0.08, Math.max(0, safe(() => wave, 1) - 1) * 0.006);
    const amount = Math.min(
      Math.max(1, Math.floor(source.units - 1)),
      Math.max(2, Math.floor(source.units * (0.24 + waveBonus)))
    );
    if (amount <= 0) return '';
    if (safe(() => wave, 1) <= 1 && own.length <= 1 && target.units <= Math.max(6, target.maxUnits * 0.45)) {
      return '';
    }

    safe(() => sendUnitsFromTower(source, target, amount));
    spawnEffect(source.x, source.y, 'attack', { color: group.commander.color, text: group.commander.short, duration: 900, size: 1.05 });
    spawnEffect(target.x, target.y, 'impact', { color: group.commander.color, text: 'Sturm', duration: 980, size: 0.95 });
    return `${group.commander.name} greift ${getTowerTierName(target.level)} mit ${amount} Truppen an.`;
  }

  function executeReserveCommander(group) {
    const boosted = group.towers
      .filter((tower) => tower.units < tower.maxUnits)
      .sort((a, b) => a.units - b.units)
      .slice(0, 2);
    let total = 0;
    boosted.forEach((tower) => {
      const amount = Math.min(
        Math.max(0, tower.maxUnits - tower.units),
        3 + Math.floor((tower.level || 1) / 2) + Math.floor(safe(() => wave, 1) / 6)
      );
      if (amount <= 0) return;
      total += amount;
      tower.units = Math.min(tower.maxUnits, tower.units + amount);
      spawnEffect(tower.x, tower.y, 'achievement', { color: group.commander.color, text: `+${amount}`, duration: 920, size: 0.78 });
    });
    if (total <= 0) return '';
    return `${group.commander.name} verstärkt die Reserve um ${total} Truppen.`;
  }

  function executeShadowCommander(group, own) {
    const target = getWeakPlayerTarget(own, null);
    if (!target || target.units <= 2) return '';

    const loss = Math.min(
      Math.max(1, Math.floor(target.units - 1)),
      1 + Math.floor((target.level || 1) / 2) + Math.floor(safe(() => wave, 1) / 8)
    );
    if (loss <= 0) return '';

    target.units = Math.max(1, target.units - loss);
    const nearest = group.towers
      .map((tower) => ({ tower, distance: Math.hypot(tower.x - target.x, tower.y - target.y) }))
      .sort((a, b) => a.distance - b.distance)[0]?.tower || null;
    if (nearest && nearest.units < nearest.maxUnits) {
      nearest.units = Math.min(nearest.maxUnits, nearest.units + 1);
    }
    spawnEffect(target.x, target.y, 'impact', { color: group.commander.color, text: `-${loss}`, duration: 1050, size: 0.98 });
    return `${group.commander.name} schwächt ${getTowerTierName(target.level)} um ${loss} Truppen.`;
  }

  function executeCommanderTactic(group, own) {
    if (group.faction === safe(() => FACTIONS.ENEMY_1, 'enemy1')) return executeStormCommander(group, own);
    if (group.faction === safe(() => FACTIONS.ENEMY_2, 'enemy2')) return executeReserveCommander(group, own);
    if (group.faction === safe(() => FACTIONS.ENEMY_3, 'enemy3')) return executeShadowCommander(group, own);
    return executeStormCommander(group, own);
  }

  function applyEnemyCommanderPressure() {
    const now = performance.now();
    const own = getPlayerTowers();
    const enemy = getEnemyTowers();
    if (!own.length || !enemy.length) return;

    const groups = getCommanderGroups(enemy);
    if (!groups.length) return;

    const graceUntil = Number(window.mastilAiGraceUntil || 0);
    if (now < graceUntil) {
      enemyCommandState.globalReadyAt = Math.max(enemyCommandState.globalReadyAt || 0, graceUntil + 1600);
      groups.forEach((group) => {
        const readyAt = graceUntil + 1900 + group.commander.stagger;
        enemyCommandState.readyAt.set(group.faction, Math.max(enemyCommandState.readyAt.get(group.faction) || 0, readyAt));
      });
      return;
    }
    if (now < (enemyCommandState.globalReadyAt || 0)) return;

    groups.sort((a, b) => (enemyCommandState.readyAt.get(a.faction) || now + a.commander.stagger) - (enemyCommandState.readyAt.get(b.faction) || now + b.commander.stagger));
    for (const group of groups) {
      if (!enemyCommandState.readyAt.has(group.faction)) {
        enemyCommandState.readyAt.set(group.faction, now + group.commander.stagger);
      }
      if (now < enemyCommandState.readyAt.get(group.faction)) continue;

      const orderText = executeCommanderTactic(group, own);
      const config = getMatchConfig();
      const planTempo = getWarPlan(config).commanderTempo || 1;
      const scenarioTempo = config.mode === 'skirmish' ? getSkirmishScenario(config).commanderTempo || 1 : 1;
      enemyCommandState.readyAt.set(group.faction, now + group.commander.interval * planTempo * scenarioTempo + Math.random() * 2400);
      if (!orderText) continue;

      matchStats.enemyOrders += 1;
      enemyCommandState.lastOrderText = orderText;
      enemyCommandState.lastCommanderId = group.faction;
      enemyCommandState.globalReadyAt = now + 14000;
      enemyCommandState.warningUntil = now + 8200;
      pushEvent(`Feindbefehl: ${orderText}`, 'threat');
      unlockAchievement('firstEnemyOrder');
      showEnhancementNotice(`${group.commander.tactic}: ${orderText}`);
      playSound(group.faction === safe(() => FACTIONS.ENEMY_2, 'enemy2') ? 'upgrade' : 'attack');
      break;
    }
  }

  function applyBossWavePressure(waveNumber) {
    if (!isBossWave(waveNumber)) return;
    const region = getBossRegionForWave(waveNumber);
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

  function getBestSourceTower() {
    return getPlayerTowers()
      .filter((tower) => tower.units > 1)
      .sort((a, b) => (b.units + (b.level || 1) * 2) - (a.units + (a.level || 1) * 2))[0] || null;
  }

  function getTargetEvaluation(source, tower) {
    if (!source || !tower || tower.faction === safe(() => FACTIONS.PLAYER, 'player')) return null;
    const distance = Math.hypot(tower.x - source.x, tower.y - source.y);
    const marked = getMarkedBattleTarget();
    const attackAmount = Math.max(1, Math.floor((source.units || 0) * 0.5));
    const defense = Math.max(1, (tower.units || 0) + (tower.level || 1) * 1.5);
    const chance = attackAmount / defense;
    const site = getStrategicSiteInfo(tower);
    const vulnerable = tower.siegedUntil && tower.siegedUntil > performance.now();
    const flanked = tower.flankedUntil && tower.flankedUntil > performance.now();
    const recon = Number(tower.reconWeakness || 0);
    const roleValue = tower.type === typeFromKey('gold') ? 8 : tower.type === typeFromKey('troop') ? 7 : tower.type === typeFromKey('watch') ? 5 : 3;
    const strategicWeight = site ? site.weight || 8 : 6;
    const score =
      distance / 82 +
      (tower.units || 0) * 0.62 +
      (tower.level || 1) * 5 -
      strategicWeight -
      roleValue -
      (tower.boss ? 34 : 0) -
      (tower.commander ? 18 : 0) -
      (vulnerable ? 16 : 0) -
      (flanked ? 10 : 0) -
      recon * 7 -
      (tower === marked ? 22 : 0);

    let reason = site ? `${site.title} sichern` : 'kurzer Weg';
    if (tower.boss) reason = 'Boss brechen';
    else if (tower.commander) reason = 'Kommandoposten schwächen';
    else if (vulnerable || flanked || recon) reason = 'verwundbares Ziel';
    else if (tower.faction === safe(() => FACTIONS.NEUTRAL, 'neutral') && getPlayerTowers().length < 3) reason = 'frühe Expansion';
    else if (tower.type === typeFromKey('gold')) reason = 'Goldquelle sichern';
    else if (tower.type === typeFromKey('troop')) reason = 'Truppenstandort sichern';
    else if (distance < getConnectionThreshold() * 0.76) reason = 'kurzer Angriffspfad';

    const label = chance >= 1.1 ? 'Sturmbar' : chance >= 0.72 ? 'Riskant' : 'Stark';
    return {
      score,
      reason,
      chance,
      label,
      attackAmount,
      distance
    };
  }

  function getRecommendedTargetFor(source, candidates = getAttackTargets()) {
    if (!source || !candidates.length) return null;
    const marked = getMarkedBattleTarget();
    const evaluated = candidates
      .map((tower) => ({ tower, evaluation: getTargetEvaluation(source, tower) }))
      .filter((entry) => entry.evaluation)
      .sort((a, b) => a.evaluation.score - b.evaluation.score);
    if (!evaluated.length) return null;
    if (marked) {
      const markedEntry = evaluated.find((entry) => entry.tower === marked);
      if (markedEntry) return markedEntry;
    }
    return evaluated[0];
  }

  function getRecommendedTargetForSelected() {
    const selected = safe(() => selectedTower && selectedTower.faction === FACTIONS.PLAYER ? selectedTower : null, null);
    const source = selected || getBestSourceTower();
    return getRecommendedTargetFor(source);
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

  function applyBattleSiteBonus(tower, node, faction, unitFactor) {
    if (!tower || !node) return tower;
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const isCastleSite = node.terrain === 'keep' || node.rank >= 9;
    const isRoadHub = MAP_LINKS.filter(([a, b]) => a === node.index || b === node.index).length >= 3;

    tower.mastilCastleSite = isCastleSite;
    tower.mastilRoadHub = isRoadHub;
    tower.mastilBattleRole = node.role;

    if (isCastleSite) {
      const capBonus = node.rank >= 9 ? 7 : 4;
      tower.maxUnits += capBonus;
      if (faction === playerFaction) {
        tower.units = Math.min(tower.maxUnits, tower.units + Math.ceil(capBonus / 2));
      } else {
        tower.units = Math.max(tower.units, Math.floor(tower.maxUnits * unitFactor));
      }
      tower.fortifiedUntil = Math.max(tower.fortifiedUntil || 0, performance.now() + (node.rank >= 9 ? 22000 : 14000));
    }

    if (isRoadHub && !isCastleSite) {
      tower.maxUnits += 2;
      tower.units = Math.min(tower.maxUnits, tower.units + 1);
    }

    return tower;
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
    tower.mastilNodeIndex = node.index;
    tower.mastilMapProfileId = node.mapProfileId || 'startgebiet';
    tower.mastilUpgradeMilestones = {};
    tower.boss = false;
    tower.bossName = '';
    tower.lootClaimed = false;
    tower.mastilRenown = 0;
    tower.mastilVeteranRank = 0;
    tower.mastilVeteranCapacityApplied = 0;
    applyBattleSiteBonus(tower, node, faction, unitFactor);
    assignEnemyCommander(tower);
    return tower;
  }

  function buildBattleMap(options = {}) {
    const config = getMatchConfig();
    const difficulty = DIFFICULTY[config.difficulty] || DIFFICULTY.normal;
    const warPlan = getWarPlan(config);
    const scenario = config.mode === 'skirmish' ? getSkirmishScenario(config) : SKIRMISH_SCENARIOS.training;
    const scenarioEnemyLevel = config.mode === 'skirmish' ? scenario.enemyLevel : 0;
    const scenarioEnemyUnits = config.mode === 'skirmish' ? scenario.enemyUnits : 1;
    const scenarioNeutralUnits = config.mode === 'skirmish' ? scenario.neutralUnits : 1;
    const currentWave = Math.max(1, safe(() => wave, 1));
    const bossWave = isBossWave(currentWave);
    const scenarioBossWave = config.mode === 'skirmish' && scenario.bossAtStart;
    const activeBossWave = bossWave || scenarioBossWave;
    const limit = SIZE_LIMITS[config.size] || SIZE_LIMITS.standard;
    const skirmishStartRank = config.mode === 'skirmish'
      ? ({ compact: 0, standard: 1, large: 1, war: 2, epic: 2 }[config.size] || 1)
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
    gold = options.preserveHome ? previousGold : (config.mode === 'skirmish' ? difficulty.gold + warPlan.goldBonus + scenario.goldBonus : 120);

    const mappedNodes = MAP_NODES.map((node, index) => getMapNodeForConfig(node, index, config, currentWave));
    const activeNodes = mappedNodes
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
          home.mastilRenown = Number(previousHome.mastilRenown || 0);
          home.mastilVeteranRank = getTowerVeteranRank(previousHome);
          home.mastilVeteranCapacityApplied = 0;
          applyTowerVeteranBonus(home);
        } else if (config.mode === 'skirmish') {
          const startRatioByDifficulty = { easy: 0.78, normal: 0.7, hard: 0.64, brutal: 0.58 };
          const sizeBoost = config.size === 'epic' ? 0.1 : config.size === 'war' ? 0.08 : config.size === 'large' ? 0.05 : 0.02;
          const startRatio = Math.min(0.9, ((startRatioByDifficulty[config.difficulty] || 0.68) + sizeBoost) * scenario.startUnits);
          home.units = Math.min(home.maxUnits, Math.max(home.units, Math.floor(home.maxUnits * startRatio)));
          if (config.size === 'war' || config.size === 'epic' || warPlan === WAR_PLANS.fortress || scenario.fortressBias) {
            home.fortifiedUntil = Math.max(home.fortifiedUntil || 0, performance.now() + 16000);
          }
        } else {
          const campaignStartRatio = currentWave <= 1 ? 0.86 : 0.72;
          home.units = Math.min(home.maxUnits, Math.max(home.units, Math.floor(home.maxUnits * campaignStartRatio)));
          if (currentWave <= 1) {
            home.fortifiedUntil = Math.max(home.fortifiedUntil || 0, performance.now() + 18000);
          }
        }
        towers.push(home);
        continue;
      }

      if (node.role === 'enemy') {
        const faction = getEnemyFaction(enemyIndex, opponentCount);
        let level = 1 + difficulty.enemyLevel + warPlan.enemyLevel + scenarioEnemyLevel + Math.floor(currentWave / 6) + (activeBossWave ? 1 : 0);
        if (node.terrain === 'keep') level += 1;
        if (config.mode === 'skirmish' && warPlan === WAR_PLANS.conquest && node.rank >= 7) level += 1;
        const factor = Math.min(0.98, (difficulty.enemyUnits + currentWave * 0.018 + (activeBossWave ? 0.16 : 0)) * warPlan.enemyUnits * scenarioEnemyUnits);
        const tower = createBattleTower(node, faction, level, factor);
        if (config.mode === 'skirmish' && (warPlan === WAR_PLANS.fortress || scenario.fortressBias)) {
          tower.fortifiedUntil = performance.now() + 14000;
        }
        if (config.mode === 'skirmish' && warPlan === WAR_PLANS.conquest && node.terrain === 'keep') {
          tower.fortifiedUntil = performance.now() + 18000;
        }
        towers.push(tower);
        enemyIndex += 1;
        continue;
      }

      let neutralLevel = currentWave >= 10 && node.rank >= 4 ? 2 : 1;
      if (config.mode === 'skirmish' && node.terrain === 'keep') neutralLevel += 1;
      const neutralFactor = (0.36 + Math.min(0.16, currentWave * 0.01) + (config.mode === 'skirmish' && warPlan === WAR_PLANS.economy ? 0.06 : 0)) * scenarioNeutralUnits;
      towers.push(createBattleTower(node, neutralFaction, neutralLevel, neutralFactor));
    }

    if (enemyIndex === 0) {
      const front = mappedNodes.find((node) => node.role === 'enemy') || { x: 0.82, y: 0.5, type: 'normal', rank: 4, index: 99, terrain: 'keep' };
      towers.push(createBattleTower(front, getEnemyFaction(0, opponentCount), 1 + difficulty.enemyLevel, difficulty.enemyUnits));
    }

    if (activeBossWave) {
      promoteBossTower(currentWave);
    }

    window.MASTIL_ACTIVE_REGION = getActiveRegion();
    window.MASTIL_ACTIVE_BOSS_WAVE = activeBossWave;
    window.MASTIL_WAR_PLAN = warPlan.label;
    window.MASTIL_SKIRMISH_SCENARIO = scenario.label;
    const graceByDifficulty = { easy: 26000, normal: 20500, hard: 16500, brutal: 12200 };
    const sizeGrace = { compact: 0.96, standard: 1.06, large: 1.2, war: 1.38, epic: 1.52 }[config.size] || 1;
    const opponentGrace = 1 + Math.max(0, opponentCount - 1) * 0.08;
    window.mastilAiGraceUntil = performance.now() + (config.mode === 'skirmish' ? (graceByDifficulty[config.difficulty] || 18000) * warPlan.graceFactor * scenario.graceFactor * sizeGrace * opponentGrace : 22000);
    enemyCommandState.readyAt.clear();
    enemyCommandState.lastOrderText = 'Feindliche Kommandanten sondieren die Front.';
    enemyCommandState.lastCommanderId = '';
    enemyCommandState.globalReadyAt = 0;
    enemyCommandState.warningUntil = 0;
    applyFactionStartBonus(options);
    safe(() => saveGameState());
    pushEvent(config.mode === 'skirmish' ? `Gefecht: ${scenario.label} | ${difficulty.label} | ${warPlan.label}` : 'Kampagne gestartet', 'wave');
    pushEvent(`Schlachtfeld: ${getBattlefieldCondition().title}`, 'condition');
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
    const recommendation = getRecommendedTargetFor(source, targets);
    const target = recommendation ? recommendation.tower : null;
    if (!target) {
      showEnhancementNotice('Kein sinnvolles Ziel gefunden.');
      playSound('error');
      return;
    }

    const amount = Math.max(1, Math.floor(source.units * 0.5));
    safe(() => sendUnitsFromTower(source, target, amount));
    unlockAchievement('firstCommand', { tower: source });
    spawnEffect(source.x, source.y, 'attack', { color: colorForFaction(source.faction), text: `-${amount}` });
    spawnEffect(target.x, target.y, 'impact', { color: '#f1cf6b', duration: 650, size: 0.75 });
    showEnhancementNotice(`Schnellangriff: ${amount} Einheiten. ${recommendation.evaluation.reason}.`);
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
    if ((matchStats.plans || 0) + (matchStats.flanks || 0) + matchStats.sieges >= 5) {
      unlockAchievement('masterTactician');
    }
  }

  function getNearestTargetFor(source, candidates) {
    const marked = getMarkedBattleTarget();
    return candidates
      .map((tower) => ({
        tower,
        score:
          tower.units +
          Math.hypot(tower.x - source.x, tower.y - source.y) / 95 +
          (tower.faction === safe(() => FACTIONS.NEUTRAL, 'neutral') ? 8 : 0) -
          (tower === marked ? 22 : 0)
      }))
      .sort((a, b) => a.score - b.score)[0]?.tower || null;
  }

  function getMarkedBattleTarget() {
    const now = performance.now();
    return safe(() => towers.find((tower) => {
      if (!tower || tower.faction === FACTIONS.PLAYER) return false;
      return tower.mastilMarkedUntil && tower.mastilMarkedUntil > now;
    }), null);
  }

  function getPriorityBattleTarget(source, candidates = getAttackTargets()) {
    return getRecommendedTargetFor(source, candidates)?.tower || null;
  }

  function markBattleTarget(source, target, kind = 'plan', duration = 22000) {
    if (!target) return;
    const now = performance.now();
    target.mastilMarkedUntil = now + duration;
    target.mastilMarkedKind = kind;
    target.mastilMarkedBy = source ? source.mastilNodeIndex : null;
    target.mastilMarkedAt = now;
    spawnEffect(target.x, target.y, kind === 'flank' ? 'flank' : 'plan', {
      color: kind === 'flank' ? '#8fc3f0' : '#f1cf6b',
      text: kind === 'flank' ? 'Flanke' : 'Ziel',
      duration: 1200,
      size: target.boss ? 1.22 : 1
    });
  }

  function markPriorityTarget() {
    if (!isCommandReady('plan', getCommandCooldownMs('plan'), 'Schlachtplan')) return;

    const source = safe(() => selectedTower && selectedTower.faction === FACTIONS.PLAYER ? selectedTower : null, null) || selectStrongestTower();
    const candidates = getAttackTargets();
    if (!source || !candidates.length) {
      commandCooldowns.delete('plan');
      showEnhancementNotice('Kein Ziel für den Schlachtplan gefunden.');
      playSound('error');
      return;
    }

    const target = getPriorityBattleTarget(source, candidates);
    if (!target) {
      commandCooldowns.delete('plan');
      showEnhancementNotice('Kein sinnvolles Ziel gefunden.');
      playSound('error');
      return;
    }

    markBattleTarget(source, target, 'plan', 24000);
    target.reconWeakness = Math.min(2, (target.reconWeakness || 0) + 1);
    matchStats.plans += 1;
    recordTacticalCommand(`Schlachtplan: ${getTowerRoleName(target.type)} markiert`, 'site');
    unlockAchievement('firstBattlePlan', { tower: target });
    showEnhancementNotice(`Schlachtplan: ${getTowerTierName(target.level)} markiert. Angriff und Belagerung treffen besser.`);
    playSound('select');
  }

  function flankingStrike() {
    if (!isCommandReady('flank', getCommandCooldownMs('flank'), 'Flankenangriff')) return;

    const own = getPlayerTowers().filter((tower) => tower.units >= Math.max(5, tower.maxUnits * 0.22));
    const source = safe(() => selectedTower && selectedTower.faction === FACTIONS.PLAYER ? selectedTower : null, null) || own[0] || selectStrongestTower();
    const candidates = getAttackTargets();
    if (!source || own.length < 2 || !candidates.length) {
      commandCooldowns.delete('flank');
      showEnhancementNotice('Flanke braucht mindestens zwei eigene Türme und ein Ziel.');
      playSound('error');
      return;
    }

    const target = getPriorityBattleTarget(source, candidates);
    if (!target) {
      commandCooldowns.delete('flank');
      showEnhancementNotice('Kein Ziel für die Flanke gefunden.');
      playSound('error');
      return;
    }

    const cost = getFlankCost(source);
    const currentGold = safe(() => gold, 0);
    if (currentGold < cost) {
      commandCooldowns.delete('flank');
      showEnhancementNotice(`Flankenangriff benötigt ${cost} Gold.`);
      playSound('error');
      return;
    }

    const strikeSources = own
      .map((tower) => ({ tower, distance: Math.hypot(tower.x - target.x, tower.y - target.y) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, Math.min(3, own.length))
      .map((entry) => entry.tower);

    let sentTotal = 0;
    strikeSources.forEach((tower, index) => {
      const ratio = tower === source ? 0.34 : 0.24;
      const amount = Math.max(1, Math.floor(tower.units * ratio));
      if (amount <= 0) return;
      sentTotal += amount;
      safe(() => sendUnitsFromTower(tower, target, amount));
      spawnEffect(tower.x, tower.y, 'attack', {
        color: colorForFaction(tower.faction),
        text: index === 0 ? 'Flanke' : `-${amount}`,
        duration: 900,
        size: 0.94
      });
    });

    if (sentTotal <= 0) {
      commandCooldowns.delete('flank');
      showEnhancementNotice('Keine Truppen für die Flanke bereit.');
      playSound('error');
      return;
    }

    safe(() => {
      gold -= cost;
      updateUI();
      hideTowerMenu();
    });
    const now = performance.now();
    target.flankedUntil = now + 18000;
    target.siegeWeakness = Math.min(4, (target.siegeWeakness || 0) + 1);
    if (target.fortifiedUntil && target.fortifiedUntil > now) {
      target.fortifiedUntil = Math.min(target.fortifiedUntil, now + 5600);
    }
    markBattleTarget(source, target, 'flank', 21000);

    matchStats.flanks += 1;
    recordTacticalCommand(`Flankenangriff: ${sentTotal} Truppen`, 'assault');
    unlockAchievement('firstFlank', { tower: target });
    spawnEffect(target.x, target.y, 'flank', {
      color: '#8fc3f0',
      text: `-${cost}G`,
      duration: 1350,
      size: target.boss ? 1.2 : 1
    });
    showEnhancementNotice(`Flankenangriff: ${sentTotal} Truppen setzen ${getTowerTierName(target.level)} unter Druck.`);
    playSound('attack');
  }

  function getSiegeTargetFor(source) {
    const enemies = getEnemyTowers();
    const neutral = safe(() => towers.filter((tower) => tower.faction === FACTIONS.NEUTRAL), []);
    const candidates = enemies.length ? enemies : neutral;
    const marked = getMarkedBattleTarget();
    if (marked && candidates.includes(marked)) return marked;
    return candidates
      .map((tower) => {
        const distance = Math.hypot(tower.x - source.x, tower.y - source.y);
        return {
          tower,
          score:
            distance / 78 +
            tower.units * 0.52 -
            (tower.boss ? 36 : 0) -
            (tower.commander ? 18 : 0) -
            (tower.level || 1) * 3 -
            (tower.terrain === 'keep' ? 10 : 0)
        };
      })
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

  function launchSiegeStrike() {
    if (!isCommandReady('siege', getCommandCooldownMs('siege'), 'Belagerung')) return;

    const source = safe(() => selectedTower && selectedTower.faction === FACTIONS.PLAYER ? selectedTower : null, null) || selectStrongestTower();
    if (!source) {
      commandCooldowns.delete('siege');
      return;
    }

    const target = getSiegeTargetFor(source);
    if (!target) {
      commandCooldowns.delete('siege');
      showEnhancementNotice('Kein Ziel für die Belagerung gefunden.');
      playSound('error');
      return;
    }

    const cost = getSiegeCost(source);
    const currentGold = safe(() => gold, 0);
    if (currentGold < cost) {
      commandCooldowns.delete('siege');
      showEnhancementNotice(`Belagerung benötigt ${cost} Gold.`);
      playSound('error');
      return;
    }

    const now = performance.now();
    const condition = getBattlefieldCondition();
    const bossPenalty = target.boss ? 0.74 : 1;
    const terrainBonus = source.terrain === 'quarry' ? 1.18 : source.terrain === 'barracks' ? 1.08 : 1;
    const typeBonus = source.type === typeFromKey('watch') ? 1.12 : source.type === typeFromKey('troop') ? 1.08 : 1;
    const markedBonus = target.mastilMarkedUntil && target.mastilMarkedUntil > now ? 1.12 : 1;
    const flankBonus = target.flankedUntil && target.flankedUntil > now ? 1.2 : 1;
    const reconBonus = 1 + Math.min(0.14, Number(target.reconWeakness || 0) * 0.07);
    const rawDamage = Math.floor((5 + (source.level || 1) * 2 + Math.max(0, safe(() => wave, 1) - 1) * 0.5) * bossPenalty * terrainBonus * typeBonus * markedBonus * flankBonus * reconBonus * condition.siegePower);
    const damage = Math.min(Math.max(0, Math.floor(target.units - 1)), Math.max(1, rawDamage));
    if (damage <= 0) {
      commandCooldowns.delete('siege');
      showEnhancementNotice('Das Ziel ist bereits gebrochen. Schickt Truppen zur Eroberung.');
      playSound('error');
      return;
    }

    safe(() => {
      gold -= cost;
      updateUI();
      hideTowerMenu();
    });
    target.units = Math.max(1, target.units - damage);
    if (target.fortifiedUntil && target.fortifiedUntil > now) {
      target.fortifiedUntil = Math.min(target.fortifiedUntil, now + 2600);
    }
    target.siegedUntil = now + 14500;
    target.siegeWeakness = Math.min(3, (target.siegeWeakness || 0) + 1);

    matchStats.sieges += 1;
    recordTacticalCommand(`Belagerung: ${getTowerTierName(target.level)} -${damage}`, 'siege');
    unlockAchievement('firstSiege', { tower: target });
    if (matchStats.sieges >= 3) unlockAchievement('siegeMaster', { tower: target });
    spawnEffect(source.x, source.y, 'attack', { color: '#f1cf6b', text: 'Belag.', duration: 950, size: 0.92 });
    spawnEffect(target.x, target.y, 'siege', {
      color: '#ffbe67',
      text: `-${damage}`,
      duration: 1350,
      size: target.boss ? 1.25 : 1.05,
      sourceX: source.x,
      sourceY: source.y
    });
    showEnhancementNotice(`Belagerung trifft ${getTowerTierName(target.level)}. ${condition.short}: -${damage} Truppen, -${cost} Gold.`);
    playSound('impact');
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

  function activateFactionAbility() {
    const factionId = getPlayerFactionId();
    const trait = getFactionTrait();
    if (!isCommandReady('ability', trait.cooldown, trait.ability)) return;

    const own = getPlayerTowers();
    const enemies = getEnemyTowers();
    const selected = safe(() => selectedTower && selectedTower.faction === FACTIONS.PLAYER ? selectedTower : null, null);
    if (!own.length) {
      commandCooldowns.delete('ability');
      showEnhancementNotice('Keine eigenen Türme für die Reichsfähigkeit.');
      playSound('error');
      return;
    }

    if (factionId === 'england') {
      const amount = 4 + Math.floor(safe(() => wave, 1) / 2);
      own.forEach((tower) => {
        tower.units = Math.min(tower.maxUnits, tower.units + amount);
        tower.fortifiedUntil = Math.max(tower.fortifiedUntil || 0, performance.now() + 17000);
        spawnEffect(tower.x, tower.y, 'fortify', { color: trait.color, text: `+${amount}`, duration: 1000, size: 0.9 });
      });
    }

    if (factionId === 'spain') {
      const markets = own.filter((tower) => tower.terrain === 'market' || tower.terrain === 'road').length;
      const bonus = 55 + safe(() => wave, 1) * 6 + markets * 14;
      safe(() => {
        gold += bonus;
        updateUI();
      });
      own.forEach((tower) => spawnEffect(tower.x, tower.y, 'achievement', { color: trait.color, text: '+Gold', duration: 1000, size: 0.85 }));
      showEnhancementNotice(`${trait.ability}: +${bonus} Gold.`);
    }

    if (factionId === 'maya') {
      enemies.forEach((tower) => {
        const loss = Math.max(2, Math.floor(tower.units * 0.18));
        tower.units = Math.max(1, tower.units - loss);
        spawnEffect(tower.x, tower.y, 'impact', { color: trait.color, text: `-${loss}`, duration: 1050, size: 0.85 });
      });
      if (!enemies.length) {
        own.forEach((tower) => {
          tower.units = Math.min(tower.maxUnits, tower.units + 2);
          spawnEffect(tower.x, tower.y, 'achievement', { color: trait.color, text: '+2', duration: 900, size: 0.8 });
        });
      }
    }

    if (factionId === 'abbasid') {
      const target = enemies
        .map((tower) => ({ tower, score: tower.units + (tower.boss ? 30 : 0) + (tower.level || 1) * 7 }))
        .sort((a, b) => b.score - a.score)[0]?.tower;
      if (target) {
        const damage = Math.max(5, Math.floor(target.units * 0.32));
        target.units = Math.max(0, target.units - damage);
        if (target.units <= 0) {
          target.underAttack = true;
          target.attackingFaction = safe(() => FACTIONS.PLAYER, 'player');
        }
        safe(() => {
          gold += 18 + Math.floor(damage / 2);
        });
        spawnEffect(target.x, target.y, 'impact', { color: trait.color, text: `-${damage}`, duration: 1250, size: 1.15 });
      } else {
        own.forEach((tower) => {
          tower.units = Math.min(tower.maxUnits, tower.units + 2);
          spawnEffect(tower.x, tower.y, 'achievement', { color: trait.color, text: 'Alchemie', duration: 950, size: 0.8 });
        });
      }
    }

    if (factionId === 'hre') {
      const target = selected || own.sort((a, b) => (b.level || 1) - (a.level || 1) || b.units - a.units)[0];
      target.level = Math.min(8, (target.level || 1) + 1);
      if (typeof getTowerMaxUnits === 'function') {
        target.maxUnits = getTowerMaxUnits(target.faction, target.type, target.level);
      }
      target.mastilVeteranCapacityApplied = 0;
      applyTowerVeteranBonus(target);
      target.units = Math.min(target.maxUnits, target.units + 8);
      target.fortifiedUntil = Math.max(target.fortifiedUntil || 0, performance.now() + 26000);
      selectedTower = target;
      addTowerRenown(target, 3, trait.ability);
      spawnEffect(target.x, target.y, 'upgrade', { color: trait.color, text: `L${target.level}`, duration: 1300, size: 1.1 });
    }

    matchStats.abilities += 1;
    recordTacticalCommand(`${trait.ability} eingesetzt`, 'edict');
    unlockAchievement('firstFactionPower');
    if (matchStats.abilities >= 3) unlockAchievement('factionMaster');
    if (factionId !== 'spain') showEnhancementNotice(`${trait.ability} wirkt.`);
    playSound('achievement');
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
    const cost = getSpecializationCost(selected);
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
    addTowerRenown(selected, 2, 'Gilde');
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

    const cost = getFortifyCost(selected);
    const currentGold = safe(() => gold, 0);
    if (currentGold < cost) {
      showEnhancementNotice(`Befestigen benötigt ${cost} Gold.`);
      playSound('error');
      return;
    }

    safe(() => {
      gold -= cost;
      selected.fortifiedUntil = performance.now() + (18000 + (selected.level * 2000)) * getBattlefieldCondition().fortifyDuration;
      hideTowerMenu();
    });
    spawnEffect(selected.x, selected.y, 'fortify', { color: '#f4e6bf', text: 'Befestigt', duration: 1050, size: 1.08 });
    playSound('fortify');
    matchStats.fortified += 1;
    addTowerRenown(selected, 1, 'Schild');
    pushEvent('Turm befestigt', 'defense');
    unlockAchievement('firstFortify', { tower: selected });
    showEnhancementNotice(`Turm befestigt. -${cost} Gold`);
  }

  function getCombatAdvantage(unit, targetTower) {
    const now = performance.now();
    let advantage = 0;
    if (unit && unit.mastilTactic === 'marked') advantage += 0.08;
    if (unit && unit.mastilTactic === 'flank') advantage += 0.11;
    if (targetTower && targetTower.mastilMarkedUntil && targetTower.mastilMarkedUntil > now) advantage += 0.07;
    if (targetTower && targetTower.flankedUntil && targetTower.flankedUntil > now) advantage += 0.08;
    if (targetTower && targetTower.siegedUntil && targetTower.siegedUntil > now) advantage += 0.1 + Math.min(0.08, (targetTower.siegeWeakness || 0) * 0.02);
    if (unit && unit.mastilFormationSize >= 10) advantage += 0.06;
    if (unit && unit.mastilFormationSize >= 18) advantage += 0.05;
    if (targetTower && targetTower.commander) advantage += 0.04;
    if (targetTower && targetTower.boss) advantage += 0.05;
    return advantage;
  }

  function maybeApplyPlayerBreakthrough(unit, targetTower, beforeUnits, afterUnits) {
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    if (!unit || !targetTower || unit.faction !== playerFaction || targetTower.faction === playerFaction) return;
    if (afterUnits >= beforeUnits || afterUnits <= 1) return;

    const advantage = getCombatAdvantage(unit, targetTower);
    if (advantage <= 0 && (unit.mastilFormationSize || 0) < 12) return;
    const chance = Math.min(0.34, 0.07 + advantage);
    if (Math.random() > chance) return;

    const damage = Math.min(afterUnits - 1, unit.mastilFormationSize >= 18 ? 2 : 1);
    if (damage <= 0) return;
    targetTower.units = Math.max(1, targetTower.units - damage);
    targetTower.mastilBreachUntil = performance.now() + 9000;
    matchStats.breaches += 1;
    warMorale = clamp(warMorale + 1.4 + damage * 0.7, 0, 100);
    spawnEffect(targetTower.x, targetTower.y, 'breach', {
      color: '#ffe18a',
      text: damage >= 2 ? 'Durchbruch!' : 'Durchbruch',
      duration: 900,
      size: damage >= 2 ? 1.12 : 0.92
    });
    if (performance.now() - lastBreachEventAt > 6800) {
      lastBreachEventAt = performance.now();
      pushEvent(`Durchbruch: ${getTowerTierName(targetTower.level)} wankt`, 'assault');
    }
  }

  function maybeApplyDefensiveCounter(unit, targetTower, beforeUnits, afterUnits) {
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    if (!unit || !targetTower || targetTower.faction !== playerFaction || unit.faction === playerFaction) return;
    if (afterUnits >= beforeUnits || afterUnits <= 0) return;

    const terrainGuard = {
      keep: 0.12,
      hill: 0.09,
      forest: 0.07,
      ford: 0.07
    }[targetTower.terrain] || 0.03;
    const watchBonus = targetTower.type === typeFromKey('watch') ? 0.07 : 0;
    const fortBonus = targetTower.fortifiedUntil && targetTower.fortifiedUntil > performance.now() ? 0.09 : 0;
    const veteranBonus = getTowerVeteranRank(targetTower) * 0.025;
    const chance = Math.min(0.32, terrainGuard + watchBonus + fortBonus + veteranBonus);
    if (Math.random() > chance) return;

    targetTower.units = Math.min(targetTower.maxUnits, targetTower.units + 1);
    matchStats.counters += 1;
    warMorale = clamp(warMorale + 0.9, 0, 100);
    addTowerRenown(targetTower, 1, 'Konter');
    spawnEffect(targetTower.x, targetTower.y, 'counter', {
      color: '#8fc3f0',
      text: 'Parade',
      duration: 760,
      size: 0.92
    });
    if (performance.now() - lastCounterEventAt > 7200) {
      lastCounterEventAt = performance.now();
      pushEvent(`Parade: ${getTowerTierName(targetTower.level)} hält die Linie`, 'defense');
    }
  }

  function installMechanicFeedback() {
    if (effectsReady) return;
    effectsReady = true;

    if (typeof getUpgradeCost === 'function' && !getUpgradeCost.__mastilCostWrapped) {
      const originalGetUpgradeCost = getUpgradeCost;
      getUpgradeCost = function enhancedUpgradeCost(tower) {
        const base = originalGetUpgradeCost.apply(this, arguments);
        return Math.max(24, Math.floor(base * getUpgradeCostModifier(tower)));
      };
      getUpgradeCost.__mastilCostWrapped = true;
    }

    if (typeof sendUnitsFromTower === 'function' && !sendUnitsFromTower.__mastilFxWrapped) {
      const originalSendUnits = sendUnitsFromTower;
      sendUnitsFromTower = function enhancedSendUnits(sourceTower, targetTower, unitCount) {
        const available = Math.floor(sourceTower && sourceTower.units ? sourceTower.units : 0);
        let requested = Math.max(0, Math.floor(unitCount || 0));
        if (sourceTower && sourceTower.terrain === 'road') requested = Math.ceil(requested * 1.08);
        if (sourceTower && sourceTower.terrain === 'barracks') requested += requested >= 6 ? 1 : 0;
        const sent = Math.max(0, Math.min(requested, available));
        const beforeUnitCount = safe(() => units.length, 0);
        const result = originalSendUnits.call(this, sourceTower, targetTower, sent);
        if (sourceTower && targetTower && sent > 0) {
          const formationId = `f${Date.now().toString(36)}-${formationCounter += 1}`;
          const now = performance.now();
          const createdUnits = safe(() => units.slice(beforeUnitCount), []);
          const formationSize = Math.max(sent, createdUnits.length);
          battleFormations.set(formationId, {
            sourceX: sourceTower.x,
            sourceY: sourceTower.y,
            targetX: targetTower.x,
            targetY: targetTower.y,
            faction: sourceTower.faction,
            count: formationSize,
            createdAt: now
          });
          createdUnits.forEach((unit, index) => {
            unit.mastilFormationId = formationId;
            unit.sourceX = sourceTower.x;
            unit.sourceY = sourceTower.y;
            unit.mastilFormationSize = formationSize;
            unit.mastilLaunchAt = now;
            unit.mastilTactic = targetTower.flankedUntil && targetTower.flankedUntil > now
              ? 'flank'
              : targetTower.mastilMarkedUntil && targetTower.mastilMarkedUntil > now
                ? 'marked'
                : '';
            unit.mastilLane = ((index % 5) - 2) * (unit.mastilTactic === 'flank' ? 3.1 : formationSize >= 10 ? 2.2 : 1.4);
          });
          spawnEffect(sourceTower.x, sourceTower.y, 'attack', {
            color: colorForFaction(sourceTower.faction),
            text: `-${sent}`,
            duration: 780,
            size: Math.min(1.6, 0.85 + sent / 28)
          });
          spawnEffect(sourceTower.x, sourceTower.y, 'commandTrail', {
            color: colorForFaction(sourceTower.faction),
            targetX: targetTower.x,
            targetY: targetTower.y,
            count: sent,
            duration: sourceTower.faction === safe(() => FACTIONS.PLAYER, 'player') ? 1250 : 940,
            size: Math.min(1.55, 0.8 + sent / 24)
          });
          spawnEffect(targetTower.x, targetTower.y, 'targetLock', {
            color: colorForFaction(sourceTower.faction),
            text: sourceTower.faction === safe(() => FACTIONS.PLAYER, 'player') ? 'Ziel' : '',
            duration: 780,
            size: Math.min(1.35, 0.78 + sent / 36)
          });
          if (sourceTower.faction === safe(() => FACTIONS.PLAYER, 'player')) {
            unlockAchievement('firstCommand', { tower: sourceTower });
            addTowerRenown(sourceTower, sent >= 8 ? 2 : 1, 'Befehl');
            if (sent >= 12 && now - lastFormationEventAt > 6500) {
              lastFormationEventAt = now;
              pushEvent(`Heerzug: ${sent} Einheiten marschieren`, 'assault');
            }
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
          selectedTower = tower;
          matchStats.upgrades += 1;
          tower.mastilVeteranCapacityApplied = 0;
          applyTowerVeteranBonus(tower);
          addTowerRenown(tower, 2, 'Ausbau');
          const milestone = applyUpgradeMilestone(tower, beforeLevel);
          spawnEffect(tower.x, tower.y, 'upgrade', {
            color: '#e2bd5a',
            text: `L${tower.level}`,
            duration: 1150,
            size: 1.05
          });
          pushEvent(`${getTowerTierName(tower.level)} ausgebaut`, 'upgrade');
          if (milestone) pushEvent(milestone, 'upgrade');
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
          let terrainBlock = {
            hill: 0.13,
            ford: 0.11,
            forest: 0.08,
            keep: 0.06,
            quarry: 0.04
          }[targetTower.terrain] || 0;
          if (targetTower.siegedUntil && targetTower.siegedUntil > performance.now()) {
            terrainBlock = Math.max(0, terrainBlock - 0.08 - (targetTower.siegeWeakness || 0) * 0.025);
          }
          if (targetTower.flankedUntil && targetTower.flankedUntil > performance.now()) {
            terrainBlock = Math.max(0, terrainBlock - 0.07);
          }
          const mayaBonus = targetTower.faction === safe(() => FACTIONS.PLAYER, 'player') &&
            getPlayerFactionId() === 'maya' &&
            (targetTower.terrain === 'forest' || targetTower.type === typeFromKey('watch'))
            ? 0.07
            : 0;
          if ((terrainBlock + mayaBonus) > 0 && Math.random() < (terrainBlock + mayaBonus)) {
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
        if (
          unit &&
          unit.mastilTactic === 'flank' &&
          targetTower &&
          targetTower.faction !== safe(() => FACTIONS.PLAYER, 'player') &&
          targetTower.units > 1 &&
          Math.random() < 0.18
        ) {
          targetTower.units = Math.max(1, targetTower.units - 1);
          spawnEffect(targetTower.x, targetTower.y, 'impact', {
            color: '#8fc3f0',
            text: '-1',
            duration: 520,
            size: 0.64
          });
        }
        const afterUnits = targetTower ? targetTower.units : beforeUnits;
        maybeApplyPlayerBreakthrough(unit, targetTower, beforeUnits, afterUnits);
        maybeApplyDefensiveCounter(unit, targetTower, beforeUnits, afterUnits);
        if (unit && targetTower && unit.faction !== beforeFaction) {
          const key = `${Math.round(targetTower.x)}:${Math.round(targetTower.y)}`;
          const now = performance.now();
          if ((impactThrottle.get(key) || 0) + 180 < now) {
            impactThrottle.set(key, now);
            if (targetTower.units === beforeUnits && wasFortified) {
              spawnEffect(targetTower.x, targetTower.y, 'shield', { color: '#f4e6bf', duration: 620 });
              addTowerRenown(targetTower, 1, 'Abwehr');
              playSound('blocked');
            } else {
              spawnEffect(targetTower.x, targetTower.y, 'impact', {
                color: colorForFaction(unit.faction),
                duration: 580,
                size: 0.86
              });
              spawnEffect(targetTower.x, targetTower.y, 'clash', {
                color: colorForFaction(unit.faction),
                duration: 420,
                size: unit.mastilFormationSize && unit.mastilFormationSize >= 10 ? 1.08 : 0.82
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
        safe(() => towers.forEach((tower) => before.set(tower, { faction: tower.faction, boss: Boolean(tower.boss), terrain: tower.terrain, commander: tower.commander || getEnemyCommander(tower.faction) })));
        const result = originalUpdateTowers.apply(this, arguments);
        safe(() => towers.forEach((tower) => applyTerrainEconomy(tower, deltaTime || 0)));
        safe(() => applyStrategicSitePulse(deltaTime || 0));
        safe(() => applyMoralePulse(deltaTime || 0));
        safe(() => applyWarIncidentPulse(deltaTime || 0));
        safe(() => towers.forEach((tower) => assignEnemyCommander(tower)));
        safe(() => applyEnemyCommanderPressure());
        safe(() => annotateRouteNetwork(towers));
        safe(() => towers.forEach((tower) => {
          const previous = before.get(tower);
          if (previous && previous.faction !== tower.faction) {
            if (tower.faction === safe(() => FACTIONS.PLAYER, 'player')) {
              matchStats.captured += 1;
              pushEvent(`${getTowerRoleName(tower.type)} erobert`, 'capture');
              unlockAchievement('firstCapture', { tower });
              claimTerrainSpoils(tower);
              addTowerRenown(tower, previous.boss ? 8 : previous.commander ? 6 : 4, 'Eroberung');
              if (previous.commander) {
                pushEvent(`${previous.commander.name} zurückgedrängt`, 'threat');
                unlockAchievement('breakCommander', { tower });
              }
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
        if (showSkirmishVictory()) return undefined;
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
            const beforeCondition = BATTLEFIELD_CONDITIONS[getRegionForWave(beforeWave).id] || BATTLEFIELD_CONDITIONS.startgebiet;
            const afterCondition = getBattlefieldCondition();
            if (beforeCondition.id !== afterCondition.id) {
              pushEvent(`Schlachtfeld: ${afterCondition.title}`, 'condition');
            }
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
      <button type="button" data-action="plan" data-cooldown-key="plan" title="Markiert das wichtigste Ziel auf der Karte"><span class="mastil-command-icon mastil-icon-plan" aria-hidden="true"></span><span>Plan</span><small></small></button>
      <button type="button" data-action="attack" title="Sendet 50% zum schwächsten nahen Ziel"><span class="mastil-command-icon mastil-icon-attack" aria-hidden="true"></span><span>Schnell</span><small></small></button>
      <button type="button" data-action="assault" data-cooldown-key="assault" title="Mehrere eigene Türme greifen koordinierte Ziele an"><span class="mastil-command-icon mastil-icon-assault" aria-hidden="true"></span><span>Front</span><small></small></button>
      <button type="button" data-action="flank" data-cooldown-key="flank" title="Mehrere Türme greifen ein markiertes Ziel von der Seite an"><span class="mastil-command-icon mastil-icon-flank" aria-hidden="true"></span><span>Flanke</span><small></small></button>
      <button type="button" data-action="rally" data-cooldown-key="rally" title="Sammelt Reserven am gewählten oder schwächsten Turm"><span class="mastil-command-icon mastil-icon-rally" aria-hidden="true"></span><span>Sammeln</span><small></small></button>
      <button type="button" data-action="siege" data-cooldown-key="siege" title="Belagert einen starken nahen Feindposten und schwächt seine Verteidigung"><span class="mastil-command-icon mastil-icon-siege" aria-hidden="true"></span><span>Belagern</span><small></small></button>
      <button type="button" data-action="upgrade" title="Verbessert den gewählten Turm"><span class="mastil-command-icon mastil-icon-upgrade" aria-hidden="true"></span><span>Ausbau</span><small></small></button>
      <button type="button" data-action="specialize" title="Wechselt die Rolle des gewählten Turms"><span class="mastil-command-icon mastil-icon-specialize" aria-hidden="true"></span><span>Gilde</span><small></small></button>
      <button type="button" data-action="ability" data-cooldown-key="ability" title="Aktiviert die besondere Fähigkeit Eures Reiches"><span class="mastil-command-icon mastil-icon-ability" aria-hidden="true"></span><span>Wunder</span><small></small></button>
      <button type="button" data-action="fortify" title="Befestigt den gewählten Turm kurzzeitig"><span class="mastil-command-icon mastil-icon-fortify" aria-hidden="true"></span><span>Schild</span><small></small></button>
      <button type="button" data-action="map" title="Mini-Karte ein- oder ausblenden"><span class="mastil-command-icon mastil-icon-map" aria-hidden="true"></span><span>Karte</span></button>
    `;
    document.body.appendChild(controls);

    controls.addEventListener('click', (event) => {
      const button = event.target && event.target.closest ? event.target.closest('button[data-action]') : null;
      const action = button && button.dataset ? button.dataset.action : '';
      if (action === 'select') selectStrongestTower();
      if (action === 'plan') markPriorityTarget();
      if (action === 'attack') quickAttackWeakest();
      if (action === 'assault') coordinatedAssault();
      if (action === 'flank') flankingStrike();
      if (action === 'rally') rallyToSelectedTower();
      if (action === 'siege') launchSiegeStrike();
      if (action === 'upgrade') upgradeSelectedTower();
      if (action === 'specialize') specializeSelectedTower();
      if (action === 'ability') activateFactionAbility();
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
    const currentGold = Math.floor(safe(() => gold, 0));
    const selected = safe(() => selectedTower && selectedTower.faction === FACTIONS.PLAYER ? selectedTower : null, null);
    const own = getPlayerTowers();
    const readySources = own.filter((tower) => tower.units >= Math.max(3, tower.maxUnits * 0.22));
    const targets = getAttackTargets();
    const setButtonState = (button, state, text = '') => {
      if (!button) return;
      button.classList.toggle('ready', state === 'ready');
      button.classList.toggle('waiting', state === 'waiting');
      button.classList.toggle('blocked', state === 'blocked');
      button.dataset.readyText = text || '';
      button.setAttribute('aria-disabled', state === 'blocked' ? 'true' : 'false');
      const small = button.querySelector('small');
      if (small && !button.dataset.cooldownKey) small.textContent = text || '';
    };
    const trait = getFactionTrait();
    const abilityButton = controls.querySelector('button[data-action="ability"]');
    if (abilityButton) {
      abilityButton.title = `${trait.ability}: ${trait.passive}`;
      abilityButton.style.setProperty('--faction-accent', trait.color);
      setButtonState(abilityButton, own.length ? 'ready' : 'blocked', own.length ? 'bereit' : '');
    }
    const recommendation = getRecommendedTargetForSelected();
    const planButton = controls.querySelector('button[data-action="plan"]');
    if (planButton) {
      setButtonState(planButton, recommendation ? 'ready' : 'blocked', recommendation ? recommendation.evaluation.label : '');
      planButton.title = recommendation
        ? `Markiert empfohlenes Ziel: ${getTowerTierName(recommendation.tower.level)} (${recommendation.evaluation.reason}).`
        : 'Markiert das wichtigste Ziel auf der Karte.';
    }
    const attackButton = controls.querySelector('button[data-action="attack"]');
    if (attackButton) {
      setButtonState(
        attackButton,
        recommendation ? (recommendation.evaluation.chance >= 0.72 ? 'ready' : 'waiting') : 'blocked',
        recommendation ? recommendation.evaluation.label : ''
      );
      attackButton.title = recommendation
        ? `Schnellangriff auf ${getTowerTierName(recommendation.tower.level)}: ${recommendation.evaluation.label}, ${recommendation.evaluation.reason}.`
        : 'Sendet 50% zum besten nahen Ziel.';
    }
    const assaultButton = controls.querySelector('button[data-action="assault"]');
    if (assaultButton) {
      const ready = readySources.length >= 2 && targets.length > 0;
      setButtonState(assaultButton, ready ? 'ready' : 'blocked', ready ? `${readySources.length}` : '');
      assaultButton.title = ready
        ? `${readySources.length} Türme sind für einen Frontangriff bereit.`
        : 'Frontangriff braucht mindestens zwei eigene Türme mit Reserven und ein Ziel.';
    }
    const siegeButton = controls.querySelector('button[data-action="siege"]');
    if (siegeButton) {
      const cost = getSiegeCost(selected || getPlayerTowers()[0]);
      const ready = Boolean(targets.length && readySources.length && currentGold >= cost);
      setButtonState(siegeButton, ready ? 'ready' : targets.length ? 'waiting' : 'blocked', ready ? `${cost}` : currentGold < cost ? `-${cost - currentGold}` : '');
      siegeButton.title = `Belagerung: schwächt einen starken Feindposten. Kosten: ${cost} Gold.`;
    }
    const flankButton = controls.querySelector('button[data-action="flank"]');
    if (flankButton) {
      const cost = getFlankCost(selected || getPlayerTowers()[0]);
      const ready = Boolean(own.length >= 2 && targets.length && currentGold >= cost);
      setButtonState(flankButton, ready ? 'ready' : targets.length ? 'waiting' : 'blocked', ready ? `${cost}` : currentGold < cost ? `-${cost - currentGold}` : '');
      flankButton.title = `Flankenangriff: mehrere Türme setzen ein markiertes Ziel unter Druck. Kosten: ${cost} Gold.`;
    }
    const rallyButton = controls.querySelector('button[data-action="rally"]');
    if (rallyButton) {
      const ready = own.length >= 2 && own.some((tower) => tower.units < tower.maxUnits);
      setButtonState(rallyButton, ready ? 'ready' : 'blocked', ready ? 'bereit' : '');
      rallyButton.title = ready
        ? 'Sammelt Reserven am gewählten oder schwächsten eigenen Turm.'
        : 'Sammeln braucht mindestens zwei eigene Türme und einen Turm mit Platz.';
    }
    const upgradeButton = controls.querySelector('button[data-action="upgrade"]');
    if (upgradeButton) {
      const preview = getUpgradePreview(selected);
      const small = upgradeButton.querySelector('small');
      setButtonState(upgradeButton, preview.available ? preview.enoughGold ? 'ready' : 'waiting' : 'blocked');
      upgradeButton.title = preview.available
        ? `${preview.nextTier}: ${preview.detail}. Kosten: ${preview.cost} Gold.`
        : 'Wähle einen eigenen Turm, um den Ausbaupfad zu sehen.';
      if (small) {
        small.textContent = preview.available
          ? preview.enoughGold ? `${preview.cost}` : `-${preview.missingGold}`
          : '';
      }
    }
    const specializeButton = controls.querySelector('button[data-action="specialize"]');
    if (specializeButton) {
      const cost = selected ? getSpecializationCost(selected) : 0;
      const ready = Boolean(selected && currentGold >= cost);
      setButtonState(specializeButton, selected ? ready ? 'ready' : 'waiting' : 'blocked', selected ? ready ? `${cost}` : `-${cost - currentGold}` : '');
      specializeButton.title = selected
        ? `Gilde: wechselt die Rolle des Turms. Kosten: ${cost} Gold.`
        : 'Wähle einen eigenen Turm, um die Gilde zu nutzen.';
    }
    const fortifyButton = controls.querySelector('button[data-action="fortify"]');
    if (fortifyButton) {
      const cost = selected ? getFortifyCost(selected) : 0;
      const ready = Boolean(selected && currentGold >= cost);
      setButtonState(fortifyButton, selected ? ready ? 'ready' : 'waiting' : 'blocked', selected ? ready ? `${cost}` : `-${cost - currentGold}` : '');
      fortifyButton.title = selected
        ? `Schild: befestigt diesen Turm kurzzeitig. Kosten: ${cost} Gold.`
        : 'Wähle einen eigenen Turm, um ihn zu befestigen.';
    }
    controls.querySelectorAll('button[data-cooldown-key]').forEach((button) => {
      const key = button.dataset.cooldownKey;
      const readyAt = commandCooldowns.get(key) || 0;
      const remaining = Math.max(0, readyAt - now);
      const small = button.querySelector('small');
      button.classList.toggle('cooling', remaining > 0);
      button.style.setProperty('--cooldown-progress', remaining > 0 ? String(Math.min(1, remaining / getCommandCooldownMs(key))) : '0');
      if (small) small.textContent = remaining > 0 ? `${Math.ceil(remaining / 1000)}s` : button.dataset.readyText || '';
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
        <span class="mastil-strategy-label">Karte</span>
        <span id="mastil-strategy-map">-</span>
      </div>
      <div class="mastil-strategy-row">
        <span class="mastil-strategy-label">Front</span>
        <span id="mastil-strategy-front">-</span>
      </div>
      <div class="mastil-strategy-row">
        <span class="mastil-strategy-label">Ziel</span>
        <span id="mastil-strategy-target">kein Ziel</span>
      </div>
      <div class="mastil-strategy-row">
        <span class="mastil-strategy-label">Moral</span>
        <span id="mastil-strategy-morale">Gefasst</span>
      </div>
      <div class="mastil-strategy-row">
        <span class="mastil-strategy-label">Druck</span>
        <span id="mastil-strategy-pressure">-</span>
      </div>
      <div class="mastil-strategy-row">
        <span class="mastil-strategy-label">Orte</span>
        <span id="mastil-strategy-sites">-</span>
      </div>
      <div class="mastil-strategy-row">
        <span class="mastil-strategy-label">Feind</span>
        <span id="mastil-strategy-threat">-</span>
      </div>
      <div class="mastil-strategy-row">
        <span class="mastil-strategy-label">Feld</span>
        <span id="mastil-strategy-condition">-</span>
      </div>
      <div class="mastil-strategy-row">
        <span class="mastil-strategy-label">Vers.</span>
        <span id="mastil-strategy-supply">-</span>
      </div>
      <div class="mastil-strategy-row">
        <span class="mastil-strategy-label">Wege</span>
        <span id="mastil-strategy-routes">-</span>
      </div>
      <div class="mastil-strategy-row">
        <span class="mastil-strategy-label">Wunder</span>
        <span id="mastil-strategy-faction">-</span>
      </div>
      <div class="mastil-strategy-row mastil-strategy-selected">
        <span class="mastil-strategy-label">Turm</span>
        <span id="mastil-strategy-selected">keiner gewählt</span>
      </div>
      <div class="mastil-strategy-row mastil-strategy-upgrade">
        <span class="mastil-strategy-label">Ausbau</span>
        <span id="mastil-strategy-upgrade">keinen Turm gewählt</span>
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
      <div class="mastil-condition-panel" id="mastil-condition-panel">
        <strong id="mastil-condition-title">Schlachtfeld</strong>
        <span id="mastil-condition-detail">Die Karte ist ruhig.</span>
      </div>
      <div class="mastil-morale-panel" id="mastil-morale-panel">
        <strong id="mastil-morale-title">Kriegslaune</strong>
        <span id="mastil-morale-detail">Das Reich sammelt sich.</span>
        <em><i id="mastil-morale-progress"></i></em>
      </div>
      <div class="mastil-incident-panel" id="mastil-incident-panel">
        <strong id="mastil-incident-title">Kriegsereignis</strong>
        <span id="mastil-incident-detail">Keine besondere Chance aktiv.</span>
        <em><i id="mastil-incident-progress"></i></em>
      </div>
      <div class="mastil-war-contract" id="mastil-war-contract">
        <strong>Kriegsauftrag</strong>
        <span id="mastil-contract-detail">Sichere wichtige Orte.</span>
        <em><i id="mastil-contract-progress"></i></em>
      </div>
      <div class="mastil-site-panel" id="mastil-site-panel">
        <strong id="mastil-site-title">Strategische Orte</strong>
        <span id="mastil-site-detail">Erobere Kartenorte für Reichsboni.</span>
        <em><i id="mastil-site-progress"></i></em>
      </div>
      <div class="mastil-threat-panel" id="mastil-threat-panel">
        <strong id="mastil-threat-title">Feindkommando</strong>
        <span id="mastil-threat-detail">Keine feindliche Kommandantur aktiv.</span>
        <em><i id="mastil-threat-progress"></i></em>
      </div>
      <div class="mastil-objective-bar" aria-hidden="true">
        <span id="mastil-objective-progress"></span>
      </div>
      <div class="mastil-objective-stats">
        <span id="mastil-stat-captured">0 erobert</span>
        <span id="mastil-stat-upgrades">0 Ausbau</span>
        <span id="mastil-stat-commands">0 Befehle</span>
        <span id="mastil-stat-maneuvers">0 Manöver</span>
        <span id="mastil-stat-morale">54 Moral</span>
        <span id="mastil-stat-events">0 Ereign.</span>
        <span id="mastil-stat-spoils">0 Beute</span>
        <span id="mastil-stat-sieges">0 Belag.</span>
        <span id="mastil-stat-breaches">0 Durchbr.</span>
        <span id="mastil-stat-counters">0 Parade</span>
        <span id="mastil-stat-supply">0% Vers.</span>
        <span id="mastil-stat-routes">0 Wege</span>
        <span id="mastil-stat-front">0% Druck</span>
        <span id="mastil-stat-edicts">0 Edikte</span>
        <span id="mastil-stat-threat">0 Feindbef.</span>
        <span id="mastil-stat-veterans">0 Vet.</span>
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
    const mapNode = document.getElementById('mastil-strategy-map');
    const front = document.getElementById('mastil-strategy-front');
    const targetNode = document.getElementById('mastil-strategy-target');
    const moraleNode = document.getElementById('mastil-strategy-morale');
    const pressureNode = document.getElementById('mastil-strategy-pressure');
    const siteNode = document.getElementById('mastil-strategy-sites');
    const threatNode = document.getElementById('mastil-strategy-threat');
    const conditionNode = document.getElementById('mastil-strategy-condition');
    const supplyNode = document.getElementById('mastil-strategy-supply');
    const routeNode = document.getElementById('mastil-strategy-routes');
    const factionNode = document.getElementById('mastil-strategy-faction');
    const selectedNode = document.getElementById('mastil-strategy-selected');
    const upgradeNode = document.getElementById('mastil-strategy-upgrade');
    const adviceNode = document.getElementById('mastil-strategy-advice');
    if (!domain || !mapNode || !front || !targetNode || !moraleNode || !pressureNode || !siteNode || !threatNode || !conditionNode || !supplyNode || !routeNode || !factionNode || !selectedNode || !upgradeNode || !adviceNode) return;

    domain.textContent = `${own.length} eigene | ${Math.floor(safe(() => gold, 0))} Gold`;
    const activeRegion = getActiveRegion();
    const plan = getWarPlan(getMatchConfig());
    mapNode.textContent = `${activeRegion.title} | ${plan.label}`;
    front.textContent = `${enemy.length} Gegner | ${neutral.length} neutral`;
    const threat = getEnemyThreatState(own, enemy);
    threatNode.textContent = threat.active ? `${threat.title} | ${threat.detail.split('.')[0]}` : 'keine Kommandantur';
    const markedTarget = getMarkedBattleTarget();
    if (markedTarget) {
      targetNode.textContent = `${getTowerRoleName(markedTarget.type)} | ${getTowerTierName(markedTarget.level)} | ${Math.floor(markedTarget.units)} Truppen`;
    } else {
      const recommendation = getRecommendedTargetForSelected();
      targetNode.textContent = recommendation
        ? `Empfohlen: ${getTowerRoleName(recommendation.tower.type)} | ${recommendation.evaluation.label} | ${recommendation.evaluation.reason}`
        : 'kein Ziel markiert';
    }
    const moraleInfo = getMoraleInfo(warMorale);
    moraleNode.textContent = `${moraleInfo.short} | ${Math.round(warMorale)}%`;
    const condition = getBattlefieldCondition();
    conditionNode.textContent = `${condition.title} | ${condition.short}`;
    const supply = computeSupplyState(own);
    const frontState = computeFrontPressure(own, enemy);
    const siteState = computeStrategicSiteState(currentTowers);
    const routeState = computeRouteControlState(currentTowers);
    supplyNode.textContent = supply.detail;
    routeNode.textContent = routeState.next
      ? `${routeState.detail} | nächstes Ziel: ${getTowerTierName(routeState.next.tower.level)}`
      : routeState.detail;
    pressureNode.textContent = frontState.detail;
    siteNode.textContent = siteState.nextTarget
      ? `${siteState.detail} | nächstes Ziel: ${siteState.nextTarget.site.short}`
      : siteState.detail;
    const trait = getFactionTrait();
    factionNode.textContent = `${trait.short} | ${trait.ability}`;
    if (selected && selected.faction === playerFaction) {
      const fortified = selected.fortifiedUntil && selected.fortifiedUntil > now ? ' | befestigt' : '';
      const terrain = getTerrainInfo(selected.terrain);
      const veteran = getTowerVeteranInfo(selected);
      const nextRenown = getTowerRenownNeeded(selected);
      const renownText = veteran
        ? ` | ${veteran.title}${nextRenown ? ` ${Math.floor(selected.mastilRenown || 0)}/${nextRenown}` : ''}`
        : ` | Ruhm ${Math.floor(selected.mastilRenown || 0)}/${nextRenown || VETERAN_RANKS[0].threshold}`;
      selectedNode.textContent = `${getTowerTierName(selected.level)} | ${getTowerRoleName(selected.type)} | ${terrain.label} | ${Math.floor(selected.units)}/${selected.maxUnits}${renownText}${fortified}`;
      const preview = getUpgradePreview(selected);
      const upgradeRow = upgradeNode.closest('.mastil-strategy-upgrade');
      if (upgradeRow) {
        upgradeRow.classList.toggle('ready', preview.enoughGold);
        upgradeRow.classList.toggle('waiting', !preview.enoughGold);
      }
      upgradeNode.textContent = preview.enoughGold
        ? `${preview.nextTier} bereit | ${preview.cost} Gold | ${preview.detail}`
        : `${preview.nextTier} | ${preview.missingGold} Gold fehlen | ${preview.detail}`;
    } else {
      selectedNode.textContent = 'keiner gewählt';
      const upgradeRow = upgradeNode.closest('.mastil-strategy-upgrade');
      if (upgradeRow) {
        upgradeRow.classList.remove('ready', 'waiting');
      }
      upgradeNode.textContent = 'keinen Turm gewählt';
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
    const contract = getWarContractState(own, enemy, neutral);
    applyWarContractRewards(own, enemy, neutral);

    const title = document.getElementById('mastil-objective-title');
    const detail = document.getElementById('mastil-objective-detail');
    const bossStatus = document.getElementById('mastil-boss-status');
    const conditionBox = document.getElementById('mastil-condition-panel');
    const conditionTitle = document.getElementById('mastil-condition-title');
    const conditionDetail = document.getElementById('mastil-condition-detail');
    const moraleBox = document.getElementById('mastil-morale-panel');
    const moraleTitle = document.getElementById('mastil-morale-title');
    const moraleDetail = document.getElementById('mastil-morale-detail');
    const moraleProgress = document.getElementById('mastil-morale-progress');
    const incidentBox = document.getElementById('mastil-incident-panel');
    const incidentTitle = document.getElementById('mastil-incident-title');
    const incidentDetail = document.getElementById('mastil-incident-detail');
    const incidentProgress = document.getElementById('mastil-incident-progress');
    const contractBox = document.getElementById('mastil-war-contract');
    const contractDetail = document.getElementById('mastil-contract-detail');
    const contractProgress = document.getElementById('mastil-contract-progress');
    const siteBox = document.getElementById('mastil-site-panel');
    const siteTitle = document.getElementById('mastil-site-title');
    const siteDetail = document.getElementById('mastil-site-detail');
    const siteProgress = document.getElementById('mastil-site-progress');
    const threatBox = document.getElementById('mastil-threat-panel');
    const threatTitle = document.getElementById('mastil-threat-title');
    const threatDetail = document.getElementById('mastil-threat-detail');
    const threatProgress = document.getElementById('mastil-threat-progress');
    const progress = document.getElementById('mastil-objective-progress');
    const captured = document.getElementById('mastil-stat-captured');
    const upgrades = document.getElementById('mastil-stat-upgrades');
    const commands = document.getElementById('mastil-stat-commands');
    const maneuvers = document.getElementById('mastil-stat-maneuvers');
    const moraleStat = document.getElementById('mastil-stat-morale');
    const eventStat = document.getElementById('mastil-stat-events');
    const spoils = document.getElementById('mastil-stat-spoils');
    const sieges = document.getElementById('mastil-stat-sieges');
    const breaches = document.getElementById('mastil-stat-breaches');
    const counters = document.getElementById('mastil-stat-counters');
    const supplyStat = document.getElementById('mastil-stat-supply');
    const routeStat = document.getElementById('mastil-stat-routes');
    const frontStat = document.getElementById('mastil-stat-front');
    const edicts = document.getElementById('mastil-stat-edicts');
    const threatStat = document.getElementById('mastil-stat-threat');
    const veteranStat = document.getElementById('mastil-stat-veterans');
    const awards = document.getElementById('mastil-stat-awards');
    if (!title || !detail || !progress || !captured || !upgrades || !commands || !maneuvers || !moraleStat || !eventStat || !spoils || !sieges || !breaches || !counters || !supplyStat || !routeStat || !frontStat || !edicts || !threatStat || !veteranStat || !awards) return;

    title.textContent = objective.title;
    detail.textContent = objective.detail;
    if (bossStatus) {
      const currentWave = safe(() => wave, 1);
      const region = getBossRegionForWave(currentWave);
      const activeBossTower = enemy.find((tower) => tower.boss && tower.bossName);
      const bossActive = isBossWave(currentWave) || Boolean(activeBossTower);
      const bossName = activeBossTower && activeBossTower.bossName ? activeBossTower.bossName : region.boss;
      const nextBossWave = getMatchConfig().mode === 'skirmish'
        ? Math.max(5, Math.ceil(currentWave / 5) * 5)
        : region.waves[1];
      bossStatus.textContent = bossActive
        ? `Boss aktiv: ${bossName}`
        : `Naechster Boss: ${bossName} in Welle ${nextBossWave}`;
      bossStatus.classList.toggle('active', bossActive);
    }
    if (conditionBox && conditionTitle && conditionDetail) {
      const condition = getBattlefieldCondition();
      conditionBox.style.setProperty('--condition-color', condition.color);
      conditionTitle.textContent = `Schlachtfeld: ${condition.title}`;
      conditionDetail.textContent = condition.detail;
    }
    if (moraleBox && moraleTitle && moraleDetail && moraleProgress) {
      const morale = getMoraleInfo(warMorale);
      moraleBox.style.setProperty('--morale-color', morale.color);
      moraleBox.classList.toggle('high', warMorale >= 75);
      moraleBox.classList.toggle('low', warMorale <= 32);
      moraleTitle.textContent = `Kriegslaune: ${morale.title}`;
      moraleDetail.textContent = morale.detail;
      moraleProgress.style.width = `${Math.round(morale.ratio * 100)}%`;
    }
    if (incidentBox && incidentTitle && incidentDetail && incidentProgress) {
      const incident = getWarIncidentPanelState();
      incidentBox.classList.toggle('active', incident.active);
      incidentBox.classList.toggle('danger', incident.kind === 'sabotage');
      incidentBox.classList.toggle('reward', incident.kind === 'convoy' || incident.kind === 'breach');
      incidentTitle.textContent = incident.active ? `Kriegsereignis: ${incident.title}` : incident.title;
      incidentDetail.textContent = incident.detail;
      incidentProgress.style.width = `${Math.round(incident.progress * 100)}%`;
    }
    if (contractBox && contractDetail && contractProgress) {
      const label = contractBox.querySelector('strong');
      if (label) label.textContent = contract.title;
      contractDetail.textContent = contract.detail;
      contractProgress.style.width = `${Math.round(contract.progress * 100)}%`;
    }
    if (siteBox && siteTitle && siteDetail && siteProgress) {
      const siteState = computeStrategicSiteState(currentTowers);
      const next = siteState.nextTarget;
      siteBox.classList.toggle('strong', siteState.heldCount >= 4);
      siteTitle.textContent = `Strategische Orte: ${siteState.heldCount}/${siteState.total}`;
      siteDetail.textContent = next
        ? `${siteState.detail} Nächstes Ziel: ${next.site.title}.`
        : `${siteState.detail} Alle wichtigen Orte sind in Eurer Hand.`;
      siteProgress.style.width = `${Math.round(siteState.ratio * 100)}%`;
    }
    if (threatBox && threatTitle && threatDetail && threatProgress) {
      const threat = getEnemyThreatState(own, enemy);
      threatBox.classList.toggle('active', threat.active);
      threatBox.classList.toggle('warning', threat.warning);
      threatBox.style.setProperty('--threat-color', threat.color);
      threatTitle.textContent = threat.active ? `Feindkommando: ${threat.title}` : threat.title;
      threatDetail.textContent = threat.detail;
      threatProgress.style.width = `${Math.round(threat.progress * 100)}%`;
    }
    progress.style.width = `${Math.round(objective.progress * 100)}%`;
    const supply = computeSupplyState(own);
    const routeState = computeRouteControlState(currentTowers);
    const frontState = computeFrontPressure(own, enemy);
    captured.textContent = `${matchStats.captured} erobert`;
    upgrades.textContent = `${matchStats.upgrades} Ausbau`;
    commands.textContent = `${matchStats.commands} Befehle`;
    maneuvers.textContent = `${matchStats.plans + matchStats.flanks} Manöver`;
    moraleStat.textContent = `${Math.round(warMorale)} Moral`;
    eventStat.textContent = `${matchStats.warEvents} Ereign.`;
    spoils.textContent = `${matchStats.spoils} Beute`;
    sieges.textContent = `${matchStats.sieges} Belag.`;
    breaches.textContent = `${matchStats.breaches} Durchbr.`;
    counters.textContent = `${matchStats.counters} Parade`;
    supplyStat.textContent = `${Math.round(supply.ratio * 100)}% Vers.`;
    routeStat.textContent = `${routeState.secured}/${routeState.total} Wege`;
    frontStat.textContent = `${Math.round(frontState.ratio * 100)}% Druck`;
    edicts.textContent = `${matchStats.edicts} Edikte`;
    threatStat.textContent = `${matchStats.enemyOrders} Feindbef.`;
    veteranStat.textContent = `${matchStats.veterans} Vet.`;
    awards.textContent = `${matchAchievements.size} Ausz.`;

    if (supply.linked >= 4) {
      unlockAchievement('supplyNetwork', { tower: own.find((tower) => tower.supplyLinked) || own[0] });
    }

    const weakTower = own.find((tower) => tower.units <= Math.max(2, tower.maxUnits * 0.22));
    if (weakTower && enemy.length && now - lastLowUnitWarningAt > 14000) {
      lastLowUnitWarningAt = now;
      pushEvent('Ein Turm ist schwach besetzt', 'danger');
      spawnEffect(weakTower.x, weakTower.y, 'shield', { color: '#e2bd5a', duration: 850 });
      playSound('blocked');
    }
    if (supply.isolated > 0 && enemy.length && now - lastSupplyWarningAt > 17000) {
      lastSupplyWarningAt = now;
      pushEvent('Versorgungslinie unterbrochen', 'supply');
      if (supply.weakest) {
        spawnEffect(supply.weakest.x, supply.weakest.y, 'shield', { color: '#ff8a6d', text: 'isoliert', duration: 1050, size: 0.86 });
      }
      playSound('blocked');
    }
    if (frontState.ratio >= 0.78 && frontState.hottest && now - lastFrontWarningAt > 16000) {
      lastFrontWarningAt = now;
      pushEvent('Frontdruck kritisch', 'front');
      spawnEffect(frontState.hottest.x, frontState.hottest.y, 'impact', {
        color: '#ff8a6d',
        text: 'Front',
        duration: 1150,
        size: 1
      });
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
        drawBattlefieldAmbience();
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
    enrichFactionSelection();
    createGameControls();
    createStrategyPanel();
    createObjectivePanel();
    createAchievementToast();
    createEdictModal();
  }

  function getBattleDebug() {
    const currentTowers = safe(() => towers, []);
    const currentUnits = safe(() => units, []);
    const effectTypes = visualEffects.reduce((types, effect) => {
      types[effect.type] = (types[effect.type] || 0) + 1;
      return types;
    }, {});
    const playerFaction = safe(() => FACTIONS.PLAYER, 'player');
    const neutralFaction = safe(() => FACTIONS.NEUTRAL, 'neutral');
    return {
      config: getMatchConfig(),
      activeRegion: getActiveRegion().title,
      warPlan: getWarPlan(getMatchConfig()).label,
      scenario: getMatchConfig().mode === 'skirmish' ? getSkirmishScenario(getMatchConfig()).label : 'Kampagne',
      towers: currentTowers.length,
      playerTowers: currentTowers.filter((tower) => tower.faction === playerFaction).length,
      enemyTowers: currentTowers.filter((tower) => tower.faction !== playerFaction && tower.faction !== neutralFaction).length,
      neutralTowers: currentTowers.filter((tower) => tower.faction === neutralFaction).length,
      castleSites: currentTowers.filter((tower) => tower.mastilCastleSite).length,
      activeBosses: currentTowers.filter((tower) => tower.boss).length,
      roadHubs: currentTowers.filter((tower) => tower.mastilRoadHub).length,
      formations: battleFormations.size,
      taggedUnits: currentUnits.filter((unit) => unit.mastilFormationId).length,
      units: currentUnits.length,
      effects: visualEffects.length,
      effectTypes,
      latestEffects: visualEffects.slice(-8).map((effect) => ({
        type: effect.type,
        text: effect.text || '',
        count: effect.count || 0
      }))
    };
  }

  window.MastilGameEnhancements = {
    init,
    selectStrongestTower,
    quickAttackWeakest,
    coordinatedAssault,
    launchSiegeStrike,
    rallyToSelectedTower,
    activateFactionAbility,
    upgradeSelectedTower,
    specializeSelectedTower,
    fortifySelectedTower,
    unlockAchievement,
    getAchievementProgress,
    getBattleDebug,
    spawnEffect
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
