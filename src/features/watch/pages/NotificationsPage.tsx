import { useState, useEffect, useCallback } from 'react';
import styles from '@/features/common/styles/ui.module.css';
import { useAuth } from '@/app/providers/useAuth';
import { markAllNotificationsRead, markNotificationRead } from '@/features/watch/services/watchApi';
import { collection, query, where, orderBy, limit, getDocs, startAfter, type DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';

interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  targetPath: string;
  read: boolean;
  createdAt: unknown;
}

export function NotificationsPage() {
  const { firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const loadNotifications = useCallback(async (reset = false) => {
    if (!firebaseUser || loading) return;
    
    setLoading(true);
    try {
      let q = query(
        collection(db, 'notifications'),
        where('userId', '==', firebaseUser.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      // 필터 적용
      if (filter !== 'all') {
        q = query(q, where('read', '==', filter === 'read'));
      }
      
      if (typeFilter !== 'all') {
        q = query(q, where('type', '==', typeFilter));
      }

      // 페이지네이션
      if (!reset && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));

      if (reset) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 20);
    } catch (error) {
      console.error('알림 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, filter, typeFilter, lastDoc, loading]);

  useEffect(() => {
    setNotifications([]);
    setLastDoc(null);
    setHasMore(true);
    void loadNotifications(true);
  }, [filter, typeFilter, firebaseUser]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!firebaseUser) return;
    
    try {
      await markNotificationRead(firebaseUser.uid, notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!firebaseUser) return;
    
    try {
      await markAllNotificationsRead(firebaseUser.uid);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const notificationTypes = ['all', 'proposal', 'comment', 'edit', 'system'];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ marginTop: 0, marginBottom: 4 }}>알림</h3>
            <p style={{ color: 'var(--muted)', margin: 0 }}>미읽음 {unreadCount}개</p>
          </div>
          <button 
            className={styles.button} 
            disabled={!firebaseUser || unreadCount === 0} 
            onClick={handleMarkAllAsRead}
          >
            모두 읽음 처리
          </button>
        </div>

        {/* 필터 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['all', 'unread', 'read'] as const).map(f => (
              <button
                key={f}
                className={filter === f ? styles.button : styles.buttonGhost}
                onClick={() => setFilter(f)}
                style={{ fontSize: 12, padding: '4px 8px' }}
              >
                {f === 'all' ? '전체' : f === 'unread' ? '미읽음' : '읽음'}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: 4 }}>
            {notificationTypes.map(type => (
              <button
                key={type}
                className={typeFilter === type ? styles.button : styles.buttonGhost}
                onClick={() => setTypeFilter(type)}
                style={{ fontSize: 12, padding: '4px 8px' }}
              >
                {type === 'all' ? '모든 유형' : 
                 type === 'proposal' ? '제안' :
                 type === 'comment' ? '댓글' :
                 type === 'edit' ? '편집' : '시스템'}
              </button>
            ))}
          </div>
        </div>

        {/* 알림 목록 */}
        <div style={{ display: 'grid', gap: 8 }}>
          {notifications.length === 0 ? (
            <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 32 }}>
              {loading ? '로딩 중...' : '알림이 없습니다'}
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                style={{ 
                  padding: 12, 
                  borderRadius: 12, 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  background: n.read ? 'transparent' : 'rgba(255,255,255,0.04)',
                  cursor: n.read ? 'default' : 'pointer'
                }}
                onClick={() => !n.read && handleMarkAsRead(n.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {n.type} · {n.targetPath} · {new Date((n.createdAt as any)?.toDate?.() || n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!n.read && (
                    <div style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: 'var(--primary)',
                      marginLeft: 8,
                      marginTop: 4
                    }} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 더 보기 버튼 */}
        {hasMore && notifications.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              className={styles.buttonGhost}
              onClick={() => loadNotifications(false)}
              disabled={loading}
            >
              {loading ? '로딩 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


