// no React import required
import styles from '@/features/common/styles/ui.module.css';

export function Composer() {
  return (
    <form className={styles.card} style={{ marginTop: 12 }} onSubmit={(e) => e.preventDefault()}>
      <label className={styles.label} htmlFor="comment">댓글 작성</label>
      <textarea id="comment" rows={3} className={styles.textarea} placeholder="내용을 입력..." />
      <div style={{ marginTop: 8 }}>
        <button className={styles.button} type="submit">등록</button>
      </div>
    </form>
  );
}


