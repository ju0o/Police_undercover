// React import not needed with jsx: react-jsx
import type { ProposalChangeType } from '@/shared/types/proposal';
import styles from '@/features/common/styles/ui.module.css';

interface DiffViewerProps {
  original: unknown;
  modified: unknown;
  changeType: ProposalChangeType;
}

export function DiffViewer({ original, modified, changeType }: DiffViewerProps) {
  // 간단한 diff 표시 - 실제로는 더 정교한 diff 알고리즘 필요
  const originalText = typeof original === 'string' ? original : JSON.stringify(original, null, 2);
  const modifiedText = typeof modified === 'string' ? modified : JSON.stringify(modified, null, 2);

  if (changeType === 'add') {
    return (
      <div className={styles.card} style={{ padding: '1rem', background: 'var(--color-background-light)' }}>
        <div style={{ color: '#10b981', marginBottom: '0.5rem', fontWeight: 'bold' }}>+ 추가될 내용</div>
        <pre style={{ 
          margin: 0, 
          fontSize: '0.9rem', 
          whiteSpace: 'pre-wrap',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          {modifiedText}
        </pre>
      </div>
    );
  }

  if (changeType === 'delete') {
    return (
      <div className={styles.card} style={{ padding: '1rem', background: 'var(--color-background-light)' }}>
        <div style={{ color: '#ef4444', marginBottom: '0.5rem', fontWeight: 'bold' }}>- 삭제될 내용</div>
        <pre style={{ 
          margin: 0, 
          fontSize: '0.9rem', 
          whiteSpace: 'pre-wrap',
          background: 'rgba(239, 68, 68, 0.1)',
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          {originalText}
        </pre>
      </div>
    );
  }

  if (changeType === 'flag_error') {
    return (
      <div className={styles.card} style={{ padding: '1rem', background: 'var(--color-background-light)' }}>
        <div style={{ color: '#f59e0b', marginBottom: '0.5rem', fontWeight: 'bold' }}>⚠️ 오류 신고된 내용</div>
        <pre style={{ 
          margin: 0, 
          fontSize: '0.9rem', 
          whiteSpace: 'pre-wrap',
          background: 'rgba(245, 158, 11, 0.1)',
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          {originalText}
        </pre>
      </div>
    );
  }

  // modify의 경우 side-by-side diff
  return (
    <div className={styles.card} style={{ padding: '1rem', background: 'var(--color-background-light)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <div style={{ color: '#ef4444', marginBottom: '0.5rem', fontWeight: 'bold' }}>- 이전 내용</div>
          <pre style={{ 
            margin: 0, 
            fontSize: '0.8rem', 
            whiteSpace: 'pre-wrap',
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {originalText}
          </pre>
        </div>
        <div>
          <div style={{ color: '#10b981', marginBottom: '0.5rem', fontWeight: 'bold' }}>+ 새 내용</div>
          <pre style={{ 
            margin: 0, 
            fontSize: '0.8rem', 
            whiteSpace: 'pre-wrap',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {modifiedText}
          </pre>
        </div>
      </div>
    </div>
  );
}
