import type { ContentBlockDoc } from './wiki';

export interface TemplateDoc {
  id: string;
  title: string;
  description?: string;
  defaultTypes: string[];
  defaultBlocks: ContentBlockDoc[];
  createdBy: string;
  createdAt: unknown;
}


