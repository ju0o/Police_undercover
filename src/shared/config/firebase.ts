/**
 * Firebase initialization for ZeroWiki
 *
 * How to configure .env (project root: D:\\zero_wiki\\.env)
 * 1) Open Firebase Console → Project settings → General → Your apps → Web app → SDK config
 * 2) Copy each value and paste to the following Vite env variables:
 *
 *    VITE_FIREBASE_API_KEY=...            (Firebase Console → SDK config → apiKey)
 *    VITE_FIREBASE_AUTH_DOMAIN=...        (authDomain)
 *    VITE_FIREBASE_PROJECT_ID=...         (projectId)
 *    VITE_FIREBASE_STORAGE_BUCKET=...     (storageBucket)
 *    VITE_FIREBASE_MESSAGING_SENDER_ID=... (messagingSenderId)
 *    VITE_FIREBASE_APP_ID=...             (appId)
 *    VITE_FIREBASE_MEASUREMENT_ID=...     (measurementId)
 *
 * 3) App Check reCAPTCHA v3 site key:
 *    Firebase Console → Build → App Check → Set up reCAPTCHA v3 → copy site key
 *    VITE_RECAPTCHA_SITE_KEY=...
 *
 * 4) For development without Firebase setup:
 *    VITE_USE_EMULATOR=true
 *
 * Vite exposes import.meta.env.VITE_* to the client. Do NOT hardcode secrets here.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
// Optional analytics (enabled when VITE_FIREBASE_MEASUREMENT_ID is provided)
import { getAnalytics, isSupported } from 'firebase/analytics';

// 개발 모드 및 에뮬레이터 설정
const isDev = import.meta.env.DEV;
const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';

// Firebase 설정
const firebaseConfig = useEmulator ? {
  // 에뮬레이터용 더미 설정
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-zerowiki',
  storageBucket: 'demo-zerowiki.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:demo123456789',
} : {
  // 실제 Firebase 설정
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// 실제 Firebase 사용 시 환경 변수 체크
if (!useEmulator) {
  const missingEnvKeys = Object.entries(firebaseConfig)
    .filter(([key, value]) => key !== 'measurementId' && !value)
    .map(([key]) => {
      // camelCase를 SNAKE_CASE로 변환
      const snakeCase = key.replace(/([A-Z])/g, '_$1').toUpperCase();
      return `VITE_FIREBASE_${snakeCase}`;
    });
  
  if (missingEnvKeys.length > 0) {
    const errorMessage = `
🔥 Firebase 설정이 필요합니다!

누락된 환경 변수:
${missingEnvKeys.map(key => `- ${key}`).join('\n')}

해결 방법:
1️⃣ 프로젝트 루트에 .env 파일 생성
2️⃣ Firebase Console에서 설정 복사
3️⃣ 환경 변수 추가

또는 개발용 에뮬레이터 사용:
.env 파일에 VITE_USE_EMULATOR=true 추가

자세한 가이드: docs/FIREBASE_SETUP.md
    `;
    
    console.error(errorMessage);
    
    if (isDev) {
      // 개발 모드에서는 경고만 표시하고 계속 진행
      console.warn('⚠️ 개발 모드: Firebase 설정 없이 계속 진행합니다.');
    }
  }
}

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
// Initialize Analytics if available and configured (do not export to avoid unused var errors)
void (async () => {
  try {
    if (!useEmulator && (firebaseConfig as any).measurementId && await isSupported()) {
      getAnalytics(app);
    }
  } catch {
    // ignore analytics errors in environments that do not support it
  }
})();

// 에뮬레이터 연결 (개발 모드 또는 명시적 설정)
if (useEmulator) {
  console.log('🔧 Firebase 에뮬레이터 모드로 실행 중...');
  
  try {
    // Auth 에뮬레이터 연결 (중복 연결 방지)
    const authDelegate = (auth as unknown as { _delegate?: { _config?: { emulator?: unknown } } })._delegate;
    if (!(authDelegate && authDelegate._config && authDelegate._config.emulator)) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
    
    // Firestore 에뮬레이터 연결
    const dbDelegate = (db as unknown as { _delegate?: { _settings?: { host?: string } } })._delegate;
    const dbHost = dbDelegate && dbDelegate._settings ? dbDelegate._settings.host : undefined;
    if (!(typeof dbHost === 'string' && dbHost.includes('localhost'))) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    
    // Storage 에뮬레이터 연결
    const storageDelegate = (storage as unknown as { _delegate?: { _host?: string } })._delegate;
    const storageHost = storageDelegate ? storageDelegate._host : undefined;
    if (!(typeof storageHost === 'string' && storageHost.includes('localhost'))) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
    
    console.log('✅ Firebase 에뮬레이터 연결 완료!');
    console.log('💡 에뮬레이터가 실행되지 않았다면: firebase emulators:start');
  } catch (error) {
    console.warn('⚠️ 에뮬레이터 연결 실패 (Firebase 에뮬레이터가 실행 중인지 확인하세요):', error);
  }
} else {
  console.log('🔥 실제 Firebase 서비스에 연결됨');
}

// App Check 설정 (실제 환경에서만)
let appCheckInstance: AppCheck | null = null;
export function ensureAppCheck(): AppCheck | null {
  if (useEmulator || isDev) {
    return null; // 개발/에뮬레이터 모드에서는 App Check 비활성화
  }
  
  try {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
    const isPlaceholder = siteKey?.includes('여기에_복사한') || siteKey === '__FILL_THIS__';
    
    if (!appCheckInstance && siteKey && !isPlaceholder) {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      console.log('🛡️ App Check 활성화됨');
    }
    return appCheckInstance;
  } catch (error) {
    console.warn('⚠️ App Check 초기화 실패:', error);
    return null;
  }
}

// 개발 모드에서 유용한 정보 표시
if (isDev) {
  console.log('🚀 ZeroWiki 개발 모드');
  console.log('📋 Firebase 설정:', {
    projectId: firebaseConfig.projectId,
    useEmulator: useEmulator || !import.meta.env.VITE_FIREBASE_API_KEY,
    hasAppCheck: !!import.meta.env.VITE_RECAPTCHA_SITE_KEY
  });
}