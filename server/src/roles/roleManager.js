// [server/src/roles/roleManager.js] - 역할/직업 관리 모듈
// 다양한 역할 정의 및 자동 배정 시스템

// 모든 역할 정의
const ROLES = {
  // === 크루메이트 팀 ===
  crewmate: {
    id: 'crewmate',
    name: '크루메이트',
    team: 'crewmate',
    description: '미션을 완료하여 우주선을 수리하고 임포스터를 찾아내세요.',
    color: '#42a5f5',
    abilities: ['complete_missions', 'call_emergency', 'vote'],
    canKill: false,
    canSabotage: false,
    canVent: false,
    visionRange: 1.0,
    priority: 1 // 배정 우선순위 (낮을수록 우선)
  },

  detective: {
    id: 'detective',
    name: '탐정',
    team: 'crewmate',
    description: '향상된 관찰력으로 시체의 정보를 더 자세히 볼 수 있습니다.',
    color: '#4caf50',
    abilities: ['complete_missions', 'call_emergency', 'vote', 'investigate_corpse'],
    canKill: false,
    canSabotage: false,
    canVent: false,
    visionRange: 1.25,
    priority: 2
  },

  police: {
    id: 'police',
    name: '경찰',
    team: 'crewmate',
    description: '플레이어를 체포할 수 있지만, 무고한 시민을 체포하면 즉시 사망합니다.',
    color: '#2196f3',
    abilities: ['complete_missions', 'call_emergency', 'vote', 'arrest_player'],
    canKill: false, // 체포 능력은 별도 처리
    canSabotage: false,
    canVent: false,
    visionRange: 1.1,
    priority: 3
  },

  scientist: {
    id: 'scientist',
    name: '과학자',
    team: 'crewmate',
    description: '사망 시간과 위치를 분석할 수 있는 특수 장비를 보유하고 있습니다.',
    color: '#9c27b0',
    abilities: ['complete_missions', 'call_emergency', 'vote', 'analyze_corpse'],
    canKill: false,
    canSabotage: false,
    canVent: false,
    visionRange: 1.0,
    priority: 4
  },

  medic: {
    id: 'medic',
    name: '의무관',
    team: 'crewmate',
    description: '한 명의 플레이어에게 보호막을 씌워 한 번의 공격을 막을 수 있습니다.',
    color: '#4caf50',
    abilities: ['complete_missions', 'call_emergency', 'vote', 'shield_player'],
    canKill: false,
    canSabotage: false,
    canVent: false,
    visionRange: 1.0,
    priority: 5
  },

  // === 임포스터 팀 ===
  impostor: {
    id: 'impostor',
    name: '임포스터',
    team: 'impostor',
    description: '크루메이트들을 제거하고 우주선을 파괴하세요.',
    color: '#f44336',
    abilities: ['fake_missions', 'call_emergency', 'vote', 'kill_player', 'sabotage', 'use_vents'],
    canKill: true,
    canSabotage: true,
    canVent: true,
    visionRange: 1.5,
    priority: 1
  },

  shapeshifter: {
    id: 'shapeshifter',
    name: '변신술사',
    team: 'impostor',
    description: '다른 플레이어의 모습으로 변신할 수 있습니다.',
    color: '#e91e63',
    abilities: ['fake_missions', 'call_emergency', 'vote', 'kill_player', 'sabotage', 'use_vents', 'shapeshift'],
    canKill: true,
    canSabotage: true,
    canVent: true,
    visionRange: 1.25,
    priority: 2
  },

  // === 중립 팀 ===
  organization: {
    id: 'organization',
    name: '조직원',
    team: 'neutral',
    description: '자신만의 목표를 달성해야 합니다. 마지막까지 생존하세요.',
    color: '#ff9800',
    abilities: ['complete_missions', 'call_emergency', 'vote', 'special_mission'],
    canKill: false,
    canSabotage: false,
    canVent: false,
    visionRange: 1.0,
    winCondition: 'survive_to_end',
    priority: 6
  },

  audit_team: {
    id: 'audit_team',
    name: '감사팀',
    team: 'neutral',
    description: '모든 플레이어의 행동을 감시하고 보고서를 작성하세요.',
    color: '#795548',
    abilities: ['complete_missions', 'call_emergency', 'vote', 'monitor_players'],
    canKill: false,
    canSabotage: false,
    canVent: false,
    visionRange: 1.2,
    winCondition: 'complete_audit',
    priority: 7
  },

  jester: {
    id: 'jester',
    name: '광대',
    team: 'neutral',
    description: '투표로 추방되면 승리합니다. 교묘하게 의심을 받으세요.',
    color: '#e91e63',
    abilities: ['fake_missions', 'call_emergency', 'vote'],
    canKill: false,
    canSabotage: false,
    canVent: false,
    visionRange: 1.0,
    winCondition: 'get_voted_out',
    priority: 8
  },

  survivor: {
    id: 'survivor',
    name: '생존자',
    team: 'neutral',
    description: '게임이 끝날 때까지 생존하기만 하면 승리합니다.',
    color: '#607d8b',
    abilities: ['complete_missions', 'call_emergency', 'vote', 'self_protect'],
    canKill: false,
    canSabotage: false,
    canVent: false,
    visionRange: 1.0,
    winCondition: 'survive_game_end',
    priority: 9
  }
};

// 역할별 능력 상세 정의
const ABILITIES = {
  // === 기본 능력 ===
  complete_missions: {
    name: '미션 수행',
    description: '우주선 수리를 위한 미션을 수행할 수 있습니다.',
    cooldown: 0
  },

  fake_missions: {
    name: '가짜 미션',
    description: '미션을 수행하는 척 할 수 있습니다.',
    cooldown: 0
  },

  call_emergency: {
    name: '긴급 회의',
    description: '긴급 회의를 소집할 수 있습니다.',
    cooldown: 0,
    usesPerGame: 1
  },

  vote: {
    name: '투표',
    description: '회의에서 투표할 수 있습니다.',
    cooldown: 0
  },

  // === 임포스터 능력 ===
  kill_player: {
    name: '킬',
    description: '다른 플레이어를 제거할 수 있습니다.',
    cooldown: 30,
    range: 1.0
  },

  sabotage: {
    name: '방해공작',
    description: '우주선 시스템을 파괴할 수 있습니다.',
    cooldown: 10
  },

  use_vents: {
    name: '통풍구 이용',
    description: '통풍구를 통해 빠르게 이동할 수 있습니다.',
    cooldown: 5
  },

  shapeshift: {
    name: '변신',
    description: '다른 플레이어의 모습으로 변신할 수 있습니다.',
    cooldown: 10,
    duration: 20
  },

  // === 크루메이트 특수 능력 ===
  investigate_corpse: {
    name: '시체 조사',
    description: '시체에서 더 많은 정보를 얻을 수 있습니다.',
    cooldown: 0
  },

  arrest_player: {
    name: '체포',
    description: '플레이어를 체포할 수 있습니다. 무고한 시민 체포 시 사망.',
    cooldown: 45,
    range: 1.2
  },

  analyze_corpse: {
    name: '시체 분석',
    description: '사망 시간과 위치를 정확히 분석할 수 있습니다.',
    cooldown: 0
  },

  shield_player: {
    name: '보호막',
    description: '한 명의 플레이어에게 보호막을 제공합니다.',
    cooldown: 0,
    usesPerGame: 1
  },

  // === 중립 특수 능력 ===
  special_mission: {
    name: '특수 임무',
    description: '조직의 특별한 임무를 수행합니다.',
    cooldown: 60
  },

  monitor_players: {
    name: '플레이어 감시',
    description: '다른 플레이어들의 행동을 감시합니다.',
    cooldown: 30
  },

  self_protect: {
    name: '자기 보호',
    description: '일시적으로 공격을 방어할 수 있습니다.',
    cooldown: 120,
    duration: 10
  }
};

// 역할 배정 함수
function assignRoles(players, roomOptions) {
  try {
    if (!players || players.length === 0) {
      return false;
    }

    // 역할 배정 계획 생성
    const roleAssignmentPlan = createRoleAssignmentPlan(players.length, roomOptions);
    
    if (!roleAssignmentPlan) {
      console.error('Failed to create role assignment plan');
      return false;
    }

    // 플레이어 배열 복사 및 셔플
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // 역할 배정
    let playerIndex = 0;
    
    for (const [roleId, count] of Object.entries(roleAssignmentPlan)) {
      for (let i = 0; i < count; i++) {
        if (playerIndex >= shuffledPlayers.length) {
          console.error('Not enough players for role assignment');
          return false;
        }

        const player = shuffledPlayers[playerIndex];
        const role = ROLES[roleId];
        
        if (!role) {
          console.error(`Unknown role: ${roleId}`);
          return false;
        }

        // 플레이어에 역할 배정
        player.role = {
          ...role,
          abilities: role.abilities.map(abilityId => ({
            ...ABILITIES[abilityId],
            id: abilityId,
            lastUsed: 0,
            usesRemaining: ABILITIES[abilityId].usesPerGame || Infinity
          }))
        };

        console.log(`[${new Date().toISOString()}] Role assigned: ${player.nickname} -> ${role.name}`);
        playerIndex++;
      }
    }

    // 남은 플레이어들은 기본 크루메이트로 배정
    while (playerIndex < shuffledPlayers.length) {
      const player = shuffledPlayers[playerIndex];
      const role = ROLES.crewmate;
      
      player.role = {
        ...role,
        abilities: role.abilities.map(abilityId => ({
          ...ABILITIES[abilityId],
          id: abilityId,
          lastUsed: 0,
          usesRemaining: ABILITIES[abilityId].usesPerGame || Infinity
        }))
      };

      console.log(`[${new Date().toISOString()}] Default role assigned: ${player.nickname} -> ${role.name}`);
      playerIndex++;
    }

    return true;

  } catch (error) {
    console.error('Error assigning roles:', error);
    return false;
  }
}

// 역할 배정 계획 생성
function createRoleAssignmentPlan(playerCount, roomOptions) {
  try {
    const plan = {};
    
    // 기본 역할 수 설정
    plan.impostor = Math.min(roomOptions.impostorCount || 2, Math.floor(playerCount / 3));
    plan.detective = Math.min(roomOptions.detectiveCount || 1, playerCount - plan.impostor);
    plan.police = Math.min(roomOptions.policeCount || 0, playerCount - plan.impostor - plan.detective);
    plan.organization = Math.min(roomOptions.organizationCount || 0, playerCount - plan.impostor - plan.detective - plan.police);
    plan.audit_team = Math.min(roomOptions.auditTeamCount || 0, playerCount - plan.impostor - plan.detective - plan.police - plan.organization);

    // 게임 모드별 추가 역할
    if (roomOptions.gameMode === 'detective') {
      // 탐정 모드: 탐정과 과학자 추가
      if (playerCount >= 6) {
        plan.scientist = 1;
      }
      if (playerCount >= 8) {
        plan.medic = 1;
      }
    } else if (roomOptions.gameMode === 'custom') {
      // 커스텀 모드: 중립 역할 추가
      if (playerCount >= 7) {
        plan.jester = 1;
      }
      if (playerCount >= 9) {
        plan.survivor = 1;
      }
      if (playerCount >= 12) {
        plan.shapeshifter = 1;
        plan.impostor = Math.max(1, plan.impostor - 1); // 변신술사가 있으면 기본 임포스터 1명 감소
      }
    }

    // 역할 수 유효성 검사
    const totalAssignedRoles = Object.values(plan).reduce((sum, count) => sum + count, 0);
    
    if (totalAssignedRoles > playerCount) {
      console.error('Too many roles assigned:', plan);
      return null;
    }

    // 최소 임포스터 수 보장
    if (plan.impostor < 1) {
      plan.impostor = 1;
    }

    // 밸런스 검사
    const impostorCount = (plan.impostor || 0) + (plan.shapeshifter || 0);
    const crewmateCount = playerCount - impostorCount - (plan.organization || 0) - (plan.audit_team || 0) - (plan.jester || 0) - (plan.survivor || 0);
    
    if (impostorCount >= crewmateCount) {
      console.error('Unbalanced role assignment - too many impostors');
      return null;
    }

    console.log(`[${new Date().toISOString()}] Role assignment plan:`, plan);
    return plan;

  } catch (error) {
    console.error('Error creating role assignment plan:', error);
    return null;
  }
}

// 팀원 정보 반환 (같은 팀 플레이어들)
function getTeammates(player, allPlayers) {
  if (!player.role) {
    return [];
  }

  const teammates = allPlayers.filter(p => 
    p.id !== player.id && 
    p.role && 
    p.role.team === player.role.team &&
    (player.role.team === 'impostor' || player.role.team === 'neutral')
  );

  return teammates.map(teammate => ({
    id: teammate.id,
    nickname: teammate.nickname,
    role: teammate.role
  }));
}

// 역할별 특수 능력 사용 가능 여부 확인
function canUseAbility(player, abilityId) {
  if (!player.role || !player.role.abilities) {
    return { allowed: false, reason: 'No role or abilities' };
  }

  const ability = player.role.abilities.find(a => a.id === abilityId);
  if (!ability) {
    return { allowed: false, reason: 'Ability not found' };
  }

  // 사용 횟수 확인
  if (ability.usesRemaining <= 0) {
    return { allowed: false, reason: 'No uses remaining' };
  }

  // 쿨다운 확인
  const timeSinceLastUse = Date.now() - ability.lastUsed;
  if (timeSinceLastUse < ability.cooldown * 1000) {
    const remainingCooldown = Math.ceil((ability.cooldown * 1000 - timeSinceLastUse) / 1000);
    return { allowed: false, reason: `Cooldown: ${remainingCooldown}s remaining` };
  }

  return { allowed: true };
}

// 능력 사용 처리
function useAbility(player, abilityId) {
  const canUse = canUseAbility(player, abilityId);
  if (!canUse.allowed) {
    return { success: false, reason: canUse.reason };
  }

  const ability = player.role.abilities.find(a => a.id === abilityId);
  
  // 능력 사용 처리
  ability.lastUsed = Date.now();
  if (ability.usesRemaining !== Infinity) {
    ability.usesRemaining--;
  }

  console.log(`[${new Date().toISOString()}] ${player.nickname} used ability: ${abilityId}`);
  return { success: true };
}

// 역할 정보 조회
function getRoleInfo(roleId) {
  return ROLES[roleId] || null;
}

// 모든 역할 목록 조회
function getAllRoles() {
  return ROLES;
}

// 능력 정보 조회
function getAbilityInfo(abilityId) {
  return ABILITIES[abilityId] || null;
}

// 모든 능력 목록 조회
function getAllAbilities() {
  return ABILITIES;
}

// 승리 조건 확인
function checkWinConditions(players, gameState) {
  const alivePlayers = players.filter(p => p.isAlive);
  const aliveByTeam = {
    impostor: alivePlayers.filter(p => p.role.team === 'impostor'),
    crewmate: alivePlayers.filter(p => p.role.team === 'crewmate'),
    neutral: alivePlayers.filter(p => p.role.team === 'neutral')
  };

  // 임포스터 승리 조건
  if (aliveByTeam.impostor.length >= aliveByTeam.crewmate.length && aliveByTeam.impostor.length > 0) {
    return {
      gameEnded: true,
      winner: 'impostor',
      reason: 'Impostors equal or outnumber crewmates'
    };
  }

  // 크루메이트 승리 조건 - 모든 임포스터 제거
  if (aliveByTeam.impostor.length === 0) {
    return {
      gameEnded: true,
      winner: 'crewmate',
      reason: 'All impostors eliminated'
    };
  }

  // 중립 역할별 승리 조건 확인
  for (const player of aliveByTeam.neutral) {
    const winCondition = checkNeutralWinCondition(player, players, gameState);
    if (winCondition.hasWon) {
      return {
        gameEnded: true,
        winner: 'neutral',
        winnerRole: player.role.id,
        winnerPlayer: player,
        reason: winCondition.reason
      };
    }
  }

  return { gameEnded: false };
}

// 중립 역할 승리 조건 확인
function checkNeutralWinCondition(player, allPlayers, gameState) {
  switch (player.role.winCondition) {
    case 'survive_to_end':
      // 조직원: 게임 종료 시까지 생존
      return {
        hasWon: false, // 게임이 끝날 때 확인
        reason: 'Survived until game end'
      };

    case 'get_voted_out':
      // 광대: 투표로 추방되면 승리
      return {
        hasWon: player.ejectedBy === 'vote',
        reason: 'Successfully got voted out'
      };

    case 'survive_game_end':
      // 생존자: 게임 종료 시 생존하면 승리
      return {
        hasWon: false, // 게임이 끝날 때 확인
        reason: 'Survived until game end'
      };

    case 'complete_audit':
      // 감사팀: 특정 조건 만족 시 승리
      const auditProgress = player.auditProgress || 0;
      return {
        hasWon: auditProgress >= 100,
        reason: 'Completed audit mission'
      };

    default:
      return { hasWon: false, reason: 'Unknown win condition' };
  }
}

// 역할 능력 쿨다운 업데이트
function updateAbilityCooldowns(players) {
  const now = Date.now();
  
  players.forEach(player => {
    if (player.role && player.role.abilities) {
      player.role.abilities.forEach(ability => {
        // 쿨다운이 끝난 능력들을 활성화
        if (ability.lastUsed > 0 && now - ability.lastUsed >= ability.cooldown * 1000) {
          ability.isReady = true;
        }
      });
    }
  });
}

// 역할 시스템 리셋 (게임 종료 후)
function resetRoles(players) {
  players.forEach(player => {
    player.role = null;
    player.auditProgress = 0;
    player.shieldedBy = null;
    player.protectedUntil = 0;
  });
}

module.exports = {
  ROLES,
  ABILITIES,
  assignRoles,
  getTeammates,
  canUseAbility,
  useAbility,
  getRoleInfo,
  getAllRoles,
  getAbilityInfo,
  getAllAbilities,
  checkWinConditions,
  updateAbilityCooldowns,
  resetRoles
};