# Police Undercover - Among Us Clone

🎮 **Police Undercover**는 Among Us 스타일의 멀티플레이어 게임입니다. 9가지 역할, 20+ 미션, 실시간 멀티플레이어 기능을 제공합니다.

## 🚀 주요 기능

### 🎯 게임 특징
- **9가지 역할**: 크루메이트, 임포스터, 탐정, 경찰, 과학자, 의무관, 조직원, 감사팀, 광대, 생존자, 변신술사
- **20+ 미션**: 4단계 난이도 (쉬움/보통/어려움/전문가)
- **3개 맵**: 다양한 환경에서 플레이
- **실시간 멀티플레이어**: Socket.io 기반 실시간 통신
- **고급 통계 시스템**: 플레이어/방/글로벌 통계, 리더보드, 성취 시스템

### 🛠️ 기술 스택
- **Backend**: Node.js + Express + Socket.io
- **Frontend**: React + TypeScript + Vite
- **실시간 통신**: Socket.io
- **스타일링**: CSS3 + Flexbox/Grid

## 📁 프로젝트 구조

```
police-undercover-web/
├── server/                 # 백엔드 서버
│   ├── src/
│   │   ├── index.js       # 메인 서버
│   │   ├── rooms/         # 방 관리
│   │   ├── roles/         # 역할 시스템
│   │   ├── missions/      # 미션 시스템
│   │   ├── game/          # 게임 로직
│   │   └── statistics/    # 통계 시스템
│   └── package.json
├── client/                # 프론트엔드
│   ├── src/
│   │   ├── App.tsx       # 메인 앱
│   │   ├── components/    # 공통 컴포넌트
│   │   └── features/      # 기능별 컴포넌트
│   └── package.json
├── .env                   # 환경 변수
└── README.md
```

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd police-undercover-web
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 설정을 추가
```

### 3. 의존성 설치

#### 백엔드 서버
```bash
cd server
npm install
```

#### 프론트엔드 클라이언트
```bash
cd client
npm install
```

### 4. 개발 서버 실행

#### 백엔드 서버 (포트 3001)
```bash
cd server
npm start
```

#### 프론트엔드 클라이언트 (포트 5173)
```bash
cd client
npm run dev
```

### 5. 브라우저에서 접속
```
http://localhost:5173
```

## 🎮 게임 플레이 방법

### 1. 로그인
- 닉네임을 입력하고 게임에 참여

### 2. 로비에서 방 선택
- 기존 방에 입장하거나 새 방 생성
- 게임 설정 커스터마이징

### 3. 게임 플레이
- **크루메이트**: 미션 완료 및 임포스터 찾기
- **임포스터**: 다른 플레이어 제거 및 미션 방해
- **특수 역할**: 각자의 고유 능력 활용

### 4. 회의 및 투표
- 시체 발견 시 회의 소집
- 토론 후 투표로 임포스터 추방

## 🎯 게임 역할

### 크루메이트 팀
- **크루메이트**: 기본 역할, 미션 완료
- **탐정**: 다른 플레이어의 역할 확인
- **경찰**: 임포스터 식별 능력
- **과학자**: 특수 장비 사용
- **의무관**: 플레이어 치료 능력

### 임포스터 팀
- **임포스터**: 기본 역할, 킬 능력
- **조직원**: 특수 킬 능력
- **감사팀**: 정보 수집 능력
- **광대**: 특수 능력
- **변신술사**: 변신 능력

## 🛠️ 개발 가이드

### 백엔드 개발
```bash
cd server
npm run dev  # 개발 모드
npm test     # 테스트 실행
```

### 프론트엔드 개발
```bash
cd client
npm run dev  # 개발 서버
npm run build  # 프로덕션 빌드
npm run lint   # 린트 검사
```

### 코드 구조
- **컴포넌트**: 재사용 가능한 UI 컴포넌트
- **기능**: 게임별 기능 모듈
- **타입**: TypeScript 타입 정의
- **스타일**: CSS 모듈

## 📊 게임 통계

### 개인 통계
- 게임 참여 횟수
- 승률 및 역할별 성과
- 미션 완료율
- 킬/데스 통계

### 방 통계
- 평균 게임 시간
- 플레이어 수
- 승률 분포

### 글로벌 통계
- 전체 플레이어 수
- 인기 맵/역할
- 리더보드

## 🎨 UI/UX 특징

### 반응형 디자인
- 모바일/태블릿/데스크톱 지원
- 터치 친화적 인터페이스

### 접근성
- 키보드 네비게이션
- 색상 대비 최적화
- 스크린 리더 지원

### 성능 최적화
- 코드 분할
- 지연 로딩
- 메모리 최적화

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙏 감사의 말

- Among Us 팀에게 영감을 주셔서 감사합니다
- Socket.io 커뮤니티
- React 및 TypeScript 커뮤니티

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**Police Undercover** - 재미있는 멀티플레이어 게임을 즐겨보세요! 🎮