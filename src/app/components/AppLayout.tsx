import { Sidebar } from '@/features/layout/components/Sidebar';
import { SearchHeader } from '@/features/layout/components/SearchHeader';
import { Footer } from '@/features/layout/components/Footer';
import { EmailVerificationBanner } from '@/features/common/components/EmailVerificationBanner';
import { DefaultSeo } from '@/features/seo/DefaultSeo';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import layoutStyles from '@/features/layout/styles/layout.module.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={layoutStyles.appLayout}>
      {/* 사이드바 */}
      <Sidebar />
      
      {/* 메인 영역 */}
      <div className={layoutStyles.mainArea}>
        {/* 헤더 */}
        <SearchHeader />
        <EmailVerificationBanner />
        
        {/* 콘텐츠 */}
        <main className={layoutStyles.mainContent}>
          <DefaultSeo />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        
        {/* 푸터 */}
        <Footer />
      </div>
    </div>
  );
}