// no React import required
import styles from '@/features/common/styles/ui.module.css';

export function ThreadList() {
  return (
    <aside className={styles.card}>
      <h4 style={{ marginTop: 0 }}>스레드</h4>
      <ul style={{ paddingLeft: 16, margin: 0, display: 'grid', gap: 8 }}>
        <li><a className={styles.navLink} href="#">샘플 스레드 1</a></li>
        <li><a className={styles.navLink} href="#">샘플 스레드 2</a></li>
      </ul>
    </aside>
  );
}


