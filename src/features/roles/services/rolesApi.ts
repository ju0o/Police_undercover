import { collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import type { RoleRequestDoc } from '@/shared/types/roles';

export async function createRoleRequest(input: Omit<RoleRequestDoc, 'id' | 'status' | 'createdAt'>) {
  const ref = doc(collection(db, 'roleRequests'));
  const payload = {
    ...input,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, payload);
  return ref.id;
}

export async function listRoleRequestsPending(): Promise<RoleRequestDoc[]> {
  const q = query(collection(db, 'roleRequests'), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RoleRequestDoc, 'id'>) }));
}

export async function reviewRoleRequest(requestId: string, reviewerUid: string, approve: boolean) {
  const ref = doc(db, 'roleRequests', requestId);
  await updateDoc(ref, {
    status: approve ? 'approved' : 'rejected',
    reviewedBy: reviewerUid,
    reviewedAt: serverTimestamp(),
  });
}

export async function applyApprovedRoleToUser(request: RoleRequestDoc) {
  if (request.status !== 'approved') return;
  const userRef = doc(db, 'users', request.uid);
  await updateDoc(userRef, { role: request.toRole, updatedAt: serverTimestamp() });
}


