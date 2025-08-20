import { type ReactElement } from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export function LoadingSpinner({ 
  size = 'medium', 
  message = '로딩 중...' 
}: LoadingSpinnerProps): ReactElement {
  const sizeMap = {
    small: 20,
    medium: 32,
    large: 48
  };
  
  const spinnerSize = sizeMap[size];
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: size === 'large' ? 64 : size === 'medium' ? 32 : 16,
      gap: 16
    }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `3px solid rgba(255, 255, 255, 0.1)`,
          borderTop: `3px solid var(--primary)`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      
      {message && (
        <div style={{ 
          color: 'var(--muted)', 
          fontSize: size === 'large' ? 16 : 14,
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
