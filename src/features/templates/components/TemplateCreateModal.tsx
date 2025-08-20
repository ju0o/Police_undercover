import { useEffect, useState } from 'react';
import styles from '@/features/common/styles/ui.module.css';
import { fetchTemplates, createSubjectFromTemplate } from '@/features/templates/services/templatesApi';
import type { TemplateDoc } from '@/shared/types/template';
import { useAuth } from '@/app/providers/useAuth';

export function TemplateCreateModal() {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateDoc[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [title, setTitle] = useState('새 주제');
  const [slug, setSlug] = useState('new-subject');
  const { firebaseUser } = useAuth();

  useEffect(() => {
    fetchTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  return (
    <div>
      <button className={styles.button} onClick={() => setOpen(true)}>템플릿으로 새 주제</button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div className={styles.card} style={{ maxWidth: 520, width: '100%' }}>
            <h4 style={{ marginTop: 0 }}>템플릿 선택</h4>
            <div className={styles.fieldRow}>
              <label className={styles.label}>템플릿</label>
              <select className={styles.select} value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">선택</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>제목</label>
              <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>슬러그</label>
              <input className={styles.input} value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className={styles.buttonGhost} onClick={() => setOpen(false)}>취소</button>
              <button
                className={styles.button}
                disabled={!selected || !firebaseUser}
                onClick={async () => {
                  const tmpl = templates.find((t) => t.id === selected);
                  if (!tmpl || !firebaseUser) return;
                  await createSubjectFromTemplate({ template: tmpl, subject: { title, slug, status: 'approved' }, userId: firebaseUser.uid });
                  setOpen(false);
                }}
              >생성</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


