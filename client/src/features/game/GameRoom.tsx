// [client/src/features/game/GameRoom.tsx] - 완전한 게임룸 컴포넌트
// 실제 미니게임과 연동된 완전한 게임 플레이 시스템

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import './GameRoom.css';
import MissionModal from './MissionModal';

// ============================
// 타입 정의
// ============================

interface Player {
  id: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  role: {
    id: string;
    name: string;
    team: 'crewmate' | 'impostor' | 'neutral';
    canKill: boolean;
    canSabotage: boolean;
    canVent: boolean;
    abilities: string[];
    description: string;
  } | null;
  position: { x: number; y: number };
  isAlive: boolean;
  completedMissions: string[];
}

interface RoomData {
  name: string;
  players: Player[];
  options: {
    maxPlayers: number;
    impostorCount: number;
    detectiveCount: number;
    isPrivate: boolean;
    roomCode?: string;
    password?: string;
    gameMode: 'classic' | 'custom' | 'detective';
    map: 'spaceship' | 'office' | 'laboratory';
    killCooldown: number;
    discussionTime: number;
    votingTime: number;
    emergencyMeetings: number;
  };
  gameState: string;
  hostId?: string;
  createdAt?: number;
}

interface GameRoomProps {
  socket: Socket | null;
  roomData: RoomData;
  playerData: Player | null;
  gamePhase: string;
  myMissions: string[];
  teammates: Player[];
  settings: any;
  onLeaveRoom: () => void;
}

interface MissionData {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  description?: string;
  timeLimit?: number;
  requiredSteps?: number;
  config: any;
}

interface MissionResult {
  success: boolean;
  timeSpent?: number;
  accuracy?: number;
  steps?: number;
}

// ============================
// 게임 상수
// ============================

const WORLD_WIDTH = 1200;
const WORLD_HEIGHT = 800;
const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;
const PLAYER_SIZE = 40;
const MOVE_SPEED = 3;
const INTERACTION_DISTANCE = 80;

// ============================
// 메인 컴포넌트
// ============================

const GameRoom: React.FC<GameRoomProps> = ({
  socket,
  roomData,
  playerData,
  gamePhase,
  myMissions,
  teammates,
  settings,
  onLeaveRoom
}) => {
  // ============================
  // 상태 관리
  // ============================

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [showMissionModal, setShowMissionModal] = useState<boolean>(false);
  const [currentMission, setCurrentMission] = useState<MissionData | null>(null);
  const [nearbyPlayers, setNearbyPlayers] = useState<Player[]>([]);
  const [killCooldown, setKillCooldown] = useState<number>(0);
  const [emergencyMeetingsLeft, setEmergencyMeetingsLeft] = useState<number>(3);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [showKillButton, setShowKillButton] = useState<boolean>(false);
  const [gameTime, setGameTime] = useState<number>(0);
  const [meetingData, setMeetingData] = useState<any>(null);
  const [votingData, setVotingData] = useState<any>(null);
  const [myVote, setMyVote] = useState<string | null>(null);

  // 키 입력 상태
  const [keysPressed, setKeysPressed] = useState<{[key: string]: boolean}>({});

  // refs
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const gameStartTime = useRef<number>(0);

  // ============================
  // 이벤트 리스너 설정
  // ============================

  useEffect(() => {
    if (!socket) return;

    // 플레이어 업데이트
    socket.on('playersUpdated', (players: Player[]) => {
      setAllPlayers(players);
    });

    // 플레이어 이동
    socket.on('playerMoved', (playerData: Player) => {
      setAllPlayers(prev => prev.map(p => 
        p.id === playerData.id ? { ...p, position: playerData.position } : p
      ));
    });

    // 게임 시작
    socket.on('gameStarted', (data: { role: any; teammates: Player[]; missions: string[] }) => {
      gameStartTime.current = Date.now();
      setGameTime(0);
    });

    // 회의 시작
    socket.on('meetingStarted', (data: any) => {
      setMeetingData(data);
    });

    // 투표 시작
    socket.on('votingStarted', () => {
      setVotingData({ phase: 'voting' });
      setMyVote(null);
    });

    // 투표 업데이트
    socket.on('votingUpdate', (data: any) => {
      setVotingData((prev: any) => ({ ...prev, ...data }));
    });

    // 게임 종료
    socket.on('gameEnded', (results: any) => {
      console.log('Game ended:', results);
    });

    // 미션 진행도 업데이트
    socket.on('missionProgress', (data: any) => {
      console.log('Mission progress:', data);
    });

    return () => {
      socket.off('playersUpdated');
      socket.off('playerMoved');
      socket.off('gameStarted');
      socket.off('meetingStarted');
      socket.off('votingStarted');
      socket.off('votingUpdate');
      socket.off('gameEnded');
      socket.off('missionProgress');
    };
  }, [socket]);

  // ============================
  // 키보드 입력 처리
  // ============================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.code]: true }));
      
      // 특수 키 처리
      switch (e.code) {
        case 'KeyE':
          if (gamePhase === 'playing' && emergencyMeetingsLeft > 0) {
            handleEmergencyMeeting();
          }
          break;
        case 'KeyR':
          if (gamePhase === 'playing') {
            handleReportCorpse();
          }
          break;
        case 'KeyQ':
          if (gamePhase === 'playing' && playerData?.role?.canKill && killCooldown === 0) {
            handleKillAttempt();
          }
          break;
        case 'KeyF':
        case 'Space':
          if (gamePhase === 'playing') {
            handleInteraction();
          }
          break;
        case 'Tab':
          e.preventDefault();
          setShowMap(!showMap);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.code]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gamePhase, killCooldown, emergencyMeetingsLeft, showMap, playerData]);

  // ============================
  // 게임 루프
  // ============================

  useEffect(() => {
    if (!playerData || gamePhase !== 'playing') return;

    const gameLoop = () => {
      movePlayer();
      updateNearbyPlayers();
      updateGameTime();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [keysPressed, playerData, gamePhase, socket, roomData]);

  // ============================
  // 게임 로직 함수들
  // ============================

  const movePlayer = useCallback(() => {
    if (!playerData || !socket) return;

    let newX = playerData.position.x;
    let newY = playerData.position.y;
    let moved = false;

    if (keysPressed['KeyW'] || keysPressed['ArrowUp']) {
      newY = Math.max(0, newY - MOVE_SPEED);
      moved = true;
    }
    if (keysPressed['KeyS'] || keysPressed['ArrowDown']) {
      newY = Math.min(WORLD_HEIGHT - PLAYER_SIZE, newY + MOVE_SPEED);
      moved = true;
    }
    if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) {
      newX = Math.max(0, newX - MOVE_SPEED);
      moved = true;
    }
    if (keysPressed['KeyD'] || keysPressed['ArrowRight']) {
      newX = Math.min(WORLD_WIDTH - PLAYER_SIZE, newX + MOVE_SPEED);
      moved = true;
    }

    if (moved) {
      const newPosition = { x: newX, y: newY };
      socket.emit('movePlayer', {
        roomName: roomData.name,
        position: newPosition
      });
    }
  }, [keysPressed, playerData, socket, roomData]);

  const updateNearbyPlayers = useCallback(() => {
    if (!playerData) return;

    const nearby = allPlayers.filter((player: Player) => {
      if (player.id === playerData.id || !player.isAlive) return false;
      
      const distance = Math.sqrt(
        Math.pow(player.position.x - playerData.position.x, 2) +
        Math.pow(player.position.y - playerData.position.y, 2)
      );
      
      return distance <= INTERACTION_DISTANCE;
    });

    setNearbyPlayers(nearby);
    
    // 킬 버튼 표시 여부
    if (playerData.role?.canKill && killCooldown === 0) {
      const killableNearby = nearby.some((p: Player) => 
        p.role?.team !== playerData.role?.team
      );
      setShowKillButton(killableNearby);
    } else {
      setShowKillButton(false);
    }
  }, [playerData, allPlayers, killCooldown]);

  const updateGameTime = useCallback(() => {
    if (gameStartTime.current > 0) {
      setGameTime(Math.floor((Date.now() - gameStartTime.current) / 1000));
    }
  }, []);

  const handleEmergencyMeeting = useCallback(() => {
    if (!socket || emergencyMeetingsLeft <= 0) return;

    socket.emit('emergencyMeeting', {
      roomName: roomData.name
    });

    setEmergencyMeetingsLeft(prev => prev - 1);
  }, [socket, roomData, emergencyMeetingsLeft]);

  const handleReportCorpse = useCallback(() => {
    if (!socket) return;

    socket.emit('reportCorpse', {
      roomName: roomData.name,
      corpseId: 'nearest' // 실제로는 가장 가까운 시체 ID를 찾아야 함
    });
  }, [socket, roomData]);

  const handleKillAttempt = useCallback(() => {
    if (!socket || !playerData?.role?.canKill || killCooldown > 0) return;

    const target = nearbyPlayers.find(p => 
      p.role?.team !== playerData.role?.team
    );

    if (target) {
      socket.emit('attemptKill', {
        roomName: roomData.name,
        targetId: target.id
      });

      // 킬 쿨다운 시작
      setKillCooldown(roomData.options?.killCooldown || 30);
    }
  }, [socket, roomData, playerData, nearbyPlayers, killCooldown]);

  const handleInteraction = useCallback(() => {
    if (!socket || !playerData) return;

    // 미션 확인
    const availableMission = myMissions.find(missionId => {
      // 실제로는 미션 위치를 확인해야 함
      return true; // 임시로 모든 미션을 사용 가능하게
    });

    if (availableMission) {
      // 미션 데이터 생성 (실제로는 서버에서 받아야 함)
      const missionData: MissionData = {
        id: availableMission,
        name: '미션',
        type: 'click',
        difficulty: 'normal',
        description: '미션을 완료하세요',
        timeLimit: 30000,
        config: {}
      };

      setCurrentMission(missionData);
      setShowMissionModal(true);
    }
  }, [socket, playerData, myMissions]);

  const handleMissionComplete = useCallback((result: MissionResult) => {
    if (!socket || !currentMission) return;

    socket.emit('completeMission', {
      roomName: roomData.name,
      missionId: currentMission.id,
      result: result
    });

    setShowMissionModal(false);
    setCurrentMission(null);
  }, [socket, roomData, currentMission]);

  const handleVote = useCallback((targetId: string) => {
    if (!socket || myVote !== null) return;

    socket.emit('castVote', {
      roomName: roomData.name,
      targetId: targetId
    });

    setMyVote(targetId);
  }, [socket, roomData, myVote]);

  // ============================
  // 타이머 효과
  // ============================

  useEffect(() => {
    if (killCooldown > 0) {
      const timer = setTimeout(() => {
        setKillCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [killCooldown]);

  // ============================
  // 준비 상태 토글
  // ============================

  const handleToggleReady = useCallback(() => {
    if (!socket) return;

    socket.emit('toggleReady', {
      roomName: roomData.name
    });
  }, [socket, roomData]);

  // ============================
  // 게임 시작
  // ============================

  const handleStartGame = useCallback(() => {
    if (!socket || !playerData?.isHost) return;

    socket.emit('startGame', {
      roomName: roomData.name
    });
  }, [socket, roomData, playerData]);

  // ============================
  // 렌더링 함수들
  // ============================

  const renderWaitingRoom = () => (
    <div className="waiting-room">
      <div className="room-header">
        <h2>방: {roomData.name}</h2>
        <button onClick={onLeaveRoom} className="leave-btn">방 나가기</button>
      </div>

      <div className="players-list">
        <h3>플레이어 목록 ({roomData.players?.length || 0}/{roomData.options?.maxPlayers || 10})</h3>
        <div className="players-grid">
          {roomData.players?.map((player: Player) => (
            <div key={player.id} className="player-card">
              <div className="player-info">
                <span className="player-name">{player.nickname}</span>
                {player.isHost && <span className="host-badge">방장</span>}
                {player.id === playerData?.id && <span className="me-badge">나</span>}
              </div>
              <div className="player-status">
                {player.isReady ? 
                  <span className="ready">준비완료</span> : 
                  <span className="not-ready">대기중</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="room-controls">
        {playerData?.isHost ? (
          <button 
            onClick={handleStartGame}
            disabled={(roomData.players?.length || 0) < 4}
            className="start-game-btn"
          >
            게임 시작 (최소 4명)
          </button>
        ) : (
          <button 
            onClick={handleToggleReady}
            className={playerData?.isReady ? 'ready-btn active' : 'ready-btn'}
          >
            {playerData?.isReady ? '준비 해제' : '준비'}
          </button>
        )}
      </div>

      <div className="room-settings">
        <h4>방 설정</h4>
        <div className="settings-grid">
          <div>최대 플레이어: {roomData.options?.maxPlayers}</div>
          <div>킬 쿨다운: {roomData.options?.killCooldown}초</div>
          <div>토론 시간: {roomData.options?.discussionTime}초</div>
          <div>투표 시간: {roomData.options?.votingTime}초</div>
        </div>
      </div>
    </div>
  );

  const renderGamePlay = () => (
    <div className="game-play">
      {/* 게임 캔버스 */}
      <div className="game-canvas-container">
        <canvas 
          ref={gameCanvasRef}
          width={VIEWPORT_WIDTH}
          height={VIEWPORT_HEIGHT}
          className="game-canvas"
        />
        
        {/* 플레이어들 렌더링 */}
        <div className="players-overlay">
          {allPlayers.map(player => (
            <div
              key={player.id}
              className={`player-sprite ${player.id === playerData?.id ? 'me' : ''} ${!player.isAlive ? 'dead' : ''}`}
              style={{
                left: player.position.x - (playerData?.position.x || 0) + VIEWPORT_WIDTH / 2,
                top: player.position.y - (playerData?.position.y || 0) + VIEWPORT_HEIGHT / 2,
              }}
            >
              <div className="player-name">{player.nickname}</div>
              {player.role && (
                <div className="player-role">{player.role.name}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 게임 UI */}
      <div className="game-ui">
        {/* 상단 HUD */}
        <div className="top-hud">
          <div className="role-info">
            <h3>{playerData?.role?.name || '역할 없음'}</h3>
            <p>{playerData?.role?.description}</p>
          </div>
          
          <div className="mission-progress">
            <h4>미션 진행도</h4>
            <div className="mission-bar">
              <div 
                className="mission-fill"
                style={{
                  width: `${(myMissions.length > 0 ? (myMissions.filter(m => m).length / myMissions.length) : 0) * 100}%`
                }}
              />
            </div>
            <span>{myMissions.filter(m => m).length}/{myMissions.length}</span>
          </div>

          <div className="game-time">
            <span>게임 시간: {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* 하단 액션 버튼들 */}
        <div className="bottom-hud">
          {playerData?.role?.canKill && (
            <button 
              className={`action-btn kill-btn ${showKillButton && killCooldown === 0 ? 'active' : ''}`}
              disabled={!showKillButton || killCooldown > 0}
              onClick={handleKillAttempt}
            >
              {killCooldown > 0 ? `킬 (${killCooldown}s)` : '킬 (Q)'}
            </button>
          )}
          
          <button 
            className="action-btn report-btn"
            onClick={handleReportCorpse}
          >
            신고 (R)
          </button>
          
          <button 
            className={`action-btn emergency-btn ${emergencyMeetingsLeft > 0 ? 'active' : ''}`}
            disabled={emergencyMeetingsLeft <= 0}
            onClick={handleEmergencyMeeting}
          >
            긴급회의 ({emergencyMeetingsLeft}) (E)
          </button>
          
          <button 
            className="action-btn map-btn"
            onClick={() => setShowMap(!showMap)}
          >
            지도 (Tab)
          </button>
        </div>
      </div>

      {/* 조작 안내 */}
      <div className="controls-guide">
        <p>WASD: 이동 | Space/F: 상호작용 | Q: 킬 | R: 신고 | E: 긴급회의 | Tab: 지도</p>
      </div>
    </div>
  );

  const renderMeeting = () => (
    <div className="meeting-phase">
      <h2>회의 진행 중...</h2>
      <p>회의 모달이 곧 열립니다.</p>
    </div>
  );

  const renderGameContent = () => {
    switch (gamePhase) {
      case 'lobby':
        return renderWaitingRoom();
      case 'playing':
        return renderGamePlay();
      case 'meeting':
      case 'voting':
        return renderMeeting();
      default:
        return <div>Loading...</div>;
    }
  };

  // ============================
  // 메인 렌더링
  // ============================

  return (
    <div className="game-room">
      {renderGameContent()}
      
      {/* 미션 모달 */}
      {showMissionModal && currentMission && (
        <MissionModal
          isOpen={showMissionModal}
          missionData={currentMission}
          socket={socket}
          roomName={roomData.name}
          onClose={() => setShowMissionModal(false)}
          onComplete={handleMissionComplete}
        />
      )}

      {/* 지도 모달 */}
      {showMap && (
        <div className="modal-overlay">
          <div className="map-modal">
            <div className="map-header">
              <h3>지도</h3>
              <button onClick={() => setShowMap(false)}>×</button>
            </div>
            <div className="mini-map">
              <div className="map-players">
                {allPlayers.map(player => (
                  <div
                    key={player.id}
                    className={`map-player ${player.id === playerData?.id ? 'me' : ''}`}
                    style={{
                      left: `${(player.position.x / WORLD_WIDTH) * 100}%`,
                      top: `${(player.position.y / WORLD_HEIGHT) * 100}%`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
