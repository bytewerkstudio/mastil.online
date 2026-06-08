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
writeFile(path.join(outDir, 'index.html'), `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="MASTIL von Bytewerk Studio - direkt im Browser spielbar.">
  <meta name="theme-color" content="#171009">
  <title>MASTIL | Bytewerk Studio</title>
  <link rel="icon" href="./assets/branding/mastil-icon.ico">
  <style>
    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      color: #f4e6bf;
      background: #171009;
      font-family: "Segoe UI", sans-serif;
    }
    main {
      width: min(520px, calc(100vw - 32px));
      border: 1px solid rgba(226, 189, 90, 0.42);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      padding: 22px;
      text-align: center;
    }
    strong {
      color: #f1cf6b;
      display: block;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    a {
      color: #f1cf6b;
      font-weight: 800;
    }
  </style>
  <script>
    const target = './src/renderer/index.html' + window.location.search + window.location.hash;
    window.location.replace(target);
  </script>
</head>
<body>
  <main>
    <strong>Bytewerk Studio</strong>
    <h1>MASTIL wird gestartet...</h1>
    <p><a href="./src/renderer/index.html">Spiel öffnen</a></p>
  </main>
</body>
</html>
`);

writeFile(path.join(outDir, 'MASTIL-WEBSITE.txt'), `MASTIL Website-Version
Publisher: Bytewerk Studio

Diese Dateien koennen direkt auf GitHub Pages oder einen normalen Webspace geladen werden.
Startdatei: index.html

Offline gegen KI funktioniert ohne Server.
Online 1v1, Kauf und Lizenz-Aktivierung brauchen spaeter einen oeffentlichen MASTIL-Server.
Die Server-Adresse kann in src/renderer/app/web-config.js hinterlegt werden.
`);

console.log(`MASTIL website build written to ${path.relative(root, outDir)}`);
