#!/usr/bin/env node

/**
 * ZeroWiki 개발 환경 자동 설정 스크립트
 * Firebase 설정 없이도 바로 체험할 수 있도록 도와줍니다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
const envContent = `# ZeroWiki 개발용 설정 (자동 생성됨)
# Firebase 에뮬레이터 모드로 실제 Firebase 설정 없이 체험 가능!

VITE_USE_EMULATOR=true

# 실제 Firebase 프로젝트를 사용하려면:
# 1. VITE_USE_EMULATOR=false로 변경
# 2. 아래 주석을 해제하고 실제 값으로 교체
# 3. Firebase Console에서 설정 복사: docs/FIREBASE_SETUP.md 참고

# VITE_FIREBASE_API_KEY=your_api_key_here
# VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID=your_project_id
# VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
# VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
# VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456789
# VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
`;

// .env 파일이 없으면 생성
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env 파일이 생성되었습니다!');
  console.log('🔧 Firebase 에뮬레이터 모드로 설정됨');
} else {
  console.log('ℹ️  .env 파일이 이미 존재합니다.');
}

console.log(`
🎉 ZeroWiki 개발 환경 준비 완료!

다음 단계:
1️⃣  npm run dev        (개발 서버 시작)
2️⃣  우측 상단 "🚀 개발자 로그인" 클릭
3️⃣  원하는 역할로 즉시 로그인 체험!

📚 자세한 설정: docs/FIREBASE_SETUP.md
`);
