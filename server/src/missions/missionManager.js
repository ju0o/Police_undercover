// [server/src/missions/missionManager.js] - 미션 관리 모듈
// 16+ 미션 정의, 난이도별 분류, 랜덤 배정 시스템

// 미션 타입별 분류
const MISSION_TYPES = {
  REPAIR: 'repair',        // 수리 미션
  SECURITY: 'security',    // 보안 미션
  ANALYSIS: 'analysis',    // 분석 미션
  HACKING: 'hacking',      // 해킹 미션
  COLLECTION: 'collection', // 수집 미션
  MAINTENANCE: 'maintenance' // 정비 미션
};

// 모든 미션 정의 (20개)
const MISSIONS = {
  // === EASY 난이도 미션 (1-7) ===
  cctv_hack: {
    id: 'cctv_hack',
    name: 'CCTV 해킹',
    description: '보안 시스템에 접근하여 CCTV 카메라를 해킹하세요.',
    type: MISSION_TYPES.HACKING,
    difficulty: 'easy',
    estimatedTime: 15, // 초
    location: { x: 120, y: 100, room: 'security' },
    minigame: 'sequence_match',
    steps: 3,
    requiredItems: [],
    rewards: { experience: 10, points: 50 },
    visualEffect: true, // 다른 플레이어가 볼 수 있는지
    soundEffect: 'typing'
  },

  fingerprint_collect: {
    id: 'fingerprint_collect',
    name: '지문 채취',
    description: '현장에서 지문을 채취하고 분석하세요.',
    type: MISSION_TYPES.COLLECTION,
    difficulty: 'easy',
    estimatedTime: 12,
    location: { x: 480, y: 120, room: 'office' },
    minigame: 'precision_click',
    steps: 2,
    requiredItems: [],
    rewards: { experience: 8, points: 40 },
    visualEffect: true,
    soundEffect: 'scan'
  },

  document_analysis: {
    id: 'document_analysis',
    name: '위조 문서 분석',
    description: '의심스러운 문서를 분석하여 위조 여부를 확인하세요.',
    type: MISSION_TYPES.ANALYSIS,
    difficulty: 'easy',
    estimatedTime: 18,
    location: { x: 350, y: 80, room: 'office' },
    minigame: 'pattern_find',
    steps: 4,
    requiredItems: [],
    rewards: { experience: 12, points: 60 },
    visualEffect: false,
    soundEffect: 'paper'
  },

  photo_recovery: {
    id: 'photo_recovery',
    name: '현장사진 복구',
    description: '손상된 사진 파일을 복구하여 증거를 찾으세요.',
    type: MISSION_TYPES.ANALYSIS,
    difficulty: 'easy',
    estimatedTime: 20,
    location: { x: 520, y: 250, room: 'lab' },
    minigame: 'puzzle_solve',
    steps: 5,
    requiredItems: [],
    rewards: { experience: 15, points: 75 },
    visualEffect: false,
    soundEffect: 'computer'
  },

  toolbox_unlock: {
    id: 'toolbox_unlock',
    name: '도구함 잠금 해제',
    description: '잠긴 도구함을 열어 필요한 도구를 확보하세요.',
    type: MISSION_TYPES.REPAIR,
    difficulty: 'easy',
    estimatedTime: 10,
    location: { x: 400, y: 600, room: 'storage' },
    minigame: 'lockpick',
    steps: 3,
    requiredItems: [],
    rewards: { experience: 10, points: 50 },
    visualEffect: true,
    soundEffect: 'mechanical'
  },

  access_log_check: {
    id: 'access_log_check',
    name: '출입 기록 분석',
    description: '출입 기록을 분석하여 수상한 활동을 찾으세요.',
    type: MISSION_TYPES.ANALYSIS,
    difficulty: 'easy',
    estimatedTime: 16,
    location: { x: 180, y: 600, room: 'security' },
    minigame: 'data_sort',
    steps: 4,
    requiredItems: [],
    rewards: { experience: 12, points: 60 },
    visualEffect: false,
    soundEffect: 'typing'
  },

  vehicle_blackbox: {
    id: 'vehicle_blackbox',
    name: '차량 블랙박스 회수',
    description: '차량에서 블랙박스를 회수하고 데이터를 추출하세요.',
    type: MISSION_TYPES.COLLECTION,
    difficulty: 'easy',
    estimatedTime: 14,
    location: { x: 80, y: 220, room: 'garage' },
    minigame: 'wire_connect',
    steps: 3,
    requiredItems: [],
    rewards: { experience: 11, points: 55 },
    visualEffect: true,
    soundEffect: 'electronic'
  },

  // === NORMAL 난이도 미션 (8-14) ===
  safe_crack: {
    id: 'safe_crack',
    name: '금고 해킹',
    description: '고급 금고의 보안을 뚫고 내용물을 확인하세요.',
    type: MISSION_TYPES.HACKING,
    difficulty: 'normal',
    estimatedTime: 25,
    location: { x: 140, y: 520, room: 'office' },
    minigame: 'combination_lock',
    steps: 6,
    requiredItems: [],
    rewards: { experience: 20, points: 100 },
    visualEffect: true,
    soundEffect: 'safe'
  },

  bug_install: {
    id: 'bug_install',
    name: '도청장치 설치',
    description: '지정된 위치에 도청장치를 은밀하게 설치하세요.',
    type: MISSION_TYPES.SECURITY,
    difficulty: 'normal',
    estimatedTime: 22,
    location: { x: 500, y: 480, room: 'office' },
    minigame: 'stealth_install',
    steps: 5,
    requiredItems: ['bug_device'],
    rewards: { experience: 18, points: 90 },
    visualEffect: false,
    soundEffect: 'quiet'
  },

  secret_door: {
    id: 'secret_door',
    name: '지하실 비밀문 열기',
    description: '숨겨진 메커니즘을 해독하여 비밀문을 여세요.',
    type: MISSION_TYPES.REPAIR,
    difficulty: 'normal',
    estimatedTime: 30,
    location: { x: 80, y: 400, room: 'basement' },
    minigame: 'mechanism_solve',
    steps: 8,
    requiredItems: [],
    rewards: { experience: 25, points: 125 },
    visualEffect: true,
    soundEffect: 'mechanical'
  },

  laptop_hack: {
    id: 'laptop_hack',
    name: '노트북 해킹',
    description: '암호화된 노트북에 침투하여 데이터를 획득하세요.',
    type: MISSION_TYPES.HACKING,
    difficulty: 'normal',
    estimatedTime: 28,
    location: { x: 360, y: 560, room: 'office' },
    minigame: 'password_crack',
    steps: 7,
    requiredItems: [],
    rewards: { experience: 22, points: 110 },
    visualEffect: false,
    soundEffect: 'typing'
  },

  blood_pattern: {
    id: 'blood_pattern',
    name: '혈흔 패턴 분석',
    description: '현장의 혈흔 패턴을 분석하여 사건을 재구성하세요.',
    type: MISSION_TYPES.ANALYSIS,
    difficulty: 'normal',
    estimatedTime: 35,
    location: { x: 300, y: 320, room: 'lab' },
    minigame: 'pattern_analysis',
    steps: 9,
    requiredItems: ['analysis_kit'],
    rewards: { experience: 28, points: 140 },
    visualEffect: false,
    soundEffect: 'science'
  },

  storage_search: {
    id: 'storage_search',
    name: '지하창고 수색',
    description: '지하창고를 체계적으로 수색하여 숨겨진 증거를 찾으세요.',
    type: MISSION_TYPES.COLLECTION,
    difficulty: 'normal',
    estimatedTime: 32,
    location: { x: 170, y: 180, room: 'storage' },
    minigame: 'methodical_search',
    steps: 8,
    requiredItems: [],
    rewards: { experience: 24, points: 120 },
    visualEffect: true,
    soundEffect: 'search'
  },

  phone_forensics: {
    id: 'phone_forensics',
    name: '휴대폰 포렌식',
    description: '휴대폰에서 삭제된 데이터를 복구하고 분석하세요.',
    type: MISSION_TYPES.ANALYSIS,
    difficulty: 'normal',
    estimatedTime: 26,
    location: { x: 600, y: 320, room: 'lab' },
    minigame: 'data_recovery',
    steps: 6,
    requiredItems: ['forensic_tools'],
    rewards: { experience: 20, points: 100 },
    visualEffect: false,
    soundEffect: 'electronic'
  },

  // === HARD 난이도 미션 (15-18) ===
  server_reset: {
    id: 'server_reset',
    name: 'CCTV 서버 리셋',
    description: '복잡한 서버 시스템을 안전하게 리셋하고 재구성하세요.',
    type: MISSION_TYPES.MAINTENANCE,
    difficulty: 'hard',
    estimatedTime: 45,
    location: { x: 570, y: 600, room: 'server' },
    minigame: 'server_management',
    steps: 12,
    requiredItems: ['admin_access'],
    rewards: { experience: 35, points: 175 },
    visualEffect: true,
    soundEffect: 'server'
  },

  bug_tracker: {
    id: 'bug_tracker',
    name: '도청장치 위치 추적',
    description: '고급 탐지 장비를 사용하여 숨겨진 도청장치를 찾으세요.',
    type: MISSION_TYPES.SECURITY,
    difficulty: 'hard',
    estimatedTime: 40,
    location: { x: 600, y: 520, room: 'security' },
    minigame: 'signal_tracking',
    steps: 10,
    requiredItems: ['detection_device'],
    rewards: { experience: 32, points: 160 },
    visualEffect: false,
    soundEffect: 'radar'
  },

  evidence_reconstruction: {
    id: 'evidence_reconstruction',
    name: '증거 재구성',
    description: '파편화된 증거들을 종합하여 사건의 전체 그림을 재구성하세요.',
    type: MISSION_TYPES.ANALYSIS,
    difficulty: 'hard',
    estimatedTime: 50,
    location: { x: 250, y: 450, room: 'lab' },
    minigame: 'evidence_puzzle',
    steps: 15,
    requiredItems: ['evidence_kit'],
    rewards: { experience: 40, points: 200 },
    visualEffect: false,
    soundEffect: 'thinking'
  },

  network_infiltration: {
    id: 'network_infiltration',
    name: '네트워크 침투',
    description: '다층 보안 네트워크에 침투하여 핵심 정보를 획득하세요.',
    type: MISSION_TYPES.HACKING,
    difficulty: 'hard',
    estimatedTime: 55,
    location: { x: 450, y: 350, room: 'server' },
    minigame: 'network_hack',
    steps: 18,
    requiredItems: ['hacking_tools'],
    rewards: { experience: 45, points: 225 },
    visualEffect: false,
    soundEffect: 'network'
  },

  // === EXPERT 난이도 미션 (19-20) ===
  master_lock_system: {
    id: 'master_lock_system',
    name: '마스터 락 시스템 해제',
    description: '최고 보안 등급의 마스터 락 시스템을 해제하세요.',
    type: MISSION_TYPES.HACKING,
    difficulty: 'expert',
    estimatedTime: 70,
    location: { x: 300, y: 200, room: 'vault' },
    minigame: 'master_lock',
    steps: 25,
    requiredItems: ['master_key', 'security_bypass'],
    rewards: { experience: 60, points: 300 },
    visualEffect: true,
    soundEffect: 'security'
  },

  quantum_analysis: {
    id: 'quantum_analysis',
    name: '양자 암호 분석',
    description: '최첨단 양자 암호화를 해독하여 기밀 정보에 접근하세요.',
    type: MISSION_TYPES.ANALYSIS,
    difficulty: 'expert',
    estimatedTime: 80,
    location: { x: 500, y: 150, room: 'lab' },
    minigame: 'quantum_decrypt',
    steps: 30,
    requiredItems: ['quantum_computer', 'crypto_keys'],
    rewards: { experience: 70, points: 350 },
    visualEffect: false,
    soundEffect: 'quantum'
  }
};

// 플레이어별 미션 진행 상태
const playerMissions = new Map(); // playerId -> assigned missions
const missionProgress = new Map(); // playerId -> mission progress
const completedMissions = new Map(); // roomName -> completed missions

// 미션 배정 함수
function assignMissions(players, roomOptions) {
  try {
    const missionsPerPlayer = roomOptions.missionsPerPlayer || 5;
    const difficulty = roomOptions.missionDifficulty || 'normal';
    const playerMissions = {};

    // 난이도별 미션 필터링
    const availableMissions = filterMissionsByDifficulty(difficulty);
    
    if (availableMissions.length < missionsPerPlayer) {
      console.error('Not enough missions available for difficulty:', difficulty);
      return null;
    }

    players.forEach(player => {
      if (player.role && player.role.team === 'crewmate') {
        // 크루메이트는 실제 미션 수행
        const assignedMissions = selectRandomMissions(availableMissions, missionsPerPlayer);
        playerMissions[player.id] = assignedMissions.map(mission => ({
          ...mission,
          status: 'assigned', // assigned, in_progress, completed, failed
          assignedAt: Date.now(),
          attempts: 0,
          maxAttempts: 3
        }));
      } else {
        // 임포스터나 다른 역할은 가짜 미션 또는 특수 미션
        const fakeMissions = generateFakeMissions(missionsPerPlayer);
        playerMissions[player.id] = fakeMissions;
      }
    });

    console.log(`[${new Date().toISOString()}] Missions assigned to ${players.length} players`);
    return playerMissions;

  } catch (error) {
    console.error('Error assigning missions:', error);
    return null;
  }
}

// 난이도별 미션 필터링
function filterMissionsByDifficulty(targetDifficulty) {
  const allMissions = Object.values(MISSIONS);
  const difficultyLevels = ['easy', 'normal', 'hard', 'expert'];
  const targetIndex = difficultyLevels.indexOf(targetDifficulty);
  
  if (targetIndex === -1) {
    return allMissions.filter(m => m.difficulty === 'normal');
  }

  // 타겟 난이도와 그 이하 난이도 미션 포함
  const allowedDifficulties = difficultyLevels.slice(0, targetIndex + 1);
  return allMissions.filter(m => allowedDifficulties.includes(m.difficulty));
}

// 랜덤 미션 선택
function selectRandomMissions(availableMissions, count) {
  const shuffled = [...availableMissions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 가짜 미션 생성 (임포스터용)
function generateFakeMissions(count) {
  const fakeMissionTemplates = [
    { name: '시스템 점검', type: 'maintenance', estimatedTime: 15 },
    { name: '보안 확인', type: 'security', estimatedTime: 20 },
    { name: '데이터 백업', type: 'maintenance', estimatedTime: 18 },
    { name: '장비 정비', type: 'repair', estimatedTime: 12 },
    { name: '로그 정리', type: 'maintenance', estimatedTime: 16 }
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = fakeMissionTemplates[i % fakeMissionTemplates.length];
    return {
      id: `fake_${i}_${Date.now()}`,
      ...template,
      isFake: true,
      status: 'assigned',
      assignedAt: Date.now()
    };
  });
}

// 미션 시작 가능 여부 확인
function canStartMission(playerId, missionId, playerPosition) {
  try {
    const mission = MISSIONS[missionId];
    if (!mission) {
      return { allowed: false, reason: 'Mission not found' };
    }

    // 위치 확인 (거리 체크)
    const distance = calculateDistance(playerPosition, mission.location);
    if (distance > 50) { // 50픽셀 이내
      return { allowed: false, reason: 'Too far from mission location' };
    }

    // 필요 아이템 확인
    if (mission.requiredItems && mission.requiredItems.length > 0) {
      // 실제 게임에서는 플레이어 인벤토리 확인
      // 여기서는 간단히 통과
    }

    return { allowed: true };

  } catch (error) {
    console.error('Error checking mission start:', error);
    return { allowed: false, reason: 'Server error' };
  }
}

// 미션 완료 처리
function completeMission(playerId, missionId, result) {
  try {
    const mission = MISSIONS[missionId];
    if (!mission) {
      return false;
    }

    // 미션 완료 기록
    if (!completedMissions.has(playerId)) {
      completedMissions.set(playerId, []);
    }

    const completedList = completedMissions.get(playerId);
    const alreadyCompleted = completedList.find(c => c.missionId === missionId);
    
    if (alreadyCompleted) {
      return false; // 이미 완료된 미션
    }

    // 완료 기록 추가
    completedList.push({
      missionId,
      completedAt: Date.now(),
      score: result.score || 0,
      attempts: result.attempts || 1,
      timeTaken: result.timeTaken || mission.estimatedTime
    });

    console.log(`[${new Date().toISOString()}] Mission completed: ${playerId} -> ${missionId}`);
    return true;

  } catch (error) {
    console.error('Error completing mission:', error);
    return false;
  }
}

// 미션 정보 조회
function getMission(missionId) {
  return MISSIONS[missionId] || null;
}

// 모든 미션 목록 조회
function getMissions() {
  return Object.values(MISSIONS);
}

// 난이도별 미션 조회
function getMissionsByDifficulty(difficulty) {
  return Object.values(MISSIONS).filter(m => m.difficulty === difficulty);
}

// 타입별 미션 조회
function getMissionsByType(type) {
  return Object.values(MISSIONS).filter(m => m.type === type);
}

// 플레이어 미션 진행률 조회
function getPlayerMissionProgress(playerId) {
  return {
    assigned: playerMissions.get(playerId) || [],
    progress: missionProgress.get(playerId) || {},
    completed: completedMissions.get(playerId) || []
  };
}

// 방 전체 미션 진행률 조회
function getRoomMissionProgress(roomName, players) {
  let totalMissions = 0;
  let completedCount = 0;

  players.forEach(player => {
    const playerProgress = getPlayerMissionProgress(player.id);
    totalMissions += playerProgress.assigned.length;
    completedCount += playerProgress.completed.length;
  });

  return {
    total: totalMissions,
    completed: completedCount,
    percentage: totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0
  };
}

// 미션 힌트 생성
function generateMissionHint(missionId, difficulty = 'normal') {
  const mission = MISSIONS[missionId];
  if (!mission) return null;

  const hints = {
    easy: `이 미션은 ${mission.location.room}에서 수행할 수 있습니다.`,
    normal: `${mission.estimatedTime}초 정도 소요되는 ${mission.type} 미션입니다.`,
    hard: `${mission.steps}단계로 구성된 복잡한 미션입니다.`,
    expert: `최고 난이도의 미션으로 특별한 도구가 필요할 수 있습니다.`
  };

  return hints[difficulty] || hints.normal;
}

// 거리 계산 헬퍼 함수
function calculateDistance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// 미션 시스템 리셋 (게임 종료 후)
function resetMissions() {
  playerMissions.clear();
  missionProgress.clear();
  completedMissions.clear();
}

// 방별 미션 리셋
function resetRoomMissions(roomName) {
  // 해당 방의 플레이어들 미션 상태만 리셋
  // 실제 구현시에는 roomName과 연결된 플레이어 ID 목록 필요
}

// 미션 난이도 통계
function getMissionDifficultyStats() {
  const stats = { easy: 0, normal: 0, hard: 0, expert: 0 };
  
  Object.values(MISSIONS).forEach(mission => {
    stats[mission.difficulty]++;
  });

  return stats;
}

// 미션 완료 시간 분석
function analyzeMissionCompletionTimes(playerId) {
  const completed = completedMissions.get(playerId) || [];
  
  if (completed.length === 0) {
    return { average: 0, fastest: 0, slowest: 0 };
  }

  const times = completed.map(c => c.timeTaken);
  return {
    average: times.reduce((sum, time) => sum + time, 0) / times.length,
    fastest: Math.min(...times),
    slowest: Math.max(...times)
  };
}

module.exports = {
  MISSIONS,
  MISSION_TYPES,
  assignMissions,
  canStartMission,
  completeMission,
  getMission,
  getMissions,
  getMissionsByDifficulty,
  getMissionsByType,
  getPlayerMissionProgress,
  getRoomMissionProgress,
  generateMissionHint,
  resetMissions,
  resetRoomMissions,
  getMissionDifficultyStats,
  analyzeMissionCompletionTimes
};