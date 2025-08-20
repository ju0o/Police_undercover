import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import type { ActivityLogDoc } from '@/shared/types/activity';

export async function logActivity(params: {
  actor: string;
  action: string;
  targetPath: string;
  diffSummary?: string;
}) {
  const ref = doc(collection(db, 'activityLogs'));
  const data: Omit<ActivityLogDoc, 'id'> = {
    actor: params.actor,
    action: params.action,
    targetPath: params.targetPath,
    diffSummary: params.diffSummary,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, data);
  return ref.id;
}
