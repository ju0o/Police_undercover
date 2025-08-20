import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import editorStyles from '@/features/wiki/styles/editor.module.css';
import type { ContentKind } from '@/shared/types/wiki';
import { useToastStore } from '@/features/common/hooks/useToast';
import { saveBlocks } from '@/features/wiki/services/wikiService';
import { useAuth } from '@/app/providers/useAuth';

interface EditableBlock {
  id: string;
  kind: ContentKind;
  text: string;
  meta: Record<string, unknown>;
  order: number;
}

export function WikiEditPage() {
  const { subjectSlug, typeSlug } = useParams();
  const { firebaseUser, profile } = useAuth();
  const pushToast = useToastStore(state => state.push);
  const [blocks, setBlocks] = useState<EditableBlock[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const addBlock = useCallback((kind: ContentKind) => {
    const newBlock: EditableBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      kind,
      text: '',
      meta: {},
      order: blocks.length,
    };
    setBlocks(prev => [...prev, newBlock]);
  }, [blocks.length]);

  const updateBlock = useCallback((id: string, updates: Partial<EditableBlock>) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  }, []);

  const onDragStart = (id: string) => () => setDraggedId(id);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (targetId: string) => () => {
    if (!draggedId || draggedId === targetId) return;
    const draggedIndex = blocks.findIndex(b => b.id === draggedId);
    const targetIndex = blocks.findIndex(b => b.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, draggedBlock);
    setBlocks(newBlocks.map((b, i) => ({ ...b, order: i })));
    setDraggedId(null);
  };

  const handleSave = useCallback(async () => {
    if (!firebaseUser || !profile) return;
    setIsSaving(true);
    try {
      const payload = blocks.map(b => ({ kind: b.kind, text: b.text, meta: b.meta, order: b.order }));
      await saveBlocks({ subjectSlug: subjectSlug || '', typeSlug: typeSlug || '', blocks: payload, userId: firebaseUser.uid, role: profile.role });
      pushToast('변경사항이 저장되었습니다');
    } finally {
      setIsSaving(false);
    }
  }, [blocks, firebaseUser, profile, pushToast, subjectSlug, typeSlug]);

  return (
    <div className={editorStyles.wikiEditor}>
      <div className={editorStyles.editorHeader}>
        <h1 className={editorStyles.editorTitle}>✏️ 편집: {subjectSlug} / {typeSlug}</h1>
        <div className={editorStyles.editorActions}>
          <button className={editorStyles.previewButton}>
            👁️ 미리보기
          </button>
          <button 
            className={editorStyles.saveButton}
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? '💾 저장 중...' : '💾 저장'}
          </button>
          <div className={editorStyles.autoSaveStatus}>
            <div className={editorStyles.autoSaveIndicator}></div>
            <span>자동 저장됨</span>
          </div>
        </div>
      </div>

      <div className={editorStyles.editorContent}>
        {/* 블록 타입 선택기 */}
        <div className={editorStyles.blockTypeSelector}>
          <button 
            className={editorStyles.blockTypeButton}
            onClick={() => addBlock('paragraph')}
          >
            📝 문단
          </button>
          <button 
            className={editorStyles.blockTypeButton}
            onClick={() => addBlock('quote')}
          >
            💬 인용구
          </button>
          <button 
            className={editorStyles.blockTypeButton}
            onClick={() => addBlock('link')}
          >
            🔗 링크
          </button>
          <button 
            className={editorStyles.blockTypeButton}
            onClick={() => addBlock('image')}
          >
            🖼️ 이미지
          </button>
          <button 
            className={editorStyles.blockTypeButton}
            onClick={() => addBlock('code')}
          >
            💻 코드
          </button>
          <button 
            className={editorStyles.blockTypeButton}
            onClick={() => addBlock('embed')}
          >
            📎 임베드
          </button>
        </div>

        {/* 블록 에디터 */}
        <div className={editorStyles.blockEditor}>
          {blocks.length === 0 ? (
            <div className={editorStyles.dropZone}>
              <p className={editorStyles.dropZoneText}>
                위의 버튼을 클릭하여 블록을 추가하거나<br />
                파일을 드래그하여 이미지를 업로드하세요
              </p>
            </div>
          ) : (
            blocks
              .slice()
              .sort((a, z) => a.order - z.order)
              .map((block) => (
                <div
                  key={block.id}
                  className={`${editorStyles.blockItem} ${draggedId === block.id ? editorStyles.dragging : ''}`}
                  draggable
                  onDragStart={onDragStart(block.id)}
                  onDragOver={onDragOver}
                  onDrop={onDrop(block.id)}
                >
                  {/* 블록 헤더 */}
                  <div className={editorStyles.blockHeader}>
                    <div className={editorStyles.blockType}>
                      <span className={editorStyles.blockTypeIcon}>
                        {getBlockIcon(block.kind)}
                      </span>
                      {getBlockTypeName(block.kind)}
                    </div>
                    <div className={editorStyles.blockActions}>
                      <button
                        className={editorStyles.dragHandle}
                        title="드래그하여 순서 변경"
                      >
                        ⋮⋮
                      </button>
                      <button
                        className={editorStyles.deleteBlockButton}
                        onClick={() => deleteBlock(block.id)}
                        title="블록 삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* 블록 콘텐츠 */}
                  <div className={editorStyles.blockContent}>
                    {renderBlockEditor(block, updateBlock)}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

function getBlockIcon(kind: ContentKind): string {
  const icons = {
    paragraph: '📝',
    quote: '💬',
    link: '🔗',
    image: '🖼️',
    embed: '📎',
    code: '💻'
  };
  return icons[kind] || '📄';
}

function getBlockTypeName(kind: ContentKind): string {
  const names = {
    paragraph: '문단',
    quote: '인용구',
    link: '링크',
    image: '이미지',
    embed: '임베드',
    code: '코드'
  };
  return names[kind] || '블록';
}

function renderBlockEditor(
  block: EditableBlock, 
  updateBlock: (id: string, updates: Partial<EditableBlock>) => void
) {
  const handleTextChange = (text: string) => {
    updateBlock(block.id, { text });
  };

  const handleMetaChange = (key: string, value: string) => {
    updateBlock(block.id, { meta: { ...block.meta, [key]: value } });
  };

  if (block.kind === 'paragraph' || block.kind === 'quote') {
    return (
      <textarea
        className={editorStyles.blockTextarea}
        value={block.text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={
          block.kind === 'paragraph' 
            ? '문단 내용을 입력하세요...' 
            : '인용할 내용을 입력하세요...'
        }
        rows={4}
      />
    );
  }

  if (block.kind === 'link') {
    return (
      <div>
        <input
          className={editorStyles.blockInput}
          type="text"
          value={block.text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="링크 텍스트"
        />
        <div className={editorStyles.metaFields}>
          <div className={editorStyles.metaField}>
            <label className={editorStyles.metaLabel}>URL</label>
            <input
              className={editorStyles.blockInput}
              type="url"
              value={(block.meta.url as string) || ''}
              onChange={(e) => handleMetaChange('url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>
    );
  }

  if (block.kind === 'image') {
    return (
      <div>
        <div className={editorStyles.metaFields}>
          <div className={editorStyles.metaField}>
            <label className={editorStyles.metaLabel}>이미지 URL</label>
            <input
              className={editorStyles.blockInput}
              type="url"
              value={(block.meta.url as string) || ''}
              onChange={(e) => handleMetaChange('url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className={editorStyles.metaField}>
            <label className={editorStyles.metaLabel}>캡션</label>
            <input
              className={editorStyles.blockInput}
              type="text"
              value={(block.meta.caption as string) || ''}
              onChange={(e) => handleMetaChange('caption', e.target.value)}
              placeholder="이미지 설명"
            />
          </div>
          <div className={editorStyles.metaField}>
            <label className={editorStyles.metaLabel}>출처</label>
            <input
              className={editorStyles.blockInput}
              type="text"
              value={(block.meta.credit as string) || ''}
              onChange={(e) => handleMetaChange('credit', e.target.value)}
              placeholder="사진 출처"
            />
          </div>
          <div className={editorStyles.metaField}>
            <label className={editorStyles.metaLabel}>라이선스</label>
            <input
              className={editorStyles.blockInput}
              type="text"
              value={(block.meta.license as string) || ''}
              onChange={(e) => handleMetaChange('license', e.target.value)}
              placeholder="CC BY-SA 4.0"
            />
          </div>
        </div>
        {block.meta.url != null && (
          <div style={{ marginTop: '1rem' }}>
            <img 
              src={block.meta.url as string} 
              alt="미리보기" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px', 
                borderRadius: '8px',
                objectFit: 'cover' 
              }} 
            />
          </div>
        )}
      </div>
    );
  }

  if (block.kind === 'code') {
    return (
      <textarea
        className={editorStyles.blockTextarea}
        value={block.text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="코드를 입력하세요..."
        rows={6}
        style={{ fontFamily: 'var(--font-family-mono)', fontSize: '14px' }}
      />
    );
  }

  if (block.kind === 'embed') {
    return (
      <div>
        <input
          className={editorStyles.blockInput}
          type="text"
          value={block.text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="임베드 제목 또는 설명"
        />
        <div className={editorStyles.metaFields}>
          <div className={editorStyles.metaField}>
            <label className={editorStyles.metaLabel}>임베드 URL</label>
            <input
              className={editorStyles.blockInput}
              type="url"
              value={(block.meta.url as string) || ''}
              onChange={(e) => handleMetaChange('url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <textarea
      className={editorStyles.blockTextarea}
      value={block.text}
      onChange={(e) => handleTextChange(e.target.value)}
      placeholder="내용을 입력하세요..."
      rows={3}
    />
  );
}