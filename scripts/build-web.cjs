const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'dist-web');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(from, to) {
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function copyDir(from, to, filter = () => true) {
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    const relative = path.relative(root, source).replace(/\\/g, '/');
    if (!filter(relative, entry)) continue;
    if (entry.isDirectory()) copyDir(source, target, filter);
    else if (entry.isFile()) copyFile(source, target);
  }
}

function writeFile(file, contents) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, contents, 'utf8');
}

function emptyDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  }
}

emptyDir(outDir);
ensureDir(outDir);

copyDir(path.join(root, 'assets'), path.join(outDir, 'assets'));
copyFile(path.join(root, 'src/shared/game-core.js'), path.join(outDir, 'src/shared/game-core.js'));
copyFile(path.join(root, 'src/renderer/index.html'), path.join(outDir, 'src/renderer/index.html'));
copyDir(path.join(root, 'src/renderer/app'), path.join(outDir, 'src/renderer/app'));
copyDir(path.join(root, 'src/renderer/styles'), path.join(outDir, 'src/renderer/styles'));
copyDir(path.join(root, 'src/renderer/legacy'), path.join(outDir, 'src/renderer/legacy'), (relative) => {
  return !relative.endsWith('original-index.htm') && !relative.endsWith('legacy-body.html');
});

writeFile(path.join(outDir, '.nojekyll'), '');
writeFile(path.join(outDir, 'CNAME'), 'mastil.online\n');
writeFile(path.join(outDir, 'manifest.webmanifest'), `${JSON.stringify({
  name: 'MASTIL',
  short_name: 'MASTIL',
  description: 'Mittelalterliche Tower-Conquest-Strategie von Bytewerk Studio.',
  start_url: './src/renderer/index.html',
  scope: './',
  display: 'standalone',
  background_color: '#120c08',
  theme_color: '#171009',
  orientation: 'landscape',
  icons: [
    {
      src: './assets/branding/mastil-logo.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: './assets/branding/mastil-icon.ico',
      sizes: '64x64',
      type: 'image/x-icon'
    }
  ],
  shortcuts: [
    {
      name: 'Spiel starten',
      url: './src/renderer/index.html',
      icons: [{ src: './assets/branding/mastil-logo.png', sizes: '512x512' }]
    }
  ]
}, null, 2)}\n`);
writeFile(path.join(outDir, 'sw.js'), `const CACHE_NAME = 'mastil-web-${Date.now()}';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/branding/mastil-icon.ico',
  './assets/branding/mastil-logo.png',
  './src/shared/game-core.js?v=3.2.0',
  './src/renderer/index.html',
  './src/renderer/legacy/legacy-styles.css?v=3.2.0',
  './src/renderer/styles/app-modern.css?v=4.38.0',
  './src/renderer/legacy/version-history.js?v=3.27.0',
  './src/renderer/legacy/legacy-game.js?v=3.8.2',
  './src/renderer/app/audio-engine.js?v=3.7.0',
  './src/renderer/app/game-enhancements.js?v=4.40.0',
  './src/renderer/app/web-config.js?v=4.20.0',
  './src/renderer/app/browser-compat.js?v=1.0.0',
  './src/renderer/app/license-client.js?v=4.1.0',
  './src/renderer/app/online-client.js?v=3.4.0',
  './src/renderer/app/app-shell.js?v=4.29.0'
];

async function cacheAsset(cache, asset) {
  try {
    const response = await fetch(asset, { cache: 'reload' });
    if (response && response.ok) await cache.put(asset, response);
  } catch {
    // Offline cache is best effort; gameplay still works online when one asset misses.
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_ASSETS.map((asset) => cacheAsset(cache, asset)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME && key.startsWith('mastil-web-')).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
      } catch {
        return (await caches.match(request)) || (await caches.match('./src/renderer/index.html')) || (await caches.match('./index.html'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  })());
});
`);
writeFile(path.join(outDir, 'index.html'), `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="MASTIL von Bytewerk Studio - mittelalterliche Tower-Conquest-Strategie direkt im Browser.">
  <meta name="theme-color" content="#171009">
  <title>MASTIL | Bytewerk Studio</title>
  <link rel="icon" href="./assets/branding/mastil-icon.ico">
  <link rel="manifest" href="./manifest.webmanifest">
  <link rel="apple-touch-icon" href="./assets/branding/mastil-logo.png">
  <style>
    :root {
      --ink: #120c07;
      --panel: rgba(19, 12, 8, 0.82);
      --line: rgba(226, 189, 90, 0.42);
      --gold: #e2bd5a;
      --cream: #f4e6bf;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      color: var(--cream);
      background: #0c0805;
      font-family: "Segoe UI", sans-serif;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -2;
      background:
        linear-gradient(180deg, rgba(5, 4, 3, 0.22), rgba(5, 4, 3, 0.82)),
        url("./assets/backgrounds/worlds/world-01-startgebiet.png") center/cover no-repeat;
    }

    body::after {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -1;
      background: linear-gradient(90deg, rgba(5, 4, 3, 0.82), rgba(5, 4, 3, 0.2) 52%, rgba(5, 4, 3, 0.74));
    }

    header {
      min-height: 100vh;
      display: grid;
      grid-template-rows: auto 1fr;
      padding: 22px clamp(18px, 5vw, 68px) 34px;
    }

    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 950;
      text-transform: uppercase;
    }

    .brand img {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      border: 1px solid var(--line);
    }

    .nav-status {
      padding: 9px 11px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: rgba(10, 7, 5, 0.62);
      color: rgba(244, 230, 191, 0.82);
      font: 800 12px/1 "Segoe UI", sans-serif;
    }

    .hero {
      width: min(1040px, 100%);
      align-self: center;
      display: grid;
      gap: 20px;
      padding-top: 48px;
    }

    .kicker {
      color: var(--gold);
      font-weight: 950;
      text-transform: uppercase;
    }

    h1 {
      max-width: 760px;
      margin: 0;
      color: #fff2bf;
      font: 900 clamp(3rem, 10vw, 7.5rem)/0.88 Georgia, serif;
      letter-spacing: 0;
    }

    .copy {
      max-width: 720px;
      margin: 0;
      color: rgba(244, 230, 191, 0.88);
      font-size: clamp(1rem, 2vw, 1.25rem);
      line-height: 1.55;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .button {
      min-height: 48px;
      display: inline-grid;
      place-items: center;
      padding: 0 18px;
      border: 1px solid rgba(255, 226, 138, 0.64);
      border-radius: 6px;
      color: #170e07;
      background: linear-gradient(180deg, #f1cf6b, #9b6d25);
      font-weight: 950;
      text-decoration: none;
      text-transform: uppercase;
    }

    .button.secondary {
      color: var(--cream);
      background: rgba(10, 7, 5, 0.62);
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      width: min(980px, 100%);
      margin-top: 14px;
    }

    .card {
      min-height: 128px;
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
    }

    .card span {
      color: var(--gold);
      font: 950 11px/1 "Segoe UI", sans-serif;
      text-transform: uppercase;
    }

    .card strong {
      display: block;
      margin: 8px 0 6px;
      color: #fff2bf;
      font-size: 18px;
    }

    .card small {
      color: rgba(244, 230, 191, 0.76);
      line-height: 1.35;
    }

    @media (max-width: 820px) {
      header { min-height: auto; }
      .cards { grid-template-columns: 1fr; }
      nav { align-items: flex-start; flex-direction: column; }
    }
  </style>
</head>
<body>
  <header>
    <nav>
      <div class="brand">
        <img src="./assets/branding/mastil-logo.png" alt="MASTIL">
        <span>Bytewerk Studio</span>
      </div>
      <div class="nav-status">Offizielle Website: mastil.online</div>
    </nav>

    <main class="hero">
      <div class="kicker">Mittelalterliche Tower-Conquest-Strategie</div>
      <h1>MASTIL</h1>
      <p class="copy">Erobere Türme, sichere Handelswege, überstehe Wellen und führe dein Reich durch Kampagne, Gefechtsmodus und später echtes Online-1v1.</p>
      <div class="actions">
        <a class="button" href="./src/renderer/index.html">Spiel starten</a>
        <a class="button secondary" href="https://github.com/bytewerkstudio/mastil.online">GitHub ansehen</a>
      </div>
      <section class="cards" aria-label="MASTIL Status">
        <article class="card"><span>Web</span><strong>Direkt spielbar</strong><small>Offline gegen KI läuft im Browser über GitHub Pages.</small></article>
        <article class="card"><span>Gefecht</span><strong>Freie Kriege</strong><small>Kartengröße, Gegner, Schwierigkeit und Farbe wählen.</small></article>
        <article class="card"><span>Online</span><strong>Server vorbereitet</strong><small>1v1 nutzt später api.mastil.online als MASTIL-Server.</small></article>
        <article class="card"><span>Web-App</span><strong>Installierbar</strong><small>Nach dem ersten Laden kann der Browser die wichtigsten Dateien offline bereithalten.</small></article>
      </section>
    </main>
  </header>
  <script>
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  </script>
</body>
</html>
`);

writeFile(path.join(outDir, 'MASTIL-WEBSITE.txt'), `MASTIL Website-Version
Publisher: Bytewerk Studio

Diese Dateien können direkt auf GitHub Pages oder einen normalen Webspace geladen werden.
Startdatei: index.html

Offline gegen KI funktioniert ohne Server.
Online 1v1, Kauf und Lizenz-Aktivierung brauchen später einen öffentlichen MASTIL-Server.
Die Server-Adresse kann in src/renderer/app/web-config.js hinterlegt werden.
`);

console.log(`MASTIL website build written to ${path.relative(root, outDir)}`);
