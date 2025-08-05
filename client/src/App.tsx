// [client/src/App.tsx] - 메인 애플리케이션 컴포넌트 (완전 개선된 버전)
// 전체 게임 상태 관리, 타입 안전성, 완전한 이벤트 핸들링

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';
import { SERVER_URL, SOCKET_CONFIG } from './config';

// 타입 imports
import type {
  GameState,
  PlayerData,
  RoomData,
  Settings,
  Notification,
  GameResults as GameResultsType,
  PublicRoom,
  Role,
  MissionProgress,
  VotingUpdate,
  MeetingData,
  GamePhase,
  SocketEventData,
  SocketResponseData
} from './types/game';

// 컴포넌트 imports
import LoginScreen from './components/LoginScreen';
import MainMenu from './components/MainMenu';
import GameRoom from './features/game/GameRoom';
import GameResults from './features/result/GameResults';
import LoadingScreen from './components/LoadingScreen';
import ErrorModal from './components/ErrorModal';
import SettingsModal from './components/SettingsModal';
import ControlsOverlay from './components/ControlsOverlay';

// 기본 설정값
const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.7,
  graphics: 'medium',
  showFPS: false,
  colorBlindMode: false
};

function App() {
  // ============================
  // 상태 관리
  // ============================

  // 연결 및 게임 상태
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null); // useRef로 소켓 관리
  const [gameState, setGameState] = useState<GameState>({
    phase: 'login',
    error: null,
    isConnected: false
  });
  const [connectionAttempted, setConnectionAttempted] = useState(false);

  // 플레이어 및 방 데이터
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [availableRooms, setAvailableRooms] = useState<PublicRoom[]>([]);

  // UI 상태
  const [showSettings, setShowSettings] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 게임 데이터
  const [gameResults, setGameResults] = useState<GameResultsType | null>(null);
  const [myMissions, setMyMissions] = useState<string[]>([]);


  // ============================
  // 알림 시스템
  // ============================

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    if (notification.duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, notification.duration);
    }
  }, []);

  // ============================
  // 소켓 연결 및 이벤트 핸들러
  // ============================

  useEffect(() => {
    // 저장된 설정 로드
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }

    // 서버 URL 설정
    console.log('Connecting to server:', SERVER_URL);
    console.log('Socket config:', SOCKET_CONFIG);
    
    // addTrailingSlash: false 적용
    const mergedConfig = { ...SOCKET_CONFIG, addTrailingSlash: false };
    const newSocket = io(SERVER_URL, mergedConfig);
    
    socketRef.current = newSocket; // useRef에 저장
    setSocket(newSocket);
    
    // autoConnect: false이므로 수동 연결 시작
    newSocket.connect();

    // ============================
    // 연결 관련 이벤트 핸들러
    // ============================

    newSocket.on('connect', () => {
      console.log('✅ Connected to server successfully!');
      console.log('🔗 Socket ID:', newSocket.id);
      console.log('🚀 Transport:', newSocket.io.engine.transport.name);
      
      setGameState(prev => ({ 
        ...prev, 
        isConnected: true, 
        error: null,
        phase: prev.phase === 'loading' ? 'menu' : prev.phase
      }));
      
      // 연결되면 방 목록 요청
      newSocket.emit('getRooms', (rooms: PublicRoom[]) => {
        console.log('📋 Rooms received:', rooms);
        setAvailableRooms(rooms || []);
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setGameState(prev => ({ 
        ...prev, 
        isConnected: false,
        error: reason === 'io server disconnect' ? 'Server disconnected' : null
      }));
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('❌ Connection error:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        description: error.description || 'No description',
        context: error.context || 'No context',
        type: error.type || 'Unknown type',
        stack: error.stack
      });
      console.error('🌐 Trying to connect to:', SERVER_URL);
      console.error('⚙️ Socket config:', SOCKET_CONFIG);
      
      setGameState(prev => ({ 
        ...prev, 
        isConnected: false, 
        error: `Failed to connect to server: ${error.message}`
      }));
    });

    // ============================
    // 방 관련 이벤트 핸들러
    // ============================

    newSocket.on('roomsUpdated', (rooms: PublicRoom[]) => {
      setAvailableRooms(rooms);
    });

    newSocket.on('roomUpdated', (room: RoomData) => {
      setRoomData(room);
    });

    // ============================
    // 게임 플레이 이벤트 핸들러
    // ============================

    newSocket.on('gameStarted', (data: { role: Role; teammates: PlayerData[]; missions: string[] }) => {
      console.log('Game started:', data);
      setPlayerData(prev => prev ? { ...prev, role: data.role } : null);
      setMyMissions(data.missions);

      setGameState(prev => ({ ...prev, phase: 'playing' }));
      
      showNotification({
        type: 'info',
        title: '게임 시작!',
        message: `당신의 역할: ${data.role.name}`,
        duration: 5000
      });
    });

    newSocket.on('gamePhaseChanged', (data: { phase: GamePhase }) => {
      console.log('Game phase changed:', data.phase);
      setGameState(prev => ({ ...prev, phase: data.phase }));
    });

    newSocket.on('playerKilled', (data: { victimId: string; victimNickname: string }) => {
      console.log('Player killed:', data);
      showNotification({
        type: 'warning',
        title: '플레이어 사망',
        message: `${data.victimNickname}님이 사망했습니다.`,
        duration: 3000
      });

      // 내가 죽었다면 상태 업데이트
      if (playerData && playerData.id === data.victimId) {
        setPlayerData(prev => prev ? { ...prev, isAlive: false } : null);
      }
    });

    newSocket.on('meetingStarted', (data: MeetingData) => {
      console.log('Meeting started:', data);
      setGameState(prev => ({ ...prev, phase: 'meeting' }));
      
      const message = data.type === 'emergency' 
        ? `${data.calledBy}님이 긴급 회의를 소집했습니다!`
        : `${data.reportedBy}님이 ${data.victim}님의 시체를 발견했습니다!`;
        
      showNotification({
        type: 'warning',
        title: '회의 시작!',
        message,
        duration: 3000
      });
    });

    newSocket.on('votingStarted', () => {
      console.log('Voting started');
      setGameState(prev => ({ ...prev, phase: 'voting' }));
      showNotification({
        type: 'info',
        title: '투표 시작',
        message: '의심스러운 플레이어에게 투표하세요!',
        duration: 3000
      });
    });

    newSocket.on('votingUpdate', (data: VotingUpdate) => {
      console.log('Voting update:', data);
      // 투표 현황 UI 업데이트는 GameRoom 컴포넌트에서 처리
    });

    newSocket.on('gameEnded', (results: GameResultsType) => {
      console.log('Game ended:', results);
      setGameResults(results);
      setGameState(prev => ({ ...prev, phase: 'results' }));
      
      const isWinner = (playerData?.role?.team === results.winner);
      showNotification({
        type: isWinner ? 'success' : 'info',
        title: '게임 종료',
        message: `${results.winner === 'crewmate' ? '크루메이트' : '임포스터'} 승리!`,
        duration: 5000
      });
    });

    newSocket.on('missionProgress', (data: MissionProgress) => {
      console.log('Mission progress:', data);
      showNotification({
        type: 'success',
        title: '미션 완료',
        message: `미션 진행도: ${data.completed}/${data.total}`,
        duration: 2000
      });
    });

    newSocket.on('roomReset', () => {
      console.log('Room reset');
      setGameState(prev => ({ ...prev, phase: 'lobby' }));
      setMyMissions([]);

      setGameResults(null);
    });

    newSocket.on('playerDisconnected', (data: { playerName: string }) => {
      showNotification({
        type: 'info',
        title: '플레이어 퇴장',
        message: `${data.playerName}님이 게임을 떠났습니다.`,
        duration: 3000
      });
    });

    newSocket.on('hostChanged', (data: { newHostName: string; newHostId: string }) => {
      showNotification({
        type: 'info',
        title: '방장 변경',
        message: `${data.newHostName}님이 새로운 방장이 되었습니다.`,
        duration: 3000
      });
      
      if (playerData && playerData.id === data.newHostId) {
        setPlayerData(prev => prev ? { ...prev, isHost: true } : null);
      }
    });

    newSocket.on('error', (error: { message: string }) => {
      setGameState(prev => ({ ...prev, error: error.message || 'Unknown error' }));
    });

    return () => {
      // 모든 리스너 해제
      newSocket.off();
      
      // 소켓 연결 해제
      if (newSocket.connected) {
        newSocket.disconnect();
      }
      
      // useRef 정리
      socketRef.current = null;
    };
  }, []); // 의존성 배열 비워서 한 번만 실행

  // 설정 저장
  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }, [settings]);

  // ============================
  // 게임 액션 핸들러
  // ============================

  const handleLogin = useCallback((nickname: string) => {
    if (!socket) return;
    
    setGameState(prev => ({ ...prev, phase: 'loading' }));
    
    setPlayerData({
      id: socket.id || '',
      nickname,
      isHost: false,
      isReady: false,
      role: null,
      position: { x: 400, y: 300 },
      isAlive: true,
      completedMissions: []
    });
    
    setConnectionAttempted(true);
    socket.connect();
    
    // 연결 타임아웃 후 메뉴로 이동
    setTimeout(() => {
      if (socket.connected) {
        setGameState(prev => ({ ...prev, phase: 'menu' }));
      } else {
        console.warn('Socket connection failed, proceeding to menu anyway');
        setGameState(prev => ({ 
          ...prev, 
          phase: 'menu', 
          error: 'Connection unstable - some features may not work' 
        }));
      }
    }, 10000); // 10초로 증가
  }, [socket]);

  const handleCreateRoom = useCallback((roomName: string, options: any) => {
    if (!socket || !playerData) {
      setGameState(prev => ({ ...prev, error: 'Connection not established. Please try again.' }));
      return;
    }
    
    if (!socket.connected) {
      setGameState(prev => ({ ...prev, error: 'Server connection lost. Please refresh the page.' }));
      return;
    }
    
    const data: SocketEventData['createRoom'] = { 
      roomName, 
      nickname: playerData.nickname, 
      options 
    };
    
    socket.emit('createRoom', data, (response: SocketResponseData) => {
      if (response && response.success) {
        setRoomData(response.room!);
        setGameState(prev => ({ ...prev, phase: 'lobby' }));
        setPlayerData(prev => prev ? { ...prev, isHost: true } : null);
        
        if (options.isPrivate && response.roomCode) {
          showNotification({
            type: 'success',
            title: '비공개방 생성 완료',
            message: `방 코드: ${response.roomCode}`,
            duration: 10000
          });
        }
      } else {
        setGameState(prev => ({ ...prev, error: response?.message || 'Failed to create room' }));
      }
    });
  }, [socket, playerData, showNotification]);

  const handleJoinRoom = useCallback((roomName: string) => {
    if (!socket || !playerData) return;
    
    const data: SocketEventData['joinRoom'] = { 
      roomName, 
      nickname: playerData.nickname
    };
    
    socket.emit('joinRoom', data, (response: SocketResponseData) => {
      if (response.success) {
        setRoomData(response.room!);
        setGameState(prev => ({ ...prev, phase: 'lobby' }));
      } else {
        setGameState(prev => ({ ...prev, error: response.message || 'Failed to join room' }));
      }
    });
  }, [socket, playerData]);

  const handleJoinByCode = useCallback((roomCode: string) => {
    if (!socket || !playerData) return;
    
    const data: SocketEventData['joinRoomByCode'] = { 
      roomCode, 
      nickname: playerData.nickname
    };
    
    socket.emit('joinRoomByCode', data, (response: SocketResponseData) => {
      if (response.success) {
        setRoomData(response.room!);
        setGameState(prev => ({ ...prev, phase: 'lobby' }));
      } else {
        setGameState(prev => ({ ...prev, error: response.message || 'Failed to join room' }));
      }
    });
  }, [socket, playerData]);

  const handleLeaveRoom = useCallback(() => {
    if (!socket || !roomData) return;
    
    // 서버에 방 퇴장 알림
    socket.emit('leaveRoom', { roomName: roomData.name });
    
    setRoomData(null);
    setMyMissions([]);
    setGameResults(null);
    setGameState(prev => ({ ...prev, phase: 'menu' }));
    
    // 재연결하지 않고 연결 유지
  }, [socket, roomData]);

  const handleErrorClose = useCallback(() => {
    setGameState(prev => ({ ...prev, error: null }));
  }, []);

  const handleLogout = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    setPlayerData(null);
    setRoomData(null);
    setMyMissions([]);
    setGameResults(null);
    setConnectionAttempted(false);
    setGameState({ phase: 'login', error: null, isConnected: false });
  }, [socket]);

  // ============================
  // 렌더링
  // ============================

  return (
    <div className="app">
      {/* 메인 콘텐츠 */}
      {gameState.phase === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      
      {gameState.phase === 'loading' && (
        <LoadingScreen message="서버에 연결 중..." />
      )}
      
      {gameState.phase === 'menu' && (
        <MainMenu
          nickname={playerData?.nickname || ''}
          availableRooms={availableRooms}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onJoinByCode={handleJoinByCode}
          onLogout={handleLogout}
        />
      )}
      
      {(gameState.phase === 'lobby' || gameState.phase === 'playing' || 
        gameState.phase === 'meeting' || gameState.phase === 'voting') && roomData && (
        <GameRoom
          socket={socket}
          roomData={roomData}
          playerData={playerData}
          gamePhase={gameState.phase}
          myMissions={myMissions}
          settings={settings}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
      
      {gameState.phase === 'results' && gameResults && (
        <GameResults
          results={gameResults}
          playerData={playerData}
          onPlayAgain={() => setGameState(prev => ({ ...prev, phase: 'lobby' }))}
          onBackToLobby={handleLeaveRoom}
        />
      )}

      {/* 모달들 */}
      {gameState.error && (
        <ErrorModal
          isOpen={true}
          message={gameState.error}
          onClose={handleErrorClose}
        />
      )}
      
      {showSettings && (
        <SettingsModal
          isOpen={true}
          settings={{
            sound: {
              master: settings.volume || 50,
              music: settings.musicEnabled ? (settings.volume || 50) : 0,
              sfx: settings.soundEnabled ? (settings.volume || 50) : 0
            },
            graphics: {
              quality: 'medium',
              fullscreen: false,
              vsync: true
            },
            controls: {
              keybindings: {}
            }
          }}
          onSettingsChange={(newSettings) => {
            setSettings(prev => ({
              ...prev,
              volume: newSettings.sound.master,
              soundEnabled: newSettings.sound.sfx > 0,
              musicEnabled: newSettings.sound.music > 0
            }));
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 알림 시스템 */}
      <div className="notifications">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification notification-${notification.type}`}
          >
            <div className="notification-title">{notification.title}</div>
            <div className="notification-message">{notification.message}</div>
            <button 
              className="notification-close"
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 조작법 오버레이 */}
      <ControlsOverlay 
        isVisible={showControlsOverlay}
        onToggle={() => setShowControlsOverlay(prev => !prev)}
      />

      {/* 연결 상태 표시 */}
      {connectionAttempted && gameState.phase !== 'playing' && 
       gameState.phase !== 'meeting' && gameState.phase !== 'voting' && (
        <div className={`connection-status ${gameState.isConnected ? 'connected' : 'disconnected'}`}>
          <div className="status-indicator"></div>
          <span>{gameState.isConnected ? '연결됨' : '연결 불안정'}</span>
        </div>
      )}
    </div>
  );
}

export default App;