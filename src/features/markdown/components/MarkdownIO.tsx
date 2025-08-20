import { useState } from 'react';
import { parseMarkdownToBlocks, blocksToMarkdown } from '@/features/markdown/services/markdown';
import styles from '@/features/common/styles/ui.module.css';

export function MarkdownIO() {
  const [md, setMd] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  return (
    <div className={styles.card}>
      <h4 style={{ marginTop: 0 }}>Markdown I/O</h4>
      <textarea className={styles.textarea} placeholder="# 제목\n\n본문..." value={md} onChange={(e) => setMd(e.target.value)} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className={styles.button} onClick={async () => {
          const blocks = await parseMarkdownToBlocks(md);
          const out = await blocksToMarkdown(blocks);
          setPreview(out);
        }}>미리보기</button>
        <button className={styles.buttonGhost} onClick={() => setPreview('')}>초기화</button>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12, color: 'var(--muted)' }}>{preview}</pre>
    </div>
  );
}


