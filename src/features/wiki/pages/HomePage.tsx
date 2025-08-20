import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '@/features/common/styles/ui.module.css';
import homeStyles from '@/features/wiki/styles/home.module.css';
import { EditorModal } from '@/features/wiki/components/EditorModal';
import { PermissionButton } from '@/features/wiki/components/PermissionUI';

// 샘플 데이터
const featuredArticles = [
  {
    title: 'React 개발 가이드',
    slug: 'react-guide',
    summary: 'React 개발을 위한 완벽한 가이드. 컴포넌트 설계부터 상태 관리까지.',
    category: '컴퓨터과학',
    lastUpdated: '2시간 전',
    views: 1234,
    status: 'approved' as const
  },
  {
    title: 'TypeScript 기초',
    slug: 'typescript-basics',
    summary: 'JavaScript의 슈퍼셋인 TypeScript의 기본 개념과 활용법.',
    category: '컴퓨터과학',
    lastUpdated: '5시간 전',
    views: 892,
    status: 'approved' as const
  },
  {
    title: '한국 현대사',
    slug: 'korean-modern-history',
    summary: '일제강점기부터 현재까지의 한국 근현대사 개관.',
    category: '역사',
    lastUpdated: '1일 전',
    views: 2156,
    status: 'approved' as const
  }
];

const recentChanges = [
  {
    title: 'JavaScript 비동기 프로그래밍',
    action: '편집됨',
    user: '고급회원123',
    time: '10분 전',
    type: 'edit' as const
  },
  {
    title: '인공지능의 역사',
    action: '새로 생성됨',
    user: '준운영진456',
    time: '25분 전',
    type: 'create' as const
  },
  {
    title: '양자역학 기초',
    action: '토론 시작됨',
    user: '중급회원789',
    time: '1시간 전',
    type: 'discussion' as const
  }
];

const popularTags = [
  { name: '프로그래밍', count: 156 },
  { name: '역사', count: 89 },
  { name: '과학', count: 134 },
  { name: '문학', count: 67 },
  { name: '영화', count: 201 },
  { name: '음악', count: 98 },
  { name: '게임', count: 178 },
  { name: '철학', count: 45 }
];

export function HomePage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <div className={homeStyles.homePage}>
      {/* 히어로 섹션 */}
      <section className={homeStyles.heroSection}>
        <div className={homeStyles.heroContent}>
          <h1 className={homeStyles.heroTitle}>
            🌿 ZeroWiki에 오신 것을 환영합니다
          </h1>
          <p className={homeStyles.heroSubtitle}>
            모든 지식이 모이는 곳, 함께 만들어가는 위키백과
          </p>
          <div className={homeStyles.heroActions}>
            <PermissionButton
              action="create"
              resource="content"
              onClick={() => setIsEditorOpen(true)}
              className={styles.button}
            >
              ➕ 새 문서 작성
            </PermissionButton>
            <Link to="/random" className={styles.buttonGhost}>
              🎲 랜덤 문서
            </Link>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <div className={homeStyles.mainGrid}>
        {/* 추천 문서 */}
        <section className={homeStyles.featuredSection}>
          <h2 className={homeStyles.sectionTitle}>⭐ 추천 문서</h2>
          <div className={homeStyles.articleGrid}>
            {featuredArticles.map((article) => (
              <Link
                key={article.slug}
                to={`/wiki/${article.slug}`}
                className={homeStyles.articleCard}
              >
                <div className={homeStyles.articleHeader}>
                  <h3 className={homeStyles.articleTitle}>{article.title}</h3>
                  <span className={homeStyles.articleCategory}>{article.category}</span>
                </div>
                <p className={homeStyles.articleSummary}>{article.summary}</p>
                <div className={homeStyles.articleMeta}>
                  <span className={homeStyles.articleViews}>👁️ {article.views.toLocaleString()}</span>
                  <span className={homeStyles.articleTime}>🕒 {article.lastUpdated}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 최근 변경사항 */}
        <section className={homeStyles.recentSection}>
          <h2 className={homeStyles.sectionTitle}>🕒 최근 변경사항</h2>
          <div className={homeStyles.changesList}>
            {recentChanges.map((change, index) => (
              <div key={index} className={homeStyles.changeItem}>
                <div className={homeStyles.changeIcon}>
                  {change.type === 'edit' && '✏️'}
                  {change.type === 'create' && '➕'}
                  {change.type === 'discussion' && '💬'}
                </div>
                <div className={homeStyles.changeContent}>
                  <div className={homeStyles.changeTitle}>{change.title}</div>
                  <div className={homeStyles.changeDetails}>
                    <span className={homeStyles.changeAction}>{change.action}</span>
                    <span className={homeStyles.changeUser}>by {change.user}</span>
                    <span className={homeStyles.changeTime}>{change.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/recent-changes" className={homeStyles.viewAllLink}>
            모든 변경사항 보기 →
          </Link>
        </section>
      </div>

      {/* 인기 태그 */}
      <section className={homeStyles.tagsSection}>
        <h2 className={homeStyles.sectionTitle}>🏷️ 인기 태그</h2>
        <div className={homeStyles.tagCloud}>
          {popularTags.map((tag) => (
            <Link
              key={tag.name}
              to={`/tag/${tag.name}`}
              className={homeStyles.tag}
              style={{
                fontSize: `${Math.min(1.2, 0.8 + tag.count / 200)}rem`
              }}
            >
              #{tag.name}
              <span className={homeStyles.tagCount}>{tag.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className={homeStyles.statsSection}>
        <div className={homeStyles.statsGrid}>
          <div className={homeStyles.statItem}>
            <div className={homeStyles.statNumber}>2,847</div>
            <div className={homeStyles.statLabel}>📄 전체 문서</div>
          </div>
          <div className={homeStyles.statItem}>
            <div className={homeStyles.statNumber}>1,234</div>
            <div className={homeStyles.statLabel}>👥 활성 사용자</div>
          </div>
          <div className={homeStyles.statItem}>
            <div className={homeStyles.statNumber}>15,679</div>
            <div className={homeStyles.statLabel}>✏️ 총 편집 수</div>
          </div>
          <div className={homeStyles.statItem}>
            <div className={homeStyles.statNumber}>892</div>
            <div className={homeStyles.statLabel}>💬 진행 중인 토론</div>
          </div>
        </div>
      </section>

      {/* 에디터 모달 */}
      <EditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        subjectSlug="new-document"
        typeSlug="overview"
      />
    </div>
  );
}