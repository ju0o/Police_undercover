# 🚀 ZeroWiki 배포 가이드

## 📋 배포 단계별 가이드

### 1️⃣ Firebase 프로젝트 생성

1. **Firebase Console 접속**
   - https://console.firebase.google.com/ 접속
   - Google 계정으로 로그인

2. **새 프로젝트 생성**
   ```
   프로젝트 이름: zerowiki-production
   프로젝트 ID: zerowiki-prod-[고유번호]
   Google Analytics: 활성화 (선택사항)
   ```

3. **필수 서비스 활성화**
   - ✅ Authentication (이메일/비밀번호)
   - ✅ Firestore Database
   - ✅ Storage
   - ✅ Hosting
   - ✅ App Check (reCAPTCHA v3)

### 2️⃣ 환경 변수 설정

프로젝트 루트에 `.env.production` 파일 생성:

```env
# Firebase 프로덕션 설정
VITE_USE_EMULATOR=false
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=zerowiki-prod-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=zerowiki-prod-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=zerowiki-prod-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_RECAPTCHA_SITE_KEY=6Le...
```

### 3️⃣ Firebase CLI 설정

```bash
# Firebase CLI 설치 (글로벌)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화
firebase init

# 선택 옵션:
# ✅ Firestore: Configure security rules and indexes files
# ✅ Hosting: Configure files for Firebase Hosting
# ✅ Storage: Configure a security rules file for Cloud Storage

# 설정:
# - Firestore rules: firestore.rules
# - Firestore indexes: firestore.indexes.json
# - Hosting public directory: dist
# - Single-page app: Yes
# - GitHub auto-deploy: No (선택사항)
```

### 4️⃣ 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# Firestore 규칙 배포
firebase deploy --only firestore:rules

# 호스팅 배포
firebase deploy --only hosting

# 전체 배포 (한 번에)
firebase deploy
```

### 5️⃣ 배포 후 검증

1. **사이트 접속 확인**
   - https://zerowiki-prod-xxxxx.web.app
   - 또는 https://zerowiki-prod-xxxxx.firebaseapp.com

2. **핵심 기능 테스트**
   - ✅ 회원가입/로그인
   - ✅ 문서 조회
   - ✅ 문서 편집 (권한별)
   - ✅ 제안 시스템
   - ✅ 모더레이션
   - ✅ 관리자 대시보드

3. **성능 확인**
   - Lighthouse 점수 확인
   - 로딩 속도 테스트
   - 모바일 반응형 확인

### 6️⃣ 도메인 연결 (선택사항)

1. **커스텀 도메인 추가**
   ```bash
   firebase hosting:channel:create live
   ```

2. **DNS 설정**
   - A 레코드: Firebase IP 주소
   - 또는 CNAME: Firebase 호스팅 도메인

### 7️⃣ 모니터링 설정

1. **Firebase Analytics 활성화**
2. **Performance Monitoring 설정**
3. **Crashlytics 연동** (선택사항)

## 🛠️ 배포 스크립트

`package.json`에 배포 스크립트 추가:

```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy",
    "deploy:hosting": "npm run build && firebase deploy --only hosting",
    "deploy:rules": "firebase deploy --only firestore:rules",
    "preview": "firebase hosting:channel:deploy preview"
  }
}
```

## 🔒 보안 체크리스트

- ✅ Firestore 보안 규칙 적용
- ✅ App Check (reCAPTCHA v3) 활성화
- ✅ 환경 변수 보안 관리
- ✅ HTTPS 강제 적용
- ✅ 도메인 검증 설정

## 📊 성능 최적화

- ✅ 코드 분할 (React.lazy)
- ✅ 이미지 최적화
- ✅ CDN 활용 (Firebase Hosting)
- ✅ 캐싱 전략 적용
- ✅ 번들 크기 최적화

## 🚨 트러블슈팅

### 빌드 에러
```bash
# 캐시 클리어
npm run clean
rm -rf node_modules
npm install

# TypeScript 에러 확인
npm run typecheck
```

### 배포 실패
```bash
# Firebase CLI 재로그인
firebase logout
firebase login

# 프로젝트 재설정
firebase use --add
```

### 권한 에러
```bash
# 프로젝트 소유자 권한 확인
# Firebase Console에서 IAM 설정 확인
```

## 📞 지원

배포 중 문제가 발생하면:
1. Firebase Console 로그 확인
2. 브라우저 개발자 도구 확인
3. GitHub Issues에 문제 보고
