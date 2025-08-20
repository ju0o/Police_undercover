import { Link } from 'react-router-dom';
import { type ReactElement } from 'react';
import styles from '@/features/common/styles/ui.module.css';

export function Footer(): ReactElement {
  return (
    <footer style={{ 
      borderTop: '1px solid rgba(255,255,255,0.08)', 
      marginTop: 48, 
      padding: '24px 0',
      backgroundColor: 'rgba(0,0,0,0.2)'
    }}>
      <div className={styles.container}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 24,
          marginBottom: 16
        }}>
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--primary)' }}>제로위키</h4>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              모두가 함께 만들어가는<br/>
              지식 공유 플랫폼
            </p>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>서비스</h4>
            <div style={{ display: 'grid', gap: 8 }}>
              <Link to="/" className={styles.buttonGhost} style={{ justifyContent: 'flex-start', fontSize: 12 }}>
                홈
              </Link>
              <Link to="/search" className={styles.buttonGhost} style={{ justifyContent: 'flex-start', fontSize: 12 }}>
                검색
              </Link>
              <Link to="/proposals" className={styles.buttonGhost} style={{ justifyContent: 'flex-start', fontSize: 12 }}>
                제안 목록
              </Link>
            </div>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>계정</h4>
            <div style={{ display: 'grid', gap: 8 }}>
              <Link to="/auth/signup" className={styles.buttonGhost} style={{ justifyContent: 'flex-start', fontSize: 12 }}>
                회원가입
              </Link>
              <Link to="/auth/signin" className={styles.buttonGhost} style={{ justifyContent: 'flex-start', fontSize: 12 }}>
                로그인
              </Link>
              <Link to="/profile" className={styles.buttonGhost} style={{ justifyContent: 'flex-start', fontSize: 12 }}>
                프로필
              </Link>
            </div>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>법적 고지</h4>
            <div style={{ display: 'grid', gap: 8 }}>
              <Link to="/legal/terms" className={styles.buttonGhost} style={{ justifyContent: 'flex-start', fontSize: 12 }}>
                이용약관
              </Link>
              <Link to="/legal/privacy" className={styles.buttonGhost} style={{ justifyContent: 'flex-start', fontSize: 12 }}>
                개인정보처리방침
              </Link>
            </div>
          </div>
        </div>
        
        <div style={{ 
          borderTop: '1px solid rgba(255,255,255,0.05)', 
          paddingTop: 16, 
          textAlign: 'center' 
        }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>
            © 2024 제로위키. 모든 권리 보유.
          </p>
        </div>
      </div>
    </footer>
  );
}
