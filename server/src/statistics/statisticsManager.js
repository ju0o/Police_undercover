// [server/src/statistics/statisticsManager.js] - 통계 관리 모듈
// 게임 통계, 플레이어 통계, 성과 추적 등

// 통계 데이터 저장소
const gameStatistics = new Map(); // roomName -> game stats
const playerStatistics = new Map(); // playerId -> player stats
const globalStatistics = {
  totalGames: 0,
  totalPlayers: 0,
  averageGameDuration: 0,
  winRatesByRole: {},
  popularMissions: {},
  serverUptime: Date.now()
};

// 방별 통계 초기화
function initializeRoomStats(roomName) {
  try {
    const roomStats = {
      roomName: roomName,
      createdAt: Date.now(),
      gamesPlayed: 0,
      totalPlayTime: 0,
      playerJoins: 0,
      playerLeaves: 0,
      meetingsCalled: 0,
      emergencyMeetings: 0,
      corpsesReported: 0,
      totalKills: 0,
      totalMissions: 0,
      completedMissions: 0,
      winsByTeam: {
        crewmate: 0,
        impostor: 0,
        neutral: 0
      },
      averagePlayersPerGame: 0,
      roleDistribution: {},
      missionCompletionRate: 0,
      voteAccuracy: 0, // 임포스터를 정확히 투표한 비율
      gameHistory: []
    };

    gameStatistics.set(roomName, roomStats);
    return roomStats;

  } catch (error) {
    console.error('Error initializing room stats:', error);
    return null;
  }
}

// 게임 시작 통계 기록
function recordGameStart(roomName, playerCount) {
  try {
    let roomStats = gameStatistics.get(roomName);
    if (!roomStats) {
      roomStats = initializeRoomStats(roomName);
    }

    roomStats.gamesPlayed++;
    roomStats.averagePlayersPerGame = 
      ((roomStats.averagePlayersPerGame * (roomStats.gamesPlayed - 1)) + playerCount) / roomStats.gamesPlayed;

    // 글로벌 통계 업데이트
    globalStatistics.totalGames++;
    globalStatistics.totalPlayers += playerCount;

    console.log(`[${new Date().toISOString()}] Game start recorded for room ${roomName} with ${playerCount} players`);
    return true;

  } catch (error) {
    console.error('Error recording game start:', error);
    return false;
  }
}

// 게임 종료 통계 기록
function recordGameEnd(roomName, winCondition, gameLength) {
  try {
    const roomStats = gameStatistics.get(roomName);
    if (!roomStats) {
      return false;
    }

    // 승리 팀 결정
    let winningTeam = 'crewmate';
    if (winCondition.includes('impostor')) {
      winningTeam = 'impostor';
    } else if (winCondition.includes('neutral')) {
      winningTeam = 'neutral';
    }

    // 승리 통계 업데이트
    roomStats.winsByTeam[winningTeam]++;
    roomStats.totalPlayTime += gameLength;

    // 게임 히스토리에 추가
    roomStats.gameHistory.push({
      endTime: Date.now(),
      duration: gameLength,
      winCondition: winCondition,
      winningTeam: winningTeam
    });

    // 최근 20게임만 유지
    if (roomStats.gameHistory.length > 20) {
      roomStats.gameHistory = roomStats.gameHistory.slice(-20);
    }

    // 글로벌 평균 게임 시간 업데이트
    globalStatistics.averageGameDuration = 
      ((globalStatistics.averageGameDuration * (globalStatistics.totalGames - 1)) + gameLength) / globalStatistics.totalGames;

    console.log(`[${new Date().toISOString()}] Game end recorded for room ${roomName}: ${winningTeam} wins`);
    return true;

  } catch (error) {
    console.error('Error recording game end:', error);
    return false;
  }
}

// 플레이어 통계 초기화
function initializePlayerStats(playerId, nickname) {
  try {
    if (playerStatistics.has(playerId)) {
      return playerStatistics.get(playerId);
    }

    const playerStats = {
      playerId: playerId,
      nickname: nickname,
      firstPlayed: Date.now(),
      lastPlayed: Date.now(),
      gamesPlayed: 0,
      totalPlayTime: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      roleStats: {
        crewmate: { played: 0, wins: 0 },
        impostor: { played: 0, wins: 0 },
        detective: { played: 0, wins: 0 },
        police: { played: 0, wins: 0 },
        scientist: { played: 0, wins: 0 },
        medic: { played: 0, wins: 0 },
        organization: { played: 0, wins: 0 },
        audit_team: { played: 0, wins: 0 },
        jester: { played: 0, wins: 0 },
        survivor: { played: 0, wins: 0 },
        shapeshifter: { played: 0, wins: 0 }
      },
      missionStats: {
        totalAssigned: 0,
        totalCompleted: 0,
        completionRate: 0,
        averageCompletionTime: 0,
        favoriteType: null
      },
      meetingStats: {
        meetingsCalled: 0,
        votesCast: 0,
        correctVotes: 0, // 임포스터에게 투표한 횟수
        voteAccuracy: 0
      },
      killStats: {
        kills: 0,
        deaths: 0,
        killDeathRatio: 0,
        survivalRate: 0
      },
      achievementProgress: {
        perfectMissions: 0, // 모든 미션 완료
        clutchWins: 0, // 1명 남아서 승리
        detectiveWins: 0, // 탐정으로 승리
        impostorStreak: 0, // 임포스터 연승
        meetingMaster: 0 // 회의 소집 횟수
      }
    };

    playerStatistics.set(playerId, playerStats);
    return playerStats;

  } catch (error) {
    console.error('Error initializing player stats:', error);
    return null;
  }
}

// 미션 완료 통계 기록
function recordMissionComplete(roomName, playerId, missionId, score = 0) {
  try {
    // 방 통계 업데이트
    const roomStats = gameStatistics.get(roomName);
    if (roomStats) {
      roomStats.completedMissions++;
      roomStats.missionCompletionRate = 
        (roomStats.completedMissions / roomStats.totalMissions) * 100;
    }

    // 플레이어 통계 업데이트
    const playerStats = playerStatistics.get(playerId);
    if (playerStats) {
      playerStats.missionStats.totalCompleted++;
      if (playerStats.missionStats.totalAssigned > 0) {
        playerStats.missionStats.completionRate = 
          (playerStats.missionStats.totalCompleted / playerStats.missionStats.totalAssigned) * 100;
      }
    }

    return true;

  } catch (error) {
    console.error('Error recording mission complete:', error);
    return false;
  }
}

// 킬 통계 기록
function recordKill(roomName, killerId, victimId) {
  try {
    // 방 통계 업데이트
    const roomStats = gameStatistics.get(roomName);
    if (roomStats) {
      roomStats.totalKills++;
    }

    // 킬러 통계 업데이트
    const killerStats = playerStatistics.get(killerId);
    if (killerStats) {
      killerStats.killStats.kills++;
      killerStats.killStats.killDeathRatio = 
        killerStats.killStats.deaths > 0 ? 
        killerStats.killStats.kills / killerStats.killStats.deaths : 
        killerStats.killStats.kills;
    }

    // 피해자 통계 업데이트
    const victimStats = playerStatistics.get(victimId);
    if (victimStats) {
      victimStats.killStats.deaths++;
      victimStats.killStats.killDeathRatio = 
        victimStats.killStats.deaths > 0 ? 
        victimStats.killStats.kills / victimStats.killStats.deaths : 
        0;
    }

    return true;

  } catch (error) {
    console.error('Error recording kill:', error);
    return false;
  }
}

// 회의 통계 기록
function recordMeeting(roomName, callerId, meetingType) {
  try {
    // 방 통계 업데이트
    const roomStats = gameStatistics.get(roomName);
    if (roomStats) {
      roomStats.meetingsCalled++;
      if (meetingType === 'emergency_button') {
        roomStats.emergencyMeetings++;
      }
    }

    // 플레이어 통계 업데이트
    const playerStats = playerStatistics.get(callerId);
    if (playerStats) {
      playerStats.meetingStats.meetingsCalled++;
      playerStats.achievementProgress.meetingMaster++;
    }

    return true;

  } catch (error) {
    console.error('Error recording meeting:', error);
    return false;
  }
}

// 시체 신고 통계 기록
function recordCorpseReport(roomName, reporterId, corpseId) {
  try {
    // 방 통계 업데이트
    const roomStats = gameStatistics.get(roomName);
    if (roomStats) {
      roomStats.corpsesReported++;
    }

    return true;

  } catch (error) {
    console.error('Error recording corpse report:', error);
    return false;
  }
}

// 투표 통계 기록
function recordVote(roomName, voterId, targetId, wasImpostor = false) {
  try {
    // 플레이어 통계 업데이트
    const playerStats = playerStatistics.get(voterId);
    if (playerStats) {
      playerStats.meetingStats.votescast++;
      
      if (wasImpostor) {
        playerStats.meetingStats.correctVotes++;
      }
      
      playerStats.meetingStats.voteAccuracy = 
        (playerStats.meetingStats.correctVotes / playerStats.meetingStats.votescast) * 100;
    }

    return true;

  } catch (error) {
    console.error('Error recording vote:', error);
    return false;
  }
}

// 추방 통계 기록
function recordEjection(roomName, ejectedPlayerId, voteResults) {
  try {
    // 투표 결과를 바탕으로 각 플레이어의 투표 정확도 업데이트
    // voteResults는 { targetId: { voters: [...] } } 형태라고 가정
    
    return true;

  } catch (error) {
    console.error('Error recording ejection:', error);
    return false;
  }
}

// 게임 통계 생성
function generateGameStats(roomName) {
  try {
    const roomStats = gameStatistics.get(roomName);
    if (!roomStats) {
      return null;
    }

    // 현재 게임의 상세 통계
    const currentGameStats = {
      roomName: roomName,
      gameNumber: roomStats.gamesPlayed,
      duration: Date.now() - roomStats.createdAt,
      totalPlayers: roomStats.averagePlayersPerGame,
      meetingsCalled: roomStats.meetingsCalled,
      totalKills: roomStats.totalKills,
      missionCompletionRate: roomStats.missionCompletionRate,
      winDistribution: {
        crewmate: roomStats.winsByTeam.crewmate,
        impostor: roomStats.winsByTeam.impostor,
        neutral: roomStats.winsByTeam.neutral
      }
    };

    return currentGameStats;

  } catch (error) {
    console.error('Error generating game stats:', error);
    return null;
  }
}

// 플레이어 통계 조회
function getPlayerStats(playerId) {
  try {
    return playerStatistics.get(playerId) || null;

  } catch (error) {
    console.error('Error getting player stats:', error);
    return null;
  }
}

// 방 통계 조회
function getRoomStats(roomName) {
  try {
    return gameStatistics.get(roomName) || null;

  } catch (error) {
    console.error('Error getting room stats:', error);
    return null;
  }
}

// 글로벌 통계 조회
function getGlobalStats() {
  try {
    return {
      ...globalStatistics,
      uptime: Date.now() - globalStatistics.serverUptime,
      activeRooms: gameStatistics.size,
      activePlayers: playerStatistics.size
    };

  } catch (error) {
    console.error('Error getting global stats:', error);
    return null;
  }
}

// 리더보드 생성
function generateLeaderboard(category = 'winRate', limit = 10) {
  try {
    const players = Array.from(playerStatistics.values());
    
    let sortedPlayers = [];
    
    switch (category) {
      case 'winRate':
        sortedPlayers = players
          .filter(p => p.gamesPlayed >= 5) // 최소 5게임 이상
          .sort((a, b) => b.winRate - a.winRate);
        break;
        
      case 'gamesPlayed':
        sortedPlayers = players.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
        break;
        
      case 'missionCompletion':
        sortedPlayers = players
          .filter(p => p.missionStats.totalAssigned >= 10)
          .sort((a, b) => b.missionStats.completionRate - a.missionStats.completionRate);
        break;
        
      case 'killDeathRatio':
        sortedPlayers = players
          .filter(p => p.killStats.deaths > 0)
          .sort((a, b) => b.killStats.killDeathRatio - a.killStats.killDeathRatio);
        break;
        
      case 'voteAccuracy':
        sortedPlayers = players
          .filter(p => p.meetingStats.votescast >= 10)
          .sort((a, b) => b.meetingStats.voteAccuracy - a.meetingStats.voteAccuracy);
        break;
        
      default:
        sortedPlayers = players.sort((a, b) => b.wins - a.wins);
    }

    return sortedPlayers.slice(0, limit).map((player, index) => ({
      rank: index + 1,
      playerId: player.playerId,
      nickname: player.nickname,
      value: getLeaderboardValue(player, category),
      gamesPlayed: player.gamesPlayed
    }));

  } catch (error) {
    console.error('Error generating leaderboard:', error);
    return [];
  }
}

// 리더보드 값 추출
function getLeaderboardValue(player, category) {
  switch (category) {
    case 'winRate':
      return `${player.winRate.toFixed(1)}%`;
    case 'gamesPlayed':
      return player.gamesPlayed;
    case 'missionCompletion':
      return `${player.missionStats.completionRate.toFixed(1)}%`;
    case 'killDeathRatio':
      return player.killStats.killDeathRatio.toFixed(2);
    case 'voteAccuracy':
      return `${player.meetingStats.voteAccuracy.toFixed(1)}%`;
    default:
      return player.wins;
  }
}

// 성취 확인 및 업데이트
function checkAchievements(playerId, gameData) {
  try {
    const playerStats = playerStatistics.get(playerId);
    if (!playerStats) {
      return [];
    }

    const newAchievements = [];

    // 완벽한 미션 수행 (모든 미션 완료)
    if (gameData.missionsCompleted === gameData.missionsAssigned) {
      playerStats.achievementProgress.perfectMissions++;
      if (playerStats.achievementProgress.perfectMissions === 1) {
        newAchievements.push('첫 완벽한 게임');
      }
    }

    // 클러치 승리 (마지막 남은 크루메이트로 승리)
    if (gameData.won && gameData.wasLastCrewmate) {
      playerStats.achievementProgress.clutchWins++;
      newAchievements.push('클러치 승리');
    }

    // 탐정 승리
    if (gameData.won && gameData.role === 'detective') {
      playerStats.achievementProgress.detectiveWins++;
      if (playerStats.achievementProgress.detectiveWins === 10) {
        newAchievements.push('명탐정');
      }
    }

    return newAchievements;

  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

// 통계 데이터 정리 (메모리 관리)
function cleanupOldStats() {
  try {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7일 전
    let cleaned = 0;

    // 오래된 방 통계 정리
    for (const [roomName, stats] of gameStatistics) {
      if (stats.createdAt < cutoffTime && stats.gamesPlayed === 0) {
        gameStatistics.delete(roomName);
        cleaned++;
      }
    }

    console.log(`[${new Date().toISOString()}] Cleaned up ${cleaned} old room statistics`);
    return cleaned;

  } catch (error) {
    console.error('Error cleaning up old stats:', error);
    return 0;
  }
}

// 정기적인 통계 정리 (1시간마다)
setInterval(cleanupOldStats, 60 * 60 * 1000);

// 통계 내보내기 (JSON 형태)
function exportStatistics() {
  try {
    const exportData = {
      timestamp: Date.now(),
      global: globalStatistics,
      rooms: Object.fromEntries(gameStatistics),
      players: Object.fromEntries(
        Array.from(playerStatistics.entries()).map(([id, stats]) => [
          id, 
          { ...stats, playerId: undefined } // playerId 중복 제거
        ])
      )
    };

    return JSON.stringify(exportData, null, 2);

  } catch (error) {
    console.error('Error exporting statistics:', error);
    return null;
  }
}

module.exports = {
  initializeRoomStats,
  recordGameStart,
  recordGameEnd,
  initializePlayerStats,
  recordMissionComplete,
  recordKill,
  recordMeeting,
  recordCorpseReport,
  recordVote,
  recordEjection,
  generateGameStats,
  getPlayerStats,
  getRoomStats,
  getGlobalStats,
  generateLeaderboard,
  checkAchievements,
  exportStatistics
};