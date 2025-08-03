// [server/src/index.js] - 메인 서버 파일
// 모든 매니저 모듈을 통합하여 Socket.IO 이벤트 처리

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

// 매니저 모듈들 import
const roomManager = require('./rooms/roomManager');
const roleManager = require('./roles/roleManager');
const moveManager = require('./game/moveManager');
const meetingManager = require('./game/meetingManager');
const killManager = require('./game/killManager');
const missionManager = require('./missions/missionManager');
const statisticsManager = require('./statistics/statisticsManager');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { 
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// 글로벌 게임 상태 관리
const gameStates = new Map(); // roomName -> gameState

io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] User connected: ${socket.id}`);

  // ================= 방 관리 =================
  
  // 방 생성 (커스텀 옵션 포함)
  socket.on('createRoom', ({ roomName, nickname, options = {} }, callback) => {
    try {
      const defaultOptions = {
        maxPlayers: 10,
        impostorCount: 2,
        detectiveCount: 1,
        missionsPerPlayer: 5,
        missionDifficulty: 'normal',
        discussionTime: 120,
        votingTime: 30,
        emergencyMeetings: 1,
        killCooldown: 30,
        taskBarUpdate: 'always',
        visualTasks: true,
        anonymousVotes: false,
        playerSpeed: 1.0,
        crewmateVision: 1.0,
        impostorVision: 1.5,
        password: null,
        isPrivate: false
      };

      const roomOptions = { ...defaultOptions, ...options };
      
      if (roomManager.createRoom(roomName, roomOptions)) {
        const player = { 
          id: socket.id, 
          nickname, 
          isHost: true,
          isReady: false,
          role: null,
          position: { x: 400, y: 300 },
          isAlive: true,
          completedMissions: [],
          votesRemaining: 1
        };
        
        roomManager.joinRoom(roomName, player);
        socket.join(roomName);
        
        // 게임 상태 초기화
        gameStates.set(roomName, {
          phase: 'lobby', // lobby, playing, meeting, voting, ended
          startTime: null,
          currentMeeting: null,
          emergencyMeetingsUsed: {},
          corpses: [],
          missionProgress: {},
          statistics: statisticsManager.initializeRoomStats(roomName)
        });

        callback({ success: true, room: roomManager.getRoom(roomName) });
        io.emit('roomsUpdated', roomManager.getAllRoomsInfo());
        console.log(`[${new Date().toISOString()}] Room created: ${roomName} by ${nickname}`);
      } else {
        callback({ success: false, message: 'Room already exists or invalid name' });
      }
    } catch (error) {
      console.error('Error creating room:', error);
      callback({ success: false, message: 'Server error' });
    }
  });

  // 방 입장
  socket.on('joinRoom', ({ roomName, nickname, password = null }, callback) => {
    try {
      const room = roomManager.getRoom(roomName);
      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      // 비밀번호 확인
      if (room.options.password && room.options.password !== password) {
        return callback({ success: false, message: 'Incorrect password' });
      }

      // 인원 수 확인
      if (room.players.length >= room.options.maxPlayers) {
        return callback({ success: false, message: 'Room is full' });
      }

      // 게임 진행 중인지 확인
      const gameState = gameStates.get(roomName);
      if (gameState && gameState.phase !== 'lobby') {
        return callback({ success: false, message: 'Game is already in progress' });
      }

      const player = {
        id: socket.id,
        nickname,
        isHost: false,
        isReady: false,
        role: null,
        position: { x: 400, y: 300 },
        isAlive: true,
        completedMissions: [],
        votesRemaining: 1
      };

      if (roomManager.joinRoom(roomName, player)) {
        socket.join(roomName);
        callback({ success: true, room: roomManager.getRoom(roomName) });
        io.to(roomName).emit('roomUpdated', roomManager.getRoom(roomName));
        io.emit('roomsUpdated', roomManager.getAllRoomsInfo());
        console.log(`[${new Date().toISOString()}] ${nickname} joined room: ${roomName}`);
      } else {
        callback({ success: false, message: 'Failed to join room' });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      callback({ success: false, message: 'Server error' });
    }
  });

  // 방 옵션 업데이트 (방장만 가능)
  socket.on('updateRoomOptions', ({ roomName, options }, callback) => {
    try {
      const room = roomManager.getRoom(roomName);
      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      const player = room.players.find(p => p.id === socket.id);
      if (!player || !player.isHost) {
        return callback({ success: false, message: 'Only host can update options' });
      }

      const gameState = gameStates.get(roomName);
      if (gameState && gameState.phase !== 'lobby') {
        return callback({ success: false, message: 'Cannot update options during game' });
      }

      roomManager.updateRoomOptions(roomName, options);
      callback({ success: true });
      io.to(roomName).emit('roomUpdated', roomManager.getRoom(roomName));
      console.log(`[${new Date().toISOString()}] Room options updated for: ${roomName}`);
    } catch (error) {
      console.error('Error updating room options:', error);
      callback({ success: false, message: 'Server error' });
    }
  });

  // 플레이어 준비 상태 변경
  socket.on('toggleReady', ({ roomName }, callback) => {
    try {
      const room = roomManager.getRoom(roomName);
      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      const player = room.players.find(p => p.id === socket.id);
      if (!player) {
        return callback({ success: false, message: 'Player not found' });
      }

      player.isReady = !player.isReady;
      callback({ success: true, isReady: player.isReady });
      io.to(roomName).emit('roomUpdated', roomManager.getRoom(roomName));
    } catch (error) {
      console.error('Error toggling ready:', error);
      callback({ success: false, message: 'Server error' });
    }
  });

  // ================= 게임 시작 및 역할 배정 =================
  
  socket.on('startGame', ({ roomName }, callback) => {
    try {
      const room = roomManager.getRoom(roomName);
      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      const host = room.players.find(p => p.isHost && p.id === socket.id);
      if (!host) {
        return callback({ success: false, message: 'Only host can start the game' });
      }

      // 최소 인원 확인
      if (room.players.length < 4) {
        return callback({ success: false, message: 'Need at least 4 players to start' });
      }

      // 모든 플레이어가 준비되었는지 확인
      const notReadyPlayers = room.players.filter(p => !p.isReady && !p.isHost);
      if (notReadyPlayers.length > 0) {
        return callback({ success: false, message: 'All players must be ready' });
      }

      // 역할 배정
      const assignedRoles = roleManager.assignRoles(room.players, room.options);
      if (!assignedRoles) {
        return callback({ success: false, message: 'Failed to assign roles' });
      }

      // 미션 배정
      const playerMissions = missionManager.assignMissions(room.players, room.options);

      // 초기 위치 설정
      room.players.forEach(player => {
        const spawnPoint = moveManager.getRandomSpawnPoint();
        player.position = spawnPoint;
        moveManager.setPlayerPosition(roomName, player.id, spawnPoint);
      });

      // 게임 상태 업데이트
      const gameState = gameStates.get(roomName);
      gameState.phase = 'playing';
      gameState.startTime = Date.now();
      gameState.missionProgress = {};
      gameState.emergencyMeetingsUsed = {};
      
      // 각 플레이어에게 개별적으로 역할과 미션 전송
      room.players.forEach(player => {
        io.to(player.id).emit('gameStarted', {
          role: player.role,
          missions: playerMissions[player.id] || [],
          teammates: roleManager.getTeammates(player, room.players),
          gameState: {
            phase: gameState.phase,
            roomOptions: room.options
          }
        });
      });

      // 모든 플레이어에게 게임 시작 알림
      io.to(roomName).emit('gamePhaseChanged', { phase: 'playing' });
      io.to(roomName).emit('positionsUpdate', moveManager.getAllPositions(roomName));

      callback({ success: true });
      console.log(`[${new Date().toISOString()}] Game started in room: ${roomName}`);

      // 통계 기록 시작
      statisticsManager.recordGameStart(roomName, room.players.length);

    } catch (error) {
      console.error('Error starting game:', error);
      callback({ success: false, message: 'Server error' });
    }
  });

  // ================= 플레이어 이동 =================
  
  socket.on('movePlayer', ({ roomName, position, velocity }) => {
    try {
      const room = roomManager.getRoom(roomName);
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || !player.isAlive) return;

      const gameState = gameStates.get(roomName);
      if (!gameState || gameState.phase !== 'playing') return;

      // 이동 속도 제한 검증
      const maxSpeed = room.options.playerSpeed * 100; // 기본 속도의 배수
      if (velocity && (Math.abs(velocity.x) > maxSpeed || Math.abs(velocity.y) > maxSpeed)) {
        console.warn(`Player ${socket.id} exceeded speed limit`);
        return;
      }

      moveManager.setPlayerPosition(roomName, socket.id, position);
      player.position = position;

      // 주변 플레이어에게만 위치 업데이트 전송 (최적화)
      socket.to(roomName).emit('playerMoved', {
        playerId: socket.id,
        position: position,
        velocity: velocity
      });

    } catch (error) {
      console.error('Error moving player:', error);
    }
  });

  // ================= 미션 시스템 =================
  
  socket.on('startMission', ({ roomName, missionId }, callback) => {
    try {
      const room = roomManager.getRoom(roomName);
      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      const player = room.players.find(p => p.id === socket.id);
      if (!player || !player.isAlive) {
        return callback({ success: false, message: 'Player not found or dead' });
      }

      const mission = missionManager.getMission(missionId);
      if (!mission) {
        return callback({ success: false, message: 'Mission not found' });
      }

      // 미션 시작 가능 여부 확인
      const canStart = missionManager.canStartMission(socket.id, missionId, player.position);
      if (!canStart.allowed) {
        return callback({ success: false, message: canStart.reason });
      }

      callback({ success: true, mission: mission });
      console.log(`[${new Date().toISOString()}] ${player.nickname} started mission: ${mission.name}`);

    } catch (error) {
      console.error('Error starting mission:', error);
      callback({ success: false, message: 'Server error' });
    }
  });

  socket.on('completeMission', ({ roomName, missionId, result }, callback) => {
    try {
      const room = roomManager.getRoom(roomName);
      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      const player = room.players.find(p => p.id === socket.id);
      if (!player || !player.isAlive) {
        return callback({ success: false, message: 'Player not found or dead' });
      }

      const success = missionManager.completeMission(socket.id, missionId, result);
      if (success) {
        player.completedMissions.push({
          missionId,
          completedAt: Date.now(),
          score: result.score || 0
        });

        // 미션 진행률 업데이트
        const gameState = gameStates.get(roomName);
        const totalMissions = room.players.length * room.options.missionsPerPlayer;
        const completedMissions = room.players.reduce((sum, p) => sum + p.completedMissions.length, 0);
        const progress = (completedMissions / totalMissions) * 100;

        gameState.missionProgress = {
          completed: completedMissions,
          total: totalMissions,
          percentage: progress
        };

        // 모든 플레이어에게 미션 진행률 업데이트
        io.to(roomName).emit('missionProgressUpdate', gameState.missionProgress);

        callback({ success: true, progress: gameState.missionProgress });

        // 승리 조건 확인
        if (progress >= 100) {
          endGame(roomName, 'crewmate_missions');
        }

        statisticsManager.recordMissionComplete(roomName, socket.id, missionId, result.score);
        console.log(`[${new Date().toISOString()}] ${player.nickname} completed mission: ${missionId}`);
      } else {
        callback({ success: false, message: 'Failed to complete mission' });
      }

    } catch (error) {
      console.error('Error completing mission:', error);
      callback({ success: false, message: 'Server error' });
    }
  });

  // ================= 킬 시스템 =================
  
  socket.on('attemptKill', ({ roomName, targetId }, callback) => {
    try {
      const room = roomManager.getRoom(roomName);
      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      const killer = room.players.find(p => p.id === socket.id);
      const target = room.players.find(p => p.id === targetId);

      if (!killer || !target) {
        return callback({ success: false, message: 'Player not found' });
      }

      const killResult = killManager.attemptKill(killer, target, room.options);
      
      if (killResult.success) {
        target.isAlive = false;
        target.deathTime = Date.now();
        target.killedBy = killer.id;

        // 시체 생성
        const gameState = gameStates.get(roomName);
        gameState.corpses.push({
          id: targetId,
          position: target.position,
          discoveredBy: null,
          discoveredAt: null
        });

        // 킬러에게만 성공 알림
        callback({ success: true });

        // 타겟에게 사망 알림
        io.to(targetId).emit('playerDied', { killedBy: killer.id });

        // 다른 플레이어들에게는 시체만 표시 (발견되기 전까지)
        socket.to(roomName).emit('corpseCreated', {
          corpseId: targetId,
          position: target.position
        });

        console.log(`[${new Date().toISOString()}] ${killer.nickname} killed ${target.nickname} in room: ${roomName}`);

        // 승리 조건 확인
        const alivePlayers = room.players.filter(p => p.isAlive);
        const aliveImpostors = alivePlayers.filter(p => p.role.team === 'impostor');
        const aliveCrewmates = alivePlayers.filter(p => p.role.team === 'crewmate');

        if (aliveImpostors.length >= aliveCrewmates.length) {
          endGame(roomName, 'impostor_elimination');
        }

        statisticsManager.recordKill(roomName, killer.id, targetId);

      } else {
        callback({ success: false, message: killResult.reason });
      }

    } catch (error) {
      console.error('Error attempting kill:', error);
      callback({ success: false, message: 'Server error' });
    }
  });

  // 시체 발견
  socket.on('reportCorpse', ({ roomName, corpseId }, callback) => {
    try {
      const room = roomManager.getRoom(roomName);
      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      const reporter = room.players.find(p => p.id === socket.id);
      if (!reporter || !reporter.isAlive) {
        return callback({ success: false, message: 'Only alive players can report' });
      }

      const gameState = gameStates.get(roomName);
      const corpse = gameState.corpses.find(c => c.id === corpseId);
      
      if (!corpse) {
        return callback({ success: false, message: 'Corpse not found' });
      }

      if (corpse.discoveredBy) {
        return callback({ success: false, message: 'Corpse already reported' });
      }

      // 시체 발견 처리
      corpse.discoveredBy = socket.id;
      corpse.discoveredAt = Date.now();

      callback({ success: true });

      // 긴급 회의 시작
      startEmergencyMeeting(roomName, socket.id, 'corpse_report', corpseId);

      statisticsManager.recordCorpseReport(roomName, socket.id, corpseId);

    } catch (error) {
      console.error('Error reporting corpse:', error);
      callback({ success: false, message: 'Server error' });
    }
  });

  // ================= 회의 시스템 =================
  
  socket.on('callEmergencyMeeting', ({ roomName }, callback) => {
    try {
      const room = roomManager.getRoom(roomName);
      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      const caller = room.players.find(p => p.id === socket.id);
      if (!caller || !caller.isAlive) {
        return callback({ success: false, message: 'Only alive players can call meetings' });
      }

      const gameState = gameStates.get(roomName);
      
      // 긴급 회의 사용 횟수 확인
      const usedMeetings = gameState.emergencyMeetingsUsed[socket.id] || 0;
      if (usedMeetings >= room.options.emergencyMeetings) {
        return callback({ success: false, message: 'No emergency meetings remaining' });
      }

      // 긴급 회의 사용 횟수 증가
      gameState.emergencyMeetingsUsed[socket.id] = usedMeetings + 1;

      callback({ success: true });

      // 긴급 회의 시작
      startEmergencyMeeting(roomName, socket.id, 'emergency_button');

    } catch (error) {
      console.error('Error calling emergency meeting:', error);
      callback({ success: false, message: 'Server error' });
    }
  });

  // 투표
  socket.on('castVote', ({ roomName, targetId }, callback) => {
    try {
      const room = roomManager.getRoom(roomName);
      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      const voter = room.players.find(p => p.id === socket.id);
      if (!voter || !voter.isAlive) {
        return callback({ success: false, message: 'Only alive players can vote' });
      }

      const gameState = gameStates.get(roomName);
      if (!gameState.currentMeeting || gameState.phase !== 'voting') {
        return callback({ success: false, message: 'No voting in progress' });
      }

      const voteResult = meetingManager.castVote(roomName, socket.id, targetId);
      if (voteResult.success) {
        callback({ success: true });
        
        // 투표 현황 업데이트
        io.to(roomName).emit('voteUpdate', {
          votes: meetingManager.getVoteResults(roomName),
          hasVoted: meetingManager.getVotedPlayers(roomName)
        });

        // 모든 플레이어가 투표했는지 확인
        const alivePlayers = room.players.filter(p => p.isAlive);
        const votedPlayers = meetingManager.getVotedPlayers(roomName);
        
        if (votedPlayers.length >= alivePlayers.length) {
          // 투표 결과 처리
          processMeetingResults(roomName);
        }

      } else {
        callback({ success: false, message: voteResult.reason });
      }

    } catch (error) {
      console.error('Error casting vote:', error);
      callback({ success: false, message: 'Server error' });
    }
  });

  // ================= 채팅 시스템 =================
  
  socket.on('sendMessage', ({ roomName, message, type = 'game' }, callback) => {
    try {
      const room = roomManager.getRoom(roomName);
      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      const sender = room.players.find(p => p.id === socket.id);
      if (!sender) {
        return callback({ success: false, message: 'Player not found' });
      }

      // 죽은 플레이어는 산 플레이어와 채팅 불가
      const gameState = gameStates.get(roomName);
      let canSendTo = [];

      if (type === 'meeting') {
        // 회의 중에는 살아있는 플레이어만 채팅 가능
        if (sender.isAlive) {
          canSendTo = room.players.filter(p => p.isAlive).map(p => p.id);
        }
      } else if (type === 'ghost') {
        // 유령 채팅 (죽은 플레이어들끼리만)
        if (!sender.isAlive) {
          canSendTo = room.players.filter(p => !p.isAlive).map(p => p.id);
        }
      } else {
        // 일반 게임 중 채팅 불가
        return callback({ success: false, message: 'Cannot chat during game' });
      }

      const chatMessage = {
        id: Date.now().toString(),
        senderId: socket.id,
        senderName: sender.nickname,
        message: message.substring(0, 200), // 메시지 길이 제한
        timestamp: Date.now(),
        type: type
      };

      // 해당 플레이어들에게만 메시지 전송
      canSendTo.forEach(playerId => {
        io.to(playerId).emit('messageReceived', chatMessage);
      });

      callback({ success: true });

    } catch (error) {
      console.error('Error sending message:', error);
      callback({ success: false, message: 'Server error' });
    }
  });

  // ================= 연결 해제 처리 =================
  
  socket.on('disconnect', () => {
    try {
      const playerRooms = [];
      
      // 플레이어가 속한 모든 방 찾기
      for (const [roomName, room] of roomManager.getAllRooms()) {
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          playerRooms.push({ roomName, player: room.players[playerIndex] });
        }
      }

      // 각 방에서 플레이어 제거 처리
      playerRooms.forEach(({ roomName, player }) => {
        // 위치 정보 제거
        moveManager.removePlayer(roomName, socket.id);
        
        // 방에서 플레이어 제거
        roomManager.leaveRoom(roomName, socket.id);
        
        // 게임 중이었다면 추가 처리
        const gameState = gameStates.get(roomName);
        if (gameState && gameState.phase === 'playing') {
          const room = roomManager.getRoom(roomName);
          if (room) {
            // 남은 플레이어들에게 알림
            io.to(roomName).emit('playerDisconnected', {
              playerId: socket.id,
              playerName: player.nickname
            });

            // 승리 조건 재확인
            const alivePlayers = room.players.filter(p => p.isAlive);
            const aliveImpostors = alivePlayers.filter(p => p.role && p.role.team === 'impostor');
            const aliveCrewmates = alivePlayers.filter(p => p.role && p.role.team === 'crewmate');

            if (aliveImpostors.length === 0) {
              endGame(roomName, 'crewmate_elimination');
            } else if (aliveImpostors.length >= aliveCrewmates.length) {
              endGame(roomName, 'impostor_elimination');
            }
          }
        }

        // 방이 비었다면 삭제
        const currentRoom = roomManager.getRoom(roomName);
        if (!currentRoom || currentRoom.players.length === 0) {
          roomManager.deleteRoom(roomName);
          gameStates.delete(roomName);
          console.log(`[${new Date().toISOString()}] Empty room deleted: ${roomName}`);
        } else {
          // 방장이 나갔다면 방장 권한 이전
          if (player.isHost && currentRoom.players.length > 0) {
            currentRoom.players[0].isHost = true;
            io.to(roomName).emit('hostChanged', {
              newHostId: currentRoom.players[0].id,
              newHostName: currentRoom.players[0].nickname
            });
          }
          
          // 방 정보 업데이트
          io.to(roomName).emit('roomUpdated', currentRoom);
        }
      });

      // 전체 방 목록 업데이트
      io.emit('roomsUpdated', roomManager.getAllRoomsInfo());
      
      console.log(`[${new Date().toISOString()}] User disconnected: ${socket.id}`);

    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // ================= 헬퍼 함수들 =================
  
  function startEmergencyMeeting(roomName, callerId, type, corpseId = null) {
    const room = roomManager.getRoom(roomName);
    const gameState = gameStates.get(roomName);
    
    // 게임 상태를 회의로 변경
    gameState.phase = 'meeting';
    
    // 회의 정보 설정
    const meeting = {
      id: Date.now().toString(),
      callerId: callerId,
      type: type, // 'emergency_button' or 'corpse_report'
      corpseId: corpseId,
      startTime: Date.now(),
      discussionEndTime: Date.now() + (room.options.discussionTime * 1000),
      votingEndTime: Date.now() + ((room.options.discussionTime + room.options.votingTime) * 1000)
    };
    
    gameState.currentMeeting = meeting;
    meetingManager.startMeeting(roomName, meeting);

    // 모든 플레이어를 회의 테이블로 이동
    const meetingPosition = { x: 400, y: 300 };
    room.players.forEach(player => {
      player.position = meetingPosition;
      moveManager.setPlayerPosition(roomName, player.id, meetingPosition);
    });

    // 회의 시작 알림
    io.to(roomName).emit('meetingStarted', {
      meeting: meeting,
      caller: room.players.find(p => p.id === callerId),
      alivePlayers: room.players.filter(p => p.isAlive),
      deadPlayers: room.players.filter(p => !p.isAlive)
    });

    // 토론 시간 타이머
    setTimeout(() => {
      gameState.phase = 'voting';
      io.to(roomName).emit('votingStarted', {
        timeLimit: room.options.votingTime
      });

      // 투표 시간 타이머
      setTimeout(() => {
        processMeetingResults(roomName);
      }, room.options.votingTime * 1000);

    }, room.options.discussionTime * 1000);

    statisticsManager.recordMeeting(roomName, callerId, type);
  }

  function processMeetingResults(roomName) {
    const room = roomManager.getRoom(roomName);
    const gameState = gameStates.get(roomName);
    
    const voteResults = meetingManager.getVoteResults(roomName);
    const ejectedPlayer = meetingManager.determineEjection(roomName, voteResults);

    let ejectedPlayerData = null;
    if (ejectedPlayer) {
      const player = room.players.find(p => p.id === ejectedPlayer);
      if (player) {
        player.isAlive = false;
        player.deathTime = Date.now();
        player.ejectedAt = gameState.currentMeeting.id;
        ejectedPlayerData = {
          id: player.id,
          nickname: player.nickname,
          role: player.role
        };
      }
    }

    // 투표 결과 발표
    io.to(roomName).emit('votingResults', {
      votes: voteResults,
      ejectedPlayer: ejectedPlayerData,
      wasImpostor: ejectedPlayerData ? ejectedPlayerData.role.team === 'impostor' : false
    });

    // 회의 종료
    gameState.phase = 'playing';
    gameState.currentMeeting = null;
    meetingManager.endMeeting(roomName);

    // 승리 조건 확인
    setTimeout(() => {
      checkWinConditions(roomName);
    }, 3000);

    if (ejectedPlayerData) {
      statisticsManager.recordEjection(roomName, ejectedPlayer, voteResults);
    }
  }

  function checkWinConditions(roomName) {
    const room = roomManager.getRoom(roomName);
    const gameState = gameStates.get(roomName);

    if (gameState.phase === 'ended') return;

    const alivePlayers = room.players.filter(p => p.isAlive);
    const aliveImpostors = alivePlayers.filter(p => p.role.team === 'impostor');
    const aliveCrewmates = alivePlayers.filter(p => p.role.team === 'crewmate');

    // 임포스터 승리 조건
    if (aliveImpostors.length >= aliveCrewmates.length) {
      endGame(roomName, 'impostor_elimination');
      return;
    }

    // 크루메이트 승리 조건 - 모든 임포스터 제거
    if (aliveImpostors.length === 0) {
      endGame(roomName, 'crewmate_elimination');
      return;
    }

    // 크루메이트 승리 조건 - 모든 미션 완료
    const totalMissions = room.players.length * room.options.missionsPerPlayer;
    const completedMissions = room.players.reduce((sum, p) => sum + p.completedMissions.length, 0);
    
    if (completedMissions >= totalMissions) {
      endGame(roomName, 'crewmate_missions');
      return;
    }
  }

  function endGame(roomName, winCondition) {
    const room = roomManager.getRoom(roomName);
    const gameState = gameStates.get(roomName);

    if (gameState.phase === 'ended') return;

    gameState.phase = 'ended';
    const endTime = Date.now();
    const gameLength = endTime - gameState.startTime;

    let winningTeam = '';
    let reason = '';

    switch (winCondition) {
      case 'impostor_elimination':
        winningTeam = 'impostor';
        reason = 'Impostors eliminated enough crewmates';
        break;
      case 'crewmate_elimination':
        winningTeam = 'crewmate';
        reason = 'All impostors were eliminated';
        break;
      case 'crewmate_missions':
        winningTeam = 'crewmate';
        reason = 'All missions were completed';
        break;
    }

    const gameResults = {
      winningTeam: winningTeam,
      reason: reason,
      gameLength: gameLength,
      players: room.players.map(player => ({
        id: player.id,
        nickname: player.nickname,
        role: player.role,
        isAlive: player.isAlive,
        completedMissions: player.completedMissions.length,
        survived: player.isAlive
      })),
      statistics: statisticsManager.generateGameStats(roomName)
    };

    // 게임 종료 알림
    io.to(roomName).emit('gameEnded', gameResults);

    // 통계 기록
    statisticsManager.recordGameEnd(roomName, winCondition, gameLength);

    console.log(`[${new Date().toISOString()}] Game ended in room ${roomName}: ${winningTeam} wins (${reason})`);

    // 5초 후 로비로 리셋
    setTimeout(() => {
      resetRoomToLobby(roomName);
    }, 5000);
  }

  function resetRoomToLobby(roomName) {
    const room = roomManager.getRoom(roomName);
    if (!room) return;

    // 플레이어 상태 리셋
    room.players.forEach(player => {
      player.isReady = false;
      player.role = null;
      player.isAlive = true;
      player.completedMissions = [];
      player.votesRemaining = 1;
      player.position = { x: 400, y: 300 };
    });

    // 게임 상태 리셋
    const gameState = gameStates.get(roomName);
    gameState.phase = 'lobby';
    gameState.startTime = null;
    gameState.currentMeeting = null;
    gameState.emergencyMeetingsUsed = {};
    gameState.corpses = [];
    gameState.missionProgress = {};

    // 위치 정보 리셋
    moveManager.resetRoom(roomName);

    // 회의/투표 상태 리셋
    meetingManager.resetRoom(roomName);
    killManager.resetRoom(roomName);

    // 클라이언트에 리셋 알림
    io.to(roomName).emit('roomReset');
    io.to(roomName).emit('roomUpdated', room);

    console.log(`[${new Date().toISOString()}] Room ${roomName} reset to lobby`);
  }
});

// REST API 엔드포인트
app.get('/api/rooms', (req, res) => {
  res.json(roomManager.getAllRoomsInfo());
});

app.get('/api/statistics/:roomName', (req, res) => {
  const stats = statisticsManager.getRoomStats(req.params.roomName);
  res.json(stats);
});

// 서버 시작
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Among Us Clone Server listening on port ${PORT}`);
  console.log(`[${new Date().toISOString()}] WebSocket server ready for connections`);
});

// 에러 핸들링
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});