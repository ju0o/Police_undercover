// React import not needed with jsx: react-jsx and TS config; remove to satisfy no-unused-vars
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/app/components/AppLayout';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

// Lazy load components for code splitting
const HomePage = lazy(() => import('@/features/wiki/pages/HomePage').then(m => ({ default: m.HomePage })));
const WikiViewPage = lazy(() => import('@/features/wiki/pages/WikiViewPage').then(m => ({ default: m.WikiViewPage })));
const WikiEditPage = lazy(() => import('@/features/wiki/pages/WikiEditPage').then(m => ({ default: m.WikiEditPage })));
const DiscussionPanel = lazy(() => import('@/features/discussion/pages/DiscussionPanel').then(m => ({ default: m.DiscussionPanel })));
const NotificationsPage = lazy(() => import('@/features/watch/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const SignUpPage = lazy(() => import('@/features/auth/pages/SignUpPage').then(m => ({ default: m.SignUpPage })));
const SignInPage = lazy(() => import('@/features/auth/pages/SignInPage').then(m => ({ default: m.SignInPage })));
const PasswordResetPage = lazy(() => import('@/features/auth/pages/PasswordResetPage').then(m => ({ default: m.PasswordResetPage })));
const ProfilePage = lazy(() => import('@/features/roles/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ProposalsPage = lazy(() => import('@/features/wiki/pages/ProposalsPage').then(m => ({ default: m.ProposalsPage })));
const ModerationPage = lazy(() => import('@/features/moderation/pages/ModerationPage').then(m => ({ default: m.ModerationPage })));
const TemplatesAdminPage = lazy(() => import('@/features/templates/pages/TemplatesAdminPage').then(m => ({ default: m.TemplatesAdminPage })));
const AnalyticsDashboardPage = lazy(() => import('@/features/admin/pages/AnalyticsDashboardPage').then(m => ({ default: m.AnalyticsDashboardPage })));
const CategoriesAdminPage = lazy(() => import('@/features/categories/pages/CategoriesAdminPage').then(m => ({ default: m.CategoriesAdminPage })));
const RoleModerationPage = lazy(() => import('@/features/roles/pages/RoleModerationPage').then(m => ({ default: m.RoleModerationPage })));
const TermsOfServicePage = lazy(() => import('@/features/legal/pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const PrivacyPolicyPage = lazy(() => import('@/features/legal/pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const SearchResultsPage = lazy(() => import('@/features/search/pages/SearchResultsPage').then(m => ({ default: m.SearchResultsPage })));
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const NotFoundPage = lazy(() => import('@/features/common/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Loading component
function PageLoading() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      color: 'var(--muted)'
    }}>
      로딩 중...
    </div>
  );
}

// Wrapper component for lazy loaded pages
function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoading />}>
      {children}
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout>
        <LazyWrapper>
          <HomePage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/wiki/:subjectSlug',
    element: (
      <AppLayout>
        <LazyWrapper>
          <WikiViewPage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/wiki/:subjectSlug/:typeSlug',
    element: (
      <AppLayout>
        <LazyWrapper>
          <WikiViewPage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/edit/:subjectSlug/:typeSlug',
    element: (
      <AppLayout>
        <LazyWrapper>
          <WikiEditPage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/wiki/:subjectSlug/:typeSlug/discussion',
    element: (
      <AppLayout>
        <LazyWrapper>
          <DiscussionPanel />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/notifications',
    element: (
      <AppLayout>
        <LazyWrapper>
          <NotificationsPage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/auth/signup',
    element: (
      <AppLayout>
        <LazyWrapper>
          <SignUpPage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/auth/signin',
    element: (
      <AppLayout>
        <LazyWrapper>
          <SignInPage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/auth/reset',
    element: (
      <AppLayout>
        <LazyWrapper>
          <PasswordResetPage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/profile',
    element: (
      <AppLayout>
        <LazyWrapper>
          <ProfilePage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/proposals',
    element: (
      <AppLayout>
        <LazyWrapper>
          <ProtectedRoute>
            <ProposalsPage />
          </ProtectedRoute>
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/moderation',
    element: (
      <AppLayout>
        <LazyWrapper>
          <ProtectedRoute role="subadmin">
            <ModerationPage />
          </ProtectedRoute>
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/admin/templates',
    element: (
      <AppLayout>
        <LazyWrapper>
          <TemplatesAdminPage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/admin/analytics',
    element: (
      <AppLayout>
        <LazyWrapper>
          <ProtectedRoute role="subadmin">
            <AnalyticsDashboardPage />
          </ProtectedRoute>
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/admin/categories',
    element: (
      <AppLayout>
        <LazyWrapper>
          <ProtectedRoute role="subadmin">
            <CategoriesAdminPage />
          </ProtectedRoute>
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/moderation/roles',
    element: (
      <AppLayout>
        <LazyWrapper>
          <ProtectedRoute role="subadmin">
            <RoleModerationPage />
          </ProtectedRoute>
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/legal/terms',
    element: (
      <AppLayout>
        <LazyWrapper>
          <TermsOfServicePage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/legal/privacy',
    element: (
      <AppLayout>
        <LazyWrapper>
          <PrivacyPolicyPage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/search',
    element: (
      <AppLayout>
        <LazyWrapper>
          <SearchResultsPage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '/admin',
    element: (
      <AppLayout>
        <LazyWrapper>
          <ProtectedRoute role="subadmin">
            <AdminDashboard />
          </ProtectedRoute>
        </LazyWrapper>
      </AppLayout>
    ),
  },
  {
    path: '*',
    element: (
      <AppLayout>
        <LazyWrapper>
          <NotFoundPage />
        </LazyWrapper>
      </AppLayout>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}


