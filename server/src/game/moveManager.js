// [server/src/game/moveManager.js] - 플레이어 이동 관리 모듈
// 실시간 위치 동기화, 충돌 감지, 맵 경계 검사, 속도 제한 등

// 맵 정보 정의
const MAPS = {
  spaceship: {
    name: '우주선',
    width: 800,
    height: 600,
    spawnPoints: [
      { x: 400, y: 300, room: 'cafeteria' },
      { x: 350, y: 280, room: 'cafeteria' },
      { x: 450, y: 280, room: 'cafeteria' },
      { x: 375, y: 250, room: 'cafeteria' },
      { x: 425, y: 250, room: 'cafeteria' }
    ],
    rooms: [
      { name: 'cafeteria', bounds: { x: 300, y: 200, width: 200, height: 150 } },
      { name: 'security', bounds: { x: 100, y: 80, width: 120, height: 100 } },
      { name: 'office', bounds: { x: 460, y: 100, width: 140, height: 120 } },
      { name: 'lab', bounds: { x: 500, y: 300, width: 150, height: 120 } },
      { name: 'storage', bounds: { x: 80, y: 400, width: 200, height: 150 } },
      { name: 'server', bounds: { x: 550, y: 500, width: 120, height: 100 } },
      { name: 'garage', bounds: { x: 50, y: 180, width: 100, height: 150 } },
      { name: 'basement', bounds: { x: 60, y: 350, width: 150, height: 100 } },
      { name: 'vault', bounds: { x: 280, y: 180, width: 80, height: 60 } }
    ],
    vents: [
      { id: 'vent1', x: 150, y: 120, connectedTo: ['vent2', 'vent3'] },
      { id: 'vent2', x: 380, y: 180, connectedTo: ['vent1', 'vent4'] },
      { id: 'vent3', x: 520, y: 350, connectedTo: ['vent1', 'vent4'] },
      { id: 'vent4', x: 450, y: 520, connectedTo: ['vent2', 'vent3'] }
    ],
    walls: [
      // 외곽 벽
      { x1: 0, y1: 0, x2: 800, y2: 0 },
      { x1: 800, y1: 0, x2: 800, y2: 600 },
      { x1: 800, y1: 600, x2: 0, y2: 600 },
      { x1: 0, y1: 600, x2: 0, y2: 0 },
      // 내부 벽들 (간단화)
      { x1: 220, y1: 100, x2: 220, y2: 200 },
      { x1: 300, y1: 350, x2: 400, y2: 350 }
    ]
  },
  
  office: {
    name: '사무실',
    width: 900,
    height: 700,
    spawnPoints: [
      { x: 450, y: 350, room: 'main_office' },
      { x: 400, y: 320, room: 'main_office' },
      { x: 500, y: 320, room: 'main_office' }
    ],
    rooms: [
      { name: 'main_office', bounds: { x: 300, y: 250, width: 300, height: 200 } },
      { name: 'meeting_room', bounds: { x: 100, y: 100, width: 150, height: 120 } },
      { name: 'server_room', bounds: { x: 650, y: 500, width: 120, height: 100 } }
    ],
    vents: [
      { id: 'office_vent1', x: 200, y: 150, connectedTo: ['office_vent2'] },
      { id: 'office_vent2', x: 550, y: 400, connectedTo: ['office_vent1'] }
    ],
    walls: []
  },
  
  laboratory: {
    name: '연구소',
    width: 750,
    height: 550,
    spawnPoints: [
      { x: 375, y: 275, room: 'central_lab' }
    ],
    rooms: [
      { name: 'central_lab', bounds: { x: 250, y: 200, width: 250, height: 150 } }
    ],
    vents: [],
    walls: []
  }
};

// 플레이어 위치 데이터
const playerPositions = new Map(); // roomName -> Map(playerId -> positionData)
const playerMovementHistory = new Map(); // playerId -> movement history
const ventCooldowns = new Map(); // playerId -> last vent use time

// 플레이어 위치 설정
function setPlayerPosition(roomName, playerId, position) {
  try {
    if (!playerPositions.has(roomName)) {
      playerPositions.set(roomName, new Map());
    }
    
    const roomPositions = playerPositions.get(roomName);
    const currentTime = Date.now();
    
    // 이전 위치 정보 가져오기
    const previousPosition = roomPositions.get(playerId);
    
    // 위치 유효성 검사
    const validPosition = validatePosition(roomName, position, previousPosition);
    if (!validPosition.isValid) {
      console.warn(`Invalid position for player ${playerId}: ${validPosition.reason}`);
      return false;
    }
    
    // 이동 기록 저장
    recordMovement(playerId, position, currentTime);
    
    // 위치 업데이트
    roomPositions.set(playerId, {
      ...position,
      playerId,
      lastUpdate: currentTime,
      room: getCurrentRoom(roomName, position)
    });
    
    return true;
    
  } catch (error) {
    console.error('Error setting player position:', error);
    return false;
  }
}

// 모든 플레이어 위치 조회
function getAllPositions(roomName) {
  try {
    const roomPositions = playerPositions.get(roomName);
    if (!roomPositions) {
      return {};
    }
    
    const positions = {};
    for (const [playerId, positionData] of roomPositions) {
      positions[playerId] = positionData;
    }
    
    return positions;
    
  } catch (error) {
    console.error('Error getting all positions:', error);
    return {};
  }
}

// 특정 플레이어 위치 조회
function getPlayerPosition(roomName, playerId) {
  try {
    const roomPositions = playerPositions.get(roomName);
    return roomPositions ? roomPositions.get(playerId) : null;
    
  } catch (error) {
    console.error('Error getting player position:', error);
    return null;
  }
}

// 플레이어 제거
function removePlayer(roomName, playerId) {
  try {
    const roomPositions = playerPositions.get(roomName);
    if (roomPositions) {
      roomPositions.delete(playerId);
      
      // 방이 비었으면 Map 제거
      if (roomPositions.size === 0) {
        playerPositions.delete(roomName);
      }
    }
    
    // 이동 기록도 정리
    playerMovementHistory.delete(playerId);
    ventCooldowns.delete(playerId);
    
    return true;
    
  } catch (error) {
    console.error('Error removing player:', error);
    return false;
  }
}

// 방 리셋
function resetRoom(roomName) {
  try {
    playerPositions.delete(roomName);
    return true;
    
  } catch (error) {
    console.error('Error resetting room:', error);
    return false;
  }
}

// 위치 유효성 검사
function validatePosition(roomName, position, previousPosition) {
  try {
    const map = getCurrentMap(roomName);
    if (!map) {
      return { isValid: false, reason: 'Map not found' };
    }
    
    // 맵 경계 확인
    if (position.x < 0 || position.x > map.width || 
        position.y < 0 || position.y > map.height) {
      return { isValid: false, reason: 'Outside map boundaries' };
    }
    
    // 이동 거리 검사 (치트 방지)
    if (previousPosition) {
      const distance = calculateDistance(position, previousPosition);
      const timeDiff = Date.now() - (previousPosition.lastUpdate || 0);
      const maxSpeed = 200; // 픽셀/초
      const maxDistance = (maxSpeed * timeDiff) / 1000;
      
      if (distance > maxDistance * 2) { // 여유를 두어 네트워크 지연 고려
        return { isValid: false, reason: 'Movement too fast' };
      }
    }
    
    // 벽 충돌 검사
    if (checkWallCollision(map, position)) {
      return { isValid: false, reason: 'Wall collision' };
    }
    
    return { isValid: true };
    
  } catch (error) {
    console.error('Error validating position:', error);
    return { isValid: false, reason: 'Validation error' };
  }
}

// 벽 충돌 검사
function checkWallCollision(map, position) {
  const playerRadius = 15; // 플레이어 충돌 반경
  
  for (const wall of map.walls) {
    if (pointToLineDistance(position, wall) < playerRadius) {
      return true;
    }
  }
  
  return false;
}

// 점과 선분 사이의 거리 계산
function pointToLineDistance(point, line) {
  const A = point.x - line.x1;
  const B = point.y - line.y1;
  const C = line.x2 - line.x1;
  const D = line.y2 - line.y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return Math.sqrt(A * A + B * B);
  
  let param = dot / lenSq;
  
  if (param < 0) {
    param = 0;
  } else if (param > 1) {
    param = 1;
  }
  
  const xx = line.x1 + param * C;
  const yy = line.y1 + param * D;
  
  const dx = point.x - xx;
  const dy = point.y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
}

// 현재 룸 확인
function getCurrentRoom(roomName, position) {
  try {
    const map = getCurrentMap(roomName);
    if (!map) return 'unknown';
    
    for (const room of map.rooms) {
      if (position.x >= room.bounds.x && 
          position.x <= room.bounds.x + room.bounds.width &&
          position.y >= room.bounds.y && 
          position.y <= room.bounds.y + room.bounds.height) {
        return room.name;
      }
    }
    
    return 'corridor'; // 복도나 기타 공간
    
  } catch (error) {
    console.error('Error getting current room:', error);
    return 'unknown';
  }
}

// 랜덤 스폰 포인트 반환
function getRandomSpawnPoint(mapName = 'spaceship') {
  try {
    const map = MAPS[mapName];
    if (!map || !map.spawnPoints.length) {
      return { x: 400, y: 300 }; // 기본 위치
    }
    
    const randomIndex = Math.floor(Math.random() * map.spawnPoints.length);
    return { ...map.spawnPoints[randomIndex] };
    
  } catch (error) {
    console.error('Error getting spawn point:', error);
    return { x: 400, y: 300 };
  }
}

// 주변 플레이어 조회 (일정 거리 내)
function getNearbyPlayers(roomName, playerId, radius = 100) {
  try {
    const playerPosition = getPlayerPosition(roomName, playerId);
    if (!playerPosition) return [];
    
    const roomPositions = playerPositions.get(roomName);
    if (!roomPositions) return [];
    
    const nearbyPlayers = [];
    
    for (const [otherPlayerId, otherPosition] of roomPositions) {
      if (otherPlayerId === playerId) continue;
      
      const distance = calculateDistance(playerPosition, otherPosition);
      if (distance <= radius) {
        nearbyPlayers.push({
          playerId: otherPlayerId,
          position: otherPosition,
          distance: distance
        });
      }
    }
    
    return nearbyPlayers.sort((a, b) => a.distance - b.distance);
    
  } catch (error) {
    console.error('Error getting nearby players:', error);
    return [];
  }
}

// 통풍구 사용 가능 여부 확인
function canUseVent(roomName, playerId, position) {
  try {
    const map = getCurrentMap(roomName);
    if (!map) return { allowed: false, reason: 'Map not found' };
    
    // 쿨다운 확인
    const lastUse = ventCooldowns.get(playerId) || 0;
    const cooldownTime = 5000; // 5초
    if (Date.now() - lastUse < cooldownTime) {
      return { 
        allowed: false, 
        reason: `Cooldown remaining: ${Math.ceil((cooldownTime - (Date.now() - lastUse)) / 1000)}s` 
      };
    }
    
    // 가까운 통풍구 찾기
    const nearbyVent = findNearestVent(map, position, 30); // 30픽셀 이내
    if (!nearbyVent) {
      return { allowed: false, reason: 'No vent nearby' };
    }
    
    return { 
      allowed: true, 
      vent: nearbyVent,
      connectedVents: nearbyVent.connectedTo.map(ventId => 
        map.vents.find(v => v.id === ventId)
      ).filter(Boolean)
    };
    
  } catch (error) {
    console.error('Error checking vent usage:', error);
    return { allowed: false, reason: 'Server error' };
  }
}

// 통풍구 사용
function useVent(roomName, playerId, targetVentId) {
  try {
    const ventCheck = canUseVent(roomName, playerId, getPlayerPosition(roomName, playerId));
    if (!ventCheck.allowed) {
      return { success: false, reason: ventCheck.reason };
    }
    
    const targetVent = ventCheck.connectedVents.find(v => v.id === targetVentId);
    if (!targetVent) {
      return { success: false, reason: 'Invalid target vent' };
    }
    
    // 플레이어 위치를 목표 통풍구로 이동
    const newPosition = { x: targetVent.x, y: targetVent.y };
    setPlayerPosition(roomName, playerId, newPosition);
    
    // 쿨다운 설정
    ventCooldowns.set(playerId, Date.now());
    
    console.log(`[${new Date().toISOString()}] Player ${playerId} used vent to ${targetVentId}`);
    return { success: true, newPosition };
    
  } catch (error) {
    console.error('Error using vent:', error);
    return { success: false, reason: 'Server error' };
  }
}

// 가장 가까운 통풍구 찾기
function findNearestVent(map, position, maxDistance) {
  let nearestVent = null;
  let minDistance = maxDistance;
  
  for (const vent of map.vents) {
    const distance = calculateDistance(position, vent);
    if (distance < minDistance) {
      minDistance = distance;
      nearestVent = vent;
    }
  }
  
  return nearestVent;
}

// 이동 기록 저장
function recordMovement(playerId, position, timestamp) {
  try {
    if (!playerMovementHistory.has(playerId)) {
      playerMovementHistory.set(playerId, []);
    }
    
    const history = playerMovementHistory.get(playerId);
    history.push({
      x: position.x,
      y: position.y,
      timestamp: timestamp
    });
    
    // 최근 100개 이동만 유지 (메모리 관리)
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
  } catch (error) {
    console.error('Error recording movement:', error);
  }
}

// 플레이어 이동 패턴 분석
function analyzeMovementPattern(playerId, timeWindow = 30000) {
  try {
    const history = playerMovementHistory.get(playerId) || [];
    const cutoffTime = Date.now() - timeWindow;
    const recentMovements = history.filter(m => m.timestamp > cutoffTime);
    
    if (recentMovements.length < 2) {
      return { distance: 0, speed: 0, suspicious: false };
    }
    
    let totalDistance = 0;
    let maxSpeed = 0;
    
    for (let i = 1; i < recentMovements.length; i++) {
      const prev = recentMovements[i - 1];
      const curr = recentMovements[i];
      
      const distance = calculateDistance(prev, curr);
      const timeDiff = curr.timestamp - prev.timestamp;
      const speed = timeDiff > 0 ? (distance / timeDiff) * 1000 : 0; // 픽셀/초
      
      totalDistance += distance;
      maxSpeed = Math.max(maxSpeed, speed);
    }
    
    const timeSpan = recentMovements[recentMovements.length - 1].timestamp - recentMovements[0].timestamp;
    const averageSpeed = timeSpan > 0 ? (totalDistance / timeSpan) * 1000 : 0;
    
    // 의심스러운 이동 패턴 감지
    const suspicious = maxSpeed > 300 || averageSpeed > 150; // 임계값
    
    return {
      distance: totalDistance,
      averageSpeed: averageSpeed,
      maxSpeed: maxSpeed,
      suspicious: suspicious
    };
    
  } catch (error) {
    console.error('Error analyzing movement pattern:', error);
    return { distance: 0, speed: 0, suspicious: false };
  }
}

// 거리 계산 헬퍼 함수
function calculateDistance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// 현재 맵 정보 가져오기
function getCurrentMap(roomName) {
  // 실제 구현에서는 방 정보에서 맵 정보를 가져와야 함
  // 여기서는 기본값으로 spaceship 사용
  return MAPS.spaceship;
}

// 맵 정보 조회
function getMapInfo(mapName) {
  return MAPS[mapName] || null;
}

// 모든 맵 목록 조회
function getAllMaps() {
  return Object.keys(MAPS);
}

// 시야 범위 내 플레이어 조회
function getPlayersInVisionRange(roomName, playerId, visionRange) {
  return getNearbyPlayers(roomName, playerId, visionRange);
}

// 통계 정보 생성
function generateMovementStats(roomName) {
  try {
    const roomPositions = playerPositions.get(roomName);
    if (!roomPositions) return null;
    
    const stats = {
      totalPlayers: roomPositions.size,
      roomDistribution: {},
      averagePosition: { x: 0, y: 0 }
    };
    
    let totalX = 0, totalY = 0;
    
    for (const [playerId, position] of roomPositions) {
      const room = position.room || 'unknown';
      stats.roomDistribution[room] = (stats.roomDistribution[room] || 0) + 1;
      totalX += position.x;
      totalY += position.y;
    }
    
    if (stats.totalPlayers > 0) {
      stats.averagePosition.x = totalX / stats.totalPlayers;
      stats.averagePosition.y = totalY / stats.totalPlayers;
    }
    
    return stats;
    
  } catch (error) {
    console.error('Error generating movement stats:', error);
    return null;
  }
}

module.exports = {
  MAPS,
  setPlayerPosition,
  getAllPositions,
  getPlayerPosition,
  removePlayer,
  resetRoom,
  getNearbyPlayers,
  canUseVent,
  useVent,
  getRandomSpawnPoint,
  analyzeMovementPattern,
  getMapInfo,
  getAllMaps,
  getPlayersInVisionRange,
  generateMovementStats
};