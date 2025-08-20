import { useState, type ReactElement } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/shared/config/firebase';
import styles from '@/features/common/styles/ui.module.css';

export function SignInPage(): ReactElement {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError((err as Error).message ?? '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', padding: 24 }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 360, display: 'grid', gap: 12 }}>
        <h1 style={{ marginBottom: 8 }}>로그인</h1>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
          aria-label="이메일"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
          aria-label="비밀번호"
        />
        {error && (
          <div role="alert" style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>
        )}
        <button type="submit" className={styles.button} disabled={loading} aria-busy={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}


