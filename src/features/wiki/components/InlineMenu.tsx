import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useAuth } from '@/app/providers/useAuth';
import styles from '@/features/common/styles/ui.module.css';

export function InlineMenu({ onProposeError, onAddAfter }: { onProposeError: () => void; onAddAfter: () => void }) {
  const { firebaseUser } = useAuth();
  const isEmailVerified = firebaseUser?.emailVerified ?? false;
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button 
          className={styles.buttonGhost} 
          aria-label="블록 메뉴"
          style={{ 
            padding: '6px 8px',
            fontSize: '14px',
            opacity: 0.6,
            transition: 'opacity 0.2s ease'
          }}
        >
          ⚙️
        </button>
      </Dropdown.Trigger>
      <Dropdown.Content 
        align="end" 
        sideOffset={8} 
        style={{ 
          background: 'var(--gradient-card)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)', 
          borderRadius: 12, 
          padding: 8, 
          minWidth: 200,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000
        }}
      >
        <Dropdown.Item 
          className={styles.navLink} 
          onSelect={firebaseUser && isEmailVerified ? onProposeError : undefined}
          disabled={!firebaseUser || !isEmailVerified}
          style={{ 
            padding: '8px 12px', 
            borderRadius: 8, 
            cursor: firebaseUser && isEmailVerified ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: firebaseUser && isEmailVerified ? 1 : 0.5
          }}
          title={!firebaseUser ? '로그인이 필요합니다' : !isEmailVerified ? '이메일 인증이 필요합니다' : undefined}
        >
          ⚠️ 오류 제안 {(!firebaseUser || !isEmailVerified) && '🔒'}
        </Dropdown.Item>
        <Dropdown.Item 
          className={styles.navLink} 
          onSelect={firebaseUser && isEmailVerified ? onAddAfter : undefined}
          disabled={!firebaseUser || !isEmailVerified}
          style={{ 
            padding: '8px 12px', 
            borderRadius: 8, 
            cursor: firebaseUser && isEmailVerified ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: firebaseUser && isEmailVerified ? 1 : 0.5
          }}
          title={!firebaseUser ? '로그인이 필요합니다' : !isEmailVerified ? '이메일 인증이 필요합니다' : undefined}
        >
          ➕ 이후에 내용 추가 {(!firebaseUser || !isEmailVerified) && '🔒'}
        </Dropdown.Item>
        <Dropdown.Separator style={{ 
          height: 1, 
          background: 'var(--color-divider)', 
          margin: '4px 0' 
        }} />
        <Dropdown.Item 
          className={styles.navLink}
          style={{ 
            padding: '8px 12px', 
            borderRadius: 8, 
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-text-muted)'
          }}
        >
          📝 편집
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}


