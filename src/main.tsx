import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from '@/app/router'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { HelmetProvider } from '@/features/seo/HelmetProvider'
import { ErrorBoundary } from '@/app/components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)
