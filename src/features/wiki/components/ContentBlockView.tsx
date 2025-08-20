import { type ContentBlockDoc } from '@/shared/types/wiki';
import viewerStyles from '@/features/wiki/styles/viewer.module.css';

export function ContentBlockView({ block }: { block: ContentBlockDoc }) {
  if (block.kind === 'paragraph') {
    return (
      <p className={viewerStyles.blockParagraph}>
        {block.text}
      </p>
    );
  }

  if (block.kind === 'quote') {
    return (
      <blockquote className={viewerStyles.blockQuote}>
        {block.text}
      </blockquote>
    );
  }

  if (block.kind === 'link') {
    return (
      <a 
        href={block.meta?.url as string} 
        className={viewerStyles.blockLink}
        target="_blank" 
        rel="noopener noreferrer"
      >
        {block.text}
      </a>
    );
  }

  if (block.kind === 'image') {
    return (
      <figure className={viewerStyles.blockImage}>
        <img 
          src={block.meta?.url as string} 
          alt={block.meta?.caption as string || ''} 
        />
        {(block.meta?.caption || block.meta?.credit || block.meta?.license) && (
          <figcaption className={viewerStyles.imageCaption}>
            <div>{block.meta?.caption}</div>
            <div className={viewerStyles.imageMeta}>
              <span>{block.meta?.credit}</span>
              <span>{block.meta?.license}</span>
            </div>
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.kind === 'code') {
    return (
      <div className={viewerStyles.blockCode}>
        <div className={viewerStyles.codeHeader}>
          코드 블록
        </div>
        <pre className={viewerStyles.codeContent}>
          <code>{block.text}</code>
        </pre>
      </div>
    );
  }

  if (block.kind === 'embed') {
    return (
      <div className={viewerStyles.blockEmbed}>
        <div className={viewerStyles.embedPlaceholder}>
          📎 임베드 콘텐츠: {block.text}
        </div>
      </div>
    );
  }

  // 기본 단락
  return (
    <p className={viewerStyles.blockParagraph}>
      {block.text}
    </p>
  );
}