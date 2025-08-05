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
  transports: ['polling'], // WebSocket 제거 - Polling만 사용
  upgrade: false, // 업그레이드 비활성화
  forceNew: false,
  rememberUpgrade: false,
  withCredentials: false,
  path: '/socket.io/',
  secure: true,
  rejectUnauthorized: false,
  closeOnBeforeunload: false
}; 