// [client/src/config.ts] - 환경 설정 파일

// Render 서버 사용 (최적화된 설정)
const defaultServerUrl = 'https://police-undercover-server.onrender.com';

export const SERVER_URL = defaultServerUrl;

export const SOCKET_CONFIG = {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 15,
  timeout: 30000,
  transports: ['websocket', 'polling'], // WebSocket 우선 시도 (Render 지원함)
  upgrade: true,
  forceNew: false,
  rememberUpgrade: false,
  withCredentials: false,
  path: '/socket.io', // 트레일링 슬래시 제거
  secure: true,
  rejectUnauthorized: false,
  closeOnBeforeunload: false,
  addTrailingSlash: false // 트레일링 슬래시 방지
}; 