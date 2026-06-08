(function initOnlineClient() {
  const colors = {
    p1: '#2f6fa5',
    p2: '#b3453f',
    neutral: '#9d9484'
  };

  const online = {
    socket: null,
    state: null,
    playerId: null,
    selectedTowerId: null,
    canvas: null,
    ctx: null,
    roomId: null
  };

  function byId(id) {
    return document.getElementById(id);
  }

  async function getBackendUrl() {
    const config = await window.MastilLicense.getConfig();
    const backendUrl = String(config.backendUrl || '').trim().replace(/\/+$/, '');
    if (!backendUrl) {
      throw new Error('Der Online-Modus braucht später eine MASTIL-Server-Adresse. Offline gegen KI funktioniert bereits im Browser.');
    }
    return backendUrl;
  }

  function message(text) {
    const node = byId('mastil-online-message');
    if (node) node.textContent = text || '';
  }

  function createPanel() {
    if (byId('mastil-online-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'mastil-online-modal';
    modal.className = 'mastil-modal';
    modal.innerHTML = `
      <div class="mastil-dialog" role="dialog" aria-modal="true" aria-labelledby="mastil-online-title">
        <button class="mastil-action secondary mastil-close-x" id="mastil-online-x-btn" type="button" aria-label="Schließen">×</button>
        <h2 id="mastil-online-title">MASTIL Online 1v1</h2>
        <p>Erstelle einen Raum oder tritt mit einem Raumcode bei. Der lokale Server verwaltet den Spielstand.</p>
        <div class="mastil-grid">
          <div class="mastil-field">
            <label for="mastil-online-name">Spielername</label>
            <input id="mastil-online-name" maxlength="18" value="Herrscher">
          </div>
          <div class="mastil-field">
            <label for="mastil-online-room-input">Raumcode</label>
            <input id="mastil-online-room-input" maxlength="12" placeholder="z.B. ABC123">
          </div>
        </div>
        <div class="mastil-online-toolbar">
          <button class="mastil-action" id="mastil-create-room-btn" type="button">Raum erstellen</button>
          <button class="mastil-action" id="mastil-join-room-btn" type="button">Beitreten</button>
          <button class="mastil-action secondary" id="mastil-upgrade-online-btn" type="button">Turm verbessern</button>
          <span class="mastil-room-code" id="mastil-room-code">Kein Raum</span>
        </div>
        <canvas id="mastil-online-canvas" width="1200" height="675"></canvas>
        <div class="mastil-message" id="mastil-online-message"></div>
        <div class="mastil-actions">
          <button class="mastil-action secondary" id="mastil-online-close-btn" type="button">Schließen</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    online.canvas = byId('mastil-online-canvas');
    online.ctx = online.canvas.getContext('2d');
    online.canvas.addEventListener('click', handleCanvasClick);
    byId('mastil-create-room-btn').addEventListener('click', createRoom);
    byId('mastil-join-room-btn').addEventListener('click', joinRoom);
    byId('mastil-upgrade-online-btn').addEventListener('click', upgradeSelected);
    byId('mastil-online-close-btn').addEventListener('click', close);
    byId('mastil-online-x-btn').addEventListener('click', close);
  }

  async function loadSocketIo() {
    if (window.io) return;
    const backendUrl = await getBackendUrl();
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${backendUrl}/socket.io/socket.io.js`;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Socket.IO konnte nicht vom lokalen Server geladen werden.'));
      document.head.appendChild(script);
    });
  }

  async function connect() {
    if (online.socket && online.socket.connected) return online.socket;
    await loadSocketIo();
    const backendUrl = await getBackendUrl();
    online.socket = window.io(backendUrl, { transports: ['websocket', 'polling'] });

    online.socket.on('connect', () => message('Verbunden mit dem MASTIL-Server.'));
    online.socket.on('connect_error', () => message('Keine Verbindung. Bitte starte zuerst den lokalen Server.'));
    online.socket.on('room:joined', (payload) => {
      online.playerId = payload.playerId;
      online.roomId = payload.roomId;
      byId('mastil-room-code').textContent = payload.roomId;
      byId('mastil-online-room-input').value = payload.roomId;
      message(`Raum ${payload.roomId}: Du bist ${payload.playerId === 'p1' ? 'Spieler 1' : 'Spieler 2'}.`);
    });
    online.socket.on('game:state', (state) => {
      online.state = state;
      render();
    });
    online.socket.on('game:error', (error) => message(error.message || 'Online-Aktion fehlgeschlagen.'));
    online.socket.on('disconnect', () => message('Verbindung getrennt.'));
    return online.socket;
  }

  async function open() {
    createPanel();
    byId('mastil-online-modal').classList.add('active');
    renderEmpty();
  }

  function close() {
    const modal = byId('mastil-online-modal');
    if (modal) modal.classList.remove('active');
  }

  async function createRoom() {
    try {
      const socket = await connect();
      const name = byId('mastil-online-name').value.trim() || 'Herrscher';
      socket.emit('room:create', { name });
      message('Raum wird erstellt...');
    } catch (error) {
      message(error.message);
    }
  }

  async function joinRoom() {
    try {
      const socket = await connect();
      const roomId = byId('mastil-online-room-input').value.trim().toUpperCase();
      const name = byId('mastil-online-name').value.trim() || 'Herrscher';
      if (!roomId) {
        message('Bitte Raumcode eingeben.');
        return;
      }
      socket.emit('room:join', { roomId, name });
      message('Raum wird betreten...');
    } catch (error) {
      message(error.message);
    }
  }

  function upgradeSelected() {
    if (!online.socket || !online.selectedTowerId) {
      message('Wähle zuerst einen eigenen Turm.');
      return;
    }
    online.socket.emit('game:command', {
      type: 'upgrade',
      towerId: online.selectedTowerId
    });
  }

  function getCanvasPoint(event) {
    const rect = online.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * online.canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * online.canvas.height
    };
  }

  function towerAt(point) {
    if (!online.state) return null;
    return online.state.towers.find((tower) => {
      const dx = tower.x - point.x;
      const dy = tower.y - point.y;
      return Math.sqrt(dx * dx + dy * dy) <= tower.radius + 12;
    });
  }

  function handleCanvasClick(event) {
    if (!online.state || !online.playerId) return;
    const tower = towerAt(getCanvasPoint(event));
    if (!tower) return;

    if (tower.owner === online.playerId) {
      online.selectedTowerId = tower.id;
      message('Eigener Turm gewählt. Klicke einen Ziel-Turm zum Angriff.');
      render();
      return;
    }

    if (!online.selectedTowerId) {
      message('Wähle zuerst einen eigenen Turm.');
      return;
    }

    online.socket.emit('game:command', {
      type: 'attack',
      sourceId: online.selectedTowerId,
      targetId: tower.id,
      ratio: 0.5
    });
  }

  function renderEmpty() {
    if (!online.ctx) return;
    online.ctx.fillStyle = '#e7d7b7';
    online.ctx.fillRect(0, 0, online.canvas.width, online.canvas.height);
    online.ctx.fillStyle = '#3a2416';
    online.ctx.font = '700 28px Segoe UI';
    online.ctx.textAlign = 'center';
    online.ctx.fillText('Raum erstellen oder beitreten', online.canvas.width / 2, online.canvas.height / 2);
  }

  function render() {
    const ctx = online.ctx;
    const state = online.state;
    if (!ctx || !state) {
      renderEmpty();
      return;
    }

    ctx.clearRect(0, 0, online.canvas.width, online.canvas.height);
    const bg = ctx.createLinearGradient(0, 0, online.canvas.width, online.canvas.height);
    bg.addColorStop(0, '#f0dfbc');
    bg.addColorStop(1, '#c3a676');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, online.canvas.width, online.canvas.height);

    ctx.strokeStyle = 'rgba(80, 52, 24, 0.18)';
    for (let x = 0; x < online.canvas.width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, online.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < online.canvas.height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(online.canvas.width, y);
      ctx.stroke();
    }

    for (const unit of state.units) {
      ctx.fillStyle = colors[unit.owner] || '#333';
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff7d6';
      ctx.font = '700 10px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(unit.amount, unit.x, unit.y - 10);
    }

    for (const tower of state.towers) {
      const selected = tower.id === online.selectedTowerId;
      ctx.save();
      ctx.translate(tower.x, tower.y);
      ctx.shadowColor = 'rgba(0,0,0,0.28)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = colors[tower.owner] || colors.neutral;
      ctx.beginPath();
      ctx.arc(0, 0, tower.radius + tower.level * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = selected ? '#ffe28a' : '#5b3a17';
      ctx.lineWidth = selected ? 6 : 3;
      ctx.stroke();
      ctx.fillStyle = '#f8e5b6';
      ctx.fillRect(-14, -28, 28, 40);
      ctx.fillStyle = '#6b431a';
      ctx.fillRect(-7, 2, 14, 18);
      ctx.fillStyle = '#fff7d6';
      ctx.font = '800 16px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(Math.floor(tower.units), 0, -42);
      ctx.font = '700 12px Segoe UI';
      ctx.fillText(`L${tower.level}`, 0, 46);
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(24, 14, 8, 0.78)';
    ctx.fillRect(0, 0, online.canvas.width, 42);
    ctx.fillStyle = '#ffe5a1';
    ctx.font = '700 18px Segoe UI';
    ctx.textAlign = 'left';
    const p1 = state.players.p1;
    const p2 = state.players.p2;
    ctx.fillText(`${p1.name}: ${p1.gold} Gold`, 18, 27);
    ctx.textAlign = 'right';
    ctx.fillText(`${p2.name}: ${p2.gold} Gold`, online.canvas.width - 18, 27);

    if (state.status === 'waiting') message('Warte auf zweiten Spieler...');
    if (state.status === 'playing') message('Spiel läuft. Eigene Türme anklicken, dann Ziel wählen.');
    if (state.status === 'finished') message(`${state.winner === online.playerId ? 'Sieg' : 'Niederlage'} in Raum ${state.roomId}.`);
  }

  window.MastilOnline = { open, close };
})();
