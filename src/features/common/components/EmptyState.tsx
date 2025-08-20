import { type ReactElement, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from '@/features/common/styles/ui.module.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ 
  icon = '📄', 
  title, 
  description, 
  children, 
  action 
}: EmptyStateProps): ReactElement {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '64px 32px',
      maxWidth: 480,
      margin: '0 auto'
    }}>
      <div style={{ 
        fontSize: 64, 
        marginBottom: 24,
        opacity: 0.6 
      }}>
        {icon}
      </div>
      
      <h2 style={{ 
        fontSize: 24, 
        fontWeight: 600, 
        margin: '0 0 12px 0',
        color: 'var(--color-text)'
      }}>
        {title}
      </h2>
      
      {description && (
        <p style={{ 
          fontSize: 16, 
          color: 'var(--muted)', 
          margin: '0 0 32px 0',
          lineHeight: 1.5
        }}>
          {description}
        </p>
      )}
      
      {children && (
        <div style={{ margin: '24px 0' }}>
          {children}
        </div>
      )}
      
      {action && (
        <div>
          {action.href ? (
            <Link to={action.href} className={styles.button}>
              {action.label}
            </Link>
          ) : (
            <button 
              className={styles.button}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
