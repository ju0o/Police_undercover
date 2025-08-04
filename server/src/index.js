// [server/src/index.js]

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const roomManager = require('./rooms/roomManager');
const roleManager = require('./roles/roleManager');
const moveManager = require('./game/moveManager');

const app = express();

// CORS 설정 - 환경변수로 클라이언트 URL 관리
const allowedOrigins = [
  process.env.CLIENT_URL || "https://metacraze-c393c.web.app",
  "http://localhost:5173", 
  "http://localhost:3001"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true
}));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Police Undercover Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);

// Socket.IO 서버 생성 - Railway 호환 설정 (메모리 최적화)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['polling'],
  pingTimeout: 30000, // 메모리 절약을 위해 단축
  pingInterval: 15000,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 5e5, // 500KB로 제한
  connectTimeout: 20000,
  serveClient: false // 클라이언트 파일 서빙 비활성화
});

io.on('connection', (socket) => {
  console.log('🔗 User connected:', socket.id);
  console.log('🌐 User origin:', socket.handshake.headers.origin);
  console.log('🚀 Transport:', socket.conn.transport.name);

  // === 방 목록 요청 ===
  socket.on('getRooms', (callback) => {
    const publicRooms = roomManager.getPublicRooms();
    if (typeof callback === 'function') {
      callback(publicRooms);
    }
  });

  // === 방 생성 ===
  socket.on('createRoom', ({ roomName, nickname, options = {} }, callback) => {
    console.log(`[CREATE ROOM] Attempting to create room: ${roomName} by ${nickname}`);
    
    // 먼저 기존 빈 방들을 정리
    const allRooms = roomManager.getAllRooms();
    for (const [existingRoomName, room] of allRooms) {
      if (room.players.length === 0) {
        console.log(`[CLEANUP] Removing empty room: ${existingRoomName}`);
        roomManager.deleteRoom(existingRoomName);
      }
    }
    
    // 비공개방인 경우 랜덤 코드 생성
    if (options.isPrivate) {
      options.roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    if (roomManager.createRoom(roomName, options)) {
      const player = { id: socket.id, nickname, isHost: true };
      roomManager.joinRoom(roomName, player);
      socket.join(roomName);
      console.log(`[CREATE ROOM] Successfully created room: ${roomName}`);
      callback({ 
        success: true, 
        room: roomManager.getRoom(roomName),
        roomCode: options.roomCode 
      });
      
      // 공개방만 전체 목록에 노출
      if (!options.isPrivate) {
        io.emit('roomsUpdated', roomManager.getPublicRooms());
      }
    } else {
      console.log(`[CREATE ROOM] Failed to create room: ${roomName} - already exists`);
      callback({ success: false, message: '이미 존재하는 방이거나 방 이름이 유효하지 않습니다.' });
    }
  });

  // === 방 입장 ===
  socket.on('joinRoom', ({ roomName, nickname, roomCode }, callback) => {
    const room = roomManager.getRoom(roomName);
    if (!room) {
      return callback({ success: false, message: 'Room not found' });
    }
    
    // 비공개방인 경우 코드 확인
    if (room.options.isPrivate && room.options.roomCode !== roomCode) {
      return callback({ success: false, message: 'Invalid room code' });
    }
    
    if (roomManager.joinRoom(roomName, { id: socket.id, nickname })) {
      socket.join(roomName);
      callback({ success: true, room: roomManager.getRoom(roomName) });
      io.to(roomName).emit('roomPlayers', roomManager.getRoomPlayers(roomName));
    } else {
      callback({ success: false, message: 'Join failed' });
    }
  });

  // === 코드로 방 입장 ===
  socket.on('joinRoomByCode', ({ roomCode, nickname }, callback) => {
    const room = roomManager.findRoomByCode(roomCode);
    if (!room) {
      return callback({ success: false, message: 'Room not found' });
    }
    
    if (roomManager.joinRoom(room.name, { id: socket.id, nickname })) {
      socket.join(room.name);
      callback({ success: true, room: roomManager.getRoom(room.name) });
      io.to(room.name).emit('roomPlayers', roomManager.getRoomPlayers(room.name));
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
  socket.on('disconnect', (reason) => {
    console.log('🔌 User disconnected:', socket.id, 'Reason:', reason);
    
    try {
      // 모든 룸에서 플레이어 제거
      const allRooms = roomManager.getAllRooms();
      const roomsToCleanup = [];
      
      for (const [roomName, room] of allRooms) {
        // 해당 플레이어가 이 방에 있는지 확인
        const playerInRoom = room.players.find(p => p.id === socket.id);
        if (playerInRoom) {
          console.log(`[DISCONNECT] Removing player ${socket.id} from room: ${roomName}`);
          moveManager.removePlayer(roomName, socket.id);
          roomManager.leaveRoom(roomName, socket.id);
          
          // 룸이 비어있다면 즉시 삭제 목록에 추가
          const remainingPlayers = roomManager.getRoomPlayers(roomName);
          if (remainingPlayers.length === 0) {
            roomsToCleanup.push(roomName);
          } else {
            io.to(roomName).emit('roomPlayers', remainingPlayers);
          }
        }
      }
      
      // 빈 방들을 즉시 정리
      for (const roomName of roomsToCleanup) {
        console.log(`[DISCONNECT] Deleting empty room: ${roomName}`);
        roomManager.deleteRoom(roomName);
      }
      
      // 공개방 목록 업데이트
      io.emit('roomsUpdated', roomManager.getPublicRooms());
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // === (여기 아래부터 미션/회의/킬/채팅 등 추가) ===
});

const PORT = process.env.PORT || 3001;
const serverInstance = server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔒 CORS origins:', allowedOrigins);
  console.log('📡 Client URL:', process.env.CLIENT_URL || 'using default');
});

// Graceful shutdown 처리
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  
  // 새로운 연결 받지 않음
  serverInstance.close(() => {
    console.log('📴 HTTP server closed');
    
    // Socket.IO 서버 종료
    io.close(() => {
      console.log('🔌 Socket.IO server closed');
      process.exit(0);
    });
  });
  
  // 30초 후 강제 종료
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});