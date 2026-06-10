const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const required = [
  'src/main/main.cjs',
  'src/preload/preload.cjs',
  'src/renderer/index.html',
  'src/renderer/app/app-shell.js',
  'src/renderer/app/audio-engine.js',
  'src/renderer/app/game-enhancements.js',
  'src/renderer/app/web-config.js',
  'src/renderer/app/browser-compat.js',
  'src/renderer/app/online-client.js',
  'src/renderer/admin/admin.html',
  'server/src/index.cjs',
  'server/src/license-service.cjs',
  'src/shared/game-core.cjs',
  'src/shared/game-core.js',
  'assets/branding/mastil-logo.png',
  'assets/branding/mastil-icon.ico',
  'assets/backgrounds/loading-bg.png',
  'scripts/build-web.cjs',
  'installer/mastil.iss'
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`Missing files:\n${missing.join('\n')}`);
  process.exit(1);
}

const index = fs.readFileSync(path.join(root, 'src/renderer/index.html'), 'utf8');
for (const marker of ['legacy-game.js', 'audio-engine.js', 'game-enhancements.js', 'web-config.js', 'browser-compat.js', 'app-shell.js', 'online-client.js']) {
  if (!index.includes(marker)) {
    console.error(`index.html marker missing: ${marker}`);
    process.exit(1);
  }
}

console.log('MASTIL smoke check passed.');
