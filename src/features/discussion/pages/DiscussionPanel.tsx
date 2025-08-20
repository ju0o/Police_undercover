// no React import required
import styles from '@/features/common/styles/ui.module.css';
import { useParams } from 'react-router-dom';
import { ThreadList } from '@/features/discussion/components/ThreadList';
import { CommentList } from '@/features/discussion/components/CommentList';
import { Composer } from '@/features/discussion/components/Composer';

export function DiscussionPanel() {
  const { subjectSlug, typeSlug } = useParams();

  return (
    <section>
      <div className={styles.container}>
        <div className={styles.card}>
          <h3 style={{ marginTop: 0 }}>Discussion</h3>
          <p style={{ color: 'var(--muted)' }}>
            대상: <b>{subjectSlug}</b> {typeSlug ? `/ ${typeSlug}` : ''}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
            <ThreadList />
            <div style={{ display: 'grid', gap: 12 }}>
              <CommentList />
              <Composer />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


