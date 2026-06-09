const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'dist-web');
const installerName = 'MASTIL-Setup-3.0.0.exe';
const releasePageUrl = 'https://github.com/bytewerkstudio/mastil.online/releases/latest';
const downloadUrl = `${releasePageUrl}/download/${installerName}`;
const installerSize = '199 MB';
const installerSha256 = '6DB8D867006592D684CBE8C9FCC361E7488E06219224000809934036F63245A8';

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

const siteCss = `
  :root {
    --ink: #0b0f11;
    --panel: rgba(9, 13, 15, 0.88);
    --panel-strong: rgba(6, 8, 10, 0.82);
    --line: rgba(226, 189, 90, 0.42);
    --gold: #e2bd5a;
    --gold-bright: #ffe18a;
    --steel: #8fc3f0;
    --emerald: #73d6a1;
    --cream: #f4e6bf;
    --muted: rgba(244, 230, 191, 0.72);
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    min-height: 100vh;
    color: var(--cream);
    background: #0c0805;
    font-family: "Segoe UI", Arial, sans-serif;
  }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -2;
    background:
      linear-gradient(180deg, rgba(7, 5, 4, 0.08), rgba(7, 5, 4, 0.76)),
      url("./assets/backgrounds/start-bg.png") center/cover no-repeat;
  }

  body::after {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    background:
      linear-gradient(90deg, rgba(4, 7, 9, 0.92), rgba(4, 7, 9, 0.38) 52%, rgba(4, 7, 9, 0.86)),
      linear-gradient(180deg, rgba(115, 214, 161, 0.08), transparent 42%);
  }

  .page {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: 22px clamp(18px, 5vw, 72px) 28px;
  }

  nav,
  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #fff2bf;
    font-weight: 950;
    text-transform: uppercase;
  }

  .brand img {
    width: 46px;
    height: 46px;
    border: 1px solid var(--line);
    border-radius: 50%;
    box-shadow: 0 0 26px rgba(226, 189, 90, 0.18);
  }

  .status {
    padding: 9px 11px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: rgba(7, 12, 14, 0.68);
    color: var(--muted);
    font: 850 12px/1 "Segoe UI", Arial, sans-serif;
  }

  main {
    width: min(1120px, 100%);
    align-self: center;
    display: grid;
    gap: 20px;
    padding: clamp(36px, 8vh, 82px) 0;
  }

  .hero {
    display: grid;
    gap: 18px;
  }

  .kicker,
  .card span,
  .download-panel span {
    color: var(--gold);
    font: 950 11px/1 "Segoe UI", Arial, sans-serif;
    text-transform: uppercase;
  }

  .download-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .download-meta code {
    display: block;
    min-width: 0;
    padding: 9px 10px;
    color: rgba(244, 230, 191, 0.86);
    border: 1px solid rgba(226, 189, 90, 0.24);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.22);
    font: 800 11px/1.28 Consolas, "Segoe UI", monospace;
    overflow-wrap: anywhere;
  }

  h1 {
    max-width: 820px;
    margin: 0;
    color: #fff2bf;
    font: 950 clamp(3.1rem, 10vw, 7.4rem)/0.9 Georgia, serif;
    letter-spacing: 0;
    text-shadow: 0 22px 44px rgba(0, 0, 0, 0.42);
  }

  .copy {
    max-width: 730px;
    margin: 0;
    color: rgba(244, 230, 191, 0.9);
    font-size: clamp(1rem, 2vw, 1.23rem);
    line-height: 1.55;
  }

  .download-panel {
    width: min(760px, 100%);
    display: grid;
    gap: 14px;
    padding: 16px;
    border: 1px solid rgba(255, 226, 138, 0.52);
    border-radius: 8px;
    background:
      linear-gradient(135deg, rgba(226, 189, 90, 0.14), rgba(143, 195, 240, 0.08)),
      var(--panel);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42), inset 0 0 36px rgba(226, 189, 90, 0.07);
  }

  .download-panel strong {
    color: #fff2bf;
    font: 950 clamp(1.25rem, 3vw, 2rem)/1.08 Georgia, serif;
  }

  .download-panel p {
    margin: 0;
    color: var(--muted);
    line-height: 1.48;
  }

  .notice {
    width: min(760px, 100%);
    display: grid;
    gap: 7px;
    padding: 12px 14px;
    border: 1px solid rgba(115, 214, 161, 0.34);
    border-radius: 8px;
    background: rgba(7, 16, 18, 0.72);
  }

  .notice strong {
    color: #d9fff0;
  }

  .notice span {
    color: var(--muted);
    line-height: 1.42;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .button {
    min-height: 50px;
    display: inline-grid;
    place-items: center;
    padding: 0 18px;
    border: 1px solid rgba(255, 226, 138, 0.68);
    border-radius: 6px;
    color: #170e07;
    background: linear-gradient(180deg, #ffe18a, #a97728);
    font-weight: 950;
    text-decoration: none;
    text-transform: uppercase;
  }

  .button.secondary {
    color: var(--cream);
    background: rgba(8, 15, 18, 0.7);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    width: min(1040px, 100%);
  }

  .card {
    min-height: 136px;
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--panel);
  }

  .card strong {
    display: block;
    margin: 8px 0 6px;
    color: #fff2bf;
    font-size: 18px;
  }

  .card small,
  footer {
    color: var(--muted);
    line-height: 1.38;
  }

  footer {
    font-size: 12px;
  }

  @media (max-width: 860px) {
    .page { min-height: auto; }
    nav, footer { align-items: flex-start; flex-direction: column; }
    .cards { grid-template-columns: 1fr; }
    .download-meta { grid-template-columns: 1fr; }
    .button { width: 100%; text-align: center; }
  }
`;

function pageHtml({ legacy = false } = {}) {
  const title = legacy
    ? 'MASTIL Browser-Version beendet'
    : 'MASTIL | Offizieller Windows Download';
  const intro = legacy
    ? 'Dieser alte Browser-Spiel-Link ist abgeschaltet. MASTIL wird ab jetzt als fluessiges Windows-Spiel mit Setup-Installer ausgeliefert.'
    : 'MASTIL ist auf mastil.online kein Browser-Spiel mehr. Die offizielle Version ist die Windows-App: herunterladen, installieren und lokal fluessig spielen.';
  const noticeTitle = legacy
    ? 'Browser-Spiel nicht mehr verfuegbar'
    : 'Offizieller Fokus: Windows-Download';
  const noticeCopy = legacy
    ? 'GitHub Pages zeigt hier nur noch den Download-Hinweis. Installiere MASTIL unter Windows, um die aktuelle Version zu spielen.'
    : 'Die Website hostet Beschreibung, Branding und den Release-Link. Das Spiel selbst wird als Windows-Setup bereitgestellt, nicht als Web-Spiel.';

  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="MASTIL von Bytewerk Studio - offizieller Windows-Download mit Setup-Installer.">
  <meta name="theme-color" content="#171009">
  <title>${title}</title>
  <link rel="icon" href="${legacy ? '../../assets/branding/mastil-icon.ico' : './assets/branding/mastil-icon.ico'}">
  <style>${siteCss.replaceAll('./assets/', legacy ? '../../assets/' : './assets/')}</style>
</head>
<body>
  <div class="page">
    <nav>
      <div class="brand">
        <img src="${legacy ? '../../assets/branding/mastil-logo.png' : './assets/branding/mastil-logo.png'}" alt="MASTIL">
        <span>Bytewerk Studio</span>
      </div>
      <div class="status">Offizielle Website: mastil.online | Windows-Download</div>
    </nav>

    <main>
      <section class="hero">
        <div class="kicker">Nur noch Windows-Version</div>
        <h1>MASTIL</h1>
        <p class="copy">${intro}</p>
      </section>

      <section class="notice" aria-label="Website Status">
        <strong>${noticeTitle}</strong>
        <span>${noticeCopy}</span>
      </section>

      <section class="download-panel" aria-label="Windows Download">
        <span>Download</span>
        <strong>MASTIL fuer Windows 10/11</strong>
        <p>Empfohlen ist der Setup-Installer. Er installiert MASTIL sauber mit Startmenue-Eintrag, Desktop-Verknuepfung und Deinstaller.</p>
        <div class="download-meta" aria-label="Download Details">
          <code>Datei: ${installerName}<br>Groesse: ${installerSize}</code>
          <code>SHA-256:<br>${installerSha256}</code>
        </div>
        <div class="actions">
          <a class="button" href="${downloadUrl}">Setup fuer Windows herunterladen</a>
          <a class="button secondary" href="${releasePageUrl}">Alle Releases ansehen</a>
        </div>
      </section>

      <section class="cards" aria-label="MASTIL Eigenschaften">
        <article class="card"><span>Windows-App</span><strong>Direkt installiert</strong><small>MASTIL startet als eigene EXE statt im Browserfenster.</small></article>
        <article class="card"><span>Leistung</span><strong>Fluessiger spielen</strong><small>Die Desktop-Version ist der feste Fokus fuer Kampf, Karten und Effekte.</small></article>
        <article class="card"><span>Offline</span><strong>Gegen KI</strong><small>Kampagne und Gefechtsmodus laufen lokal auf dem Rechner.</small></article>
        <article class="card"><span>Installer</span><strong>Sauber verwaltet</strong><small>Setup, Verknuepfungen und Deinstallation bleiben geordnet.</small></article>
      </section>
    </main>

    <footer>
      <span>2026 Bytewerk Studio | MASTIL</span>
      <span>${installerName} | SHA-256 ${installerSha256.slice(0, 12)}...</span>
    </footer>
  </div>
</body>
</html>
`;
}

emptyDir(outDir);
ensureDir(outDir);

copyDir(path.join(root, 'assets'), path.join(outDir, 'assets'));
writeFile(path.join(outDir, '.nojekyll'), '');
writeFile(path.join(outDir, 'CNAME'), 'mastil.online\n');
writeFile(path.join(outDir, 'index.html'), pageHtml());
writeFile(path.join(outDir, 'src/renderer/index.html'), pageHtml({ legacy: true }));
writeFile(path.join(outDir, 'MASTIL-WEBSITE.txt'), `MASTIL Windows Download Website

Diese GitHub-Pages-Ausgabe ist nur noch die offizielle Download-Seite.
Das Browser-Spiel wird nicht mehr als oeffentlicher Spielmodus ausgeliefert.
Alte Spiel-Links zeigen nur noch einen Windows-Download-Hinweis.

Primaerer Download:
${downloadUrl}

Datei:
${installerName}

Groesse:
${installerSize}

SHA-256:
${installerSha256}

Release-Seite:
${releasePageUrl}

CNAME:
mastil.online
`);

console.log('MASTIL Windows download website written to dist-web');
