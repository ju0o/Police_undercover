import { useEffect, useState, type ReactElement } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from '@/features/common/styles/ui.module.css';
import { searchSubjects } from '@/features/search/services/searchService';
import { trackSearch } from '@/features/analytics/track';

export function SearchResultsPage(): ReactElement {
  const [params, setParams] = useSearchParams();
  const term = (params.get('q') ?? '').trim();
  const sortBy = (params.get('sort') as 'relevance' | 'recent') || 'relevance';
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<Array<{ id: string; title: string; slug: string; summary?: string }>>([]);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        if (!term) { setItems([]); return; }
        const results = await searchSubjects(term, { limit: 100, sortBy });
        setItems(results.map((r) => ({ id: r.id, title: r.title, slug: r.slug, summary: r.summary })));
        setPage(1);
        void trackSearch(term);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, sortBy]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ marginTop: 0, marginBottom: 4 }}>검색 결과</h3>
            <div style={{ color: 'var(--muted)' }}>"{term}" 검색</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className={sortBy === 'relevance' ? styles.button : styles.buttonGhost}
              onClick={() => setParams({ q: term, sort: 'relevance' })}
            >
              관련도순
            </button>
            <button 
              className={sortBy === 'recent' ? styles.button : styles.buttonGhost}
              onClick={() => setParams({ q: term, sort: 'recent' })}
            >
              최신순
            </button>
          </div>
        </div>
        {loading ? (
          <div style={{ color: 'var(--muted)' }}>로딩 중...</div>
        ) : items.length === 0 ? (
          <div style={{ color: 'var(--muted)' }}>결과가 없습니다</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {items.slice((page - 1) * pageSize, page * pageSize).map((it) => {
              // Enhanced highlighting function
              const highlightText = (text: string, searchTerm: string) => {
                if (!searchTerm) return text;
                const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                const parts = text.split(regex);
                return parts.map((part, index) => 
                  regex.test(part) ? <mark key={index}>{part}</mark> : part
                );
              };

              return (
                <div key={it.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 12 }}>
                  <Link to={`/wiki/${it.slug}`} className={styles.buttonGhost} style={{ display: 'block', textAlign: 'left' }}>
                    {highlightText(it.title, term)}
                  </Link>
                  {it.summary && (
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                      {highlightText(it.summary, term)}
                    </div>
                  )}
                </div>
              );
            })}
            {items.length > pageSize && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <button className={styles.buttonGhost} disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>이전</button>
                <div style={{ color: 'var(--muted)', alignSelf: 'center' }}>{page} / {Math.ceil(items.length / pageSize)}</div>
                <button className={styles.buttonGhost} disabled={page >= Math.ceil(items.length / pageSize)} onClick={() => setPage((p) => Math.min(Math.ceil(items.length / pageSize), p + 1))}>다음</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


