import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import type { ContentBlockDoc } from '@/shared/types/wiki';
import type { Root, Content, Paragraph, Blockquote, Link, Image, Code, PhrasingContent } from 'mdast';
import { toString } from 'mdast-util-to-string';

export async function parseMarkdownToBlocks(markdown: string): Promise<ContentBlockDoc[]> {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const blocks: ContentBlockDoc[] = [];
  let order = 1;
  for (const node of (tree.children as Content[]) || []) {
    if (node.type === 'paragraph') {
      const para = node as Paragraph;
      const text = toString(para as unknown as { children: PhrasingContent[] });
      blocks.push(baseBlock('paragraph', order++, text));
    } else if (node.type === 'blockquote') {
      const bq = node as Blockquote;
      const first = (bq.children?.[0] as Paragraph) ?? ({ type: 'paragraph', children: [] } as Paragraph);
      const text = toString(first as unknown as { children: PhrasingContent[] });
      blocks.push(baseBlock('quote', order++, text));
    } else if (node.type === 'link') {
      const ln = node as unknown as Link & { children?: PhrasingContent[] };
      const text = (ln.children ? toString({ type: 'paragraph', children: ln.children } as unknown as Paragraph) : '') || ln.url;
      blocks.push({ ...baseBlock('link', order++, text), meta: { url: ln.url } });
    } else if (node.type === 'image') {
      const img = node as Image;
      blocks.push({ ...baseBlock('image', order++, img.alt || ''), meta: { url: img.url, caption: img.title || undefined } });
    } else if (node.type === 'code') {
      const code = node as Code;
      blocks.push(baseBlock('code', order++, '```' + (code.lang || '') + '\n' + (code.value || '') + '\n```'));
    }
  }
  return blocks;
}

export async function blocksToMarkdown(blocks: ContentBlockDoc[]): Promise<string> {
  const lines: string[] = [];
  for (const b of blocks.sort((a, z) => a.order - z.order)) {
    if (b.kind === 'paragraph') lines.push(b.text || '');
    if (b.kind === 'quote') lines.push(`> ${b.text || ''}`);
    if (b.kind === 'link') lines.push(`[${b.text || b.meta?.url}](${b.meta?.url})`);
    if (b.kind === 'image') lines.push(`![${b.meta?.caption || ''}](${b.meta?.url})`);
    if (b.kind === 'code') lines.push(b.text || '');
  }
  const md = lines.join('\n\n');
  const file = unified().use(remarkStringify).processSync(md);
  return String(file);
}

function baseBlock(kind: ContentBlockDoc['kind'], order: number, text: string): ContentBlockDoc {
  return {
    id: cryptoId(),
    kind,
    text,
    order,
    status: 'approved',
    version: 1,
    createdBy: 'local',
    createdAt: '',
    updatedAt: '',
  };
}

function cryptoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}


