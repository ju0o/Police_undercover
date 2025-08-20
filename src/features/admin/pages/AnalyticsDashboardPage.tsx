import { useEffect, useState, type ReactElement } from 'react';
import styles from '@/features/common/styles/ui.module.css';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { collection, getCountFromServer, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';

interface DailyStats {
  date: string;
  edits: number;
  proposals: number;
  searches: number;
  users: number;
}

export function AnalyticsDashboardPage(): ReactElement {
  const [counts, setCounts] = useState<{ edits: number; proposals: number; searches: number } | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        // 주간 카운트
        const editsQ = query(collection(db, 'activityLogs'), where('action', 'in', ['edit', 'approve', 'reject']), where('createdAt', '>=', since));
        const propsQ = query(collection(db, 'proposals'), where('createdAt', '>=', since));
        const searchesQ = query(collection(db, 'activityLogs'), where('action', '==', 'search'), where('createdAt', '>=', since));
        const [editsC, propsC, searchesC] = await Promise.all([
          getCountFromServer(editsQ),
          getCountFromServer(propsQ),
          getCountFromServer(searchesQ),
        ]);
        setCounts({ edits: editsC.data().count, proposals: propsC.data().count, searches: searchesC.data().count });

        // 일별 통계 (최근 7일)
        const dailyData: DailyStats[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          
          const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
          
          // 각 날짜별 활동 수집
          const [dayEdits, dayProps, daySearches, dayUsers] = await Promise.all([
            getDocs(query(collection(db, 'activityLogs'), 
              where('action', 'in', ['edit', 'approve', 'reject']), 
              where('createdAt', '>=', date), 
              where('createdAt', '<', nextDate))),
            getDocs(query(collection(db, 'proposals'), 
              where('createdAt', '>=', date), 
              where('createdAt', '<', nextDate))),
            getDocs(query(collection(db, 'activityLogs'), 
              where('action', '==', 'search'), 
              where('createdAt', '>=', date), 
              where('createdAt', '<', nextDate))),
            getDocs(query(collection(db, 'users'), 
              where('createdAt', '>=', date), 
              where('createdAt', '<', nextDate)))
          ]);
          
          dailyData.push({
            date: dateStr,
            edits: dayEdits.size,
            proposals: dayProps.size,
            searches: daySearches.size,
            users: dayUsers.size
          });
        }
        
        setDailyStats(dailyData);
      } catch {
        setCounts({ edits: 0, proposals: 0, searches: 0 });
        setDailyStats([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 간단한 차트 컴포넌트
  const SimpleChart = ({ data, title }: { data: DailyStats[]; title: string }) => {
    if (data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.edits + d.proposals + d.searches + d.users));
    
    return (
      <div className={styles.card} style={{ marginTop: 16 }}>
        <h4 style={{ margin: '0 0 16px 0' }}>{title}</h4>
        <div style={{ display: 'flex', alignItems: 'end', gap: 8, height: 120 }}>
          {data.map((day, index) => {
            const total = day.edits + day.proposals + day.searches + day.users;
            const height = maxValue > 0 ? (total / maxValue) * 100 : 0;
            
            return (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div 
                  style={{ 
                    width: '100%', 
                    backgroundColor: 'var(--primary)', 
                    height: `${height}px`,
                    borderRadius: '4px 4px 0 0',
                    minHeight: height > 0 ? '2px' : '0'
                  }}
                  title={`${day.date}: 편집 ${day.edits}, 제안 ${day.proposals}, 검색 ${day.searches}, 신규 ${day.users}`}
                />
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: 'center' }}>
                  {day.date}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                  {total}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
          일별 활동량 (편집 + 제안 + 검색 + 신규가입)
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute role="subadmin">
      <div className={styles.container}>
        <div className={styles.card}>
          <h3 style={{ marginTop: 0 }}>📊 관리자 대시보드</h3>
          
          {loading ? (
            <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 32 }}>
              데이터 로딩 중...
            </div>
          ) : (
            <>
              {/* 주간 요약 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                <div className={styles.card} style={{ padding: 16, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>최근 7일 편집활동</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{counts?.edits || 0}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>편집/승인/반려</div>
                </div>
                <div className={styles.card} style={{ padding: 16, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>최근 7일 제안</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{counts?.proposals || 0}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>새로운 제안</div>
                </div>
                <div className={styles.card} style={{ padding: 16, backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>최근 7일 검색</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#a855f7' }}>{counts?.searches || 0}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>검색 쿼리</div>
                </div>
                <div className={styles.card} style={{ padding: 16, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>신규 가입자</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
                    {dailyStats.reduce((sum, day) => sum + day.users, 0)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>최근 7일</div>
                </div>
              </div>
              
              {/* 활동 차트 */}
              <SimpleChart data={dailyStats} title="📈 일별 활동 추이" />
              
              {/* 세부 통계 */}
              <div className={styles.card} style={{ marginTop: 16 }}>
                <h4 style={{ margin: '0 0 12px 0' }}>📋 세부 통계</h4>
                <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                  {dailyStats.map((day, index) => (
                    <div key={index} style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '80px 1fr 1fr 1fr 1fr', 
                      gap: 8, 
                      padding: 8,
                      backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      borderRadius: 4
                    }}>
                      <div style={{ fontWeight: 600 }}>{day.date}</div>
                      <div style={{ color: '#22c55e' }}>편집 {day.edits}</div>
                      <div style={{ color: '#3b82f6' }}>제안 {day.proposals}</div>
                      <div style={{ color: '#a855f7' }}>검색 {day.searches}</div>
                      <div style={{ color: '#f59e0b' }}>가입 {day.users}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}


