export type ThreadStatus = 'open' | 'locked';

export interface DiscussionThreadDoc {
  id: string;
  subjectId: string;
  typeId?: string;
  contentId?: string;
  title?: string;
  createdBy: string;
  createdAt: unknown;
  lastActivityAt: unknown;
  status: ThreadStatus;
}

export interface DiscussionCommentDoc {
  id: string;
  text: string;
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
  edited: boolean;
  parentId?: string;
}


