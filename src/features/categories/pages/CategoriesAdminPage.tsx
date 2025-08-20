import { useEffect, useState, type ReactElement } from 'react';
import styles from '@/features/common/styles/ui.module.css';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { db } from '@/shared/config/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, orderBy, query, setDoc, where, getCountFromServer, limit } from 'firebase/firestore';

interface GroupForm { title: string }
interface ItemForm { name: string; slug: string; count?: number }

export function CategoriesAdminPage(): ReactElement {
  const [groups, setGroups] = useState<Array<{ id: string; title: string; items: Array<{ id: string } & ItemForm> }>>([]);
  const [newGroup, setNewGroup] = useState<GroupForm>({ title: '' });
  const [newItemByGroup, setNewItemByGroup] = useState<Record<string, ItemForm>>({});

  async function load(): Promise<void> {
    const gq = query(collection(db, 'categories'), orderBy('title'));
    const gs = await getDocs(gq);
    const rows: Array<{ id: string; title: string; items: Array<{ id: string } & ItemForm> }> = [];
    for (const g of gs.docs) {
      const iq = query(collection(doc(db, 'categories', g.id), 'items'), orderBy('name'));
      const is = await getDocs(iq);
      rows.push({ id: g.id, title: (g.data() as { title: string }).title, items: is.docs.map((d) => ({ id: d.id, ...(d.data() as ItemForm) })) });
    }
    setGroups(rows);
  }

  useEffect(() => { void load(); }, []);

  return (
    <ProtectedRoute role="subadmin">
      <div className={styles.container}>
        <div className={styles.card}>
          <h3 style={{ marginTop: 0 }}>카테고리 관리</h3>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0 16px' }}>
            <button
              className={styles.button}
              onClick={async () => {
                // 자동 집계: 각 항목의 slug가 subjects.tags에 array-contains로 포함된 문서 수 집계
                for (const g of groups) {
                  for (const it of g.items) {
                    try {
                      const q = query(collection(db, 'subjects'), where('tags', 'array-contains', it.slug));
                      const snapshot = await getCountFromServer(q);
                      const count = snapshot.data().count;
                      await setDoc(doc(doc(db, 'categories', g.id), 'items', it.id), { count }, { merge: true });
                    } catch {
                      // continue on errors to process remaining items
                    }
                  }
                }
                await load();
              }}
            >count 자동 집계</button>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>subjects.tags에 슬러그가 포함된 문서 수를 count로 반영합니다.</div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
            <div className={styles.fieldRow}>
              <label className={styles.label}>새 그룹 제목</label>
              <input className={styles.input} value={newGroup.title} onChange={(e) => setNewGroup({ title: e.target.value })} />
            </div>
            <button
              className={styles.button}
              disabled={!newGroup.title.trim()}
              onClick={async () => {
                await addDoc(collection(db, 'categories'), { title: newGroup.title.trim() });
                setNewGroup({ title: '' });
                await load();
              }}
            >그룹 추가</button>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {groups.map((g) => (
              <div key={g.id} style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong>{g.title}</strong>
                  <button
                    className={styles.button}
                    onClick={async () => {
                      await deleteDoc(doc(db, 'categories', g.id));
                      await load();
                    }}
                  >그룹 삭제</button>
                </div>

                <div style={{ display: 'grid', gap: 8, marginBottom: 8 }}>
                  {g.items.map((it) => (
                    <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px auto', gap: 8 }}>
                      <input className={styles.input} defaultValue={it.name} id={`name-${it.id}`} />
                      <input className={styles.input} defaultValue={it.slug} id={`slug-${it.id}`} />
                      <input className={styles.input} defaultValue={String(it.count ?? '')} id={`count-${it.id}`} placeholder="count(선택)" />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className={styles.button}
                          onClick={async () => {
                            const name = (document.getElementById(`name-${it.id}`) as HTMLInputElement).value;
                            const slug = (document.getElementById(`slug-${it.id}`) as HTMLInputElement).value;
                            const countRaw = (document.getElementById(`count-${it.id}`) as HTMLInputElement).value;
                            const count = countRaw ? Number(countRaw) : undefined;
                            await setDoc(doc(doc(db, 'categories', g.id), 'items', it.id), { name, slug, count }, { merge: true });
                            await load();
                          }}
                        >저장</button>
                        <button
                          className={styles.button}
                          onClick={async () => {
                            await deleteDoc(doc(doc(db, 'categories', g.id), 'items', it.id));
                            await load();
                          }}
                        >삭제</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px auto', gap: 8 }}>
                  <input
                    className={styles.input}
                    placeholder="항목 이름"
                    value={newItemByGroup[g.id]?.name ?? ''}
                    onChange={(e) => setNewItemByGroup((s) => ({ ...s, [g.id]: { ...(s[g.id] ?? { name: '', slug: '', count: undefined }), name: e.target.value } }))}
                  />
                  <input
                    className={styles.input}
                    placeholder="슬러그"
                    value={newItemByGroup[g.id]?.slug ?? ''}
                    onChange={(e) => setNewItemByGroup((s) => ({ ...s, [g.id]: { ...(s[g.id] ?? { name: '', slug: '', count: undefined }), slug: e.target.value } }))}
                  />
                  <input
                    className={styles.input}
                    placeholder="count(선택)"
                    value={newItemByGroup[g.id]?.count ?? ''}
                    onChange={(e) => setNewItemByGroup((s) => ({ ...s, [g.id]: { ...(s[g.id] ?? { name: '', slug: '', count: undefined }), count: e.target.value ? Number(e.target.value) : undefined } }))}
                  />
                  <button
                    className={styles.button}
                    disabled={!newItemByGroup[g.id]?.name || !newItemByGroup[g.id]?.slug}
                    onClick={async () => {
                      const item = newItemByGroup[g.id]!;
                      await addDoc(collection(doc(db, 'categories', g.id), 'items'), { name: item.name, slug: item.slug, count: item.count });
                      setNewItemByGroup((s) => ({ ...s, [g.id]: { name: '', slug: '', count: undefined } }));
                      await load();
                    }}
                  >항목 추가</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Count 자동 집계 */}
        <div className={styles.card} style={{ marginTop: 24 }}>
          <h3 style={{ marginTop: 0 }}>📊 Count 자동 집계</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>
            subjects 컬렉션의 tags 필드를 기반으로 각 카테고리의 문서 수를 자동으로 계산합니다.
          </p>
          <button
            className={styles.button}
            onClick={async () => {
              if (!confirm('모든 카테고리의 count를 자동으로 업데이트하시겠습니까?')) return;
              
              try {
                // subjects에서 모든 tags 수집
                const subjectsSnap = await getDocs(collection(db, 'subjects'));
                const tagCounts: Record<string, number> = {};
                
                subjectsSnap.docs.forEach((doc) => {
                  const data = doc.data();
                  const tags = data.tags || [];
                  tags.forEach((tag: string) => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                  });
                });
                
                // 각 카테고리 그룹의 아이템들 업데이트
                for (const group of groups) {
                  for (const item of group.items) {
                    const count = tagCounts[item.slug] || 0;
                    await setDoc(
                      doc(doc(db, 'categories', group.id), 'items', item.id), 
                      { count }, 
                      { merge: true }
                    );
                  }
                }
                
                alert(`Count 자동 집계 완료! ${Object.keys(tagCounts).length}개 태그 처리됨`);
                await load();
              } catch (err) {
                alert('Count 집계 중 오류: ' + (err as Error).message);
              }
            }}
          >
            🔄 Count 자동 집계 실행
          </button>
          
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
            <strong>작동 방식:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>subjects 컬렉션의 모든 문서를 스캔</li>
              <li>각 문서의 tags 배열에서 태그별 개수 집계</li>
              <li>카테고리 아이템의 slug와 매칭하여 count 업데이트</li>
            </ul>
          </div>
        </div>
        
        {/* 벌크 편집 도구 */}
        <div className={styles.card} style={{ marginTop: 24 }}>
          <h3 style={{ marginTop: 0 }}>🔧 벌크 편집 도구</h3>
          
          <div style={{ display: 'grid', gap: 16 }}>
            {/* 카테고리 일괄 삭제 */}
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>빈 카테고리 정리</h4>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 8px 0' }}>
                count가 0이거나 없는 카테고리 아이템들을 일괄 삭제합니다.
              </p>
              <button
                className={styles.buttonGhost}
                style={{ color: '#ff6b6b' }}
                onClick={async () => {
                  if (!confirm('빈 카테고리들을 모두 삭제하시겠습니까?')) return;
                  
                  let deletedCount = 0;
                  for (const group of groups) {
                    for (const item of group.items) {
                      if (!item.count || item.count === 0) {
                        await deleteDoc(doc(doc(db, 'categories', group.id), 'items', item.id));
                        deletedCount++;
                      }
                    }
                  }
                  
                  alert(`${deletedCount}개의 빈 카테고리가 삭제되었습니다.`);
                  await load();
                }}
              >
                🗑️ 빈 카테고리 일괄 삭제
              </button>
            </div>
            
            {/* 카테고리 이름 정규화 */}
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>카테고리 이름 정규화</h4>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 8px 0' }}>
                카테고리 이름의 앞뒤 공백을 제거하고 첫 글자를 대문자로 변환합니다.
              </p>
              <button
                className={styles.button}
                onClick={async () => {
                  if (!confirm('모든 카테고리 이름을 정규화하시겠습니까?')) return;
                  
                  let updatedCount = 0;
                  for (const group of groups) {
                    for (const item of group.items) {
                      const normalizedName = item.name.trim().charAt(0).toUpperCase() + item.name.trim().slice(1);
                      if (normalizedName !== item.name) {
                        await setDoc(
                          doc(doc(db, 'categories', group.id), 'items', item.id),
                          { name: normalizedName },
                          { merge: true }
                        );
                        updatedCount++;
                      }
                    }
                  }
                  
                  alert(`${updatedCount}개의 카테고리 이름이 정규화되었습니다.`);
                  await load();
                }}
              >
                ✨ 이름 정규화 실행
              </button>
            </div>
            
            {/* 감사 로그 */}
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>감사 로그</h4>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 8px 0' }}>
                최근 카테고리 변경 내역을 확인합니다.
              </p>
              <button
                className={styles.buttonGhost}
                onClick={async () => {
                  try {
                    const logsSnap = await getDocs(
                      query(
                        collection(db, 'activityLogs'),
                        where('action', 'in', ['category_create', 'category_update', 'category_delete']),
                        orderBy('createdAt', 'desc'),
                        limit(10)
                      )
                    );
                    
                    const logs = logsSnap.docs.map(d => d.data());
                    const logText = logs.map(log => 
                      `${new Date(log.createdAt?.toDate?.() || log.createdAt).toLocaleString()} - ${log.action} by ${log.userId}`
                    ).join('\n');
                    
                    alert(`최근 카테고리 변경 로그:\n\n${logText || '변경 내역이 없습니다.'}`);
                  } catch (err) {
                    alert('로그 조회 중 오류: ' + (err as Error).message);
                  }
                }}
              >
                📋 감사 로그 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


