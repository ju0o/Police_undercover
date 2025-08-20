// no React import required
import styles from '@/features/common/styles/ui.module.css';
import { useEffect, useState } from 'react';
import { listRoleRequestsPending, reviewRoleRequest, applyApprovedRoleToUser } from '@/features/roles/services/rolesApi';
import type { RoleRequestDoc } from '@/shared/types/roles';
import { useAuth } from '@/app/providers/useAuth';

export function RoleModerationPage() {
  const [items, setItems] = useState<RoleRequestDoc[]>([]);
  const { firebaseUser } = useAuth();
  useEffect(() => {
    listRoleRequestsPending().then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h3 style={{ marginTop: 0 }}>역할 신청 승인</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {items.length === 0 ? (
            <div style={{ color: 'var(--muted)' }}>대기중인 신청이 없습니다</div>
          ) : (
            items.map((r) => (
              <div key={r.id} style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 13 }}>{r.uid}: {r.fromRole} → {r.toRole}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.reason}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={styles.button} disabled={!firebaseUser} onClick={async () => { if (!firebaseUser) return; await reviewRoleRequest(r.id, firebaseUser.uid, true); await applyApprovedRoleToUser({ ...r, status: 'approved' }); setItems((s) => s.filter((x) => x.id !== r.id)); }}>승인</button>
                  <button className={styles.buttonGhost} disabled={!firebaseUser} onClick={async () => { if (!firebaseUser) return; await reviewRoleRequest(r.id, firebaseUser.uid, false); setItems((s) => s.filter((x) => x.id !== r.id)); }}>반려</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


