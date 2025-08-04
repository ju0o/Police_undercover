// [server/src/rooms/roomManager.js] - 방 관리 모듈
// 방 생성, 입장, 퇴장, 옵션 관리 등을 담당

const rooms = new Map(); // roomName -> room object

// 기본 방 옵션 설정
const DEFAULT_ROOM_OPTIONS = {
  maxPlayers: 10,
  impostorCount: 2,
  detectiveCount: 1,
  policeCount: 0, // 경찰 역할
  organizationCount: 0, // 조직원 역할
  auditTeamCount: 0, // 감사팀 역할
  missionsPerPlayer: 5,
  missionDifficulty: 'normal', // easy, normal, hard, expert
  discussionTime: 120, // 토론 시간 (초)
  votingTime: 30, // 투표 시간 (초)
  emergencyMeetings: 1, // 플레이어당 긴급 회의 횟수
  killCooldown: 30, // 킬 쿨다운 (초)
  taskBarUpdate: 'always', // always, meetings, never
  visualTasks: true, // 시각적 미션 표시 여부
  anonymousVotes: false, // 익명 투표 여부
  playerSpeed: 1.0, // 플레이어 이동 속도 배수
  crewmateVision: 1.0, // 크루메이트 시야 배수
  impostorVision: 1.5, // 임포스터 시야 배수
  password: null, // 방 비밀번호
  isPrivate: false, // 비공개 방 여부
  allowSpectators: true, // 관전자 허용 여부
  gameMode: 'classic', // classic, custom, detective
  map: 'spaceship', // spaceship, office, laboratory
  language: 'ko' // 언어 설정
};

// 방 생성
function createRoom(roomName, customOptions = {}) {
  try {
    // 방 이름 유효성 검사
    if (!roomName || typeof roomName !== 'string' || roomName.trim().length === 0) {
      return false;
    }

    // 방 이름 길이 제한 (최대 20자)
    if (roomName.length > 20) {
      return false;
    }

    // 특수문자 제한 (영문, 숫자, 한글, 공백만 허용)
    const validNameRegex = /^[a-zA-Z0-9가-힣\s]+$/;
    if (!validNameRegex.test(roomName)) {
      return false;
    }

    // 이미 존재하는 방인지 확인
    if (rooms.has(roomName)) {
      return false;
    }

    // 옵션 병합 및 유효성 검사
    const roomOptions = validateAndMergeOptions(customOptions);
    
    // 방 객체 생성
    const room = {
      name: roomName,
      players: [],
      options: roomOptions,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      gameState: 'lobby', // lobby, playing, ended
      hostId: null, // 방장 ID (첫 번째 플레이어가 자동으로 방장)
      bannedPlayers: [], // 차단된 플레이어 목록
      spectators: [] // 관전자 목록
    };

    rooms.set(roomName, room);
    console.log(`[${new Date().toISOString()}] Room created: ${roomName}`);
    return true;

  } catch (error) {
    console.error('Error creating room:', error);
    return false;
  }
}

// 방 입장
function joinRoom(roomName, player) {
  try {
    const room = rooms.get(roomName);
    if (!room) {
      return false;
    }

    // 차단된 플레이어 확인
    if (room.bannedPlayers.includes(player.id)) {
      return false;
    }

    // 이미 방에 있는 플레이어 확인
    const existingPlayer = room.players.find(p => p.id === player.id);
    if (existingPlayer) {
      return false;
    }

    // 최대 인원 확인
    if (room.players.length >= room.options.maxPlayers) {
      return false;
    }

    // 닉네임 중복 확인
    const duplicateNickname = room.players.find(p => p.nickname === player.nickname);
    if (duplicateNickname) {
      return false;
    }

    // 첫 번째 플레이어는 자동으로 방장
    if (room.players.length === 0) {
      player.isHost = true;
      room.hostId = player.id;
    }

    // 플레이어 추가
    room.players.push(player);
    room.lastActivity = Date.now();

    console.log(`[${new Date().toISOString()}] Player ${player.nickname} joined room: ${roomName}`);
    return true;

  } catch (error) {
    console.error('Error joining room:', error);
    return false;
  }
}

// 방 퇴장
function leaveRoom(roomName, playerId) {
  try {
    const room = rooms.get(roomName);
    if (!room) {
      return false;
    }

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      return false;
    }

    const leavingPlayer = room.players[playerIndex];
    room.players.splice(playerIndex, 1);
    room.lastActivity = Date.now();

    // 방장이 나간 경우 방장 권한 이전
    if (leavingPlayer.isHost && room.players.length > 0) {
      room.players[0].isHost = true;
      room.hostId = room.players[0].id;
      console.log(`[${new Date().toISOString()}] Host transferred to ${room.players[0].nickname} in room: ${roomName}`);
    }

    // 방이 비었으면 자동 삭제 (더 빠른 정리를 위해 5초로 단축)
    if (room.players.length === 0) {
      setTimeout(() => {
        if (rooms.has(roomName) && rooms.get(roomName).players.length === 0) {
          rooms.delete(roomName);
          console.log(`[${new Date().toISOString()}] Empty room deleted: ${roomName}`);
        }
      }, 5000); // 5초 후 삭제
    }

    console.log(`[${new Date().toISOString()}] Player ${leavingPlayer.nickname} left room: ${roomName}`);
    return true;

  } catch (error) {
    console.error('Error leaving room:', error);
    return false;
  }
}

// 방 옵션 업데이트 (방장만 가능)
function updateRoomOptions(roomName, newOptions) {
  try {
    const room = rooms.get(roomName);
    if (!room) {
      return false;
    }

    // 게임 중에는 옵션 변경 불가
    if (room.gameState !== 'lobby') {
      return false;
    }

    // 옵션 유효성 검사 및 병합
    const validatedOptions = validateAndMergeOptions(newOptions, room.options);
    room.options = validatedOptions;
    room.lastActivity = Date.now();

    console.log(`[${new Date().toISOString()}] Room options updated for: ${roomName}`);
    return true;

  } catch (error) {
    console.error('Error updating room options:', error);
    return false;
  }
}

// 방 삭제
function deleteRoom(roomName) {
  try {
    if (rooms.has(roomName)) {
      rooms.delete(roomName);
      console.log(`[${new Date().toISOString()}] Room deleted: ${roomName}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting room:', error);
    return false;
  }
}

// 방 정보 조회
function getRoom(roomName) {
  return rooms.get(roomName) || null;
}

// 방의 플레이어 목록 조회
function getRoomPlayers(roomName) {
  const room = rooms.get(roomName);
  return room ? room.players : [];
}

// 방의 옵션 조회
function getRoomOptions(roomName) {
  const room = rooms.get(roomName);
  return room ? room.options : {};
}

// 모든 방 목록 조회 (Iterator 반환)
function getAllRooms() {
  return rooms;
}

// 모든 방 정보 조회 (공개용)
function getAllRoomsInfo() {
  const roomsInfo = [];
  
  for (const [roomName, room] of rooms) {
    // 비공개 방은 제외
    if (!room.options.isPrivate) {
      roomsInfo.push({
        name: roomName,
        playerCount: room.players.length,
        maxPlayers: room.options.maxPlayers,
        gameState: room.gameState,
        hasPassword: !!room.options.password,
        createdAt: room.createdAt,
        gameMode: room.options.gameMode,
        map: room.options.map
      });
    }
  }

  // 최근 활동 순으로 정렬
  return roomsInfo.sort((a, b) => b.createdAt - a.createdAt);
}

// 플레이어 차단
function banPlayer(roomName, hostId, targetId) {
  try {
    const room = rooms.get(roomName);
    if (!room) {
      return false;
    }

    // 방장 권한 확인
    if (room.hostId !== hostId) {
      return false;
    }

    // 타겟 플레이어 확인
    const targetPlayer = room.players.find(p => p.id === targetId);
    if (!targetPlayer) {
      return false;
    }

    // 차단 목록에 추가
    if (!room.bannedPlayers.includes(targetId)) {
      room.bannedPlayers.push(targetId);
    }

    // 방에서 강제 퇴장
    leaveRoom(roomName, targetId);

    console.log(`[${new Date().toISOString()}] Player ${targetId} banned from room: ${roomName}`);
    return true;

  } catch (error) {
    console.error('Error banning player:', error);
    return false;
  }
}

// 플레이어 차단 해제
function unbanPlayer(roomName, hostId, targetId) {
  try {
    const room = rooms.get(roomName);
    if (!room) {
      return false;
    }

    // 방장 권한 확인
    if (room.hostId !== hostId) {
      return false;
    }

    // 차단 목록에서 제거
    const banIndex = room.bannedPlayers.indexOf(targetId);
    if (banIndex !== -1) {
      room.bannedPlayers.splice(banIndex, 1);
      console.log(`[${new Date().toISOString()}] Player ${targetId} unbanned from room: ${roomName}`);
      return true;
    }

    return false;

  } catch (error) {
    console.error('Error unbanning player:', error);
    return false;
  }
}

// 방장 권한 이전
function transferHost(roomName, currentHostId, newHostId) {
  try {
    const room = rooms.get(roomName);
    if (!room) {
      return false;
    }

    // 현재 방장 확인
    if (room.hostId !== currentHostId) {
      return false;
    }

    // 새 방장 확인
    const newHost = room.players.find(p => p.id === newHostId);
    if (!newHost) {
      return false;
    }

    // 방장 권한 이전
    const currentHost = room.players.find(p => p.id === currentHostId);
    if (currentHost) {
      currentHost.isHost = false;
    }

    newHost.isHost = true;
    room.hostId = newHostId;
    room.lastActivity = Date.now();

    console.log(`[${new Date().toISOString()}] Host transferred from ${currentHostId} to ${newHostId} in room: ${roomName}`);
    return true;

  } catch (error) {
    console.error('Error transferring host:', error);
    return false;
  }
}

// 옵션 유효성 검사 및 병합
function validateAndMergeOptions(customOptions, baseOptions = DEFAULT_ROOM_OPTIONS) {
  const options = { ...baseOptions };

  // 숫자 옵션들의 범위 검사
  const numericOptions = {
    maxPlayers: { min: 4, max: 15 },
    impostorCount: { min: 1, max: 5 },
    detectiveCount: { min: 0, max: 3 },
    policeCount: { min: 0, max: 2 },
    organizationCount: { min: 0, max: 3 },
    auditTeamCount: { min: 0, max: 2 },
    missionsPerPlayer: { min: 3, max: 10 },
    discussionTime: { min: 30, max: 300 },
    votingTime: { min: 15, max: 120 },
    emergencyMeetings: { min: 0, max: 5 },
    killCooldown: { min: 10, max: 60 },
    playerSpeed: { min: 0.5, max: 3.0 },
    crewmateVision: { min: 0.25, max: 2.0 },
    impostorVision: { min: 0.25, max: 3.0 }
  };

  // 열거형 옵션들
  const enumOptions = {
    missionDifficulty: ['easy', 'normal', 'hard', 'expert'],
    taskBarUpdate: ['always', 'meetings', 'never'],
    gameMode: ['classic', 'custom', 'detective'],
    map: ['spaceship', 'office', 'laboratory'],
    language: ['ko', 'en', 'ja', 'zh']
  };

  // 숫자 옵션 검증
  for (const [key, range] of Object.entries(numericOptions)) {
    if (customOptions[key] !== undefined) {
      const value = Number(customOptions[key]);
      if (!isNaN(value) && value >= range.min && value <= range.max) {
        options[key] = value;
      }
    }
  }

  // 열거형 옵션 검증
  for (const [key, validValues] of Object.entries(enumOptions)) {
    if (customOptions[key] !== undefined && validValues.includes(customOptions[key])) {
      options[key] = customOptions[key];
    }
  }

  // 불린 옵션 검증
  const booleanOptions = ['visualTasks', 'anonymousVotes', 'isPrivate', 'allowSpectators'];
  for (const key of booleanOptions) {
    if (typeof customOptions[key] === 'boolean') {
      options[key] = customOptions[key];
    }
  }

  // 비밀번호 검증
  if (customOptions.password !== undefined) {
    if (customOptions.password === null || customOptions.password === '') {
      options.password = null;
    } else if (typeof customOptions.password === 'string' && customOptions.password.length <= 20) {
      options.password = customOptions.password;
    }
  }

  // 역할 수 검증 (전체 플레이어 수보다 많으면 안됨)
  const totalRoles = options.impostorCount + options.detectiveCount + 
                    options.policeCount + options.organizationCount + options.auditTeamCount;
  
  if (totalRoles > options.maxPlayers) {
    // 자동 조정: 임포스터 수를 우선시하고 나머지 역할 수를 줄임
    const remainingSlots = options.maxPlayers - options.impostorCount;
    const otherRoles = options.detectiveCount + options.policeCount + 
                      options.organizationCount + options.auditTeamCount;
    
    if (otherRoles > remainingSlots) {
      const ratio = remainingSlots / otherRoles;
      options.detectiveCount = Math.floor(options.detectiveCount * ratio);
      options.policeCount = Math.floor(options.policeCount * ratio);
      options.organizationCount = Math.floor(options.organizationCount * ratio);
      options.auditTeamCount = Math.floor(options.auditTeamCount * ratio);
    }
  }

  return options;
}

// 비활성 방 정리 (주기적으로 호출)
function cleanupInactiveRooms() {
  const now = Date.now();
  const inactiveThreshold = 60 * 60 * 1000; // 1시간

  for (const [roomName, room] of rooms) {
    // 1시간 동안 활동이 없고 플레이어가 없는 방 삭제
    if (now - room.lastActivity > inactiveThreshold && room.players.length === 0) {
      rooms.delete(roomName);
      console.log(`[${new Date().toISOString()}] Inactive room deleted: ${roomName}`);
    }
  }
}

// 정기적으로 비활성 방 정리 (5분마다)
setInterval(cleanupInactiveRooms, 5 * 60 * 1000);

// 공개방 목록만 반환
function getPublicRooms() {
  const publicRooms = [];
  for (const [roomName, room] of rooms) {
    if (!room.options.isPrivate) {
      publicRooms.push({
        name: roomName,
        playerCount: room.players.length,
        maxPlayers: room.options.maxPlayers,
        gameStarted: room.gameStarted || false
      });
    }
  }
  return publicRooms;
}

// 방 코드로 방 찾기
function findRoomByCode(roomCode) {
  for (const [roomName, room] of rooms) {
    if (room.options.roomCode === roomCode) {
      return { name: roomName, ...room };
    }
  }
  return null;
}

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  updateRoomOptions,
  deleteRoom,
  getRoom,
  getRoomPlayers,
  getRoomOptions,
  getPublicRooms,
  findRoomByCode,
  getAllRooms,
  getAllRoomsInfo,
  banPlayer,
  unbanPlayer,
  transferHost,
  DEFAULT_ROOM_OPTIONS
};