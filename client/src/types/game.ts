// [client/src/types/game.ts] - 게임 관련 TypeScript 타입 정의
// 서버와 클라이언트 간 데이터 일관성을 위한 타입 시스템

// ============================
// 기본 게임 상태 타입
// ============================

export type GamePhase = 'login' | 'menu' | 'lobby' | 'loading' | 'playing' | 'meeting' | 'voting' | 'results' | 'ended';

export type PlayerState = 'alive' | 'dead' | 'spectating';

export type WinCondition = 'crewmate_tasks' | 'crewmate_vote' | 'impostor_kill' | 'impostor_sabotage';

export type MissionType = 'sequence' | 'progress' | 'switch' | 'click' | 'swipe';

export type MissionDifficulty = 'easy' | 'normal' | 'hard' | 'expert';

// ============================
// 플레이어 관련 타입
// ============================

export interface Position {
  x: number;
  y: number;
}

export interface Role {
  id: string;
  name: string;
  team: 'crewmate' | 'impostor' | 'neutral';
  canKill: boolean;
  canSabotage: boolean;
  canVent: boolean;
  abilities: string[];
  description: string;
}

export interface PlayerData {
  id: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  role: Role | null;
  position: Position;
  isAlive: boolean;
  completedMissions: string[];
}

export interface PlayerGameData extends PlayerData {
  state: PlayerState;
  totalTasks: number;
  lastKillTime: number;
  emergencyMeetingsUsed: number;
  isInVent: boolean;
  canVote: boolean;
  votedFor: string | null;
}

// ============================
// 방 관련 타입
// ============================

export interface RoomOptions {
  maxPlayers: number;
  impostorCount: number;
  detectiveCount: number;
  isPrivate: boolean;
  roomCode?: string;
  password?: string;
  gameMode: 'classic' | 'custom' | 'detective';
  map: 'spaceship' | 'office' | 'laboratory';
}

export interface RoomData {
  name: string;
  players: PlayerData[];
  options: RoomOptions;
  gameState: string;
  hostId?: string;
  createdAt?: number;
}

export interface PublicRoom {
  name: string;
  playerCount: number;
  maxPlayers: number;
  gameStarted: boolean;
  hasPassword: boolean;
  gameMode: string;
  map: string;
}

// ============================
// 게임 상태 타입
// ============================

export interface GameState {
  phase: GamePhase;
  error: string | null;
  isConnected: boolean;
}

export interface GameTimers {
  discussion: number | null;
  voting: number | null;
  game: number | null;
}

export interface GameSettings {
  discussionTime: number;
  votingTime: number;
  killCooldown: number;
  emergencyMeetings: number;
  gameTimeLimit: number;
}

export interface CorpseData {
  playerId: string;
  position: Position;
  discoveredBy: string | null;
  discoveredAt: number | null;
}

export interface GameStateData {
  roomName: string;
  phase: GamePhase;
  startedAt: number | null;
  players: Map<string, PlayerGameData>;
  corpses: CorpseData[];
  completedTasks: number;
  totalTasks: number;
  meetingCooldown: number;
  votes: Map<string, string>;
  votingResults: VotingResults | null;
  timers: GameTimers;
  settings: GameSettings;
}

// ============================
// 미션 관련 타입
// ============================

export interface MissionData {
  id: string;
  name: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  description?: string;
  location?: string;
  timeLimit?: number;
  requiredSteps?: number;
}

export interface MissionProgress {
  completed: number;
  total: number;
  player: string;
}

export interface MissionResult {
  success: boolean;
  timeSpent?: number;
  accuracy?: number;
  steps?: number;
}

// ============================
// 회의/투표 관련 타입
// ============================

export interface MeetingData {
  type: 'emergency' | 'corpse_report';
  calledBy?: string;
  reportedBy?: string;
  victim?: string;
  discussionTime: number;
}

export interface VoteData {
  voterId: string;
  targetId: string | 'skip';
}

export interface VotingResults {
  ejectedPlayer: string | null;
  voteCount: Record<string, number>;
  skipVotes: number;
  isTie: boolean;
}

export interface VotingUpdate {
  votedCount: number;
  totalVoters: number;
  voterId: string;
  targetId: string;
}

// ============================
// 게임 결과 타입
// ============================

export interface PlayerResult {
  id: string;
  nickname: string;
  role: Role;
  state: PlayerState;
  completedTasks: number;
  totalTasks: number;
}

export interface GameStats {
  duration: number;
  totalTasks: number;
  completedTasks: number;
  totalKills: number;
}

export interface GameResults {
  winCondition: WinCondition;
  winner: 'crewmate' | 'impostor';
  players: PlayerResult[];
  gameStats: GameStats;
}

// ============================
// 소켓 이벤트 타입
// ============================

export interface SocketEventData {
  // 방 관리
  createRoom: {
    roomName: string;
    nickname: string;
    options?: Partial<RoomOptions>;
  };
  joinRoom: {
    roomName: string;
    nickname: string;
    roomCode?: string;
  };
  joinRoomByCode: {
    roomCode: string;
    nickname: string;
  };

  // 게임 플레이
  startGame: {
    roomName: string;
  };
  movePlayer: {
    roomName: string;
    position: Position;
  };

  // 게임 액션
  attemptKill: {
    roomName: string;
    targetId: string;
  };
  startMission: {
    roomName: string;
    missionId: string;
  };
  completeMission: {
    roomName: string;
    missionId: string;
    result: MissionResult;
  };
  emergencyMeeting: {
    roomName: string;
  };
  reportCorpse: {
    roomName: string;
    corpseId: string;
  };
  castVote: {
    roomName: string;
    targetId: string;
  };
}

export interface SocketResponseData {
  success: boolean;
  message?: string;
  room?: RoomData;
  roomCode?: string;
  mission?: MissionData;
}

// ============================
// UI 설정 타입
// ============================

export interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  graphics: 'low' | 'medium' | 'high';
  showFPS: boolean;
  colorBlindMode: boolean;
  sound?: SoundSettings;
  controls?: ControlSettings;
}

export interface SoundSettings {
  master: number;
  effects: number;
  music: number;
  voice: number;
}

export interface ControlSettings {
  moveUp: string;
  moveDown: string;
  moveLeft: string;
  moveRight: string;
  action: string;
  report: string;
  kill: string;
  sabotage: string;
  map: string;
  meeting: string;
}

// ============================
// 알림 시스템 타입
// ============================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type?: 'primary' | 'secondary';
}

// ============================
// 컴포넌트 Props 타입
// ============================

export interface GameRoomProps {
  socket: any; // Socket 타입은 socket.io-client에서 import
  roomData: RoomData;
  playerData: PlayerData | null;
  gamePhase: GamePhase;
  myMissions: string[];
  teammates: PlayerData[];
  settings: Settings;
  onLeaveRoom: () => void;
}

export interface MainMenuProps {
  nickname: string;
  availableRooms: PublicRoom[];
  onCreateRoom: (roomName: string, isPrivate: boolean) => void;
  onJoinRoom: (roomName: string) => void;
  onJoinByCode: (roomCode: string) => void;
  onLogout: () => void;
}

export interface LoginScreenProps {
  onLogin: (nickname: string) => void;
}

export interface GameResultsProps {
  results: GameResults;
  playerData: PlayerData | null;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

// ============================
// 게임 로직 유틸리티 타입
// ============================

export interface NearbyPlayer {
  player: PlayerData;
  distance: number;
  canInteract: boolean;
}

export interface InteractionTarget {
  type: 'player' | 'corpse' | 'mission' | 'sabotage' | 'vent';
  id: string;
  position: Position;
  action: string;
}

export interface KeyBinding {
  key: string;
  action: string;
  condition?: () => boolean;
}

// ============================
// 에러 타입
// ============================

export interface GameError {
  code: string;
  message: string;
  context?: Record<string, any>;
}

export interface ValidationError extends GameError {
  field: string;
  value: any;
}

// ============================
// 이벤트 핸들러 타입
// ============================

export type EventHandler<T = any> = (data: T) => void;

export type SocketEventHandler = (data: any, callback?: (response: any) => void) => void;

export interface GameEventHandlers {
  onGameStarted: EventHandler<{ role: Role; teammates: PlayerData[]; missions: string[] }>;
  onPlayerKilled: EventHandler<{ victimId: string; victimNickname: string; position: Position }>;
  onMeetingStarted: EventHandler<MeetingData>;
  onVotingUpdate: EventHandler<VotingUpdate>;
  onGameEnded: EventHandler<GameResults>;
  onMissionProgress: EventHandler<MissionProgress>;
  onPlayerDisconnected: EventHandler<{ playerId: string; playerName: string }>;
  onRoomUpdated: EventHandler<RoomData>;
  onGamePhaseChanged: EventHandler<{ phase: GamePhase; gameState?: GameStateData }>;
}

// ============================
// 유틸리티 타입
// ============================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================
// 상수 타입
// ============================

export const GAME_PHASES = {
  LOGIN: 'login',
  MENU: 'menu',
  LOBBY: 'lobby',
  LOADING: 'loading',
  PLAYING: 'playing',
  MEETING: 'meeting',
  VOTING: 'voting',
  RESULTS: 'results',
  ENDED: 'ended'
} as const;

export const PLAYER_STATES = {
  ALIVE: 'alive',
  DEAD: 'dead',
  SPECTATING: 'spectating'
} as const;

export const WIN_CONDITIONS = {
  CREWMATE_TASKS: 'crewmate_tasks',
  CREWMATE_VOTE: 'crewmate_vote',
  IMPOSTOR_KILL: 'impostor_kill',
  IMPOSTOR_SABOTAGE: 'impostor_sabotage'
} as const;