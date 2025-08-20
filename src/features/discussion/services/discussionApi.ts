import { addDoc, collection, doc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import { useToastStore } from '@/features/common/hooks/useToast';
import type { DiscussionThreadDoc, DiscussionCommentDoc, ThreadStatus } from '@/shared/types/discussion';

export async function createThread(
  input: Omit<DiscussionThreadDoc, 'id' | 'createdAt' | 'lastActivityAt' | 'status'> & {
    status?: ThreadStatus;
  },
) {
  const col = collection(db, 'discussions');
  const payload: Partial<DiscussionThreadDoc> = {
    ...input,
    status: (input.status ?? 'open') as ThreadStatus,
    createdAt: serverTimestamp() as unknown,
    lastActivityAt: serverTimestamp() as unknown,
  };
  const ref = await addDoc(col, payload);
  useToastStore.getState().push('스레드가 생성되었습니다');
  return ref.id;
}

export async function lockThread(threadId: string) {
  const ref = doc(db, 'discussions', threadId);
  await updateDoc(ref, { status: 'locked', lastActivityAt: serverTimestamp() });
}

export async function addComment(
  threadId: string,
  input: Omit<DiscussionCommentDoc, 'id' | 'createdAt' | 'updatedAt' | 'edited'>,
) {
  const col = collection(db, 'discussions', threadId, 'comments');
  const payload: Partial<DiscussionCommentDoc> = {
    ...input,
    edited: false,
    createdAt: serverTimestamp() as unknown,
    updatedAt: serverTimestamp() as unknown,
  };
  const ref = await addDoc(col, payload);
  useToastStore.getState().push('댓글이 등록되었습니다');
  return ref.id;
}

export function queries() {
  return {
    threads: query(collection(db, 'discussions'), orderBy('lastActivityAt', 'desc')),
  };
}


