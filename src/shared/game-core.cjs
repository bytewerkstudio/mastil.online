/* eslint-disable no-undef */
(function initGameCore(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MastilGameCore = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory() {
  const UNIT_SPEED = 150;
  const TOWER_RADIUS = 28;
  const BASE_UNIT_RATE = 0.55;
  const BASE_GOLD_RATE = 1.2;

  function id(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function createTower(x, y, owner, level = 1) {
    return {
      id: id('tower'),
      x,
      y,
      owner,
      level,
      units: owner === 'neutral' ? 8 : 18,
      maxUnits: 24 + level * 6,
      unitTimer: 0,
      goldTimer: 0,
      radius: TOWER_RADIUS
    };
  }

  function createInitialState(roomId) {
    const state = {
      roomId,
      status: 'waiting',
      winner: null,
      width: 1200,
      height: 760,
      players: {
        p1: { id: 'p1', name: 'Spieler 1', gold: 120, connected: false },
        p2: { id: 'p2', name: 'Spieler 2', gold: 120, connected: false }
      },
      towers: [],
      units: [],
      updatedAt: Date.now()
    };

    state.towers.push(createTower(170, 380, 'p1', 1));
    state.towers.push(createTower(1030, 380, 'p2', 1));
    state.towers.push(createTower(600, 170, 'neutral', 1));
    state.towers.push(createTower(600, 590, 'neutral', 1));
    state.towers.push(createTower(420, 380, 'neutral', 1));
    state.towers.push(createTower(780, 380, 'neutral', 1));
    return state;
  }

  function publicState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function getTower(state, towerId) {
    return state.towers.find((tower) => tower.id === towerId);
  }

  function applyCommand(state, playerId, command) {
    if (!state || state.status === 'finished') return { ok: false, error: 'Game is finished.' };
    if (!['p1', 'p2'].includes(playerId)) return { ok: false, error: 'Unknown player.' };

    if (command.type === 'attack') {
      const source = getTower(state, command.sourceId);
      const target = getTower(state, command.targetId);
      if (!source || !target) return { ok: false, error: 'Tower not found.' };
      if (source.owner !== playerId) return { ok: false, error: 'Source tower is not yours.' };
      if (source.id === target.id) return { ok: false, error: 'Target must be different.' };
      const ratio = Math.max(0.2, Math.min(0.8, Number(command.ratio || 0.5)));
      const amount = Math.max(1, Math.floor(source.units * ratio));
      if (amount < 1 || source.units <= 1) return { ok: false, error: 'Not enough units.' };

      source.units -= amount;
      state.units.push({
        id: id('unit'),
        owner: playerId,
        amount,
        x: source.x,
        y: source.y,
        targetId: target.id
      });
      state.updatedAt = Date.now();
      return { ok: true };
    }

    if (command.type === 'upgrade') {
      const tower = getTower(state, command.towerId);
      const player = state.players[playerId];
      if (!tower || tower.owner !== playerId) return { ok: false, error: 'Tower not found.' };
      const cost = 60 + tower.level * 40;
      if (player.gold < cost) return { ok: false, error: 'Not enough gold.' };
      player.gold -= cost;
      tower.level += 1;
      tower.maxUnits += 8;
      tower.units = Math.min(tower.maxUnits, tower.units + 5);
      state.updatedAt = Date.now();
      return { ok: true };
    }

    return { ok: false, error: 'Unknown command.' };
  }

  function step(state, deltaTime) {
    if (!state || state.status !== 'playing') return state;
    const dt = Math.max(0, Math.min(deltaTime, 0.2));

    for (const tower of state.towers) {
      if (tower.owner === 'neutral') continue;
      tower.unitTimer += dt * BASE_UNIT_RATE * (1 + tower.level * 0.08);
      if (tower.unitTimer >= 1) {
        const add = Math.floor(tower.unitTimer);
        tower.unitTimer -= add;
        tower.units = Math.min(tower.maxUnits, tower.units + add);
      }

      tower.goldTimer += dt * BASE_GOLD_RATE * (1 + tower.level * 0.05);
      if (tower.goldTimer >= 1) {
        const addGold = Math.floor(tower.goldTimer);
        tower.goldTimer -= addGold;
        state.players[tower.owner].gold += addGold;
      }
    }

    for (let index = state.units.length - 1; index >= 0; index -= 1) {
      const unit = state.units[index];
      const target = getTower(state, unit.targetId);
      if (!target) {
        state.units.splice(index, 1);
        continue;
      }

      const dx = target.x - unit.x;
      const dy = target.y - unit.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const travel = UNIT_SPEED * dt;

      if (distance <= target.radius + travel) {
        resolveArrival(unit, target);
        state.units.splice(index, 1);
      } else {
        unit.x += (dx / distance) * travel;
        unit.y += (dy / distance) * travel;
      }
    }

    const p1Alive = state.towers.some((tower) => tower.owner === 'p1') || state.units.some((unit) => unit.owner === 'p1');
    const p2Alive = state.towers.some((tower) => tower.owner === 'p2') || state.units.some((unit) => unit.owner === 'p2');
    if (!p1Alive || !p2Alive) {
      state.status = 'finished';
      state.winner = p1Alive ? 'p1' : 'p2';
    }

    state.updatedAt = Date.now();
    return state;
  }

  function resolveArrival(unit, target) {
    if (target.owner === unit.owner) {
      target.units = Math.min(target.maxUnits, target.units + unit.amount);
      return;
    }

    target.units -= unit.amount;
    if (target.units < 0) {
      target.owner = unit.owner;
      target.units = Math.min(target.maxUnits, Math.abs(target.units));
      target.level = Math.max(1, Math.floor(target.level * 0.75));
      target.maxUnits = 24 + target.level * 6;
    }
  }

  return {
    createInitialState,
    publicState,
    applyCommand,
    step
  };
});
