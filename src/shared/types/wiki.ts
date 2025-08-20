export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface SubjectDoc {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  status: ApprovalStatus;
  tags: string[];
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface TypeDoc {
  id: string;
  title: string;
  slug: string;
  status: ApprovalStatus;
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export type ContentKind = 'paragraph' | 'quote' | 'link' | 'image' | 'embed' | 'code';

export interface ContentMeta {
  url?: string;
  caption?: string;
  credit?: string;
  license?: string;
  sourceUrl?: string;
}

export interface ContentBlockDoc {
  id: string;
  kind: ContentKind;
  text?: string;
  meta?: ContentMeta;
  order: number;
  status: ApprovalStatus;
  version: number;
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
}


