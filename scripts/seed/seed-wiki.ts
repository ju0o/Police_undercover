import 'dotenv/config';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Admin SDK automatically uses FIRESTORE_EMULATOR_HOST when present
initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'zerowiki-2bd39' });
const db = getFirestore();

async function main() {
  const s1Ref = await db.collection('subjects').add({
    title: '샘플 주제 1', slug: 'sample-1', status: 'approved', tags: [], createdBy: 'seed', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
  await db.collection('subjects').doc(s1Ref.id).collection('types').add({
    title: '개요', slug: 'overview', status: 'approved', createdBy: 'seed', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('Seeded subjects:', s1Ref.id);
}

main().catch((e) => { console.error(e); process.exit(1); });


