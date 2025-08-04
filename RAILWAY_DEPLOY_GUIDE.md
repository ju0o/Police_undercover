# Railway 배포 가이드

## 1. 기존 프로젝트 삭제

1. [Railway 대시보드](https://railway.app/dashboard)에 접속
2. 삭제할 기존 프로젝트 클릭
3. Settings → General → Delete Project
4. 프로젝트 이름 입력 후 삭제 확인

## 2. 새 프로젝트 생성 및 배포

### 방법 1: GitHub 연동 (권장)
1. Railway 대시보드에서 "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. `ju0o/Police_undercover` 저장소 선택
4. 자동 배포 시작

### 방법 2: CLI 사용
```bash
# Railway CLI 로그인 (브라우저에서 인증)
npx @railway/cli login

# 새 프로젝트 생성
npx @railway/cli init

# 배포
npx @railway/cli up
```

## 3. 환경변수 설정

Railway 대시보드 → 프로젝트 → Variables에서 다음 설정:

```bash
NODE_ENV=production
PORT=$PORT  # Railway가 자동 설정
CLIENT_URL=https://your-firebase-app.web.app
SOCKET_CORS_ORIGIN=https://your-firebase-app.web.app
```

## 4. 빌드 설정 확인

Railway는 자동으로 다음을 감지합니다:
- `package.json` 의 `start` 스크립트
- `Procfile` 의 시작 명령어
- `railway.json` 의 배포 설정

## 5. 배포 완료 확인

1. Railway 대시보드에서 배포 로그 확인
2. 생성된 URL로 서버 접속 테스트
3. WebSocket 연결 상태 확인

## 배포 URL 예시
```
https://police-undercover-production.up.railway.app
```

## 문제 해결

### 포트 오류
- Railway는 `$PORT` 환경변수를 제공
- `server/src/index.js`에서 `process.env.PORT` 사용 확인

### CORS 오류
- `CLIENT_URL` 환경변수를 Firebase URL로 설정
- `SOCKET_CORS_ORIGIN`도 동일하게 설정

### 빌드 실패
- `server/package.json`의 의존성 확인
- Railway 빌드 로그에서 오류 메시지 확인