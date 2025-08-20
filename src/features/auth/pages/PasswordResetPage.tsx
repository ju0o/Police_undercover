import { useState, type ReactElement } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/shared/config/firebase';
import styles from '@/features/common/styles/ui.module.css';

export function PasswordResetPage(): ReactElement {
  const [email, setEmail] = useState<string>('');
  const [sent, setSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      setError((err as Error).message ?? '메일 전송 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', padding: 24 }}>
      <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 360, display: 'grid', gap: 12 }}>
        <h1 style={{ marginBottom: 8 }}>비밀번호 재설정</h1>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
          aria-label="이메일"
        />
        {error && <div role="alert" style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}
        {sent && <div style={{ color: 'var(--success)', fontSize: 13 }}>재설정 메일을 전송했습니다.</div>}
        <button type="submit" className={styles.button} disabled={loading} aria-busy={loading}>
          {loading ? '전송 중...' : '재설정 메일 보내기'}
        </button>
      </form>
    </div>
  );
}


