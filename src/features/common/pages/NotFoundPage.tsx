import { type ReactElement } from 'react';
import { EmptyState } from '@/features/common/components/EmptyState';
import { trackPageView } from '@/features/analytics/track';
import { useEffect } from 'react';

export function NotFoundPage(): ReactElement {
  useEffect(() => {
    void trackPageView('/404', { error_type: '404_not_found' });
  }, []);

  return (
    <EmptyState
      icon="🔍"
      title="페이지를 찾을 수 없습니다"
      description="요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다. URL을 확인하시거나 홈페이지에서 다시 시작해 주세요."
      action={{
        label: "홈페이지로 돌아가기",
        href: "/"
      }}
    >
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: 24
      }}>
        <a 
          href="/search" 
          style={{ 
            color: 'var(--primary)', 
            textDecoration: 'none',
            fontSize: 14
          }}
        >
          🔍 검색하기
        </a>
        <span style={{ color: 'var(--muted)' }}>•</span>
        <a 
          href="/proposals" 
          style={{ 
            color: 'var(--primary)', 
            textDecoration: 'none',
            fontSize: 14
          }}
        >
          📝 제안 목록
        </a>
        <span style={{ color: 'var(--muted)' }}>•</span>
        <button
          onClick={() => window.history.back()}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            cursor: 'pointer',
            fontSize: 14,
            textDecoration: 'underline'
          }}
        >
          ← 이전 페이지
        </button>
      </div>
    </EmptyState>
  );
}
