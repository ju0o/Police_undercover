// [client/src/config.ts] - 환경 설정 파일

// 강제로 Render 서버 사용 (캐시 문제 해결)
const defaultServerUrl = 'https://police-undercover-server.onrender.com';

export const SERVER_URL = defaultServerUrl;

export const SOCKET_CONFIG = {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 15,
  timeout: 45000, // 서버와 동일하게 설정
  transports: ['polling', 'websocket'],
  upgrade: true,
  forceNew: false, // Render에서는 false
  rememberUpgrade: false, // Render에서는 false
  withCredentials: false, // 서버와 동일하게 false
  // Render 최적화 설정
  path: '/socket.io/',
  secure: true,
  rejectUnauthorized: false
}; 