// [server/src/game/meetingManager.js] - 회의/투표 관리 모듈
// 긴급 회의, 시체 신고, 토론, 투표, 결과 처리 등 모든 회의 시스템

// 회의 상태 관리
const activeMeetings = new Map(); // roomName -> meetingData
const meetingHistory = new Map(); // roomName -> meeting history
const playerVoteHistory = new Map(); // playerId -> vote history

// 회의 타입 정의
const MEETING_TYPES = {
  EMERGENCY: 'emergency_button',
  CORPSE_REPORT: 'corpse_report',
  ADMIN_CALL: 'admin_call'
};

// 투표 타입 정의
const VOTE_TYPES = {
  PLAYER: 'player',
  SKIP: 'skip',
  ABSTAIN: 'abstain'
};

// 회의 시작
function startMeeting(roomName, meetingData) {
  try {
    const meeting = {
      id: meetingData.id || Date.now().toString(),
      roomName: roomName,
      type: meetingData.type || MEETING_TYPES.EMERGENCY,
      callerId: meetingData.callerId,
      corpseId: meetingData.corpseId || null,
      startTime: meetingData.startTime || Date.now(),
      discussionEndTime: meetingData.discussionEndTime,
      votingEndTime: meetingData.votingEndTime,
      phase: 'discussion', // discussion, voting, results, ended
      participants: [], // 회의 참여자 목록
      votes: new Map(), // voterId -> voteData
      chatMessages: [], // 회의 중 채팅 메시지
      evidence: [], // 제출된 증거들
      accusations: [], // 고발/의혹 제기
      defenses: [], // 방어/해명
      settings: {
        allowAnonymousVotes: false,
        requireMajority: true,
        skipVoteCount: 'auto', // auto, manual, disabled
        emergencyMeetingCost: 1
      }
    };

    activeMeetings.set(roomName, meeting);
    
    // 회의 히스토리에 추가
    if (!meetingHistory.has(roomName)) {
      meetingHistory.set(roomName, []);
    }
    meetingHistory.get(roomName).push({
      id: meeting.id,
      type: meeting.type,
      callerId: meeting.callerId,
      startTime: meeting.startTime
    });

    console.log(`[${new Date().toISOString()}] Meeting started in room ${roomName}: ${meeting.type} by ${meeting.callerId}`);
    return meeting;

  } catch (error) {
    console.error('Error starting meeting:', error);
    return null;
  }
}

// 회의 참여자 설정
function setMeetingParticipants(roomName, participants) {
  try {
    const meeting = activeMeetings.get(roomName);
    if (!meeting) {
      return false;
    }

    meeting.participants = participants.map(participant => ({
      playerId: participant.id,
      nickname: participant.nickname,
      isAlive: participant.isAlive,
      role: participant.role,
      canVote: participant.isAlive,
      hasVoted: false,
      isAccused: false,
      accusationCount: 0
    }));

    return true;

  } catch (error) {
    console.error('Error setting meeting participants:', error);
    return false;
  }
}

// 투표 시작 (토론 단계에서 투표 단계로 전환)
function startVoting(roomName) {
  try {
    const meeting = activeMeetings.get(roomName);
    if (!meeting) {
      return false;
    }

    if (meeting.phase !== 'discussion') {
      return false;
    }

    meeting.phase = 'voting';
    meeting.votingStartTime = Date.now();

    console.log(`[${new Date().toISOString()}] Voting started in room ${roomName}`);
    return true;

  } catch (error) {
    console.error('Error starting voting:', error);
    return false;
  }
}

// 투표하기
function castVote(roomName, voterId, targetId) {
  try {
    const meeting = activeMeetings.get(roomName);
    if (!meeting) {
      return { success: false, reason: 'No active meeting' };
    }

    if (meeting.phase !== 'voting') {
      return { success: false, reason: 'Not in voting phase' };
    }

    // 투표자 유효성 확인
    const voter = meeting.participants.find(p => p.playerId === voterId);
    if (!voter) {
      return { success: false, reason: 'Voter not found in meeting' };
    }

    if (!voter.canVote) {
      return { success: false, reason: 'Voter cannot vote' };
    }

    if (voter.hasVoted) {
      return { success: false, reason: 'Already voted' };
    }

    // 투표 대상 유효성 확인 (스킵/기권 제외)
    if (targetId !== VOTE_TYPES.SKIP && targetId !== VOTE_TYPES.ABSTAIN) {
      const target = meeting.participants.find(p => p.playerId === targetId);
      if (!target) {
        return { success: false, reason: 'Invalid vote target' };
      }
    }

    // 투표 기록
    const voteData = {
      voterId: voterId,
      targetId: targetId,
      timestamp: Date.now(),
      voteType: determineVoteType(targetId),
      isAnonymous: meeting.settings.allowAnonymousVotes
    };

    meeting.votes.set(voterId, voteData);
    voter.hasVoted = true;

    // 투표 히스토리 기록
    if (!playerVoteHistory.has(voterId)) {
      playerVoteHistory.set(voterId, []);
    }
    playerVoteHistory.get(voterId).push({
      meetingId: meeting.id,
      roomName: roomName,
      targetId: targetId,
      timestamp: Date.now()
    });

    console.log(`[${new Date().toISOString()}] Vote cast in room ${roomName}: ${voterId} -> ${targetId}`);
    return { success: true };

  } catch (error) {
    console.error('Error casting vote:', error);
    return { success: false, reason: 'Server error' };
  }
}

// 투표 결과 조회
function getVoteResults(roomName) {
  try {
    const meeting = activeMeetings.get(roomName);
    if (!meeting) {
      return null;
    }

    const results = {
      totalVotes: meeting.votes.size,
      totalEligibleVoters: meeting.participants.filter(p => p.canVote).length,
      votesByTarget: {},
      voteDetails: [],
      votingComplete: false
    };

    // 투표 집계
    for (const [voterId, voteData] of meeting.votes) {
      const targetId = voteData.targetId;
      
      if (!results.votesByTarget[targetId]) {
        results.votesByTarget[targetId] = {
          count: 0,
          voters: [],
          percentage: 0
        };
      }

      results.votesByTarget[targetId].count++;
      
      if (!meeting.settings.allowAnonymousVotes) {
        results.votesByTarget[targetId].voters.push(voterId);
      }

      results.voteDetails.push({
        voterId: meeting.settings.allowAnonymousVotes ? 'anonymous' : voterId,
        targetId: targetId,
        voteType: voteData.voteType,
        timestamp: voteData.timestamp
      });
    }

    // 투표율 계산
    for (const targetId in results.votesByTarget) {
      const voteCount = results.votesByTarget[targetId].count;
      results.votesByTarget[targetId].percentage = 
        (voteCount / results.totalEligibleVoters) * 100;
    }

    // 투표 완료 여부 확인
    results.votingComplete = results.totalVotes >= results.totalEligibleVoters;

    return results;

  } catch (error) {
    console.error('Error getting vote results:', error);
    return null;
  }
}

// 투표한 플레이어 목록 조회
function getVotedPlayers(roomName) {
  try {
    const meeting = activeMeetings.get(roomName);
    if (!meeting) {
      return [];
    }

    return Array.from(meeting.votes.keys());

  } catch (error) {
    console.error('Error getting voted players:', error);
    return [];
  }
}

// 추방 대상 결정
function determineEjection(roomName, voteResults) {
  try {
    const meeting = activeMeetings.get(roomName);
    if (!meeting) {
      return null;
    }

    if (!voteResults) {
      voteResults = getVoteResults(roomName);
    }

    if (!voteResults || !voteResults.votesByTarget) {
      return null;
    }

    // 스킵/기권 투표 제외하고 플레이어 투표만 집계
    const playerVotes = {};
    
    for (const [targetId, voteInfo] of Object.entries(voteResults.votesByTarget)) {
      if (targetId !== VOTE_TYPES.SKIP && targetId !== VOTE_TYPES.ABSTAIN) {
        playerVotes[targetId] = voteInfo.count;
      }
    }

    // 가장 많은 표를 받은 플레이어 찾기
    let maxVotes = 0;
    let ejectedPlayer = null;
    const tiedPlayers = [];

    for (const [playerId, voteCount] of Object.entries(playerVotes)) {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        ejectedPlayer = playerId;
        tiedPlayers.length = 0;
        tiedPlayers.push(playerId);
      } else if (voteCount === maxVotes && voteCount > 0) {
        tiedPlayers.push(playerId);
      }
    }

    // 동점 처리
    if (tiedPlayers.length > 1) {
      // 설정에 따라 동점 처리 방식 결정
      if (meeting.settings.requireMajority) {
        const requiredVotes = Math.ceil(voteResults.totalEligibleVoters / 2);
        if (maxVotes < requiredVotes) {
          ejectedPlayer = null; // 과반수 미달로 추방 없음
        }
      } else {
        // 동점일 경우 랜덤 선택 또는 추방 없음
        ejectedPlayer = null; // 동점으로 추방 없음
      }
    }

    // 스킵 투표가 더 많은 경우
    const skipVotes = voteResults.votesByTarget[VOTE_TYPES.SKIP]?.count || 0;
    if (skipVotes > maxVotes) {
      ejectedPlayer = null;
    }

    return ejectedPlayer;

  } catch (error) {
    console.error('Error determining ejection:', error);
    return null;
  }
}

// 회의 종료
function endMeeting(roomName) {
  try {
    const meeting = activeMeetings.get(roomName);
    if (!meeting) {
      return false;
    }

    meeting.phase = 'ended';
    meeting.endTime = Date.now();

    // 회의 결과를 히스토리에 저장
    const history = meetingHistory.get(roomName);
    if (history) {
      const meetingRecord = history.find(m => m.id === meeting.id);
      if (meetingRecord) {
        meetingRecord.endTime = meeting.endTime;
        meetingRecord.voteResults = getVoteResults(roomName);
        meetingRecord.ejectedPlayer = determineEjection(roomName);
        meetingRecord.duration = meeting.endTime - meeting.startTime;
      }
    }

    // 액티브 회의에서 제거
    activeMeetings.delete(roomName);

    console.log(`[${new Date().toISOString()}] Meeting ended in room ${roomName}`);
    return true;

  } catch (error) {
    console.error('Error ending meeting:', error);
    return false;
  }
}

// 회의 중 메시지 추가
function addMeetingMessage(roomName, message) {
  try {
    const meeting = activeMeetings.get(roomName);
    if (!meeting) {
      return false;
    }

    meeting.chatMessages.push({
      id: Date.now().toString(),
      senderId: message.senderId,
      senderName: message.senderName,
      content: message.content,
      timestamp: Date.now(),
      type: message.type || 'normal' // normal, system, evidence
    });

    return true;

  } catch (error) {
    console.error('Error adding meeting message:', error);
    return false;
  }
}

// 증거 제출
function submitEvidence(roomName, evidence) {
  try {
    const meeting = activeMeetings.get(roomName);
    if (!meeting) {
      return false;
    }

    meeting.evidence.push({
      id: Date.now().toString(),
      submitterId: evidence.submitterId,
      submitterName: evidence.submitterName,
      type: evidence.type, // screenshot, testimony, observation
      content: evidence.content,
      timestamp: Date.now(),
      credibility: 1.0 // 신뢰도 점수
    });

    console.log(`[${new Date().toISOString()}] Evidence submitted in room ${roomName} by ${evidence.submitterName}`);
    return true;

  } catch (error) {
    console.error('Error submitting evidence:', error);
    return false;
  }
}

// 고발/의혹 제기
function makeAccusation(roomName, accusation) {
  try {
    const meeting = activeMeetings.get(roomName);
    if (!meeting) {
      return false;
    }

    // 고발당한 플레이어의 고발 횟수 증가
    const accusedParticipant = meeting.participants.find(p => p.playerId === accusation.accusedId);
    if (accusedParticipant) {
      accusedParticipant.accusationCount++;
      accusedParticipant.isAccused = true;
    }

    meeting.accusations.push({
      id: Date.now().toString(),
      accuserId: accusation.accuserId,
      accuserName: accusation.accuserName,
      accusedId: accusation.accusedId,
      accusedName: accusation.accusedName,
      reason: accusation.reason,
      evidenceIds: accusation.evidenceIds || [],
      timestamp: Date.now(),
      severity: accusation.severity || 'medium' // low, medium, high
    });

    console.log(`[${new Date().toISOString()}] Accusation made in room ${roomName}: ${accusation.accuserName} accused ${accusation.accusedName}`);
    return true;

  } catch (error) {
    console.error('Error making accusation:', error);
    return false;
  }
}

// 방어/해명
function makeDefense(roomName, defense) {
  try {
    const meeting = activeMeetings.get(roomName);
    if (!meeting) {
      return false;
    }

    meeting.defenses.push({
      id: Date.now().toString(),
      defenderId: defense.defenderId,
      defenderName: defense.defenderName,
      accusationId: defense.accusationId,
      content: defense.content,
      evidenceIds: defense.evidenceIds || [],
      timestamp: Date.now(),
      credibility: 1.0
    });

    console.log(`[${new Date().toISOString()}] Defense made in room ${roomName} by ${defense.defenderName}`);
    return true;

  } catch (error) {
    console.error('Error making defense:', error);
    return false;
  }
}

// 현재 회의 정보 조회
function getCurrentMeeting(roomName) {
  return activeMeetings.get(roomName) || null;
}

// 회의 히스토리 조회
function getMeetingHistory(roomName) {
  return meetingHistory.get(roomName) || [];
}

// 플레이어 투표 히스토리 조회
function getPlayerVoteHistory(playerId) {
  return playerVoteHistory.get(playerId) || [];
}

// 방 리셋
function resetRoom(roomName) {
  try {
    activeMeetings.delete(roomName);
    meetingHistory.delete(roomName);
    
    // 해당 방의 플레이어들 투표 히스토리도 정리 (선택사항)
    // 여기서는 유지하여 통계 목적으로 사용

    return true;

  } catch (error) {
    console.error('Error resetting room meetings:', error);
    return false;
  }
}

// 투표 타입 결정
function determineVoteType(targetId) {
  if (targetId === VOTE_TYPES.SKIP) return 'skip';
  if (targetId === VOTE_TYPES.ABSTAIN) return 'abstain';
  return 'player';
}

// 회의 설정 업데이트
function updateMeetingSettings(roomName, settings) {
  try {
    const meeting = activeMeetings.get(roomName);
    if (!meeting) {
      return false;
    }

    meeting.settings = { ...meeting.settings, ...settings };
    return true;

  } catch (error) {
    console.error('Error updating meeting settings:', error);
    return false;
  }
}

// 회의 통계 생성
function generateMeetingStats(roomName) {
  try {
    const history = meetingHistory.get(roomName) || [];
    
    if (history.length === 0) {
      return null;
    }

    const stats = {
      totalMeetings: history.length,
      meetingTypes: {},
      averageDuration: 0,
      totalVotes: 0,
      ejectionRate: 0,
      mostActivePlayer: null
    };

    let totalDuration = 0;
    let totalEjections = 0;
    const playerActivity = {};

    for (const meeting of history) {
      // 회의 타입별 통계
      stats.meetingTypes[meeting.type] = (stats.meetingTypes[meeting.type] || 0) + 1;

      // 지속 시간 통계
      if (meeting.duration) {
        totalDuration += meeting.duration;
      }

      // 추방 통계
      if (meeting.ejectedPlayer) {
        totalEjections++;
      }

      // 투표 통계
      if (meeting.voteResults) {
        stats.totalVotes += meeting.voteResults.totalVotes;
      }

      // 플레이어 활동 통계
      if (meeting.callerId) {
        playerActivity[meeting.callerId] = (playerActivity[meeting.callerId] || 0) + 1;
      }
    }

    // 평균 지속 시간
    stats.averageDuration = totalDuration / history.length;

    // 추방율
    stats.ejectionRate = (totalEjections / history.length) * 100;

    // 가장 활발한 플레이어 (회의를 가장 많이 소집한 플레이어)
    let maxActivity = 0;
    for (const [playerId, count] of Object.entries(playerActivity)) {
      if (count > maxActivity) {
        maxActivity = count;
        stats.mostActivePlayer = playerId;
      }
    }

    return stats;

  } catch (error) {
    console.error('Error generating meeting stats:', error);
    return null;
  }
}

module.exports = {
  MEETING_TYPES,
  VOTE_TYPES,
  startMeeting,
  setMeetingParticipants,
  startVoting,
  castVote,
  getVoteResults,
  getVotedPlayers,
  determineEjection,
  endMeeting,
  addMeetingMessage,
  submitEvidence,
  makeAccusation,
  makeDefense,
  getCurrentMeeting,
  getMeetingHistory,
  getPlayerVoteHistory,
  resetRoom,
  updateMeetingSettings,
  generateMeetingStats
};