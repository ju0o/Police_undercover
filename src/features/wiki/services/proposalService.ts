import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import type { ProposalDoc, ProposalChangeType } from '@/shared/types/proposal';

export async function createProposal(params: {
  targetPath: string;
  changeType: ProposalChangeType;
  payload?: unknown;
  reason: string;
  userId: string;
}) {
  const ref = doc(collection(db, 'proposals'));
  const data: Omit<ProposalDoc, 'id'> = {
    targetPath: params.targetPath,
    changeType: params.changeType,
    payload: params.payload,
    reason: params.reason,
    status: 'pending',
    createdBy: params.userId,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, data);
  return ref.id;
}


