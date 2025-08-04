# 배포 가이드

## Railway (Backend) 배포

1. Railway 계정 생성 및 로그인
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. 프로젝트 초기화 및 배포
   ```bash
   railway init
   railway up
   ```

3. 환경변수 설정 (Railway 대시보드에서)
   - `PORT`: 자동 설정됨
   - `NODE_ENV`: production
   - `CLIENT_URL`: Firebase 배포 후 URL로 업데이트

## Firebase (Frontend) 배포

1. Firebase CLI 설치 및 로그인
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. Firebase 프로젝트 생성 및 초기화
   ```bash
   firebase init hosting
   ```

3. 클라이언트 빌드 및 배포
   ```bash
   cd client
   npm run build
   cd ..
   firebase deploy
   ```

## 환경변수 업데이트

배포 후 다음 환경변수들을 실제 URL로 업데이트:

### Railway (Backend)
- `CLIENT_URL`: Firebase 호스팅 URL
- `SOCKET_CORS_ORIGIN`: Firebase 호스팅 URL

### Firebase (Frontend) - .env 파일
- `VITE_SERVER_URL`: Railway 앱 URL

## 배포 확인

1. Backend 확인: Railway URL에서 서버 응답 확인
2. Frontend 확인: Firebase URL에서 앱 로딩 확인
3. 통합 테스트: 게임 생성 및 접속 테스트