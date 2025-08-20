import styles from '@/features/common/styles/ui.module.css';

export function CommentList() {
  return (
    <div className={styles.card}>
      <h4 style={{ marginTop: 0 }}>댓글</h4>
      <ul style={{ paddingLeft: 16, margin: 0, display: 'grid', gap: 8 }}>
        <li>예시 댓글 A</li>
        <li>예시 댓글 B</li>
      </ul>
    </div>
  );
}


