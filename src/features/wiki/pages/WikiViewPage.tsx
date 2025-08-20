import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { trackProposal } from '@/features/analytics/track';
import { getSubjectBySlug } from '@/features/wiki/services/wikiService';
import * as Tabs from '@radix-ui/react-tabs';
import styles from '@/features/common/styles/ui.module.css';
import viewerStyles from '@/features/wiki/styles/viewer.module.css';
import { Skeleton } from '@/features/common/ui/Skeleton';
import { ContentBlockView } from '@/features/wiki/components/ContentBlockView';
import { InlineMenu } from '@/features/wiki/components/InlineMenu';
import { EditorModal } from '@/features/wiki/components/EditorModal';
import { createProposal } from '@/features/wiki/services/proposalService';
import { StatusBadge, PermissionButton } from '@/features/wiki/components/PermissionUI';
import { EmptyState } from '@/features/common/components/EmptyState';
import { LoadingSpinner } from '@/features/common/components/LoadingSpinner';
import { useAuth } from '@/app/providers/useAuth';

export function WikiViewPage() {
  const { subjectSlug, typeSlug } = useParams();
  const [subjectTitle, setSubjectTitle] = useState<string>(subjectSlug ?? '알 수 없는 주제');
  const [subjectSummary, setSubjectSummary] = useState<string | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!subjectSlug) {
        setLoading(false);
        setNotFound(true);
        return;
      }
      
      setLoading(true);
      try {
        const s = await getSubjectBySlug(subjectSlug);
        if (s) {
          setSubjectTitle(s.title || subjectSlug);
          setSubjectSummary(s.summary);
          setNotFound(false);
        } else {
          setSubjectTitle(subjectSlug);
          setSubjectSummary(undefined);
          setNotFound(true);
        }
      } catch (error) {
        console.error('Failed to load subject:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [subjectSlug, typeSlug]);

  // 로딩 상태
  if (loading) {
    return (
      <div className={viewerStyles.wikiViewer}>
        <Helmet>
          <title>로딩 중... - ZeroWiki</title>
        </Helmet>
        <LoadingSpinner size="large" message="문서를 불러오는 중..." />
      </div>
    );
  }

  // 문서를 찾을 수 없는 경우
  if (notFound) {
    return (
      <div className={viewerStyles.wikiViewer}>
        <Helmet>
          <title>{`${subjectTitle} - ZeroWiki`}</title>
          <meta name="description" content={`${subjectTitle} 문서를 찾을 수 없습니다`} />
        </Helmet>
        <EmptyState
          icon="📄"
          title={`"${subjectTitle}" 문서가 없습니다`}
          description="이 주제에 대한 문서가 아직 작성되지 않았습니다. 새로운 문서를 작성하여 지식을 공유해 보세요!"
          action={{
            label: "새 문서 작성하기",
            onClick: () => setIsEditorOpen(true)
          }}
        >
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <Link to="/search" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 14 }}>
              🔍 검색하기
            </Link>
            <span style={{ color: 'var(--muted)' }}>•</span>
            <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 14 }}>
              🏠 홈으로
            </Link>
          </div>
        </EmptyState>
        
        {/* 에디터 모달 */}
        <EditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          subjectSlug={subjectSlug || ''}
          typeSlug={typeSlug || 'overview'}
        />
      </div>
    );
  }

  return (
    <div className={viewerStyles.wikiViewer}>
      <Helmet>
        <title>{`${subjectTitle} - ZeroWiki`}</title>
        <meta name="description" content={subjectSummary || `${subjectTitle} 문서`} />
        <meta property="og:title" content={`${subjectTitle} - ZeroWiki`} />
        <meta property="og:description" content={subjectSummary || `${subjectTitle} 문서`} />
      </Helmet>
      <div className={viewerStyles.wikiHeader}>
        <h1 className={viewerStyles.wikiTitle}>{subjectTitle}</h1>
        <div className={viewerStyles.wikiMeta}>
          <StatusBadge status="approved" size="small" />
          <div className={viewerStyles.wikiActions}>
            <PermissionButton 
              action="edit" 
              resource="content"
              onClick={() => setIsEditorOpen(true)}
              className={styles.buttonGhost}
            >
              ✏️ 편집
            </PermissionButton>
            <Link to={`/wiki/${subjectSlug}${typeSlug ? `/${typeSlug}` : ''}/discussion`} className={styles.buttonGhost}>
              💬 토론
            </Link>
          </div>
        </div>
      </div>
      
      <Tabs.Root defaultValue="content" orientation="horizontal" className={viewerStyles.wikiTabs}>
        <Tabs.List className={viewerStyles.wikiTabsList} aria-label="문서 탭">
          <Tabs.Trigger className={viewerStyles.wikiTabsTrigger} value="content">📄 내용</Tabs.Trigger>
          <Tabs.Trigger className={viewerStyles.wikiTabsTrigger} value="history">📚 역사</Tabs.Trigger>
          <Tabs.Trigger className={viewerStyles.wikiTabsTrigger} value="info">ℹ️ 정보</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
      
      <div className={viewerStyles.wikiContent}>
        {/* 목차 */}
        <div className={viewerStyles.tableOfContents}>
          <h3 className={viewerStyles.tocTitle}>📑 목차</h3>
          <ul className={viewerStyles.tocList}>
            <li className={viewerStyles.tocItem}>
              <a href="#intro" className={viewerStyles.tocLink}>1. 개요</a>
            </li>
            <li className={viewerStyles.tocItem}>
              <a href="#details" className={viewerStyles.tocLink}>2. 상세 내용</a>
            </li>
            <li className={viewerStyles.tocItem}>
              <a href="#references" className={viewerStyles.tocLink}>3. 참고 자료</a>
            </li>
          </ul>
        </div>

        {/* 컨텐츠 블록들 */}
        <BlockWithMenu subjectSlug={subjectSlug || ''} typeSlug={typeSlug || ''} blockId="b1">
          <div className={viewerStyles.contentBlock}>
            <ContentBlockView block={{ id: 'b1', kind: 'paragraph', text: '이것은 나무위키 스타일의 문서입니다. 한글 가독성을 위해 최적화된 폰트와 줄 간격을 사용합니다. 복잡한 내용도 쉽게 읽을 수 있도록 디자인되었습니다.', order: 1, status: 'approved', version: 1, createdBy: 'seed', createdAt: '', updatedAt: '' }} />
          </div>
        </BlockWithMenu>
        
        <BlockWithMenu subjectSlug={subjectSlug || ''} typeSlug={typeSlug || ''} blockId="b2">
          <div className={viewerStyles.contentBlock}>
            <ContentBlockView block={{ id: 'b2', kind: 'quote', text: '이것은 인용구입니다. 중요한 정보나 명언을 강조할 때 사용됩니다.', order: 2, status: 'approved', version: 1, createdBy: 'seed', createdAt: '', updatedAt: '' }} />
          </div>
        </BlockWithMenu>
        
        <BlockWithMenu subjectSlug={subjectSlug || ''} typeSlug={typeSlug || ''} blockId="b3">
          <div className={viewerStyles.contentBlock}>
            <ContentBlockView block={{ id: 'b3', kind: 'link', text: '나무위키 공식 사이트', order: 3, status: 'approved', version: 1, createdBy: 'seed', createdAt: '', updatedAt: '', meta: { url: 'https://namu.wiki' } }} />
          </div>
        </BlockWithMenu>
        
        <BlockWithMenu subjectSlug={subjectSlug || ''} typeSlug={typeSlug || ''} blockId="b4">
          <div className={viewerStyles.contentBlock}>
            <ContentBlockView block={{ id: 'b4', kind: 'image', text: '', order: 4, status: 'approved', version: 1, createdBy: 'seed', createdAt: '', updatedAt: '', meta: { url: 'https://picsum.photos/800/400', caption: '예시 이미지 - 아름다운 풍경', license: 'CC BY-SA 4.0', credit: '사진 출처: Unsplash' } }} />
          </div>
        </BlockWithMenu>
        
        <div style={{ marginTop: 32, display: 'grid', gap: 12 }}>
          <Skeleton width="90%" height={20} />
          <Skeleton width="75%" height={16} />
          <Skeleton width="85%" height={16} />
        </div>
      </div>
      
      {/* 에디터 모달 */}
      <EditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        subjectSlug={subjectSlug || ''}
        typeSlug={typeSlug || 'overview'}
      />
    </div>
  );
}

function BlockWithMenu({ children, subjectSlug, typeSlug, blockId }: { children: React.ReactNode; subjectSlug: string; typeSlug: string; blockId: string }) {
  const { firebaseUser } = useAuth();
  return (
    <div className={viewerStyles.contentBlock}>
      <div className={viewerStyles.inlineMenu}>
        <InlineMenu
          onProposeError={async () => {
            if (!firebaseUser) return;
            const path = `/subjects/${subjectSlug}/types/${typeSlug}/contents/${blockId}`;
            await createProposal({ targetPath: path, changeType: 'flag_error', reason: '이 내용이 틀렸어요', userId: firebaseUser.uid });
                void trackProposal('create', { targetPath: path, changeType: 'flag_error' });
          }}
          onAddAfter={() => {}}
        />
      </div>
      {children}
    </div>
  );
}


