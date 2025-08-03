// [client/src/features/game/GameRoom.tsx] - 게임룸 메인 컴포넌트
// 게임 플레이, 이동, UI 등 모든 게임 기능

import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import './GameRoom.css';

interface Player {
  id: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  role: any;
  position: { x: number; y: number };
  isAlive: boolean;
  completedMissions: any[];
}

interface GameRoomProps {
  socket: Socket | null;
  roomData: any;
  playerData: Player | null;
  gamePhase: string;
  myMissions: any[];
  teammates: any[];
  settings: any;
  onLeaveRoom: () => void;
}

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
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [showMissionModal, setShowMissionModal] = useState<boolean>(false);
  const [showKillButton, setShowKillButton] = useState<boolean>(false);
  const [showEmergencyButton, setShowEmergencyButton] = useState<boolean>(true);
  const [showMeetingModal, setShowMeetingModal] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [nearbyPlayers, setNearbyPlayers] = useState<Player[]>([]);
  const [currentMission, setCurrentMission] = useState<any>(null);
  const [killCooldown, setKillCooldown] = useState<number>(0);
  const [emergencyMeetingsLeft, setEmergencyMeetingsLeft] = useState<number>(3);
  
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // 키 입력 상태 관리
  const [keysPressed, setKeysPressed] = useState<{[key: string]: boolean}>({});

  // 게임 월드 설정
  const WORLD_WIDTH = 1200;
  const WORLD_HEIGHT = 800;
  const VIEWPORT_WIDTH = 800;
  const VIEWPORT_HEIGHT = 600;
  const PLAYER_SIZE = 40;
  const MOVE_SPEED = 3;

  // 플레이어 위치 업데이트
  useEffect(() => {
    if (!socket) return;

    socket.on('playersUpdated', (players: Player[]) => {
      setAllPlayers(players);
    });

    socket.on('playerMoved', (playerData: Player) => {
      setAllPlayers(prev => prev.map(p => 
        p.id === playerData.id ? { ...p, position: playerData.position } : p
      ));
    });

    return () => {
      socket.off('playersUpdated');
      socket.off('playerMoved');
    };
  }, [socket]);

  // 키보드 입력 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.code]: true }));
      
      // 특수 키 처리
      switch (e.code) {
        case 'KeyE':
          if (gamePhase === 'game' && emergencyMeetingsLeft > 0) {
            handleEmergencyMeeting();
          }
          break;
        case 'KeyR':
          if (gamePhase === 'game') {
            handleReportCorpse();
          }
          break;
        case 'KeyQ':
          if (gamePhase === 'game' && playerData?.role?.canKill && killCooldown === 0) {
            handleKillAttempt();
          }
          break;
        case 'KeyF':
        case 'Space':
          if (gamePhase === 'game') {
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
  }, [gamePhase, killCooldown, emergencyMeetingsLeft, showMap]);

  // 이동 처리
  useEffect(() => {
    if (!playerData || gamePhase !== 'game') return;

    const movePlayer = () => {
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

      if (moved && socket) {
        const newPosition = { x: newX, y: newY };
        socket.emit('movePlayer', {
          roomName: roomData.name,
          position: newPosition
        });
      }
    };

    const gameLoop = () => {
      movePlayer();
      updateNearbyPlayers();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [keysPressed, playerData, gamePhase, socket, roomData]);

  // 주변 플레이어 확인
  const updateNearbyPlayers = () => {
    if (!playerData) return;

    const nearby = allPlayers.filter(player => {
      if (player.id === playerData.id || !player.isAlive) return false;
      
      const distance = Math.sqrt(
        Math.pow(player.position.x - playerData.position.x, 2) +
        Math.pow(player.position.y - playerData.position.y, 2)
      );
      
      return distance <= 80; // 상호작용 거리
    });

    setNearbyPlayers(nearby);
    
    // 킬 버튼 표시 여부
    if (playerData.role?.canKill && killCooldown === 0) {
      const killableNearby = nearby.some(p => 
        p.role?.team !== playerData.role?.team
      );
      setShowKillButton(killableNearby);
    } else {
      setShowKillButton(false);
    }
  };

  // 긴급 회의 소집
  const handleEmergencyMeeting = () => {
    if (!socket || emergencyMeetingsLeft <= 0) return;

    socket.emit('emergencyMeeting', {
      roomName: roomData.name,
      callerId: playerData?.id
    });

    setEmergencyMeetingsLeft(prev => prev - 1);
  };

  // 시체 신고
  const handleReportCorpse = () => {
    if (!socket) return;

    // 주변에 시체가 있는지 확인
    socket.emit('reportCorpse', {
      roomName: roomData.name,
      reporterId: playerData?.id,
      position: playerData?.position
    });
  };

  // 킬 시도
  const handleKillAttempt = () => {
    if (!socket || !playerData?.role?.canKill || killCooldown > 0) return;

    const target = nearbyPlayers.find(p => 
      p.role?.team !== playerData.role?.team
    );

    if (target) {
      socket.emit('attemptKill', {
        roomName: roomData.name,
        killerId: playerData.id,
        targetId: target.id
      });

      // 킬 쿨다운 시작
      setKillCooldown(roomData.options?.killCooldown || 30);
    }
  };

  // 상호작용 (미션, 벤트 등)
  const handleInteraction = () => {
    if (!socket || !playerData) return;

    // 미션 확인
    const availableMission = myMissions.find(mission => 
      !mission.completed && 
      Math.abs(mission.position.x - playerData.position.x) <= 50 &&
      Math.abs(mission.position.y - playerData.position.y) <= 50
    );

    if (availableMission) {
      setCurrentMission(availableMission);
      setShowMissionModal(true);
    }
  };

  // 미션 완료 처리
  const handleMissionComplete = (mission: any, result: any) => {
    if (!socket) return;

    socket.emit('completeMission', {
      roomName: roomData.name,
      missionId: mission.id,
      result: result
    });

    setShowMissionModal(false);
    setCurrentMission(null);
  };

  // 킬 쿨다운 타이머
  useEffect(() => {
    if (killCooldown > 0) {
      const timer = setTimeout(() => {
        setKillCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [killCooldown]);

  // 준비 상태 토글
  const handleToggleReady = () => {
    if (!socket) return;

    socket.emit('toggleReady', {
      roomName: roomData.name
    });
  };

  // 게임 시작 (방장만)
  const handleStartGame = () => {
    if (!socket || !playerData?.isHost) return;

    socket.emit('startGame', {
      roomName: roomData.name
    });
  };

  // 게임 단계별 렌더링
  const renderGameContent = () => {
    switch (gamePhase) {
      case 'room':
        return renderWaitingRoom();
      case 'game':
        return renderGamePlay();
      case 'meeting':
      case 'voting':
        return renderMeeting();
      default:
        return <div>Loading...</div>;
    }
  };

  // 대기실 렌더링
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

  // 게임 플레이 렌더링
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
                  width: `${(myMissions.filter(m => m.completed).length / myMissions.length) * 100}%`
                }}
              />
            </div>
            <span>{myMissions.filter(m => m.completed).length}/{myMissions.length}</span>
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

  // 회의 렌더링
  const renderMeeting = () => (
    <div className="meeting-phase">
      <h2>회의 진행 중...</h2>
      <p>회의 모달이 곧 열립니다.</p>
    </div>
  );

  return (
    <div className="game-room">
      {renderGameContent()}
      
      {/* 미션 모달 */}
      {showMissionModal && currentMission && (
        <div className="modal-overlay">
          <div className="mission-modal">
            <h3>{currentMission.name}</h3>
            <p>{currentMission.description}</p>
            <div className="mission-actions">
              <button 
                onClick={() => handleMissionComplete(currentMission, { success: true })}
                className="complete-btn"
              >
                완료
              </button>
              <button 
                onClick={() => setShowMissionModal(false)}
                className="cancel-btn"
              >
                취소
              </button>
            </div>
          </div>
        </div>
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
              {/* 미니맵 구현 */}
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
