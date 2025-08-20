import { useState } from 'react';
import styles from '@/features/common/styles/ui.module.css';
import { useAuth } from '@/app/providers/useAuth';
import type { UserRole } from '@/shared/types/user';
import { createRoleRequest } from '@/features/roles/services/rolesApi';
import { doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db } from '@/shared/config/firebase';

const ROLE_ORDER: UserRole[] = ['newbie', 'intermediate', 'advanced', 'subadmin'];

export function ProfilePage() {
  const { profile, firebaseUser } = useAuth();
  const [toRole, setToRole] = useState<UserRole>('intermediate');
  const [reason, setReason] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(profile?.marketingConsent ?? false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const canRequest = firebaseUser && profile;
  const current = profile?.role ?? 'newbie';

  const allowedTargets = ROLE_ORDER.filter((r) => ROLE_ORDER.indexOf(r) > ROLE_ORDER.indexOf(current));

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h3 style={{ marginTop: 0 }}>프로필</h3>
        <div style={{ color: 'var(--muted)' }}>현재 역할: {current}</div>
        {firebaseUser && (
          <div className={styles.fieldRow} style={{ marginTop: 12 }}>
            <label className={styles.label}>이메일</label>
            <div>{firebaseUser.email}</div>
          </div>
        )}
        <div className={styles.fieldRow}>
          <label className={styles.label}>이름</label>
          <input className={styles.input} defaultValue={profile?.name ?? ''} id="name" />
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.label}>닉네임</label>
          <input className={styles.input} defaultValue={profile?.nickname ?? ''} id="nickname" />
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.label}>연락처</label>
          <input className={styles.input} defaultValue={profile?.phone ?? ''} id="phone" />
        </div>
        
        {/* 마케팅 동의 설정 */}
        <div className={styles.fieldRow}>
          <label className={styles.label}>마케팅 정보 수신 동의</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="marketing-consent"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
            />
            <label htmlFor="marketing-consent" style={{ fontSize: 14, color: 'var(--muted)' }}>
              이벤트, 혜택, 새로운 기능 등에 대한 정보를 이메일로 받아보겠습니다.
            </label>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className={styles.button}
            disabled={!firebaseUser}
            onClick={async () => {
              if (!firebaseUser || !profile) return;
              const name = (document.getElementById('name') as HTMLInputElement).value;
              const nickname = (document.getElementById('nickname') as HTMLInputElement).value;
              const phone = (document.getElementById('phone') as HTMLInputElement).value;
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                name,
                nickname,
                phone,
                marketingConsent,
                role: profile.role,
                email: profile.email,
                blocked: false,
                createdAt: profile.createdAt ?? serverTimestamp(),
                updatedAt: serverTimestamp(),
              }, { merge: true });
              alert('프로필이 저장되었습니다.');
            }}
          >프로필 저장</button>
        </div>
        <div className={styles.fieldRow} style={{ marginTop: 12 }}>
          <label className={styles.label}>역할 신청</label>
          <select className={styles.select} value={toRole} onChange={(e) => setToRole(e.target.value as UserRole)}>
            {allowedTargets.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className={styles.fieldRow}>
          <label className={styles.label}>사유</label>
          <textarea className={styles.textarea} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="신청 사유를 입력" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={styles.button}
            disabled={!canRequest || !reason}
            onClick={async () => {
              if (!firebaseUser || !profile) return;
              await createRoleRequest({ uid: firebaseUser.uid, fromRole: profile.role, toRole, reason });
              setReason('');
            }}
          >신청</button>
        </div>
        
        {/* 계정 삭제 섹션 */}
        <div style={{ 
          marginTop: 32, 
          padding: 16, 
          border: '1px solid rgba(255,0,0,0.3)', 
          borderRadius: 8,
          backgroundColor: 'rgba(255,0,0,0.05)'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#ff4444' }}>위험 구역</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: 12, color: 'var(--muted)' }}>
            계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
          </p>
          <button
            className={styles.buttonGhost}
            style={{ 
              color: '#ff4444', 
              borderColor: '#ff4444',
              fontSize: 12
            }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            계정 삭제
          </button>
        </div>
        
        {/* 계정 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className={styles.card} style={{ maxWidth: 400 }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#ff4444' }}>계정 삭제 확인</h3>
              <p style={{ margin: '0 0 16px 0', lineHeight: 1.5 }}>
                정말로 계정을 삭제하시겠습니까?<br/>
                이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  className={styles.buttonGhost}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  취소
                </button>
                <button
                  className={styles.button}
                  style={{ backgroundColor: '#ff4444' }}
                  onClick={async () => {
                    if (!firebaseUser) return;
                    try {
                      // Firestore 프로필 삭제
                      await deleteDoc(doc(db, 'users', firebaseUser.uid));
                      // Firebase Auth 계정 삭제
                      await deleteUser(firebaseUser);
                      alert('계정이 삭제되었습니다.');
                      window.location.href = '/';
                    } catch (err) {
                      alert('계정 삭제 중 오류가 발생했습니다: ' + (err as Error).message);
                    }
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


