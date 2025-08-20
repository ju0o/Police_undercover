import { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import editorStyles from '@/features/wiki/styles/editor.module.css';
import styles from '@/features/common/styles/ui.module.css';
import type { ContentKind } from '@/shared/types/wiki';
import { useToastStore } from '@/features/common/hooks/useToast';
import { saveBlocks } from '@/features/wiki/services/wikiService';
import { trackEdit } from '@/features/analytics/track';
import { useAuth } from '@/app/providers/useAuth';

interface EditableBlock {
  id: string;
  kind: ContentKind;
  text: string;
  meta: Record<string, unknown>;
  order: number;
}

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectSlug: string;
  typeSlug: string;
  initialBlocks?: EditableBlock[];
}

export function EditorModal({ isOpen, onClose, subjectSlug, typeSlug, initialBlocks = [] }: EditorModalProps) {
  const { firebaseUser, profile } = useAuth();
  const pushToast = useToastStore(state => state.push);
  const [blocks, setBlocks] = useState<EditableBlock[]>(initialBlocks);
  const [draggedId] = useState<string | null>(null);
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

  const handleSave = useCallback(async () => {
    if (!firebaseUser || !profile) return;
    setIsSaving(true);
    try {
      const payload = blocks.map(b => ({ kind: b.kind, text: b.text, meta: b.meta, order: b.order }));
      await saveBlocks({ subjectSlug, typeSlug, blocks: payload, userId: firebaseUser.uid, role: profile.role });
      void trackEdit('save', { subjectSlug, typeSlug, blocks: blocks.length });
      pushToast('변경사항이 저장되었습니다');
      onClose();
    } catch (e) {
      void trackEdit('error', { subjectSlug, typeSlug, error: String(e) });
      pushToast('저장 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  }, [blocks, firebaseUser, profile, pushToast, subjectSlug, typeSlug, onClose]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={editorStyles.modalOverlay} />
        <Dialog.Content className={editorStyles.modalContent}>
          {/* 모달 헤더 */}
          <div className={editorStyles.modalHeader}>
            <Dialog.Title className={editorStyles.modalTitle}>
              ✏️ 편집: {subjectSlug} / {typeSlug}
            </Dialog.Title>
            <div className={editorStyles.modalActions}>
              <button 
                className={styles.buttonGhost}
                onClick={onClose}
                disabled={isSaving}
              >
                취소
              </button>
              <button 
                className={styles.button}
                onClick={handleSave} 
                disabled={isSaving}
              >
                {isSaving ? '💾 저장 중...' : '💾 저장'}
              </button>
            </div>
          </div>

          {/* 모달 콘텐츠 */}
          <div className={editorStyles.modalBody}>
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
            </div>

            {/* 블록 에디터 */}
            <div className={editorStyles.blockEditor}>
              {blocks.length === 0 ? (
                <div className={editorStyles.dropZone}>
                  <p className={editorStyles.dropZoneText}>
                    위의 버튼을 클릭하여 블록을 추가하세요
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
        rows={3}
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
        <input
          className={editorStyles.blockInput}
          type="url"
          value={(block.meta.url as string) || ''}
          onChange={(e) => handleMetaChange('url', e.target.value)}
          placeholder="https://example.com"
          style={{ marginTop: '8px' }}
        />
      </div>
    );
  }

  if (block.kind === 'image') {
    return (
      <div>
        <input
          className={editorStyles.blockInput}
          type="url"
          value={(block.meta.url as string) || ''}
          onChange={(e) => handleMetaChange('url', e.target.value)}
          placeholder="이미지 URL"
        />
        <input
          className={editorStyles.blockInput}
          type="text"
          value={(block.meta.caption as string) || ''}
          onChange={(e) => handleMetaChange('caption', e.target.value)}
          placeholder="이미지 설명"
          style={{ marginTop: '8px' }}
        />
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
        rows={4}
        style={{ fontFamily: 'var(--font-family-mono)', fontSize: '14px' }}
      />
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
