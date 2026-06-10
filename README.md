# MASTIL App

MASTIL is now structured as a Windows desktop game project instead of one long HTML file.

## What Is Included

- Electron desktop game shell.
- Original MASTIL Canvas game extracted into separate legacy CSS/JS/HTML assets.
- Modern menu layer with offline AI, online 1v1, buy and license activation actions.
- Demo gate: waves 1-5 are free; wave 6 requires an active license.
- Local backend with Express, Stripe hooks, SQL.js-backed SQLite storage, license activation and Socket.IO 1v1 rooms.
- Separate Admin window for manual license generation and revocation.
- Inno Setup script for a Windows installer.

## First Run

1. Install Node.js LTS if it is not available.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and set at least `LICENSE_SECRET` and `ADMIN_TOKEN`.
5. Start the backend with `npm run dev:server`.
6. Start the game with `npm run dev`.
7. Start the admin app with `npm run dev:admin`.

## Build

1. Run `npm run pack:win`.
2. Run `npm run installer`.
3. The installer is written to `dist-installer`.

Stripe can stay empty during local development. The Admin window can create test licenses without Stripe.

## Website

Run `npm run build:web` to create `dist-web`. This folder is the official `mastil.online` website and includes the playable browser build.

- `mastil.online` opens a MASTIL portal with a clear `Spiel starten` button.
- The game is published at `src/renderer/index.html` inside the GitHub Pages build.
- Offline gegen KI works as a static browser game without a backend server.
- GitHub Pages hosts only static files. Online 1v1, buying and license activation need a public MASTIL backend later, for example `api.mastil.online`.
- Windows EXE and installer support remain part of the Electron project and can be released separately.

The included GitHub Pages workflow builds `dist-web` automatically when the project is pushed to `main` or `master`.
In GitHub, set Pages to deploy through GitHub Actions.
