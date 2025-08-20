import { useAuth } from '@/app/providers/useAuth';
import { Link } from 'react-router-dom';
import { can } from '@/shared/utils/permissions';
import type { UserRole } from '@/shared/types/user';
import styles from '@/features/common/styles/ui.module.css';

type Action = 'read' | 'create' | 'update' | 'delete' | 'lock' | 'approve' | 'reject' | 'edit';
type Resource = 'subject' | 'type' | 'content' | 'proposal' | 'annotation' | 'discussion' | 'comment' | 'template' | 'roleRequest' | 'notification' | 'watchlist';

interface PermissionButtonProps {
  action: Action;
  resource: Resource;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function PermissionButton({ 
  action, 
  resource, 
  children, 
  onClick, 
  className = styles.button,
  disabled = false 
}: PermissionButtonProps) {
  const { role, firebaseUser } = useAuth();
  const hasPermission = role ? can(action, resource, role) : false;
  const isLoggedIn = !!firebaseUser;
  const isEmailVerified = firebaseUser?.emailVerified ?? false;
  
  // For edit/create actions, require email verification
  const requiresEmailVerification = ['edit', 'create', 'update', 'delete'].includes(action);
  const canPerformAction = hasPermission && isLoggedIn && (!requiresEmailVerification || isEmailVerified);
  
  let titleMessage = '';
  if (!isLoggedIn) {
    titleMessage = '로그인이 필요합니다';
  } else if (!hasPermission) {
    titleMessage = '권한이 없습니다';
  } else if (requiresEmailVerification && !isEmailVerified) {
    titleMessage = '이메일 인증이 필요합니다';
  }
  
  return (
    <button
      onClick={canPerformAction ? onClick : undefined}
      disabled={disabled || !canPerformAction}
      className={className}
      title={titleMessage || undefined}
    >
      {children}
      {!canPerformAction && (
        <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>
          {!isLoggedIn ? '🔒' : !hasPermission ? '🔒' : '📧'}
        </span>
      )}
    </button>
  );
}

interface StatusBadgeProps {
  status: 'approved' | 'pending' | 'rejected';
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const colors = {
    approved: '#10b981',
    pending: '#fbbf24', 
    rejected: '#ef4444'
  };
  
  const texts = {
    approved: '승인됨',
    pending: '승인 대기',
    rejected: '반려됨'
  };
  
  return (
    <span 
      className={styles.badge}
      style={{ 
        backgroundColor: colors[status],
        color: 'white',
        position: 'static',
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        padding: size === 'small' ? '2px 6px' : '4px 8px'
      }}
    >
      {texts[status]}
    </span>
  );
}

interface RoleRequiredProps {
  role: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleRequired({ role: requiredRole, children, fallback }: RoleRequiredProps) {
  const { role } = useAuth();
  
  // 역할 계층: newbie < intermediate < advanced < subadmin
  const roleHierarchy: Record<UserRole, number> = {
    newbie: 0,
    intermediate: 1,
    advanced: 2,
    subadmin: 3
  };
  
  const hasRequiredRole = role && roleHierarchy[role] >= roleHierarchy[requiredRole];
  
  if (!hasRequiredRole) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
}

// Helpers for pages to show login/verification prompts consistently
export function RequireLoginOrVerified({ children }: { children: React.ReactNode }) {
  const { firebaseUser } = useAuth();
  if (!firebaseUser) {
    return (
      <div className={styles.permissionBox}>
        <div>편집하려면 로그인 해주세요.</div>
        <div className={styles.actions}>
          <Link to="/auth/signin" className={styles.button}>로그인</Link>
          <Link to="/auth/signup" className={styles.buttonGhost}>회원가입</Link>
        </div>
      </div>
    );
  }
  if (!firebaseUser.emailVerified) {
    return (
      <div className={styles.permissionBox}>
        <div>이메일 인증 후 편집할 수 있습니다. 받은 편지함을 확인해 주세요.</div>
        <div className={styles.actions}>
          <Link to="/auth/reset" className={styles.buttonGhost}>비밀번호 재설정</Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
