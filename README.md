# 🌿 ZeroWiki

**완전한 협업형 위키 플랫폼** - React + TypeScript + Firebase로 구축된 프로덕션 준비 완료 웹 애플리케이션

## 🚀 **즉시 체험하기**

Firebase 설정 없이도 바로 체험할 수 있습니다!

```bash
# 1. 의존성 설치
npm install --legacy-peer-deps

# 2. 개발 서버 시작
npm run dev

# 3. 브라우저에서 http://localhost:5173 접속
# 4. 우측 상단 "🚀 개발자 로그인" 클릭하여 즉시 로그인!
```

## ✨ **주요 기능**

### 🎯 **완전한 위키 시스템**
- **블록 기반 에디터** - 드래그앤드롭으로 콘텐츠 편집
- **계층적 문서 구조** - 주제(Subject) → 유형(Type) → 내용(Content)
- **실시간 협업** - 제안, 승인, 토론 시스템
- **역할 기반 권한** - 신규/중급/고급/준운영진 4단계

### 🎨 **혁신적인 UI/UX**
- **사이드패널 위젯:**
  - 🔥 실시간 트렌드 (조회수 + 상승률)
  - 🏆 위키 챌린지 (진행률 바 + 보상 시스템)
  - 🌐 커뮤니티 허브 (실시간 통계)
  - 🌤️ 날씨 위젯 (위치 기반)
- **모달 에디터** - 필요할 때만 등장하는 편집 환경
- **스마트 검색** - 실시간 제안 및 자동완성
- **한글 최적화** - 나무위키 스타일 디자인

### 📋 **법적 완성도**
- **이용약관** - 11개 조항 완전 문서
- **개인정보처리방침** - GDPR 준수 9개 섹션
- **마케팅 동의** - 선택적 수신 동의
- **팝업 모달** - 회원가입 시 전문 확인 가능

### 👑 **관리자 대시보드**
- **📊 개요 탭** - 실시간 통계 + 시스템 알림
- **👥 사용자 관리** - 검색, 필터, 역할 변경
- **📝 콘텐츠 모더레이션** - 승인/거부 원클릭
- **⚙️ 시스템 관리** - 서버 상태, 캐시, 백업

## 🛠️ **기술 스택**

### **Frontend**
- **React 18** + **TypeScript** - 최신 웹 기술
- **Vite** - 초고속 개발 서버
- **CSS Modules** - 모듈화된 스타일링
- **React Query** - 서버 상태 관리
- **Zustand** - 경량 클라이언트 상태

### **Backend & Infrastructure**
- **Firebase Auth** - 이메일/비밀번호 인증
- **Firestore** - NoSQL 실시간 데이터베이스
- **Firebase Storage** - 파일 업로드/관리
- **App Check** - reCAPTCHA v3 보안
- **Firebase Hosting** - 글로벌 CDN 배포

### **개발자 경험**
- **ESLint + Prettier** - 코드 품질 관리
- **절대 경로 임포트** - `@/features/...`
- **완전한 TypeScript** - 100% 타입 안전
- **0개 런타임 에러** - 철저한 에러 처리

## 📁 **프로젝트 구조**

```
src/
├── app/                    # 앱 설정 및 라우터
├── features/
│   ├── admin/             # 관리자 대시보드
│   ├── auth/              # 인증 (로그인/회원가입)
│   ├── common/            # 공통 UI 컴포넌트
│   ├── discussion/        # 토론 시스템
│   ├── layout/            # 레이아웃 (헤더/사이드바)
│   ├── legal/             # 법적 문서 (약관/개인정보)
│   ├── moderation/        # 모더레이션 시스템
│   ├── templates/         # 문서 템플릿
│   ├── watch/             # 알림 시스템
│   └── wiki/              # 위키 핵심 기능
└── shared/                # 공유 유틸리티
    ├── config/            # Firebase 설정
    ├── types/             # TypeScript 타입 정의
    └── utils/             # 유틸리티 함수
```

## 🎮 **개발자 로그인**

개발 모드에서 우측 상단의 "🚀 개발자 로그인"을 클릭하면:

- **🔰 신규 회원** - 기본 조회 권한
- **📚 중급 회원** - 콘텐츠 추가 권한
- **⭐ 고급 회원** - 유형 생성 권한
- **👑 준운영진** - 모든 권한 + 관리자 기능

각 역할로 로그인하여 다양한 기능을 체험해보세요!

## 🔧 **Firebase 설정 (선택사항)**

실제 Firebase 프로젝트를 연결하려면:

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Authentication, Firestore, Storage 활성화
3. `.env` 파일에 설정 추가:

```env
VITE_USE_EMULATOR=false
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... 기타 설정
```

자세한 가이드: [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)

## 📚 **주요 페이지**

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 🏠 홈페이지 | `/` | 추천 문서, 최근 변경사항, 인기 태그 |
| 📖 위키 뷰어 | `/wiki/:subject/:type` | 문서 조회 + 인라인 편집 |
| ✏️ 편집 모달 | 편집 버튼 클릭 | 블록 기반 에디터 |
| 📝 내 제안 | `/proposals` | 제안한 변경사항 관리 |
| ⚖️ 모더레이션 | `/moderation` | 승인/거부 처리 (준운영진) |
| 👑 관리자 | `/admin` | 시스템 관리 대시보드 |
| 📋 이용약관 | `/legal/terms` | 서비스 이용약관 |
| 🔒 개인정보 | `/legal/privacy` | 개인정보처리방침 |

## 🎯 **핵심 워크플로우**

### **1. 콘텐츠 생성**
1. 사이드바에서 카테고리 탐색
2. "➕ 새 문서" 또는 편집 버튼 클릭
3. 모달 에디터에서 블록 기반 편집
4. 역할에 따라 즉시 반영 또는 승인 대기

### **2. 협업 프로세스**
1. 문서 조회 중 "..." 메뉴에서 오류 제안
2. 제안 시스템을 통한 변경사항 제출
3. 준운영진이 모더레이션 큐에서 승인/거부
4. 승인 시 즉시 반영, 거부 시 알림 발송

### **3. 커뮤니티 참여**
1. 실시간 트렌드에서 인기 문서 확인
2. 위키 챌린지 참여로 포인트 획득
3. 토론 시스템으로 의견 교환
4. 역할 승급을 통한 권한 확장

## 🏆 **프로덕션 준비 완료**

- ✅ **보안** - Firebase App Check + Firestore Rules
- ✅ **성능** - React Query 캐싱 + 코드 분할
- ✅ **접근성** - ARIA 라벨 + 키보드 네비게이션
- ✅ **SEO** - React Helmet + 동적 메타태그
- ✅ **모니터링** - 활동 로그 + 에러 추적
- ✅ **확장성** - 모듈화된 아키텍처

## 📞 **지원**

- 📖 **문서**: [docs/](docs/) 폴더 참고
- 🐛 **버그 리포트**: GitHub Issues
- 💡 **기능 제안**: GitHub Discussions
- 🔧 **개발 가이드**: [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)

---

**🌿 ZeroWiki** - 모든 지식이 모이는 곳, 함께 만들어가는 위키백과