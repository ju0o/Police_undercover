// [server/src/index.js]

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const roomManager = require('./rooms/roomManager');
const roleManager = require('./roles/roleManager');
const moveManager = require('./game/moveManager');

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
    // 게임 시작 로직은 나중에 구현
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