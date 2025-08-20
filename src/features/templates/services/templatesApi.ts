import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import type { TemplateDoc } from '@/shared/types/template';

export async function fetchTemplates(): Promise<TemplateDoc[]> {
  const snap = await getDocs(collection(db, 'templates'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TemplateDoc, 'id'>) })) as TemplateDoc[];
}

export async function createSubjectFromTemplate(params: {
  template: TemplateDoc;
  subject: { title: string; slug: string; summary?: string; status: 'approved' | 'pending' };
  userId: string;
}) {
  const batch = writeBatch(db);
  const subjectRef = doc(collection(db, 'subjects'));
  batch.set(subjectRef, {
    title: params.subject.title,
    slug: params.subject.slug,
    summary: params.subject.summary ?? '',
    status: params.subject.status,
    tags: [],
    createdBy: params.userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const typeRef = doc(collection(subjectRef, 'types'));
  batch.set(typeRef, {
    title: params.template.defaultTypes[0] ?? '개요',
    slug: params.template.defaultTypes[0] ?? 'overview',
    status: 'approved',
    createdBy: params.userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  for (const b of params.template.defaultBlocks ?? []) {
    const contentRef = doc(collection(typeRef, 'contents'));
    batch.set(contentRef, {
      kind: b.kind,
      text: b.text ?? '',
      meta: b.meta ?? {},
      order: b.order ?? 1,
      status: params.subject.status,
      version: 1,
      createdBy: params.userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
  return { subjectId: subjectRef.id, typeId: typeRef.id };
}


