// [client/src/App.tsx] - 메인 애플리케이션 컴포넌트
// 전체 게임 상태 관리 및 라우팅

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';

// 컴포넌트 imports
import LoginScreen from './components/LoginScreen';
import MainMenu from './components/MainMenu';
// import Lobby from './features/lobby/Lobby'; // 현재 사용하지 않음
import GameRoom from './features/game/GameRoom';
import GameResults from './features/result/GameResults';
import LoadingScreen from './components/LoadingScreen';
import ErrorModal from './components/ErrorModal';
import SettingsModal from './components/SettingsModal';
import ControlsOverlay from './components/ControlsOverlay';

// 타입 정의
interface GameState {
  phase: 'login' | 'menu' | 'lobby' | 'room' | 'game' | 'meeting' | 'voting' | 'results' | 'loading';
  error: string | null;
  isConnected: boolean;
}

interface PlayerData {
  id: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  role: any;
  position: { x: number; y: number };
  isAlive: boolean;
  completedMissions: any[];
}

interface RoomData {
  name: string;
  players: PlayerData[];
  options: any;
  gameState: string;
}

interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  graphics: 'low' | 'medium' | 'high';
  showFPS: boolean;
  colorBlindMode: boolean;
  sound?: any;
  controls?: any;
}

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.7,
  graphics: 'medium',
  showFPS: false,
  colorBlindMode: false
};

function App() {
  // 연결 및 게임 상태
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    phase: 'login',
    error: null,
    isConnected: false
  });

  // 플레이어 및 방 데이터
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);

  // UI 상태
  const [showSettings, setShowSettings] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<any[]>([]);

  // 게임 데이터
  const [gameResults, setGameResults] = useState<any>(null);
  const [myMissions, setMyMissions] = useState<any[]>([]);
  const [teammates, setTeammates] = useState<any[]>([]);

  // 소켓 연결 초기화
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }

    // 개발 환경에서는 localhost, 프로덕션에서는 환경변수 사용
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    console.log('Connecting to server:', serverUrl);
    
    const newSocket = io(serverUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      transports: ['polling', 'websocket'], // polling을 먼저 시도
      upgrade: true,
      forceNew: true
    });

    setSocket(newSocket);

    // 연결 이벤트 리스너
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setGameState(prev => ({ 
        ...prev, 
        isConnected: true, 
        error: null,
        // 로딩 중이었다면 메뉴로 이동
        phase: prev.phase === 'loading' ? 'menu' : prev.phase
      }));
      
      // 연결되면 방 목록 요청
      newSocket.emit('getRooms', (rooms: any[]) => {
        console.log('Rooms received:', rooms);
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

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: (error as any).description,
        context: (error as any).context,
        type: (error as any).type
      });
      setGameState(prev => ({ 
        ...prev, 
        isConnected: false, 
        error: `Failed to connect to server: ${error.message}`
      }));
    });

    // 방 목록 업데이트
    newSocket.on('roomsUpdated', (rooms) => {
      setAvailableRooms(rooms);
    });

    // 방 상태 업데이트
    newSocket.on('roomUpdated', (room) => {
      setRoomData(room);
    });

    // 게임 시작
    newSocket.on('gameStarted', (data) => {
      setPlayerData(prev => prev ? { ...prev, role: data.role } : null);
      setMyMissions(data.missions);
      setTeammates(data.teammates);
      setGameState(prev => ({ ...prev, phase: 'game' }));
      
      showNotification({
        type: 'info',
        title: '게임 시작!',
        message: `당신의 역할: ${data.role.name}`,
        duration: 5000
      });
    });

    // 게임 페이즈 변경
    newSocket.on('gamePhaseChanged', (data) => {
      setGameState(prev => ({ ...prev, phase: data.phase }));
    });

    // 회의 시작
    newSocket.on('meetingStarted', (data) => {
      setGameState(prev => ({ ...prev, phase: 'meeting' }));
      showNotification({
        type: 'warning',
        title: '긴급 회의!',
        message: data.type === 'emergency_button' ? '긴급 버튼이 눌렸습니다!' : '시체가 발견되었습니다!',
        duration: 3000
      });
    });

    // 투표 시작
    newSocket.on('votingStarted', () => {
      setGameState(prev => ({ ...prev, phase: 'voting' }));
    });

    // 게임 종료
    newSocket.on('gameEnded', (results) => {
      setGameResults(results);
      setGameState(prev => ({ ...prev, phase: 'results' }));
    });

    // 방 리셋
    newSocket.on('roomReset', () => {
      setGameState(prev => ({ ...prev, phase: 'room' }));
      setMyMissions([]);
      setTeammates([]);
      setGameResults(null);
    });

    // 플레이어 연결 해제
    newSocket.on('playerDisconnected', (data) => {
      showNotification({
        type: 'info',
        title: '플레이어 퇴장',
        message: `${data.playerName}님이 게임을 떠났습니다.`,
        duration: 3000
      });
    });

    // 방장 변경
    newSocket.on('hostChanged', (data) => {
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

    // 에러 처리
    newSocket.on('error', (error) => {
      setGameState(prev => ({ ...prev, error: error.message || 'Unknown error' }));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // 설정 저장
  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }, [settings]);

  // 알림 표시 함수
  const showNotification = (notification: any) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    if (notification.duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, notification.duration);
    }
  };

  // 로그인 처리
  const handleLogin = (nickname: string) => {
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
    
    // 소켓 연결 시작
    socket.connect();
    
    // 연결 타임아웃 후 강제로 메인 메뉴로 이동 (fallback)
    setTimeout(() => {
      if (socket.connected) {
        setGameState(prev => ({ ...prev, phase: 'menu' }));
      } else {
        console.warn('Socket connection failed, proceeding to menu anyway');
        setGameState(prev => ({ ...prev, phase: 'menu', error: 'Connection unstable - some features may not work' }));
      }
    }, 3000);
  };

  // 방 생성 (새로운 시그니처)
  const handleCreateRoom = (roomName: string, isPrivate: boolean) => {
    if (!socket || !playerData) {
      setGameState(prev => ({ ...prev, error: 'Connection not established. Please try again.' }));
      return;
    }
    
    if (!socket.connected) {
      setGameState(prev => ({ ...prev, error: 'Server connection lost. Please refresh the page.' }));
      return;
    }
    
    const options = { isPrivate };
    
    socket.emit('createRoom', { 
      roomName, 
      nickname: playerData.nickname, 
      options 
    }, (response: any) => {
      if (response && response.success) {
        setRoomData(response.room);
        setGameState(prev => ({ ...prev, phase: 'room' }));
        setPlayerData(prev => prev ? { ...prev, isHost: true } : null);
        
        // 비공개방인 경우 방 코드 알림
        if (isPrivate && response.roomCode) {
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
  };

  // 방 입장
  const handleJoinRoom = (roomName: string) => {
    if (!socket || !playerData) return;
    
    socket.emit('joinRoom', { 
      roomName, 
      nickname: playerData.nickname
    }, (response: any) => {
      if (response.success) {
        setRoomData(response.room);
        setGameState(prev => ({ ...prev, phase: 'room' }));
      } else {
        setGameState(prev => ({ ...prev, error: response.message }));
      }
    });
  };

  // 코드로 방 입장
  const handleJoinByCode = (roomCode: string) => {
    if (!socket || !playerData) return;
    
    socket.emit('joinRoomByCode', { 
      roomCode, 
      nickname: playerData.nickname
    }, (response: any) => {
      if (response.success) {
        setRoomData(response.room);
        setGameState(prev => ({ ...prev, phase: 'room' }));
      } else {
        setGameState(prev => ({ ...prev, error: response.message }));
      }
    });
  };

  // 방 나가기
  const handleLeaveRoom = () => {
    if (!socket) return;
    
    socket.disconnect();
    setRoomData(null);
    setMyMissions([]);
    setTeammates([]);
    setGameResults(null);
    setGameState(prev => ({ ...prev, phase: 'menu' }));
    
    // 재연결
    setTimeout(() => {
      socket.connect();
    }, 500);
  };

  // 에러 처리
  const handleErrorClose = () => {
    setGameState(prev => ({ ...prev, error: null }));
  };

  // 로그아웃
  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    setPlayerData(null);
    setRoomData(null);
    setMyMissions([]);
    setTeammates([]);
    setGameResults(null);
    setGameState({ phase: 'login', error: null, isConnected: false });
  };

  // 렌더링
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
      
      {(gameState.phase === 'room' || gameState.phase === 'game' || 
        gameState.phase === 'meeting' || gameState.phase === 'voting') && roomData && (
        <GameRoom
          socket={socket}
          roomData={roomData}
          playerData={playerData}
          gamePhase={gameState.phase}
          myMissions={myMissions}
          teammates={teammates}
          settings={settings}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
      
      {gameState.phase === 'results' && gameResults && (
        <GameResults
          results={gameResults}
          playerData={playerData}
          onPlayAgain={() => setGameState(prev => ({ ...prev, phase: 'room' }))}
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
          settings={settings as any}
          onSettingsChange={setSettings as any}
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

      {/* 작동법 오버레이 */}
      <ControlsOverlay 
        isVisible={showControlsOverlay}
        onToggle={() => setShowControlsOverlay(prev => !prev)}
      />

      {/* 연결 상태 표시 (게임 중이 아닐 때만) */}
      {gameState.phase !== 'game' && gameState.phase !== 'meeting' && gameState.phase !== 'voting' && (
        <div className={`connection-status ${gameState.isConnected ? 'connected' : 'disconnected'}`}>
          <div className="status-indicator"></div>
          <span>{gameState.isConnected ? '연결됨' : '연결 끊김'}</span>
        </div>
      )}
    </div>
  );
}

export default App;