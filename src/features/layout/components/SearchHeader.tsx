import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { Bell } from '@/features/watch/components/Bell';
import { QuickLoginPanel } from '@/features/auth/dev/QuickLoginPanel';
import styles from '@/features/common/styles/ui.module.css';
import headerStyles from '@/features/layout/styles/header.module.css';
import { trackPageView, trackSearch } from '@/features/analytics/track';

export function SearchHeader() {
  const { firebaseUser, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      void trackSearch(searchQuery.trim());
    }
  };

  useEffect(() => {
    void trackPageView(window.location.pathname + window.location.search);
  }, []);

  return (
    <header className={headerStyles.header}>
      <div className={headerStyles.headerContent}>
        {/* 로고 */}
        <Link to="/" className={headerStyles.logo} aria-label="ZeroWiki 홈페이지로 이동">
          <span className={headerStyles.logoIcon} aria-hidden="true">🌿</span>
          <span className={headerStyles.logoText}>ZeroWiki</span>
        </Link>

        {/* 검색바 */}
        <form onSubmit={handleSearch} className={headerStyles.searchForm} role="search" aria-label="사이트 검색">
          <div className={`${headerStyles.searchContainer} ${isSearchFocused ? headerStyles.searchFocused : ''}`}>
            <span className={headerStyles.searchIcon} aria-hidden="true">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="문서, 카테고리, 내용 검색..."
              className={headerStyles.searchInput}
              aria-label="검색어 입력"
              aria-describedby="search-help"
            />
            <span id="search-help" className="sr-only">
              Enter 키를 눌러 검색하거나 검색 버튼을 클릭하세요
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={headerStyles.searchClear}
              >
                ✕
              </button>
            )}
          </div>
          
          {/* 검색 제안 드롭다운 (개발 중에만 표시) */}
          {import.meta.env.DEV && isSearchFocused && searchQuery && (
            <div className={headerStyles.searchSuggestions}>
              <div className={headerStyles.suggestionGroup}>
                <div className={headerStyles.suggestionTitle}>📄 문서</div>
                <div className={headerStyles.suggestionItem}>
                  <span className={headerStyles.suggestionIcon}>📝</span>
                  <span>React 개발 가이드</span>
                </div>
                <div className={headerStyles.suggestionItem}>
                  <span className={headerStyles.suggestionIcon}>📝</span>
                  <span>TypeScript 기초</span>
                </div>
              </div>
              <div className={headerStyles.suggestionGroup}>
                <div className={headerStyles.suggestionTitle}>📚 카테고리</div>
                <div className={headerStyles.suggestionItem}>
                  <span className={headerStyles.suggestionIcon}>🔬</span>
                  <span>컴퓨터과학</span>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* 우측 액션 */}
        <div className={headerStyles.headerActions}>
          {firebaseUser ? (
            <>
              {/* 알림 */}
              <Bell />
              
              {/* 사용자 메뉴 */}
              <div className={headerStyles.userMenu}>
                <div className={headerStyles.userAvatar}>
                  {profile?.nickname?.[0] || firebaseUser.email?.[0] || '?'}
                </div>
                <div className={headerStyles.userInfo}>
                  <div className={headerStyles.userName}>
                    {profile?.nickname || firebaseUser.email}
                  </div>
                  <div className={headerStyles.userRole}>
                    {getRoleLabel(profile?.role)}
                  </div>
                </div>
              </div>

              {/* 빠른 액션 */}
              <div className={headerStyles.quickActions}>
                <Link to="/proposals" className={styles.buttonGhost}>
                  📝 내 제안
                </Link>
                {(profile?.role === 'subadmin' || profile?.role === 'advanced') && (
                  <Link to="/moderation" className={styles.buttonGhost}>
                    ⚖️ 모더레이션
                  </Link>
                )}
                {profile?.role === 'subadmin' && (
                  <Link to="/admin/templates" className={styles.buttonGhost}>
                    👑 관리자
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className={headerStyles.authActions}>
              <Link to="/auth/signup" className={styles.button}>
                회원가입
              </Link>
              <Link to="/auth/signin" className={styles.buttonGhost}>
                로그인
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 개발자 패널 */}
      {import.meta.env.DEV && <QuickLoginPanel />}
    </header>
  );
}

function getRoleLabel(role?: string): string {
  switch (role) {
    case 'newbie': return '🔰 신규 회원';
    case 'intermediate': return '📚 중급 회원';
    case 'advanced': return '⭐ 고급 회원';
    case 'subadmin': return '👑 준운영진';
    default: return '👤 게스트';
  }
}
