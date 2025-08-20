import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/shared/config/firebase';
import styles from '@/features/common/styles/ui.module.css';
import { LegalModal } from '@/features/legal/components/LegalModal';

export function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    termsAgree: false,
    privacyAgree: false,
    marketingAgree: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [legalModal, setLegalModal] = useState<{
    isOpen: boolean;
    type: 'terms' | 'privacy' | 'marketing';
  }>({
    isOpen: false,
    type: 'terms'
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openLegalModal = (type: 'terms' | 'privacy' | 'marketing') => {
    setLegalModal({ isOpen: true, type });
  };

  const closeLegalModal = () => {
    setLegalModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.termsAgree || !formData.privacyAgree) {
      setError('필수 약관에 동의해주세요.');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setSubmitting(true);
    try {
      // 1) Auth 계정 생성
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const { user } = cred;
      const uid = user.uid;

      // 2) Firestore 프로필 생성 (보안 규칙 요구사항 충족)
      await setDoc(doc(db, 'users', uid), {
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email,
        phone: formData.phone,
        role: 'newbie',
        blocked: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      try {
        await sendEmailVerification(user);
      } catch {
        // ignore verification errors to not block signup UX
      }
      alert('회원가입이 완료되었습니다! 이메일 인증 메일을 확인해 주세요.');
    } catch (err) {
      setError((err as Error).message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container} style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className={styles.card}>
        <h2 style={{ margin: '0 0 var(--spacing-xl) 0', textAlign: 'center', color: 'var(--color-text)' }}>
          🌿 ZeroWiki 회원가입
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          {/* 기본 정보 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>이름 *</label>
            <input
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="홍길동"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>닉네임 *</label>
            <input
              type="text"
              className={styles.input}
              value={formData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              placeholder="제로위키유저"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>이메일 *</label>
            <input
              type="email"
              className={styles.input}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>연락처 *</label>
            <input
              type="tel"
              className={styles.input}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="010-0000-0000"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>비밀번호 *</label>
            <input
              type="password"
              className={styles.input}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="영문/숫자/특수문자 포함 8자 이상"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>비밀번호 확인 *</label>
            <input
              type="password"
              className={styles.input}
              value={formData.passwordConfirm}
              onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>

          {/* 약관 동의 */}
          <div style={{ 
            background: 'var(--color-background-lighter)', 
            padding: 'var(--spacing-lg)', 
            borderRadius: '12px',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: 'var(--font-size-base)', color: 'var(--color-text)' }}>
              📋 약관 동의
            </h3>
            
            <div className={styles.checkboxContainer} style={{ marginBottom: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                id="terms"
                checked={formData.termsAgree}
                onChange={(e) => handleInputChange('termsAgree', e.target.checked)}
                required
              />
              <label htmlFor="terms" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <span>서비스 이용약관 동의 (필수)</span>
                <a
                  href="/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'none',
                    border: '1px solid var(--color-primary)',
                    color: 'var(--color-primary)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  전문보기
                </a>
              </label>
            </div>

            <div className={styles.checkboxContainer} style={{ marginBottom: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                id="privacy"
                checked={formData.privacyAgree}
                onChange={(e) => handleInputChange('privacyAgree', e.target.checked)}
                required
              />
              <label htmlFor="privacy" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <span>개인정보 수집 및 이용 동의 (필수)</span>
                <a
                  href="/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'none',
                    border: '1px solid var(--color-primary)',
                    color: 'var(--color-primary)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  전문보기
                </a>
              </label>
            </div>

            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="marketing"
                checked={formData.marketingAgree}
                onChange={(e) => handleInputChange('marketingAgree', e.target.checked)}
              />
              <label htmlFor="marketing" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <span>마케팅 정보 수신 동의 (선택)</span>
                <button
                  type="button"
                  onClick={() => openLegalModal('marketing')}
                  style={{
                    background: 'none',
                    border: '1px solid var(--color-text-muted)',
                    color: 'var(--color-text-muted)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  전문보기
                </button>
              </label>
            </div>
          </div>

          {/* 제출 버튼 */}
          {error && (
            <div role="alert" style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>
          )}
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
            <button type="submit" className={styles.button} style={{ flex: 1 }} disabled={submitting} aria-busy={submitting}>
              {submitting ? '처리 중...' : '🎉 가입하기'}
            </button>
            <Link to="/auth/signin" className={styles.buttonGhost} style={{ flex: 1, textAlign: 'center' }}>
              로그인으로 돌아가기
            </Link>
          </div>
        </form>
      </div>

      {/* 법적 문서 모달 */}
      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={closeLegalModal}
        type={legalModal.type}
      />
    </div>
  );
}