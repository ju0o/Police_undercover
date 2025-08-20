import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import { useAuth } from '@/app/providers/useAuth';
import type { ProposalDoc } from '@/shared/types/proposal';
import styles from '@/features/common/styles/ui.module.css';
import { Skeleton } from '@/features/common/ui/Skeleton';

export function ProposalsPage() {
  const { firebaseUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals', firebaseUser?.uid, filter],
    queryFn: async () => {
      if (!firebaseUser) return [];
      let q = query(
        collection(db, 'proposals'),
        where('createdBy', '==', firebaseUser.uid),
        orderBy('createdAt', 'desc')
      );
      if (filter !== 'all') {
        q = query(q, where('status', '==', filter));
      }
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProposalDoc));
    },
    enabled: !!firebaseUser,
  });

  if (!firebaseUser) {
    return (
      <div className={styles.card} style={{ margin: '2rem auto', maxWidth: '800px', padding: '2rem' }}>
        <h1>로그인이 필요합니다</h1>
      </div>
    );
  }

  return (
    <div className={styles.card} style={{ margin: '2rem auto', maxWidth: '1000px', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>내 제안</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={filter === status ? styles.button : styles.buttonGhost}
            >
              {status === 'all' ? '전체' : 
               status === 'pending' ? '대기중' :
               status === 'approved' ? '승인됨' : '반려됨'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={styles.card} style={{ padding: '1rem' }}>
              <Skeleton width="60%" height={18} />
              <Skeleton width="100%" height={16} style={{ marginTop: '0.5rem' }} />
              <Skeleton width="40%" height={13} style={{ marginTop: '0.5rem' }} />
            </div>
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <div className={styles.card} style={{ padding: '2rem', textAlign: 'center' }}>
          <p>제안이 없습니다.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {proposals.map(proposal => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: ProposalDoc }) {
  const statusText = proposal.status === 'pending' ? '대기중' :
                    proposal.status === 'approved' ? '승인됨' : '반려됨';
  const statusColor = proposal.status === 'pending' ? '#fbbf24' :
                     proposal.status === 'approved' ? '#10b981' : '#ef4444';
  
  const changeTypeText = proposal.changeType === 'modify' ? '수정' :
                        proposal.changeType === 'add' ? '추가' :
                        proposal.changeType === 'delete' ? '삭제' : '오류 신고';

  return (
    <div className={styles.card} style={{ padding: '1.5rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            {changeTypeText} • {proposal.targetPath}
          </h3>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-text-secondary)' }}>
            {proposal.reason}
          </p>
        </div>
        <span 
          className={styles.badge} 
          style={{ backgroundColor: statusColor, color: 'white' }}
        >
          {statusText}
        </span>
      </div>
      
      {proposal.payload != null && (
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--color-primary)' }}>
            변경 내용 보기
          </summary>
          <pre style={{ 
            background: 'var(--color-background-light)', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginTop: '0.5rem',
            fontSize: '0.9rem',
            overflow: 'auto'
          }}>
            {JSON.stringify(proposal.payload, null, 2)}
          </pre>
        </details>
      )}
      
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
        제안일: {proposal.createdAt ? new Date((proposal.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString() : '알 수 없음'}
        {proposal.approvedAt != null && (
          <span style={{ marginLeft: '1rem' }}>
            처리일: {new Date((proposal.approvedAt as { seconds: number }).seconds * 1000).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}


