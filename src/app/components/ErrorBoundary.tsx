import { Component, type ReactNode, type ErrorInfo } from 'react';
import { trackError } from '@/features/analytics/track';
import styles from '@/features/common/styles/ui.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Analytics 에러 추적
    void trackError(error, 'react_error_boundary', {
      component_stack: errorInfo.componentStack,
      error_boundary: true
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.container}>
          <div className={styles.card} style={{ textAlign: 'center', padding: 32 }}>
            <h2 style={{ color: '#ff6b6b', marginBottom: 16 }}>⚠️ 오류가 발생했습니다</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
              페이지를 표시하는 중에 문제가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.
            </p>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
              <button 
                className={styles.button}
                onClick={() => window.location.reload()}
              >
                🔄 페이지 새로고침
              </button>
              <button 
                className={styles.buttonGhost}
                onClick={() => window.history.back()}
              >
                ← 이전 페이지
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details style={{ textAlign: 'left', marginTop: 24 }}>
                <summary style={{ cursor: 'pointer', marginBottom: 8 }}>
                  개발자 정보 (개발 모드에서만 표시)
                </summary>
                <div style={{ 
                  backgroundColor: 'rgba(255,0,0,0.1)', 
                  padding: 16, 
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  overflow: 'auto'
                }}>
                  <strong>Error:</strong> {this.state.error.message}<br/>
                  <strong>Stack:</strong><br/>
                  <pre style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <strong>Component Stack:</strong><br/>
                      <pre style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}