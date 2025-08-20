import { Link } from 'react-router-dom';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useCurrentUserNotifications } from '@/features/watch/hooks/useNotifications';

export function Bell({ count }: { count?: number }) {
  const { items, unread } = useCurrentUserNotifications();
  const badge = count ?? unread;
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button aria-label={`알림 ${count}개`} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent' }}>
          <span role="img" aria-label="bell">🔔</span>
          {badge > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6, background: 'var(--danger)', color: 'white', borderRadius: 12, padding: '0 6px', fontSize: 12,
              boxShadow: '0 4px 12px rgba(239,68,68,0.55)'
            }}>{badge}</span>
          )}
        </button>
      </Dropdown.Trigger>
      <Dropdown.Content align="end" sideOffset={8} style={{ background: '#111627', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 8, minWidth: 260 }}>
        <Dropdown.Item asChild>
          <Link to="/notifications" style={{ display: 'block', padding: 8, borderRadius: 8 }}>알림 모두 보기</Link>
        </Dropdown.Item>
        <Dropdown.Separator style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '6px 0' }} />
        {items.length === 0 ? (
          <div style={{ color: 'var(--muted)', padding: 8 }}>새 알림이 없습니다</div>
        ) : (
          <div style={{ display: 'grid', gap: 4 }}>
            {items.slice(0, 5).map((n) => (
              <div key={n.id} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 13 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{n.type}</div>
              </div>
            ))}
          </div>
        )}
      </Dropdown.Content>
    </Dropdown.Root>
  );
}


