import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import type { ContentBlockDoc } from '@/shared/types/wiki';
import type { UserRole } from '@/shared/types/user';

export interface SubjectLite { id: string; slug: string; title: string; summary?: string }
export async function getSubjectBySlug(slug: string): Promise<SubjectLite | null> {
  const q = query(collection(db, 'subjects'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data() as { slug: string; title: string; summary?: string };
  return { id: d.id, ...data };
}

export interface TypeLite { id: string; slug: string; title: string }
export async function getTypeBySlug(subjectId: string, slug: string): Promise<TypeLite | null> {
  const q = query(collection(doc(db, 'subjects', subjectId), 'types'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data() as { slug: string; title: string };
  return { id: d.id, ...data };
}

export async function saveBlocks(params: {
  subjectSlug: string;
  typeSlug: string;
  blocks: Pick<ContentBlockDoc, 'kind' | 'text' | 'meta' | 'order'>[];
  userId: string;
  role: UserRole;
}) {
  const subject = await getSubjectBySlug(params.subjectSlug);
  if (!subject) throw new Error('Subject not found');
  const type = await getTypeBySlug(subject.id, params.typeSlug);
  if (!type) throw new Error('Type not found');
  const contentsCol = collection(doc(doc(db, 'subjects', subject.id), 'types', type.id), 'contents');
  const results: string[] = [];
  for (const b of params.blocks) {
    const ref = doc(contentsCol);
    await setDoc(ref, {
      kind: b.kind,
      text: b.text ?? '',
      meta: b.meta ?? {},
      order: b.order,
      status: statusForCreate(params.role),
      version: 1,
      createdBy: params.userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    results.push(ref.id);
  }
  return results;
}

function statusForCreate(role: UserRole): 'approved' | 'pending' {
  if (role === 'subadmin' || role === 'advanced' || role === 'intermediate') return 'approved';
  return 'pending';
}


