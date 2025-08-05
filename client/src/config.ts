// [client/src/config.ts] - 환경 설정 파일

// Render 서버 사용 (최적화된 설정)
const defaultServerUrl = 'https://police-undercover-server.onrender.com';

export const SERVER_URL = defaultServerUrl;

// GPT 권장: Render 무료 플랜 최적화 설정
export const SOCKET_CONFIG = {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 15,
  timeout: 60000,             // 60초 타임아웃 (GPT 권장)
  transports: ['polling'],    // HTTP long-polling 강제 (GPT 권장)
  upgrade: false,             // WebSocket 업그레이드 방지 (GPT 권장)
  withCredentials: false,
  path: '/socket.io',         // 트레일링 슬래시 제거 (GPT 권장)
  secure: true
}; 