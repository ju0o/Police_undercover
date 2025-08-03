// [server/src/game/killManager.js] - 킬/시체 관리 모듈
// 임포스터 킬, 시체 생성/발견, 킬 쿨다운, 범위 검사 등

// 킬 데이터 관리
const killCooldowns = new Map(); // playerId -> last kill time
const corpses = new Map(); // roomName -> corpse array
const killHistory = new Map(); // roomName -> kill history
const protectedPlayers = new Map(); // playerId -> protection data

// 킬 시도
function attemptKill(killer, target, roomOptions) {
  try {
    // 기본 검증
    if (!killer || !target) {
      return { success: false, reason: 'Invalid killer or target' };
    }

    // 킬러 역할 확인
    if (!killer.role || !killer.role.canKill) {
      return { success: false, reason: 'Killer cannot kill' };
    }

    // 킬러 생존 확인
    if (!killer.isAlive) {
      return { success: false, reason: 'Killer is dead' };
    }

    // 타겟 생존 확인
    if (!target.isAlive) {
      return { success: false, reason: 'Target is already dead' };
    }

    // 자기 자신 킬 방지
    if (killer.id === target.id) {
      return { success: false, reason: 'Cannot kill yourself' };
    }

    // 같은 팀 킬 방지 (임포스터끼리 킬 불가)
    if (killer.role.team === target.role.team && killer.role.team === 'impostor') {
      return { success: false, reason: 'Cannot kill teammates' };
    }

    // 킬 쿨다운 확인
    const cooldownCheck = checkKillCooldown(killer.id, roomOptions);
    if (!cooldownCheck.ready) {
      return { 
        success: false, 
        reason: `Kill cooldown: ${cooldownCheck.remainingTime}s remaining` 
      };
    }

    // 거리 확인
    const distanceCheck = checkKillDistance(killer, target);
    if (!distanceCheck.inRange) {
      return { success: false, reason: 'Target too far away' };
    }

    // 보호막 확인
    const protectionCheck = checkPlayerProtection(target.id);
    if (protectionCheck.isProtected) {
      // 보호막이 있다면 보호막만 제거하고 킬 실패
      removePlayerProtection(target.id);
      return { 
        success: false, 
        reason: 'Target was protected', 
        protectionBroken: true 
      };
    }

    // 특수 역할별 킬 처리
    const specialKillResult = handleSpecialRoleKill(killer, target);
    if (!specialKillResult.allowed) {
      return { success: false, reason: specialKillResult.reason };
    }

    // 킬 실행
    executeKill(killer, target, roomOptions);

    return { success: true };

  } catch (error) {
    console.error('Error attempting kill:', error);
    return { success: false, reason: 'Server error' };
  }
}

// 킬 쿨다운 확인
function checkKillCooldown(killerId, roomOptions) {
  try {
    const lastKillTime = killCooldowns.get(killerId) || 0;
    const cooldownDuration = (roomOptions.killCooldown || 30) * 1000; // 초를 밀리초로
    const timeSinceLastKill = Date.now() - lastKillTime;

    if (timeSinceLastKill >= cooldownDuration) {
      return { ready: true, remainingTime: 0 };
    } else {
      const remainingTime = Math.ceil((cooldownDuration - timeSinceLastKill) / 1000);
      return { ready: false, remainingTime };
    }

  } catch (error) {
    console.error('Error checking kill cooldown:', error);
    return { ready: false, remainingTime: 999 };
  }
}

// 킬 거리 확인
function checkKillDistance(killer, target) {
  try {
    if (!killer.position || !target.position) {
      return { inRange: false, distance: Infinity };
    }

    const dx = killer.position.x - target.position.x;
    const dy = killer.position.y - target.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const maxKillDistance = 50; // 픽셀 단위
    
    return {
      inRange: distance <= maxKillDistance,
      distance: distance
    };

  } catch (error) {
    console.error('Error checking kill distance:', error);
    return { inRange: false, distance: Infinity };
  }
}

// 플레이어 보호 상태 확인
function checkPlayerProtection(playerId) {
  try {
    const protection = protectedPlayers.get(playerId);
    
    if (!protection) {
      return { isProtected: false };
    }

    // 보호 시간 만료 확인
    if (Date.now() > protection.expiresAt) {
      protectedPlayers.delete(playerId);
      return { isProtected: false };
    }

    return {
      isProtected: true,
      protectionType: protection.type,
      protectedBy: protection.protectedBy,
      expiresAt: protection.expiresAt
    };

  } catch (error) {
    console.error('Error checking player protection:', error);
    return { isProtected: false };
  }
}

// 플레이어 보호막 제거
function removePlayerProtection(playerId) {
  try {
    protectedPlayers.delete(playerId);
    return true;
  } catch (error) {
    console.error('Error removing player protection:', error);
    return false;
  }
}

// 특수 역할별 킬 처리
function handleSpecialRoleKill(killer, target) {
  try {
    // 경찰의 체포 능력
    if (killer.role.id === 'police') {
      return handlePoliceArrest(killer, target);
    }

    // 변신술사의 킬
    if (killer.role.id === 'shapeshifter') {
      return handleShapeshifterKill(killer, target);
    }

    // 일반 임포스터 킬
    return { allowed: true };

  } catch (error) {
    console.error('Error handling special role kill:', error);
    return { allowed: false, reason: 'Special role error' };
  }
}

// 경찰 체포 처리
function handlePoliceArrest(police, target) {
  try {
    // 경찰은 임포스터를 체포하면 성공, 크루메이트를 체포하면 자신이 죽음
    if (target.role.team === 'impostor') {
      return { allowed: true, arrestSuccess: true };
    } else {
      // 무고한 시민 체포 시 경찰이 죽음
      return { 
        allowed: true, 
        arrestSuccess: false, 
        policeDeathByMistake: true 
      };
    }

  } catch (error) {
    console.error('Error handling police arrest:', error);
    return { allowed: false, reason: 'Police arrest error' };
  }
}

// 변신술사 킬 처리
function handleShapeshifterKill(shapeshifter, target) {
  try {
    // 변신술사는 킬 후 잠시 타겟의 모습으로 변신
    return { 
      allowed: true, 
      shapeshift: true, 
      newAppearance: {
        nickname: target.nickname,
        color: target.color || target.role.color,
        duration: 20000 // 20초
      }
    };

  } catch (error) {
    console.error('Error handling shapeshifter kill:', error);
    return { allowed: false, reason: 'Shapeshifter error' };
  }
}

// 킬 실행
function executeKill(killer, target, roomOptions) {
  try {
    const roomName = killer.roomName || target.roomName;
    
    // 킬 쿨다운 설정
    killCooldowns.set(killer.id, Date.now());

    // 시체 생성
    const corpse = {
      id: target.id,
      playerId: target.id,
      playerName: target.nickname,
      killedBy: killer.id,
      killerName: killer.nickname,
      position: { ...target.position },
      deathTime: Date.now(),
      discoveredBy: null,
      discoveredAt: null,
      reportedBy: null,
      reportedAt: null,
      cause: determineDeathCause(killer, target),
      evidence: generateDeathEvidence(killer, target)
    };

    // 시체 목록에 추가
    if (!corpses.has(roomName)) {
      corpses.set(roomName, []);
    }
    corpses.get(roomName).push(corpse);

    // 킬 히스토리 기록
    recordKillHistory(roomName, killer, target, corpse);

    console.log(`[${new Date().toISOString()}] Kill executed: ${killer.nickname} killed ${target.nickname} in room ${roomName}`);

  } catch (error) {
    console.error('Error executing kill:', error);
  }
}

// 사망 원인 결정
function determineDeathCause(killer, target) {
  if (killer.role.id === 'police') {
    return target.role.team === 'impostor' ? 'arrested' : 'wrongful_arrest';
  }
  
  if (killer.role.id === 'shapeshifter') {
    return 'shapeshifter_kill';
  }
  
  return 'impostor_kill';
}

// 사망 증거 생성
function generateDeathEvidence(killer, target) {
  try {
    const evidence = {
      bloodPattern: Math.random() > 0.5 ? 'splatter' : 'pool',
      timeOfDeath: Date.now(),
      location: { ...target.position },
      witnesses: [], // 주변에 있던 플레이어들 (나중에 추가)
      forensicClues: []
    };

    // 역할별 특수 증거
    if (killer.role.id === 'police') {
      evidence.forensicClues.push('restraint_marks');
    } else if (killer.role.id === 'shapeshifter') {
      evidence.forensicClues.push('mysterious_dna');
    }

    // 랜덤 추가 증거
    const possibleClues = ['footprints', 'fingerprints', 'fabric_fibers', 'struggle_signs'];
    if (Math.random() > 0.7) {
      const randomClue = possibleClues[Math.floor(Math.random() * possibleClues.length)];
      evidence.forensicClues.push(randomClue);
    }

    return evidence;

  } catch (error) {
    console.error('Error generating death evidence:', error);
    return {};
  }
}

// 킬 히스토리 기록
function recordKillHistory(roomName, killer, target, corpse) {
  try {
    if (!killHistory.has(roomName)) {
      killHistory.set(roomName, []);
    }

    killHistory.get(roomName).push({
      id: corpse.id,
      killerId: killer.id,
      killerName: killer.nickname,
      killerRole: killer.role.id,
      targetId: target.id,
      targetName: target.nickname,
      targetRole: target.role.id,
      timestamp: Date.now(),
      location: { ...corpse.position },
      cause: corpse.cause,
      gamePhase: 'playing' // playing, meeting 등
    });

  } catch (error) {
    console.error('Error recording kill history:', error);
  }
}

// 시체 발견 처리
function discoverCorpse(roomName, corpseId, discovererI) {
  try {
    const roomCorpses = corpses.get(roomName);
    if (!roomCorpses) {
      return { success: false, reason: 'No corpses in room' };
    }

    const corpse = roomCorpses.find(c => c.id === corpseId);
    if (!corpse) {
      return { success: false, reason: 'Corpse not found' };
    }

    if (corpse.discoveredBy) {
      return { success: false, reason: 'Corpse already discovered' };
    }

    // 시체 발견 기록
    corpse.discoveredBy = discovererId;
    corpse.discoveredAt = Date.now();

    console.log(`[${new Date().toISOString()}] Corpse discovered in room ${roomName}: ${corpseId} by ${discovererId}`);

    return { 
      success: true, 
      corpse: corpse,
      shouldTriggerMeeting: true 
    };

  } catch (error) {
    console.error('Error discovering corpse:', error);
    return { success: false, reason: 'Server error' };
  }
}

// 시체 신고 처리
function reportCorpse(roomName, corpseId, reporterId) {
  try {
    const discoverResult = discoverCorpse(roomName, corpseId, reporterId);
    if (!discoverResult.success) {
      return discoverResult;
    }

    const corpse = discoverResult.corpse;
    corpse.reportedBy = reporterId;
    corpse.reportedAt = Date.now();

    console.log(`[${new Date().toISOString()}] Corpse reported in room ${roomName}: ${corpseId} by ${reporterId}`);

    return {
      success: true,
      corpse: corpse,
      triggerEmergencyMeeting: true
    };

  } catch (error) {
    console.error('Error reporting corpse:', error);
    return { success: false, reason: 'Server error' };
  }
}

// 플레이어 보호 설정 (의무관 능력)
function protectPlayer(targetId, protectorId, duration = 60000) {
  try {
    protectedPlayers.set(targetId, {
      protectedBy: protectorId,
      type: 'medic_shield',
      startTime: Date.now(),
      expiresAt: Date.now() + duration
    });

    console.log(`[${new Date().toISOString()}] Player ${targetId} protected by ${protectorId} for ${duration}ms`);
    return { success: true };

  } catch (error) {
    console.error('Error protecting player:', error);
    return { success: false, reason: 'Server error' };
  }
}

// 시체 목록 조회
function getCorpses(roomName) {
  return corpses.get(roomName) || [];
}

// 발견되지 않은 시체 목록 조회
function getUndiscoveredCorpses(roomName) {
  const roomCorpses = corpses.get(roomName) || [];
  return roomCorpses.filter(corpse => !corpse.discoveredBy);
}

// 킬 히스토리 조회
function getKillHistory(roomName) {
  return killHistory.get(roomName) || [];
}

// 킬 쿨다운 상태 조회
function getKillCooldownStatus(playerId) {
  try {
    const lastKillTime = killCooldowns.get(playerId) || 0;
    const timeSinceLastKill = Date.now() - lastKillTime;
    
    return {
      lastKillTime: lastKillTime,
      timeSinceLastKill: timeSinceLastKill,
      isReady: timeSinceLastKill >= 30000 // 30초 기본 쿨다운
    };

  } catch (error) {
    console.error('Error getting kill cooldown status:', error);
    return { lastKillTime: 0, timeSinceLastKill: Infinity, isReady: true };
  }
}

// 방 리셋
function resetRoom(roomName) {
  try {
    corpses.delete(roomName);
    killHistory.delete(roomName);
    
    // 해당 방의 플레이어들 쿨다운 정리는 플레이어 ID로는 어려우므로
    // 게임 종료 시 전체 리셋 함수에서 처리
    
    return true;

  } catch (error) {
    console.error('Error resetting room kills:', error);
    return false;
  }
}

// 전체 킬 데이터 리셋
function resetAllKillData() {
  try {
    killCooldowns.clear();
    corpses.clear();
    killHistory.clear();
    protectedPlayers.clear();
    
    return true;

  } catch (error) {
    console.error('Error resetting all kill data:', error);
    return false;
  }
}

// 킬 통계 생성
function generateKillStats(roomName) {
  try {
    const history = killHistory.get(roomName) || [];
    
    if (history.length === 0) {
      return null;
    }

    const stats = {
      totalKills: history.length,
      killerStats: {},
      victimStats: {},
      killsByRole: {},
      killsByLocation: {},
      averageKillInterval: 0
    };

    let totalInterval = 0;
    let previousKillTime = null;

    for (const kill of history) {
      // 킬러 통계
      if (!stats.killerStats[kill.killerId]) {
        stats.killerStats[kill.killerId] = {
          name: kill.killerName,
          role: kill.killerRole,
          killCount: 0,
          victims: []
        };
      }
      stats.killerStats[kill.killerId].killCount++;
      stats.killerStats[kill.killerId].victims.push(kill.targetName);

      // 피해자 통계
      stats.victimStats[kill.targetId] = {
        name: kill.targetName,
        role: kill.targetRole,
        killedBy: kill.killerName,
        deathTime: kill.timestamp
      };

      // 역할별 킬 통계
      stats.killsByRole[kill.killerRole] = (stats.killsByRole[kill.killerRole] || 0) + 1;

      // 위치별 킬 통계
      const locationKey = `${Math.floor(kill.location.x / 50)}-${Math.floor(kill.location.y / 50)}`;
      stats.killsByLocation[locationKey] = (stats.killsByLocation[locationKey] || 0) + 1;

      // 킬 간격 계산
      if (previousKillTime) {
        totalInterval += kill.timestamp - previousKillTime;
      }
      previousKillTime = kill.timestamp;
    }

    // 평균 킬 간격
    if (history.length > 1) {
      stats.averageKillInterval = totalInterval / (history.length - 1);
    }

    return stats;

  } catch (error) {
    console.error('Error generating kill stats:', error);
    return null;
  }
}

module.exports = {
  attemptKill,
  checkKillCooldown,
  checkKillDistance,
  discoverCorpse,
  reportCorpse,
  protectPlayer,
  getCorpses,
  getUndiscoveredCorpses,
  getKillHistory,
  getKillCooldownStatus,
  resetRoom,
  resetAllKillData,
  generateKillStats
};