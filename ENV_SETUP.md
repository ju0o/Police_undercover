# 환경 변수 설정 가이드

## 개요

ZeroWiki 프로젝트는 클라이언트(Vite)와 서버(Firebase Functions) 환경에서 각각 다른 환경 변수를 사용합니다.

## 클라이언트 환경 변수 (.env.production)

클라이언트에서 사용하는 모든 환경 변수는 `VITE_` 접두사를 가져야 합니다.

```bash
# Firebase 클라이언트 설정 (필수)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Firebase Analytics (선택사항)
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# 개발 환경 설정 (선택사항)
VITE_USE_EMULATOR=false
```

### 환경 변수 설명

- **VITE_FIREBASE_API_KEY**: Firebase 프로젝트의 API 키
- **VITE_FIREBASE_AUTH_DOMAIN**: Firebase 인증 도메인
- **VITE_FIREBASE_PROJECT_ID**: Firebase 프로젝트 ID
- **VITE_FIREBASE_STORAGE_BUCKET**: Firebase Storage 버킷 이름
- **VITE_FIREBASE_MESSAGING_SENDER_ID**: Firebase 메시징 발신자 ID
- **VITE_FIREBASE_APP_ID**: Firebase 앱 ID
- **VITE_FIREBASE_MEASUREMENT_ID**: Google Analytics 측정 ID (선택사항)
- **VITE_USE_EMULATOR**: 개발 시 Firebase 에뮬레이터 사용 여부

## 서버 환경 변수 (Firebase Functions)

### 서비스 계정 키 설정

Firebase Admin SDK를 사용하기 위해 서비스 계정 키가 필요합니다.

```bash
# 서비스 계정 키 파일 경로
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 서비스 계정 키 생성 방법

1. Firebase Console → 프로젝트 설정 → 서비스 계정
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드
4. 안전한 위치에 저장 (예: `scripts/prod/service-account.json`)
5. 환경 변수에 절대 경로 설정

## 환경별 설정

### 개발 환경 (.env.local)

```bash
# 개발용 Firebase 설정
VITE_FIREBASE_API_KEY=dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=dev-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dev-project
VITE_FIREBASE_STORAGE_BUCKET=dev-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=dev_sender_id
VITE_FIREBASE_APP_ID=dev_app_id

# 에뮬레이터 사용
VITE_USE_EMULATOR=true
```

### 프로덕션 환경 (.env.production)

```bash
# 프로덕션 Firebase 설정
VITE_FIREBASE_API_KEY=prod_api_key
VITE_FIREBASE_AUTH_DOMAIN=zerowiki-2bd39.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=zerowiki-2bd39
VITE_FIREBASE_STORAGE_BUCKET=zerowiki-2bd39.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=prod_sender_id
VITE_FIREBASE_APP_ID=prod_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# 에뮬레이터 비활성화
VITE_USE_EMULATOR=false
```

## 보안 고려사항

### 클라이언트 환경 변수

- ⚠️ **주의**: `VITE_` 접두사가 있는 모든 환경 변수는 빌드 시 클라이언트 코드에 포함됩니다
- 민감한 정보(API 시크릿, 비공개 키 등)는 절대 클라이언트 환경 변수에 포함하지 마세요
- Firebase API 키는 공개되어도 상대적으로 안전하지만, Firestore 보안 규칙으로 데이터 접근을 제어해야 합니다

### 서버 환경 변수

- 서비스 계정 키 파일은 절대 Git에 커밋하지 마세요
- `.gitignore`에 서비스 계정 키 파일 경로를 추가하세요
- 프로덕션 환경에서는 안전한 시크릿 관리 시스템을 사용하세요

## Git 보안 설정

### .gitignore 추가 항목

```gitignore
# 환경 변수 파일
.env*
!.env.example

# Firebase 서비스 계정 키
**/service-account*.json
**/firebase-admin*.json

# 기타 민감한 파일
secrets/
*.pem
*.key
```

## 배포 시 환경 변수 설정

### Firebase Hosting

Firebase Hosting은 빌드 시 환경 변수를 번들에 포함시킵니다.

```bash
# 프로덕션 빌드
npm run build

# Firebase 배포
firebase deploy --only hosting
```

### Firebase Functions

Functions 환경 변수는 Firebase CLI로 설정합니다.

```bash
# Functions 환경 변수 설정
firebase functions:config:set admin.service_account_path="/path/to/service-account.json"

# 환경 변수 확인
firebase functions:config:get
```

## 환경 변수 검증

### 클라이언트 환경 변수 검증

`src/shared/config/firebase.ts`에서 필수 환경 변수를 검증합니다:

```typescript
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

## 트러블슈팅

### 일반적인 문제들

1. **환경 변수가 undefined로 나타나는 경우**
   - `VITE_` 접두사가 있는지 확인
   - `.env` 파일이 프로젝트 루트에 있는지 확인
   - 개발 서버 재시작

2. **Firebase 초기화 오류**
   - 모든 필수 Firebase 환경 변수가 설정되었는지 확인
   - Firebase 프로젝트 설정에서 올바른 값을 복사했는지 확인

3. **서비스 계정 키 오류**
   - 파일 경로가 올바른지 확인
   - 파일 권한 확인
   - JSON 파일이 손상되지 않았는지 확인

### 디버깅 명령어

```bash
# 클라이언트 환경 변수 확인
echo $VITE_FIREBASE_PROJECT_ID

# 서비스 계정 키 파일 확인
cat $GOOGLE_APPLICATION_CREDENTIALS

# Firebase 프로젝트 상태 확인
firebase projects:list
firebase use --add
```

## 예제 파일

### .env.example

```bash
# Firebase 클라이언트 설정 (필수)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Analytics (선택사항)
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# 개발 환경 (선택사항)
VITE_USE_EMULATOR=false
```

이 파일을 복사하여 실제 값으로 대체한 후 `.env.production` 또는 `.env.local`로 저장하세요.
