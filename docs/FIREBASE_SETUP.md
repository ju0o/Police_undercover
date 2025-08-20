# 🔥 Firebase 설정 가이드

## 📋 목차
1. [Firebase 프로젝트 생성](#firebase-프로젝트-생성)
2. [환경 변수 설정](#환경-변수-설정)
3. [Firebase 에뮬레이터 사용 (개발용)](#firebase-에뮬레이터-사용)
4. [실제 Firebase 프로젝트 설정](#실제-firebase-프로젝트-설정)

## 🚀 빠른 시작 (에뮬레이터 사용)

개발 환경에서 바로 체험하려면 Firebase 에뮬레이터를 사용하세요:

### 1단계: 환경 변수 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 복사하세요:

```env
# 개발용 더미 설정 (에뮬레이터 사용)
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-zerowiki
VITE_FIREBASE_STORAGE_BUCKET=demo-zerowiki.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:demo123456789

# 에뮬레이터 모드 활성화
VITE_USE_EMULATOR=true
```

### 2단계: Firebase 에뮬레이터 설치 및 실행

```bash
# Firebase CLI 설치 (전역)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 에뮬레이터 실행
firebase emulators:start
```

### 3단계: 개발 서버 실행

```bash
npm run dev
```

## 🔧 실제 Firebase 프로젝트 설정

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `zerowiki` (또는 원하는 이름)
4. Google Analytics 설정 (선택사항)

### 2. Firebase 서비스 활성화

#### Authentication 설정
1. Authentication > Sign-in method
2. "이메일/비밀번호" 활성화
3. "익명" 활성화 (선택사항)

#### Firestore Database 설정
1. Firestore Database > 데이터베이스 만들기
2. "테스트 모드에서 시작" 선택
3. 위치: `asia-northeast3 (서울)` 선택

#### Storage 설정
1. Storage > 시작하기
2. "테스트 모드에서 시작" 선택

### 3. 웹 앱 등록

1. 프로젝트 개요 > 웹 앱 추가 (</>)
2. 앱 닉네임: `ZeroWiki`
3. Firebase Hosting 설정 (선택사항)
4. **설정 정보 복사** (중요!)

### 4. 환경 변수 설정

복사한 설정 정보를 `.env` 파일에 입력:

```env
VITE_FIREBASE_API_KEY=AIzaSyExample...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# 프로덕션 모드
VITE_USE_EMULATOR=false
```

### 5. App Check 설정 (선택사항)

보안 강화를 위해 App Check 설정:

1. App Check 활성화
2. reCAPTCHA v3 선택
3. 사이트 키 복사하여 환경 변수에 추가:

```env
VITE_RECAPTCHA_SITE_KEY=6LeExample...
```

### 6. Firestore 보안 규칙 배포

```bash
firebase deploy --only firestore:rules
```

### 7. 테스트 사용자 생성

Firebase Console > Authentication > Users에서 테스트 계정 생성:

```
newbie@example.com - Passw0rd!
intermediate@example.com - Passw0rd!
advanced@example.com - Passw0rd!
subadmin@example.com - Passw0rd!
```

## 🛠️ 문제 해결

### 에러: `auth/invalid-api-key`
- `.env` 파일이 프로젝트 루트에 있는지 확인
- API 키가 올바른지 확인
- 개발 서버 재시작: `npm run dev`

### 에러: `appCheck/recaptcha-error`
- `VITE_RECAPTCHA_SITE_KEY` 제거하거나 올바른 키 입력
- App Check 비활성화: `VITE_USE_EMULATOR=true`

### 에러: `auth/invalid-credential`
- 테스트 사용자가 Firebase Authentication에 등록되어 있는지 확인
- 이메일/비밀번호가 정확한지 확인

### 에뮬레이터 연결 실패
- Firebase CLI 최신 버전 확인: `firebase --version`
- 포트 충돌 확인: `firebase emulators:start --only auth,firestore`

## 📞 지원

문제가 지속되면 다음 정보와 함께 문의하세요:
- 에러 메시지 전문
- `.env` 파일 내용 (API 키 제외)
- 브라우저 개발자 도구 콘솔 로그
