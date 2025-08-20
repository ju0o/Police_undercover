import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/shared/config/firebase';
import styles from '@/features/common/styles/ui.module.css';

const testUsers = [
  { email: 'newbie@example.com', password: 'Passw0rd!', role: 'newbie', label: '🔰 신규 회원' },
  { email: 'intermediate@example.com', password: 'Passw0rd!', role: 'intermediate', label: '📚 중급 회원' },
  { email: 'advanced@example.com', password: 'Passw0rd!', role: 'advanced', label: '⭐ 고급 회원' },
  { email: 'subadmin@example.com', password: 'Passw0rd!', role: 'subadmin', label: '👑 준운영진' },
];

export function QuickLoginPanel() {
  if (import.meta.env.PROD) return null;

  const handleLogin = async (email: string, password: string, role: string) => {
    try {
      // 먼저 로그인 시도
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInError: unknown) {
        const code = (signInError as FirebaseError | { code?: string } | undefined)?.code;
        if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
          // 사용자가 없으면 자동으로 계정 생성
          console.log('사용자가 없습니다. 계정을 생성합니다...');
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Firestore에 사용자 프로필 생성
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: role === 'newbie' ? '신규유저' : 
                  role === 'intermediate' ? '중급유저' : 
                  role === 'advanced' ? '고급유저' : '준운영진',
            nickname: role === 'newbie' ? '새로운위키러' : 
                     role === 'intermediate' ? '중급위키러' : 
                     role === 'advanced' ? '고급위키러' : '관리자',
            email: email,
            phone: '010-0000-0000',
            role: role,
            createdAt: new Date(),
            updatedAt: new Date(),
            blocked: false
          });
          
          console.log(`✅ ${role} 계정이 생성되었습니다.`);
        } else {
          throw signInError;
        }
      }
      
      console.log(`✅ ${role} 계정으로 로그인 성공!`);
    } catch (error) {
      console.error('Login failed:', error);
      alert(`로그인 실패: ${(error as Error).message || '알 수 없는 오류'}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 20, 
      right: 20, 
      background: 'var(--gradient-card)', 
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--glass-border)',
      padding: 12, 
      borderRadius: 12,
      fontSize: 12,
      boxShadow: 'var(--shadow-lg)',
      zIndex: 9999,
      minWidth: 160
    }}>
      <div style={{ 
        color: 'var(--color-text)', 
        marginBottom: 8, 
        fontWeight: 600,
        textAlign: 'center',
        borderBottom: '1px solid var(--color-divider)',
        paddingBottom: 6
      }}>
        🚀 개발자 로그인
      </div>
      {testUsers.map(user => (
        <button
          key={user.email}
          onClick={() => handleLogin(user.email, user.password, user.role)}
          className={styles.buttonGhost}
          style={{
            display: 'block',
            width: '100%',
            margin: '4px 0',
            padding: '6px 8px',
            fontSize: 11,
            textAlign: 'left',
            justifyContent: 'flex-start'
          }}
        >
          {user.label}
        </button>
      ))}
    </div>
  );
}