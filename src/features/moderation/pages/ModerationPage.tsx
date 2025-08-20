import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import { useAuth } from '@/app/providers/useAuth';
import { useToastStore } from '@/features/common/hooks/useToast';
import { logActivity } from '@/features/activity/services/activityService';
import { trackProposal } from '@/features/analytics/track';
import type { ProposalDoc } from '@/shared/types/proposal';
import styles from '@/features/common/styles/ui.module.css';
import { Skeleton } from '@/features/common/ui/Skeleton';
import { DiffViewer } from '@/features/moderation/components/DiffViewer';

export function ModerationPage() {
  const { firebaseUser, role } = useAuth();
  const addToast = useToastStore(state => state.addToast);
  const queryClient = useQueryClient();
  const [selectedProposal, setSelectedProposal] = useState<ProposalDoc | null>(null);

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['moderation-proposals'],
    queryFn: async () => {
      const q = query(
        collection(db, 'proposals'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProposalDoc));
    },
    enabled: role === 'subadmin',
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ proposalId, decision, reason }: { proposalId: string; decision: 'approved' | 'rejected'; reason?: string }) => {
      const ref = doc(db, 'proposals', proposalId);
      await updateDoc(ref, {
        status: decision,
        approvedBy: firebaseUser?.uid,
        approvedAt: serverTimestamp(),
        rejectionReason: reason || null,
      });
      
      // 감사 로그 기록
      if (firebaseUser) {
        const proposal = proposals.find(p => p.id === proposalId);
        await logActivity({
          actor: firebaseUser.uid,
          action: decision === 'approved' ? 'approve' : 'reject',
          targetPath: proposal?.targetPath || `/proposals/${proposalId}`,
          diffSummary: `Proposal ${decision}: ${proposal?.reason || 'No reason'}`,
        });
        void trackProposal(decision === 'approved' ? 'approve' : 'reject', {
          proposalId,
          targetPath: proposal?.targetPath,
        });
      }
    },
    onSuccess: (_, { decision }) => {
      queryClient.invalidateQueries({ queryKey: ['moderation-proposals'] });
      setSelectedProposal(null);
      addToast({
        id: Date.now().toString(),
        message: decision === 'approved' ? '제안이 승인되었습니다.' : '제안이 반려되었습니다.',
        type: 'success',
      });
    },
    onError: () => {
      addToast({
        id: Date.now().toString(),
        message: '처리 중 오류가 발생했습니다.',
        type: 'error',
      });
    },
  });

  if (role !== 'subadmin') {
    return (
      <div className={styles.card} style={{ margin: '2rem auto', maxWidth: '800px', padding: '2rem' }}>
        <h1>접근 권한이 없습니다</h1>
        <p>준운영진만 접근할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', margin: '2rem', maxWidth: '1400px', marginLeft: 'auto', marginRight: 'auto' }}>
      {/* 제안 목록 */}
      <div className={styles.card} style={{ flex: '1', padding: '2rem', maxHeight: '80vh', overflow: 'auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>모더레이션 큐</h1>
        
        {isLoading ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={styles.card} style={{ padding: '1rem' }}>
                <Skeleton width="70%" height={18} />
                <Skeleton width="100%" height={16} style={{ marginTop: '0.5rem' }} />
                <Skeleton width="30%" height={13} style={{ marginTop: '0.5rem' }} />
              </div>
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <div className={styles.card} style={{ padding: '2rem', textAlign: 'center' }}>
            <p>승인 대기 중인 제안이 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {proposals.map(proposal => (
              <ProposalModerationCard 
                key={proposal.id} 
                proposal={proposal}
                isSelected={selectedProposal?.id === proposal.id}
                onClick={() => setSelectedProposal(proposal)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 상세 검토 패널 */}
      <div className={styles.card} style={{ flex: '1', padding: '2rem', maxHeight: '80vh', overflow: 'auto' }}>
        {selectedProposal ? (
          <ProposalReviewPanel 
            proposal={selectedProposal}
            onReview={(decision, reason) => reviewMutation.mutate({ proposalId: selectedProposal.id, decision, reason })}
            isReviewing={reviewMutation.isPending}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '4rem' }}>
            <p>검토할 제안을 선택하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProposalModerationCard({ 
  proposal, 
  isSelected, 
  onClick 
}: { 
  proposal: ProposalDoc; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  const changeTypeText = proposal.changeType === 'modify' ? '수정' :
                        proposal.changeType === 'add' ? '추가' :
                        proposal.changeType === 'delete' ? '삭제' : '오류 신고';

  return (
    <div 
      className={styles.card} 
      style={{ 
        padding: '1.5rem', 
        cursor: 'pointer',
        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
        transition: 'border-color 0.2s ease'
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>
          {changeTypeText} • {proposal.targetPath.split('/').pop()}
        </h3>
        <span className={styles.badge} style={{ backgroundColor: '#fbbf24', color: 'white', fontSize: '0.8rem' }}>
          대기중
        </span>
      </div>
      
      <p style={{ margin: '0.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        {proposal.reason}
      </p>
      
      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
        {proposal.createdAt ? new Date((proposal.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString() : '알 수 없음'}
      </div>
    </div>
  );
}

function ProposalReviewPanel({ 
  proposal, 
  onReview, 
  isReviewing 
}: { 
  proposal: ProposalDoc; 
  onReview: (decision: 'approved' | 'rejected', reason?: string) => void;
  isReviewing: boolean;
}) {
  const [rejectionReason, setRejectionReason] = useState('');
  
  const changeTypeText = proposal.changeType === 'modify' ? '수정' :
                        proposal.changeType === 'add' ? '추가' :
                        proposal.changeType === 'delete' ? '삭제' : '오류 신고';

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>제안 검토</h2>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          {changeTypeText} • {proposal.targetPath}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>제안 사유</h3>
        <p style={{ 
          background: 'var(--color-background-light)', 
          padding: '1rem', 
          borderRadius: '8px',
          margin: '0.5rem 0'
        }}>
          {proposal.reason}
        </p>
      </div>

      {proposal.payload != null && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>변경 내용</h3>
          <DiffViewer 
            original={proposal.payload} 
            modified={proposal.payload}
            changeType={proposal.changeType}
          />
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h3>반려 사유 (선택)</h3>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="반려할 경우 사유를 입력하세요..."
          className={styles.input}
          rows={3}
          style={{ width: '100%', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onReview('rejected', rejectionReason.trim() || undefined)}
          disabled={isReviewing}
          className={styles.buttonDanger}
        >
          {isReviewing ? '처리중...' : '반려'}
        </button>
        <button
          onClick={() => onReview('approved')}
          disabled={isReviewing}
          className={styles.button}
        >
          {isReviewing ? '처리중...' : '승인'}
        </button>
      </div>
    </div>
  );
}
