import { useState, type ReactElement } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/app/providers/useAuth';

export function EmailVerificationBanner(): ReactElement | null {
  const { firebaseUser } = useAuth();
  const [sending, setSending] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!firebaseUser || firebaseUser.emailVerified) return null;

  const onResend = async (): Promise<void> => {
    if (!firebaseUser) return;
    setError('');
    setSending(true);
    try {
      await sendEmailVerification(firebaseUser);
      setSent(true);
    } catch (err) {
      setError((err as Error).message ?? '전송 실패');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 12, margin: '8px 16px'
    }}>
      <div style={{ color: 'white', fontSize: 13 }}>
        이메일 인증이 완료되지 않았습니다. 받은 편지함에서 인증 메일을 확인해 주세요.
        {sent && <span style={{ marginLeft: 8, color: '#22c55e' }}>메일을 다시 전송했습니다.</span>}
        {error && <span style={{ marginLeft: 8, color: '#ef4444' }}>{error}</span>}
      </div>
      <button onClick={onResend} disabled={sending} style={{
        background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.24)', borderRadius: 8,
        padding: '6px 10px', fontSize: 12
      }}>
        {sending ? '전송 중...' : '인증 메일 다시 보내기'}
      </button>
    </div>
  );
}


