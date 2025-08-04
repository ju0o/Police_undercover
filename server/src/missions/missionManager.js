// [server/src/missions/missionManager.js] - 완전한 미션 관리 시스템
// 다양한 미니게임과 미션 진행도를 관리하는 통합 시스템

// ============================
// 미션 상수 및 설정
// ============================

const MISSION_TYPES = {
  SEQUENCE: 'sequence',    // 순서 맞추기
  PROGRESS: 'progress',    // 진행률 채우기
  SWITCH: 'switch',        // 스위치 조작
  CLICK: 'click',          // 클릭 미션
  SWIPE: 'swipe',          // 스와이프
  PUZZLE: 'puzzle',        // 퍼즐
  MEMORY: 'memory',        // 기억력 게임
  REACTION: 'reaction'     // 반응 속도
};

const MISSION_DIFFICULTY = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
  EXPERT: 'expert'
};

// ============================
// 미션 데이터베이스
// ============================

const MISSION_DATABASE = {
  // 전선 연결 미션
  electrical_wires: {
    id: 'electrical_wires',
    name: '전선 연결',
    type: MISSION_TYPES.SEQUENCE,
    difficulty: MISSION_DIFFICULTY.NORMAL,
    description: '전선을 올바른 순서로 연결하세요',
    location: 'electrical',
    timeLimit: 30000,
    requiredSteps: 4,
    config: {
      wireCount: 4,
      colors: ['red', 'blue', 'green', 'yellow'],
      sequence: ['red', 'blue', 'green', 'yellow']
    }
  },

  // 엔진 연료 주입
  fuel_engine: {
    id: 'fuel_engine',
    name: '엔진 연료 주입',
    type: MISSION_TYPES.PROGRESS,
    difficulty: MISSION_DIFFICULTY.EASY,
    description: '연료 게이지를 100%까지 채우세요',
    location: 'engine',
    timeLimit: 20000,
    requiredSteps: 10,
    config: {
      targetProgress: 100,
      incrementPerClick: 10,
      maxClicks: 10
    }
  },

  // 조명 수리
  fix_lights: {
    id: 'fix_lights',
    name: '조명 수리',
    type: MISSION_TYPES.SWITCH,
    difficulty: MISSION_DIFFICULTY.EASY,
    description: '모든 스위치를 올바른 상태로 설정하세요',
    location: 'electrical',
    timeLimit: 25000,
    requiredSteps: 3,
    config: {
      switchCount: 3,
      targetStates: [true, false, true],
      labels: ['메인 조명', '비상 조명', '경고등']
    }
  },

  // 소행성 제거
  clear_asteroids: {
    id: 'clear_asteroids',
    name: '소행성 제거',
    type: MISSION_TYPES.CLICK,
    difficulty: MISSION_DIFFICULTY.NORMAL,
    description: '화면에 나타나는 소행성들을 클릭하여 제거하세요',
    location: 'navigation',
    timeLimit: 15000,
    requiredSteps: 8,
    config: {
      asteroidCount: 8,
      spawnInterval: 800,
      clickRadius: 30
    }
  },

  // 카드 인증
  swipe_card: {
    id: 'swipe_card',
    name: '카드 인증',
    type: MISSION_TYPES.SWIPE,
    difficulty: MISSION_DIFFICULTY.NORMAL,
    description: '카드를 올바른 방향으로 스와이프하세요',
    location: 'admin',
    timeLimit: 20000,
    requiredSteps: 1,
    config: {
      swipeDirection: 'right',
      minSwipeDistance: 100,
      swipeSpeed: 500
    }
  },

  // 보안 코드 입력
  security_code: {
    id: 'security_code',
    name: '보안 코드 입력',
    type: MISSION_TYPES.SEQUENCE,
    difficulty: MISSION_DIFFICULTY.HARD,
    description: '4자리 보안 코드를 순서대로 입력하세요',
    location: 'admin',
    timeLimit: 30000,
    requiredSteps: 4,
    config: {
      codeLength: 4,
      code: [1, 3, 2, 4],
      maxAttempts: 3
    }
  },

  // 반응 속도 테스트
  reaction_test: {
    id: 'reaction_test',
    name: '반응 속도 테스트',
    type: MISSION_TYPES.REACTION,
    difficulty: MISSION_DIFFICULTY.HARD,
    description: '빨간색이 나타나면 즉시 클릭하세요',
    location: 'medbay',
    timeLimit: 20000,
    requiredSteps: 5,
    config: {
      targetCount: 5,
      minDelay: 1000,
      maxDelay: 3000,
      clickWindow: 1000
    }
  },

  // 기억력 게임
  memory_game: {
    id: 'memory_game',
    name: '기억력 게임',
    type: MISSION_TYPES.MEMORY,
    difficulty: MISSION_DIFFICULTY.EXPERT,
    description: '순서를 기억하여 동일한 순서로 클릭하세요',
    location: 'medbay',
    timeLimit: 45000,
    requiredSteps: 5,
    config: {
      sequenceLength: 5,
      displayTime: 1000,
      inputTime: 10000
    }
  }
};

// ============================
// 미션 진행 상태 관리
// ============================

const missionProgress = new Map(); // roomName -> Map(playerId -> missionData)

// ============================
// 미션 관리 함수
// ============================

function getMissionData(missionId) {
  return MISSION_DATABASE[missionId] || null;
}

function getAllMissions() {
  return Object.values(MISSION_DATABASE);
}

function getMissionsByDifficulty(difficulty) {
  return Object.values(MISSION_DATABASE).filter(mission => mission.difficulty === difficulty);
}

function getMissionsByType(type) {
  return Object.values(MISSION_DATABASE).filter(mission => mission.type === type);
}

function getRandomMission(difficulty = null) {
  let missions = getAllMissions();
  
  if (difficulty) {
    missions = missions.filter(mission => mission.difficulty === difficulty);
  }
  
  if (missions.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * missions.length);
  return missions[randomIndex];
}

// ============================
// 미션 진행 관리
// ============================

function startMission(roomName, playerId, missionId) {
  console.log(`[MISSION] Starting mission: ${missionId} for player: ${playerId} in room: ${roomName}`);
  
  const missionData = getMissionData(missionId);
  if (!missionData) {
    console.error(`[MISSION] Mission not found: ${missionId}`);
    return null;
  }
  
  // 진행 상태 초기화
  if (!missionProgress.has(roomName)) {
    missionProgress.set(roomName, new Map());
  }
  
  const roomProgress = missionProgress.get(roomName);
  const playerProgress = roomProgress.get(playerId) || {};
  
  // 미션별 초기 상태 설정
  const missionState = createMissionState(missionData);
  
  playerProgress[missionId] = {
    ...missionData,
    state: missionState,
    startTime: Date.now(),
    attempts: 0,
    completed: false
  };
  
  roomProgress.set(playerId, playerProgress);
  
  console.log(`[MISSION] Mission started: ${missionId} for player: ${playerId}`);
    return {
    ...missionData,
    state: missionState
  };
}

function updateMissionProgress(roomName, playerId, missionId, updateData) {
  console.log(`[MISSION] Updating progress for mission: ${missionId}, player: ${playerId}`);
  
  const roomProgress = missionProgress.get(roomName);
  if (!roomProgress) return false;
  
  const playerProgress = roomProgress.get(playerId);
  if (!playerProgress || !playerProgress[missionId]) return false;
  
  const mission = playerProgress[missionId];
  
  // 상태 업데이트
  Object.assign(mission.state, updateData);
  
  // 완료 조건 확인
  if (checkMissionCompletion(mission)) {
    mission.completed = true;
    mission.completionTime = Date.now();
    console.log(`[MISSION] Mission completed: ${missionId} by player: ${playerId}`);
  }
  
  return true;
}

function completeMission(roomName, playerId, missionId) {
  console.log(`[MISSION] Completing mission: ${missionId} for player: ${playerId} in room: ${roomName}`);
  
  const roomProgress = missionProgress.get(roomName);
  if (!roomProgress) return false;
  
  const playerProgress = roomProgress.get(playerId);
  if (!playerProgress || !playerProgress[missionId]) return false;
  
  const mission = playerProgress[missionId];
  
  if (!mission.completed) {
    console.error(`[MISSION] Mission not completed: ${missionId}`);
      return false;
    }

  // 완료된 미션 제거
  delete playerProgress[missionId];
  
  return true;
}

function getMissionProgress(roomName, playerId, missionId) {
  const roomProgress = missionProgress.get(roomName);
  if (!roomProgress) return null;
  
  const playerProgress = roomProgress.get(playerId);
  if (!playerProgress) return null;
  
  return playerProgress[missionId] || null;
}

function getPlayerMissions(roomName, playerId) {
  const roomProgress = missionProgress.get(roomName);
  if (!roomProgress) return [];
  
  const playerProgress = roomProgress.get(playerId);
  if (!playerProgress) return [];
  
  return Object.values(playerProgress);
}

// ============================
// 미션별 상태 생성
// ============================

function createMissionState(missionData) {
  switch (missionData.type) {
    case MISSION_TYPES.SEQUENCE:
      return createSequenceState(missionData);
    case MISSION_TYPES.PROGRESS:
      return createProgressState(missionData);
    case MISSION_TYPES.SWITCH:
      return createSwitchState(missionData);
    case MISSION_TYPES.CLICK:
      return createClickState(missionData);
    case MISSION_TYPES.SWIPE:
      return createSwipeState(missionData);
    case MISSION_TYPES.REACTION:
      return createReactionState(missionData);
    case MISSION_TYPES.MEMORY:
      return createMemoryState(missionData);
    default:
      return {};
  }
}

function createSequenceState(missionData) {
  const config = missionData.config;
  return {
    currentStep: 0,
    sequence: [...config.sequence],
    userInput: [],
    correct: 0,
    wrong: 0
  };
}

function createProgressState(missionData) {
  const config = missionData.config;
  return {
    progress: 0,
    clicks: 0,
    maxClicks: config.maxClicks
  };
}

function createSwitchState(missionData) {
  const config = missionData.config;
  return {
    switches: new Array(config.switchCount).fill(false),
    targetStates: [...config.targetStates],
    correct: 0
  };
}

function createClickState(missionData) {
  const config = missionData.config;
  return {
    asteroids: [],
    clicked: 0,
    total: config.asteroidCount,
    lastSpawnTime: 0
  };
}

function createSwipeState(missionData) {
  const config = missionData.config;
  return {
    swipeStart: null,
    swipeEnd: null,
    swipeDistance: 0,
    swipeDirection: null,
    swipeSpeed: 0
  };
}

function createReactionState(missionData) {
  const config = missionData.config;
  return {
    targets: [],
    clicked: 0,
    total: config.targetCount,
    lastTargetTime: 0,
    reactionTimes: []
  };
}

function createMemoryState(missionData) {
  const config = missionData.config;
  return {
    sequence: generateRandomSequence(config.sequenceLength),
    userInput: [],
    currentStep: 0,
    displayMode: true,
    displayIndex: 0
  };
}

// ============================
// 미션 완료 조건 확인
// ============================

function checkMissionCompletion(mission) {
  const missionData = mission;
  
  switch (missionData.type) {
    case MISSION_TYPES.SEQUENCE:
      return checkSequenceCompletion(mission);
    case MISSION_TYPES.PROGRESS:
      return checkProgressCompletion(mission);
    case MISSION_TYPES.SWITCH:
      return checkSwitchCompletion(mission);
    case MISSION_TYPES.CLICK:
      return checkClickCompletion(mission);
    case MISSION_TYPES.SWIPE:
      return checkSwipeCompletion(mission);
    case MISSION_TYPES.REACTION:
      return checkReactionCompletion(mission);
    case MISSION_TYPES.MEMORY:
      return checkMemoryCompletion(mission);
    default:
      return false;
  }
}

function checkSequenceCompletion(mission) {
  const state = mission.state;
  return state.currentStep >= state.sequence.length;
}

function checkProgressCompletion(mission) {
  const state = mission.state;
  const config = mission.config;
  return state.progress >= config.targetProgress;
}

function checkSwitchCompletion(mission) {
  const state = mission.state;
  const config = mission.config;
  
  for (let i = 0; i < config.switchCount; i++) {
    if (state.switches[i] !== config.targetStates[i]) {
      return false;
    }
  }
  return true;
}

function checkClickCompletion(mission) {
  const state = mission.state;
  return state.clicked >= state.total;
}

function checkSwipeCompletion(mission) {
  const state = mission.state;
  const config = mission.config;
  
  return state.swipeDistance >= config.minSwipeDistance &&
         state.swipeDirection === config.swipeDirection &&
         state.swipeSpeed <= config.swipeSpeed;
}

function checkReactionCompletion(mission) {
  const state = mission.state;
  return state.clicked >= state.total;
}

function checkMemoryCompletion(mission) {
  const state = mission.state;
  const config = mission.config;
  
  if (state.userInput.length !== config.sequenceLength) {
    return false;
  }
  
  for (let i = 0; i < config.sequenceLength; i++) {
    if (state.userInput[i] !== state.sequence[i]) {
      return false;
    }
  }
  return true;
}

// ============================
// 유틸리티 함수
// ============================

function generateRandomSequence(length) {
  const sequence = [];
  for (let i = 0; i < length; i++) {
    sequence.push(Math.floor(Math.random() * 4) + 1); // 1-4
  }
  return sequence;
}

function calculateAccuracy(mission) {
  const state = mission.state;
  
  switch (mission.type) {
    case MISSION_TYPES.SEQUENCE:
      return state.correct / (state.correct + state.wrong) * 100;
    case MISSION_TYPES.REACTION:
      if (state.reactionTimes.length === 0) return 0;
      const avgTime = state.reactionTimes.reduce((a, b) => a + b, 0) / state.reactionTimes.length;
      return Math.max(0, 100 - avgTime / 10); // 반응 시간이 빠를수록 높은 점수
    default:
      return 100; // 다른 미션들은 완료하면 100% 정확도
  }
}

function getMissionResult(mission) {
  if (!mission.completed) {
    return {
      success: false,
      message: 'Mission not completed'
    };
  }
  
  const accuracy = calculateAccuracy(mission);
  const timeSpent = mission.completionTime - mission.startTime;
  
  return {
    success: true,
    accuracy: Math.round(accuracy),
    timeSpent,
    attempts: mission.attempts
  };
}

// ============================
// 미션 정리
// ============================

function clearMissionProgress(roomName) {
  console.log(`[MISSION] Clearing mission progress for room: ${roomName}`);
  missionProgress.delete(roomName);
}

function clearPlayerMissions(roomName, playerId) {
  console.log(`[MISSION] Clearing missions for player: ${playerId} in room: ${roomName}`);
  
  const roomProgress = missionProgress.get(roomName);
  if (roomProgress) {
    roomProgress.delete(playerId);
  }
}

// ============================
// 모듈 내보내기
// ============================

module.exports = {
  // 상수
  MISSION_TYPES,
  MISSION_DIFFICULTY,
  
  // 미션 데이터
  MISSION_DATABASE,
  getMissionData,
  getAllMissions,
  getMissionsByDifficulty,
  getMissionsByType,
  getRandomMission,
  
  // 미션 진행 관리
  startMission,
  updateMissionProgress,
  completeMission,
  getMissionProgress,
  getPlayerMissions,
  
  // 완료 조건
  checkMissionCompletion,
  
  // 결과 처리
  calculateAccuracy,
  getMissionResult,
  
  // 정리
  clearMissionProgress,
  clearPlayerMissions
};