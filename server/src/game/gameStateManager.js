// [server/src/game/gameStateManager.js] - 완전한 게임 상태 관리 시스템
// 게임 플로우, 승리 조건, 이벤트 핸들링을 포함한 통합 관리자

const roleManager = require('../roles/roleManager');

// ============================
// 게임 상수
// ============================

const GAME_PHASES = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  MEETING: 'meeting',
  VOTING: 'voting',
  RESULTS: 'results'
};

const PLAYER_STATES = {
  ALIVE: 'alive',
  DEAD: 'dead',
  SPECTATING: 'spectating'
};

const WIN_CONDITIONS = {
  CREWMATE_TASKS: 'crewmate_tasks',
  CREWMATE_VOTE: 'crewmate_vote',
  IMPOSTOR_KILL: 'impostor_kill',
  IMPOSTOR_SABOTAGE: 'impostor_sabotage'
};

// ============================
// 게임 상태 저장소
// ============================

const gameStates = new Map(); // roomName -> GameStateData
const gameTimers = new Map(); // roomName -> timers

// ============================
// 게임 상태 데이터 구조
// ============================

class GameStateData {
  constructor(roomName) {
    this.roomName = roomName;
    this.phase = GAME_PHASES.LOBBY;
    this.startedAt = null;
    this.players = new Map(); // playerId -> PlayerGameData
    this.corpses = [];
    this.completedTasks = 0;
    this.totalTasks = 0;
    this.meetingCooldown = 0;
    this.votes = new Map(); // voterId -> targetId
    this.votingResults = null;
    this.timers = {
      discussion: null,
      voting: null,
      game: null
    };
    this.settings = {
      discussionTime: 120000, // 2분
      votingTime: 30000,     // 30초
      killCooldown: 30000,   // 30초
      emergencyMeetings: 1,
      gameTimeLimit: 600000   // 10분
    };
  }
}

class PlayerGameData {
  constructor(playerId, nickname, role) {
    this.id = playerId;
    this.nickname = nickname;
    this.role = role;
    this.state = PLAYER_STATES.ALIVE;
    this.position = { x: 400, y: 300 };
    this.completedTasks = [];
    this.totalTasks = 0;
    this.lastKillTime = 0;
    this.emergencyMeetingsUsed = 0;
    this.isInVent = false;
    this.canVote = true;
    this.votedFor = null;
  }
}

// ============================
// 게임 초기화 및 관리
// ============================

function initializeGame(roomName) {
  console.log(`[GAME STATE] Initializing game for room: ${roomName}`);
  
  const gameState = new GameStateData(roomName);
  gameStates.set(roomName, gameState);
  
  // 타이머 초기화
  gameTimers.set(roomName, {
    discussion: null,
    voting: null,
    game: null
  });
  
  return gameState;
}

function startGame(roomName) {
  console.log(`[GAME STATE] Starting game in room: ${roomName}`);
  
  const gameState = gameStates.get(roomName);
  if (!gameState) {
    console.error(`[GAME STATE] No game state found for room: ${roomName}`);
    return null;
  }
  
  // 게임 상태 초기화
  gameState.phase = GAME_PHASES.PLAYING;
  gameState.startedAt = Date.now();
  gameState.completedTasks = 0;
  gameState.totalTasks = 0;
  gameState.corpses = [];
  gameState.votes.clear();
  gameState.votingResults = null;
  
  // 플레이어 역할 배정
  const players = Array.from(gameState.players.values());
  const roles = roleManager.assignRoles(players.length);
  
  players.forEach((player, index) => {
    player.role = roles[index];
    player.state = PLAYER_STATES.ALIVE;
    player.completedTasks = [];
    player.lastKillTime = 0;
    player.emergencyMeetingsUsed = 0;
    player.isInVent = false;
    player.canVote = true;
    player.votedFor = null;
    
    // 크루메이트에게 미션 할당
    if (player.role.team === 'crewmate') {
      player.totalTasks = 5; // 기본 5개 미션
      gameState.totalTasks += player.totalTasks;
    }
  });
  
  // 게임 타이머 시작
  startGameTimer(roomName);
  
  console.log(`[GAME STATE] Game started successfully in room: ${roomName}`);
  return gameState;
}

function endGame(roomName, winCondition) {
  console.log(`[GAME STATE] Ending game in room: ${roomName}, win condition: ${winCondition}`);
  
  const gameState = gameStates.get(roomName);
  if (!gameState) return null;
  
  // 모든 타이머 정리
  clearAllTimers(roomName);
  
  // 승자 결정
  let winner = 'crewmate';
  if (winCondition === WIN_CONDITIONS.IMPOSTOR_KILL || 
      winCondition === WIN_CONDITIONS.IMPOSTOR_SABOTAGE) {
    winner = 'impostor';
  }
  
  // 게임 통계 계산
  const gameStats = {
    duration: Date.now() - gameState.startedAt,
    totalTasks: gameState.totalTasks,
    completedTasks: gameState.completedTasks,
    totalKills: gameState.corpses.length
  };
  
  // 플레이어 결과 생성
  const playerResults = Array.from(gameState.players.values()).map(player => ({
    id: player.id,
    nickname: player.nickname,
    role: player.role,
    state: player.state,
    completedTasks: player.completedTasks.length,
    totalTasks: player.totalTasks
  }));
  
  const results = {
    winCondition,
    winner,
    players: playerResults,
    gameStats
  };
  
  // 게임 상태를 결과 단계로 변경
  gameState.phase = GAME_PHASES.RESULTS;
  
  console.log(`[GAME STATE] Game ended in room: ${roomName}, winner: ${winner}`);
  return results;
}

// ============================
// 플레이어 상태 관리
// ============================

function updatePlayerState(roomName, playerId, updates) {
  const gameState = gameStates.get(roomName);
  if (!gameState) return false;
  
  const player = gameState.players.get(playerId);
  if (!player) return false;
  
  Object.assign(player, updates);
  return true;
}

function getPlayerGameData(roomName, playerId) {
  const gameState = gameStates.get(roomName);
  if (!gameState) return null;
  
  return gameState.players.get(playerId);
}

function addPlayer(roomName, playerId, nickname) {
  const gameState = gameStates.get(roomName);
  if (!gameState) return false;
  
  const player = new PlayerGameData(playerId, nickname, null);
  gameState.players.set(playerId, player);
  return true;
}

function removePlayer(roomName, playerId) {
  const gameState = gameStates.get(roomName);
  if (!gameState) return false;
  
  return gameState.players.delete(playerId);
}

// ============================
// 킬 시스템
// ============================

function processKill(roomName, killerId, targetId) {
  console.log(`[KILL] Processing kill: ${killerId} -> ${targetId} in room: ${roomName}`);
  
  const gameState = gameStates.get(roomName);
  if (!gameState || gameState.phase !== GAME_PHASES.PLAYING) {
    console.log(`[KILL] Invalid game state for kill`);
    return false;
  }
  
  const killer = gameState.players.get(killerId);
  const target = gameState.players.get(targetId);
  
  if (!killer || !target) {
    console.log(`[KILL] Killer or target not found`);
    return false;
  }
  
  // 임포스터만 킬 가능
  if (killer.role.team !== 'impostor') {
    console.log(`[KILL] Killer is not impostor`);
    return false;
  }
  
  // 살아있는 플레이어만 킬 가능
  if (target.state !== PLAYER_STATES.ALIVE) {
    console.log(`[KILL] Target is not alive`);
    return false;
  }
  
  // 킬 쿨다운 확인
  const now = Date.now();
  if (now - killer.lastKillTime < gameState.settings.killCooldown) {
    console.log(`[KILL] Kill cooldown not ready`);
    return false;
  }
  
  // 거리 확인 (간단한 거리 체크)
  const distance = Math.sqrt(
    Math.pow(killer.position.x - target.position.x, 2) + 
    Math.pow(killer.position.y - target.position.y, 2)
  );
  
  if (distance > 50) { // 50픽셀 이내에서만 킬 가능
    console.log(`[KILL] Target too far: ${distance}`);
    return false;
  }
  
  // 킬 실행
  target.state = PLAYER_STATES.DEAD;
  killer.lastKillTime = now;
  
  // 시체 추가
  gameState.corpses.push({
    playerId: targetId,
    position: { ...target.position },
    discoveredBy: null,
    discoveredAt: null
  });
  
  console.log(`[KILL] Kill successful: ${targetId} killed by ${killerId}`);
  return true;
}

// ============================
// 미션 시스템
// ============================

function completeMission(roomName, playerId, missionId) {
  console.log(`[MISSION] Completing mission: ${missionId} by ${playerId} in room: ${roomName}`);
  
  const gameState = gameStates.get(roomName);
  if (!gameState || gameState.phase !== GAME_PHASES.PLAYING) {
    return false;
  }
  
  const player = gameState.players.get(playerId);
  if (!player || player.state !== PLAYER_STATES.ALIVE) {
    return false;
  }
  
  // 크루메이트만 미션 가능
  if (player.role.team !== 'crewmate') {
    return false;
  }
  
  // 이미 완료한 미션인지 확인
  if (player.completedTasks.includes(missionId)) {
    return false;
  }
  
  // 미션 완료 처리
  player.completedTasks.push(missionId);
  gameState.completedTasks++;
  
  console.log(`[MISSION] Mission completed: ${missionId} by ${playerId}`);
  return true;
}

// ============================
// 회의 시스템
// ============================

function startMeeting(roomName, meetingData) {
  console.log(`[MEETING] Starting meeting in room: ${roomName}`);
  
  const gameState = gameStates.get(roomName);
  if (!gameState) return false;
  
  gameState.phase = GAME_PHASES.MEETING;
  gameState.votes.clear();
  gameState.votingResults = null;
  
  // 모든 살아있는 플레이어의 투표 권한 초기화
  Array.from(gameState.players.values()).forEach(player => {
    if (player.state === PLAYER_STATES.ALIVE) {
      player.canVote = true;
      player.votedFor = null;
    }
  });
  
  // 토론 타이머 시작
  startDiscussionTimer(roomName);
  
  return true;
}

function startVoting(roomName) {
  console.log(`[VOTING] Starting voting in room: ${roomName}`);
  
  const gameState = gameStates.get(roomName);
  if (!gameState) return false;
  
  gameState.phase = GAME_PHASES.VOTING;
  
  // 투표 타이머 시작
  startVotingTimer(roomName);
  
  return true;
}

function castVote(roomName, voterId, targetId) {
  console.log(`[VOTE] Casting vote: ${voterId} -> ${targetId} in room: ${roomName}`);
  
  const gameState = gameStates.get(roomName);
  if (!gameState || gameState.phase !== GAME_PHASES.VOTING) {
    return false;
  }
  
  const voter = gameState.players.get(voterId);
  if (!voter || voter.state !== PLAYER_STATES.ALIVE || !voter.canVote) {
    return false;
  }
  
  // 이미 투표했는지 확인
  if (gameState.votes.has(voterId)) {
    return false;
  }
  
  // 투표 처리
  gameState.votes.set(voterId, targetId);
  voter.votedFor = targetId;
  voter.canVote = false;
  
  console.log(`[VOTE] Vote cast: ${voterId} -> ${targetId}`);
  return true;
}

function processVotingResults(roomName) {
  console.log(`[VOTING] Processing voting results in room: ${roomName}`);
  
  const gameState = gameStates.get(roomName);
  if (!gameState) return null;
  
  // 투표 집계
  const voteCount = {};
  let skipVotes = 0;
  
  gameState.votes.forEach((targetId, voterId) => {
    if (targetId === 'skip') {
      skipVotes++;
    } else {
      voteCount[targetId] = (voteCount[targetId] || 0) + 1;
    }
  });
  
  // 최다 득표자 찾기
  let maxVotes = 0;
  let ejectedPlayer = null;
  
  Object.entries(voteCount).forEach(([playerId, votes]) => {
    if (votes > maxVotes) {
      maxVotes = votes;
      ejectedPlayer = playerId;
    }
  });
  
  // 동점 확인
  const tiedPlayers = Object.entries(voteCount).filter(([playerId, votes]) => votes === maxVotes);
  const isTie = tiedPlayers.length > 1;
  
  if (isTie) {
    ejectedPlayer = null; // 동점이면 추방 안됨
  }
  
  // 추방 처리
  if (ejectedPlayer) {
    const player = gameState.players.get(ejectedPlayer);
    if (player) {
      player.state = PLAYER_STATES.DEAD;
      console.log(`[VOTING] Player ejected: ${ejectedPlayer}`);
    }
  }
  
  const results = {
    ejectedPlayer,
    voteCount,
    skipVotes,
    isTie
  };
  
  gameState.votingResults = results;
  
  // 게임 재개
  setTimeout(() => {
    resumeGame(roomName);
  }, 3000);
  
  return results;
}

// ============================
// 승리 조건 확인
// ============================

function checkWinCondition(roomName) {
  const gameState = gameStates.get(roomName);
  if (!gameState || gameState.phase !== GAME_PHASES.PLAYING) {
    return null;
  }
  
  const alivePlayers = Array.from(gameState.players.values())
    .filter(p => p.state === PLAYER_STATES.ALIVE);
  
  const aliveCrewmates = alivePlayers.filter(p => p.role.team === 'crewmate');
  const aliveImpostors = alivePlayers.filter(p => p.role.team === 'impostor');
  
  // 크루메이트 승리 조건: 모든 미션 완료
  if (gameState.completedTasks >= gameState.totalTasks) {
    console.log(`[WIN CONDITION] Crewmates win by completing all tasks`);
    return WIN_CONDITIONS.CREWMATE_TASKS;
  }
  
  // 임포스터 승리 조건: 크루메이트 수 <= 임포스터 수
  if (aliveCrewmates.length <= aliveImpostors.length) {
    console.log(`[WIN CONDITION] Impostors win by killing crewmates`);
    return WIN_CONDITIONS.IMPOSTOR_KILL;
  }
  
  // 임포스터가 모두 죽었으면 크루메이트 승리
  if (aliveImpostors.length === 0) {
    console.log(`[WIN CONDITION] Crewmates win by voting out all impostors`);
    return WIN_CONDITIONS.CREWMATE_VOTE;
  }
  
  return null;
}

// ============================
// 타이머 관리
// ============================

function startGameTimer(roomName) {
  const timers = gameTimers.get(roomName);
  if (!timers) return;
  
  timers.game = setTimeout(() => {
    console.log(`[TIMER] Game time limit reached in room: ${roomName}`);
    const winCondition = checkWinCondition(roomName);
    if (winCondition) {
      endGame(roomName, winCondition);
    }
  }, 600000); // 10분
}

function startDiscussionTimer(roomName) {
  const timers = gameTimers.get(roomName);
  if (!timers) return;
  
  timers.discussion = setTimeout(() => {
    console.log(`[TIMER] Discussion time ended in room: ${roomName}`);
    startVoting(roomName);
  }, 120000); // 2분
}

function startVotingTimer(roomName) {
  const timers = gameTimers.get(roomName);
  if (!timers) return;
  
  timers.voting = setTimeout(() => {
    console.log(`[TIMER] Voting time ended in room: ${roomName}`);
    processVotingResults(roomName);
  }, 30000); // 30초
}

function clearAllTimers(roomName) {
  const timers = gameTimers.get(roomName);
  if (!timers) return;
  
  Object.values(timers).forEach(timer => {
    if (timer) clearTimeout(timer);
  });
  
  Object.keys(timers).forEach(key => {
    timers[key] = null;
  });
}

// ============================
// 게임 상태 조회
// ============================

function getGameState(roomName) {
  return gameStates.get(roomName);
}

function changePhase(roomName, phase) {
  const gameState = gameStates.get(roomName);
  if (!gameState) return false;
  
  gameState.phase = phase;
  return true;
}

function resumeGame(roomName) {
  console.log(`[GAME] Resuming game in room: ${roomName}`);
  
  const gameState = gameStates.get(roomName);
  if (!gameState) return false;
  
  gameState.phase = GAME_PHASES.PLAYING;
  gameState.votes.clear();
  gameState.votingResults = null;
  
  return true;
}

function deleteGame(roomName) {
  console.log(`[GAME STATE] Deleting game for room: ${roomName}`);
  
  clearAllTimers(roomName);
  gameStates.delete(roomName);
  gameTimers.delete(roomName);
}

// ============================
// 유틸리티 함수
// ============================

function getAlivePlayers(roomName) {
  const gameState = gameStates.get(roomName);
  if (!gameState) return [];
  
  return Array.from(gameState.players.values())
    .filter(p => p.state === PLAYER_STATES.ALIVE);
}

function getDeadPlayers(roomName) {
  const gameState = gameStates.get(roomName);
  if (!gameState) return [];
  
  return Array.from(gameState.players.values())
    .filter(p => p.state === PLAYER_STATES.DEAD);
}

function getImpostors(roomName) {
  const gameState = gameStates.get(roomName);
  if (!gameState) return [];
  
  return Array.from(gameState.players.values())
    .filter(p => p.role.team === 'impostor');
}

function getCrewmates(roomName) {
  const gameState = gameStates.get(roomName);
  if (!gameState) return [];
  
  return Array.from(gameState.players.values())
    .filter(p => p.role.team === 'crewmate');
}

// ============================
// 모듈 내보내기
// ============================

module.exports = {
  // 상수
  GAME_PHASES,
  PLAYER_STATES,
  WIN_CONDITIONS,
  
  // 게임 관리
  initializeGame,
  startGame,
  endGame,
  deleteGame,
  
  // 플레이어 관리
  updatePlayerState,
  getPlayerGameData,
  addPlayer,
  removePlayer,
  
  // 게임 액션
  processKill,
  completeMission,
  startMeeting,
  startVoting,
  castVote,
  processVotingResults,
  
  // 승리 조건
  checkWinCondition,
  
  // 게임 상태
  getGameState,
  changePhase,
  resumeGame,
  
  // 유틸리티
  getAlivePlayers,
  getDeadPlayers,
  getImpostors,
  getCrewmates
};