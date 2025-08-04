// [client/src/config.ts] - 환경 설정 파일

// 개발 환경에서는 로컬 서버, 프로덕션에서는 Render 서버
const isDevelopment = import.meta.env.DEV;
const defaultServerUrl = isDevelopment 
  ? 'http://localhost:3001' 
  : 'https://police-undercover-server.onrender.com';

export const SERVER_URL = import.meta.env.VITE_SERVER_URL || defaultServerUrl;

export const SOCKET_CONFIG = {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 15,
  timeout: 20000,
  transports: ['polling', 'websocket'],
  upgrade: true,
  forceNew: true,
  rememberUpgrade: true,
  withCredentials: false,
  // Railway 호환 설정
  rejectUnauthorized: false,
  secure: true
}; 