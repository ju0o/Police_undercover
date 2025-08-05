// [client/src/config.ts] - 환경 설정 파일

// Render 서버 사용 (CORS 수정 완료)
const defaultServerUrl = 'https://police-undercover-server.onrender.com';

export const SERVER_URL = defaultServerUrl;

export const SOCKET_CONFIG = {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 15,
  timeout: 60000, // 증가된 타임아웃
  transports: ['websocket', 'polling'], // websocket 우선 시도
  upgrade: true,
  forceNew: false,
  rememberUpgrade: false,
  withCredentials: false,
  // 명시적 경로 설정
  path: '/socket.io/',
  secure: true,
  rejectUnauthorized: false,
  // 추가 안정성 설정
  closeOnBeforeunload: false
}; 