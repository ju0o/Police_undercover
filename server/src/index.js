// [server/src/index.js]

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const roomManager = require('./rooms/roomManager');
const roleManager = require('./roles/roleManager');
const moveManager = require('./game/moveManager'); // 위치 동기화 모듈

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // === 방 생성 ===
  socket.on('createRoom', ({ roomName, nickname }, callback) => {
    if (roomManager.createRoom(roomName)) {
      roomManager.joinRoom(roomName, { id: socket.id, nickname });
      socket.join(roomName);
      callback({ success: true });
      io.emit('roomsUpdated', roomManager.getAllRooms());
    } else {
      callback({ success: false, message: 'Room already exists' });
    }
  });

  // === 방 입장 ===
  socket.on('joinRoom', ({ roomName, nickname }, callback) => {
    if (roomManager.joinRoom(roomName, { id: socket.id, nickname })) {
      socket.join(roomName);
      callback({ success: true });
      io.to(roomName).emit('roomPlayers', roomManager.getRoomPlayers(roomName));
    } else {
      callback({ success: false, message: 'Join failed' });
    }
  });

  // === 게임 시작/역할 배정/초기 위치 ===
socket.on('startGame', ({ roomName }, callback) => {
  const players = roomManager.getRoomPlayers(roomName);
  const options = roomManager.getRoomOptions(roomName);
  const missions = missionManager.getMissions();
  const missionsPerPlayer = options.missionsPerPlayer || 5;
  // === 각 유저에게 미션 랜덤 배정 ===
  const playerMissions = {};
  players.forEach((p) => {
    // 미션 n개 랜덤 뽑기 (중복 허용 X)
    const shuffled = missions.slice().sort(() => Math.random() - 0.5);
    playerMissions[p.id] = shuffled.slice(0, missionsPerPlayer);
  });
    io.to(roomName).emit('gameStarted');
    io.to(roomName).emit('positionsUpdate', moveManager.getAllPositions(roomName));
    callback({ success: true });
  });

  // === 플레이어 이동 동기화 ===
  socket.on('movePlayer', ({ roomName, pos }) => {
    moveManager.setPlayerPosition(roomName, socket.id, pos);
    io.to(roomName).emit('positionsUpdate', moveManager.getAllPositions(roomName));
  });

  // === 연결 해제(퇴장/위치삭제) ===
  socket.on('disconnect', () => {
    for (const roomName of roomManager.getAllRooms()) {
      moveManager.removePlayer(roomName, socket.id);
      roomManager.leaveRoom(roomName, socket.id);
      io.to(roomName).emit('roomPlayers', roomManager.getRoomPlayers(roomName));
      io.to(roomName).emit('positionsUpdate', moveManager.getAllPositions(roomName));
      io.emit('roomsUpdated', roomManager.getAllRooms());
    }
    console.log('User disconnected:', socket.id);
  });

  // === (여기 아래부터 미션/회의/킬/채팅 등 추가) ===
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

socket.on('createRoom', ({ roomName, nickname, options }, callback) => {
    if (roomManager.createRoom(roomName, options)) {
      roomManager.joinRoom(roomName, { id: socket.id, nickname });
      socket.join(roomName);
      callback({ success: true });
      io.emit('roomsUpdated', roomManager.getAllRooms());
    } else {
      callback({ success: false, message: 'Room already exists' });
    }
});