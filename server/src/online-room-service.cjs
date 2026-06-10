const crypto = require('crypto');
const gameCore = require('../../src/shared/game-core.cjs');

function roomCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

function createOnlineRoomService(io) {
  const rooms = new Map();

  function broadcast(room) {
    io.to(room.id).emit('game:state', gameCore.publicState(room.state));
  }

  function ensureTicker(room) {
    if (room.timer) return;
    let last = Date.now();
    room.timer = setInterval(() => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;
      gameCore.step(room.state, dt);
      broadcast(room);
      if (room.state.status === 'finished') {
        clearInterval(room.timer);
        room.timer = null;
      }
    }, 200);
  }

  function joinSocket(socket, room, playerId, name) {
    socket.join(room.id);
    socket.data.roomId = room.id;
    socket.data.playerId = playerId;
    room.players[playerId] = socket.id;
    room.state.players[playerId].connected = true;
    room.state.players[playerId].name = name || room.state.players[playerId].name;

    if (room.players.p1 && room.players.p2 && room.state.status === 'waiting') {
      room.state.status = 'playing';
      ensureTicker(room);
    }

    socket.emit('room:joined', { roomId: room.id, playerId });
    broadcast(room);
  }

  function register(socket) {
    socket.on('room:create', ({ name } = {}) => {
      const id = roomCode();
      const room = {
        id,
        players: { p1: null, p2: null },
        state: gameCore.createInitialState(id),
        timer: null
      };
      rooms.set(id, room);
      joinSocket(socket, room, 'p1', name);
    });

    socket.on('room:join', ({ roomId, name } = {}) => {
      const id = String(roomId || '').trim().toUpperCase();
      const room = rooms.get(id);
      if (!room) {
        socket.emit('game:error', { message: 'Raum nicht gefunden.' });
        return;
      }
      if (room.players.p2 && room.players.p2 !== socket.id) {
        socket.emit('game:error', { message: 'Raum ist bereits voll.' });
        return;
      }
      const playerId = room.players.p1 === socket.id ? 'p1' : 'p2';
      joinSocket(socket, room, playerId, name);
    });

    socket.on('game:command', (command = {}) => {
      const room = rooms.get(socket.data.roomId);
      if (!room) return;
      const result = gameCore.applyCommand(room.state, socket.data.playerId, command);
      if (!result.ok) socket.emit('game:error', { message: result.error });
      broadcast(room);
    });

    socket.on('disconnect', () => {
      const room = rooms.get(socket.data.roomId);
      if (!room) return;
      const playerId = socket.data.playerId;
      if (playerId && room.state.players[playerId]) room.state.players[playerId].connected = false;
      if (playerId && room.players[playerId] === socket.id) room.players[playerId] = null;
      broadcast(room);
    });
  }

  return { register };
}

module.exports = { createOnlineRoomService };
