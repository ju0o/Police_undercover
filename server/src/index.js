// [server/src/index.js] - 메인 서버 파일 (완전한 게임 이벤트 핸들러 포함)

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const roomManager = require('./rooms/roomManager');
const roleManager = require('./roles/roleManager');
const moveManager = require('./game/moveManager');
const gameStateManager = require('./game/gameStateManager');
const missionManager = require('./missions/missionManager');

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
  pingTimeout: 30000,
  pingInterval: 15000,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 5e5, // 500KB로 제한
  connectTimeout: 20000,
  serveClient: false
});

io.on('connection', (socket) => {
  console.log('🔗 User connected:', socket.id);
  console.log('🌐 User origin:', socket.handshake.headers.origin);
  console.log('🚀 Transport:', socket.conn.transport.name);

  // ============================
  // 방 관리 이벤트 핸들러
  // ============================

  // 방 목록 요청
  socket.on('getRooms', (callback) => {
    const publicRooms = roomManager.getPublicRooms();
    if (typeof callback === 'function') {
      callback(publicRooms);
    }
  });

  // 방 생성
  socket.on('createRoom', ({ roomName, nickname, options = {} }, callback) => {
    console.log(`[CREATE ROOM] Attempting to create room: ${roomName} by ${nickname}`);
    
    // 먼저 기존 빈 방들을 정리
    const allRooms = roomManager.getAllRooms();
    for (const [existingRoomName, room] of allRooms) {
      if (room.players.length === 0) {
        console.log(`[CLEANUP] Removing empty room: ${existingRoomName}`);
        roomManager.deleteRoom(existingRoomName);
        gameStateManager.deleteGame(existingRoomName);
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
      
      // 게임 상태 초기화
      gameStateManager.initializeGame(roomName);
      
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

  // 방 입장
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
      
      // 게임 상태에 플레이어 추가
      const gameState = gameStateManager.getGameState(roomName);
      if (gameState && gameState.phase === gameStateManager.GAME_PHASES.LOBBY) {
        gameStateManager.addPlayer(roomName, socket.id, nickname);
      }
      
      callback({ success: true, room: roomManager.getRoom(roomName) });
      io.to(roomName).emit('roomUpdated', roomManager.getRoom(roomName));
    } else {
      callback({ success: false, message: 'Join failed' });
    }
  });

  // 코드로 방 입장
  socket.on('joinRoomByCode', ({ roomCode, nickname }, callback) => {
    const room = roomManager.findRoomByCode(roomCode);
    if (!room) {
      return callback({ success: false, message: 'Room not found' });
    }
    
    if (roomManager.joinRoom(room.name, { id: socket.id, nickname })) {
      socket.join(room.name);
      callback({ success: true, room: roomManager.getRoom(room.name) });
      io.to(room.name).emit('roomUpdated', roomManager.getRoom(room.name));
    } else {
      callback({ success: false, message: 'Join failed' });
    }
  });

  // ============================
  // 게임 플레이 이벤트 핸들러
  // ============================

  // 게임 시작
  socket.on('startGame', ({ roomName }, callback) => {
    console.log(`[GAME START] Starting game in room: ${roomName}`);
    
    const room = roomManager.getRoom(roomName);
    if (!room) {
      return callback({ success: false, message: 'Room not found' });
    }

    // 방장 권한 확인
    const host = room.players.find(p => p.isHost);
    if (!host || host.id !== socket.id) {
      return callback({ success: false, message: 'Only host can start the game' });
    }

    // 최소 인원 확인 (4명 이상)
    if (room.players.length < 4) {
      return callback({ success: false, message: '최소 4명 이상 필요합니다' });
    }

    // 게임 시작
    const gameData = gameStateManager.startGame(roomName);
    if (gameData) {
      // 모든 플레이어에게 게임 시작 알림
      room.players.forEach(player => {
        const playerGameData = gameStateManager.getPlayerGameData(roomName, player.id);
        io.to(player.id).emit('gameStarted', {
          role: playerGameData.role,
          teammates: playerGameData.role.team === 'impostor' ? 
            Array.from(gameData.players.values())
              .filter(p => p.role.team === 'impostor' && p.id !== player.id)
              .map(p => ({ id: p.id, nickname: p.nickname })) : [],
          missions: playerGameData.role.team === 'crewmate' ? 
            ['electrical_wires', 'fuel_engine', 'fix_lights', 'clear_asteroids', 'swipe_card'] : []
        });
      });

      // 게임 상태 브로드캐스트
      io.to(roomName).emit('gamePhaseChanged', { 
        phase: gameStateManager.GAME_PHASES.PLAYING,
        gameState: gameData 
      });
      
      callback({ success: true });
      console.log(`[GAME START] Game started successfully in room: ${roomName}`);
    } else {
      callback({ success: false, message: 'Failed to start game' });
    }
  });

  // 플레이어 이동
  socket.on('movePlayer', ({ roomName, position }) => {
    console.log(`[MOVE] Player ${socket.id} moved to ${position.x}, ${position.y} in room: ${roomName}`);
    
    // 게임 상태 업데이트
    gameStateManager.updatePlayerState(roomName, socket.id, { position });
    
    // 움직임 매니저에도 업데이트
    moveManager.setPlayerPosition(roomName, socket.id, position);
    
    // 모든 플레이어에게 위치 업데이트 브로드캐스트
    io.to(roomName).emit('positionsUpdate', moveManager.getAllPositions(roomName));
  });

  // ============================
  // 게임 액션 이벤트 핸들러 (새로 추가)
  // ============================

  // 킬 시도
  socket.on('attemptKill', ({ roomName, targetId }, callback) => {
    console.log(`[KILL] Player ${socket.id} attempting to kill ${targetId} in room: ${roomName}`);
    
    const success = gameStateManager.processKill(roomName, socket.id, targetId);
    
    if (success) {
      // 킬 성공 - 모든 플레이어에게 알림
      const gameState = gameStateManager.getGameState(roomName);
      const victim = gameState.players.get(targetId);
      
      io.to(roomName).emit('playerKilled', {
        victimId: targetId,
        victimNickname: victim.nickname,
        position: victim.position
      });

      // 승리 조건 확인
      const winCondition = gameStateManager.checkWinCondition(roomName);
      if (winCondition) {
        setTimeout(() => {
          const results = gameStateManager.endGame(roomName, winCondition);
          io.to(roomName).emit('gameEnded', results);
        }, 2000);
      }

      callback({ success: true });
      console.log(`[KILL] Kill successful: ${targetId} killed by ${socket.id}`);
    } else {
      callback({ success: false, message: 'Kill failed - invalid conditions' });
    }
  });

  // 미션 시작
  socket.on('startMission', ({ roomName, missionId }, callback) => {
    console.log(`[MISSION] Player ${socket.id} starting mission ${missionId} in room: ${roomName}`);
    
    const gameState = gameStateManager.getGameState(roomName);
    const player = gameStateManager.getPlayerGameData(roomName, socket.id);
    
    if (!gameState || !player || player.state !== gameStateManager.PLAYER_STATES.ALIVE) {
      return callback({ success: false, message: 'Invalid game state' });
    }

    if (player.role.team !== 'crewmate') {
      return callback({ success: false, message: 'Only crewmates can do missions' });
    }

    if (player.completedTasks.includes(missionId)) {
      return callback({ success: false, message: 'Mission already completed' });
    }

    // 미션 데이터 전송
    const missionData = missionManager.getMissionData(missionId);
    if (!missionData) {
      return callback({ success: false, message: 'Mission not found' });
    }

    callback({ success: true, mission: missionData });
  });

  // 미션 완료
  socket.on('completeMission', ({ roomName, missionId, result }, callback) => {
    console.log(`[MISSION] Player ${socket.id} completed mission ${missionId} in room: ${roomName}`);
    
    // 미션 결과 검증 (간단한 검증)
    if (!result || !result.success) {
      return callback({ success: false, message: 'Mission not completed properly' });
    }

    const success = gameStateManager.completeMission(roomName, socket.id, missionId);
    
    if (success) {
      const gameState = gameStateManager.getGameState(roomName);
      
      // 미션 진행도 업데이트 브로드캐스트
      io.to(roomName).emit('missionProgress', {
        completed: gameState.completedTasks,
        total: gameState.totalTasks,
        player: socket.id
      });

      callback({ success: true });
      console.log(`[MISSION] Mission ${missionId} completed successfully by ${socket.id}`);
    } else {
      callback({ success: false, message: 'Mission completion failed' });
    }
  });

  // 긴급 회의 호출
  socket.on('emergencyMeeting', ({ roomName }, callback) => {
    console.log(`[MEETING] Emergency meeting called by ${socket.id} in room: ${roomName}`);
    
    const gameState = gameStateManager.getGameState(roomName);
    const player = gameStateManager.getPlayerGameData(roomName, socket.id);
    
    if (!gameState || gameState.phase !== gameStateManager.GAME_PHASES.PLAYING) {
      return callback({ success: false, message: 'Cannot call meeting now' });
    }

    if (!player || player.state !== gameStateManager.PLAYER_STATES.ALIVE) {
      return callback({ success: false, message: 'Dead players cannot call meetings' });
    }

    if (player.emergencyMeetingsUsed >= gameState.settings.emergencyMeetings) {
      return callback({ success: false, message: 'No emergency meetings left' });
    }

    // 긴급 회의 시작
    player.emergencyMeetingsUsed++;
    gameStateManager.changePhase(roomName, gameStateManager.GAME_PHASES.MEETING);
    
    io.to(roomName).emit('meetingStarted', {
      type: 'emergency',
      calledBy: player.nickname,
      discussionTime: gameState.settings.discussionTime
    });

    callback({ success: true });
    console.log(`[MEETING] Emergency meeting started in room: ${roomName}`);
  });

  // 시체 신고
  socket.on('reportCorpse', ({ roomName, corpseId }, callback) => {
    console.log(`[REPORT] Corpse reported by ${socket.id} in room: ${roomName}`);
    
    const gameState = gameStateManager.getGameState(roomName);
    const reporter = gameStateManager.getPlayerGameData(roomName, socket.id);
    
    if (!gameState || gameState.phase !== gameStateManager.GAME_PHASES.PLAYING) {
      return callback({ success: false, message: 'Cannot report now' });
    }

    if (!reporter || reporter.state !== gameStateManager.PLAYER_STATES.ALIVE) {
      return callback({ success: false, message: 'Dead players cannot report' });
    }

    // 시체 찾기
    const corpse = gameState.corpses.find(c => c.playerId === corpseId);
    if (!corpse) {
      return callback({ success: false, message: 'Corpse not found' });
    }

    if (corpse.discoveredBy) {
      return callback({ success: false, message: 'Corpse already reported' });
    }

    // 거리 확인
    const distance = Math.sqrt(
      Math.pow(reporter.position.x - corpse.position.x, 2) + 
      Math.pow(reporter.position.y - corpse.position.y, 2)
    );
    if (distance > 100) {
      return callback({ success: false, message: 'Too far from corpse' });
    }

    // 시체 신고 처리
    corpse.discoveredBy = socket.id;
    corpse.discoveredAt = Date.now();
    
    gameStateManager.changePhase(roomName, gameStateManager.GAME_PHASES.MEETING);
    
    const victim = gameState.players.get(corpseId);
    io.to(roomName).emit('meetingStarted', {
      type: 'corpse_report',
      reportedBy: reporter.nickname,
      victim: victim.nickname,
      discussionTime: gameState.settings.discussionTime
    });

    callback({ success: true });
    console.log(`[REPORT] Corpse ${corpseId} reported by ${socket.id} in room: ${roomName}`);
  });

  // 투표하기
  socket.on('castVote', ({ roomName, targetId }, callback) => {
    console.log(`[VOTE] Player ${socket.id} voting for ${targetId} in room: ${roomName}`);
    
    const success = gameStateManager.castVote(roomName, socket.id, targetId);
    
    if (success) {
      const gameState = gameStateManager.getGameState(roomName);
      
      // 투표 현황 업데이트
      const votedCount = gameState.votes.size;
      const totalVoters = Array.from(gameState.players.values())
        .filter(p => p.state === gameStateManager.PLAYER_STATES.ALIVE).length;

      io.to(roomName).emit('votingUpdate', {
        votedCount,
        totalVoters,
        voterId: socket.id,
        targetId
      });

      callback({ success: true });
      console.log(`[VOTE] Vote cast successfully by ${socket.id} for ${targetId}`);
    } else {
      callback({ success: false, message: 'Vote failed' });
    }
  });

  // ============================
  // 연결 해제 처리
  // ============================

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
          
          // 게임 상태에서 플레이어 제거 또는 상태 변경
          const gameState = gameStateManager.getGameState(roomName);
          if (gameState && gameState.phase !== gameStateManager.GAME_PHASES.LOBBY) {
            // 게임 중이면 플레이어를 죽은 상태로 변경
            gameStateManager.updatePlayerState(roomName, socket.id, {
              state: gameStateManager.PLAYER_STATES.DEAD
            });
            
            // 승리 조건 확인
            const winCondition = gameStateManager.checkWinCondition(roomName);
            if (winCondition) {
              setTimeout(() => {
                const results = gameStateManager.endGame(roomName, winCondition);
                io.to(roomName).emit('gameEnded', results);
              }, 1000);
            }
          }
          
          moveManager.removePlayer(roomName, socket.id);
          roomManager.leaveRoom(roomName, socket.id);
          
          // 룸이 비어있다면 즉시 삭제 목록에 추가
          const remainingPlayers = roomManager.getRoomPlayers(roomName);
          if (remainingPlayers.length === 0) {
            roomsToCleanup.push(roomName);
          } else {
            io.to(roomName).emit('roomUpdated', roomManager.getRoom(roomName));
            io.to(roomName).emit('playerDisconnected', {
              playerId: socket.id,
              playerName: playerInRoom.nickname
            });
          }
        }
      }
      
      // 빈 방들을 즉시 정리
      for (const roomName of roomsToCleanup) {
        console.log(`[DISCONNECT] Deleting empty room: ${roomName}`);
        roomManager.deleteRoom(roomName);
        gameStateManager.deleteGame(roomName);
      }
      
      // 공개방 목록 업데이트
      io.emit('roomsUpdated', roomManager.getPublicRooms());
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// ============================
// 헬퍼 함수들
// ============================

function getMissionName(missionId) {
  const missionNames = {
    'electrical_wires': '전선 연결',
    'fuel_engine': '엔진 연료 주입',
    'fix_lights': '조명 수리',
    'clear_asteroids': '소행성 제거',
    'swipe_card': '카드 인증'
  };
  return missionNames[missionId] || '미션';
}

function getMissionType(missionId) {
  const types = {
    'electrical_wires': 'sequence',
    'fuel_engine': 'progress',
    'fix_lights': 'switch',
    'clear_asteroids': 'click',
    'swipe_card': 'swipe'
  };
  return types[missionId] || 'click';
}

function getMissionDifficulty(missionId) {
  return 'normal'; // 모든 미션을 일단 보통 난이도로
}

// ============================
// 서버 시작
// ============================

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