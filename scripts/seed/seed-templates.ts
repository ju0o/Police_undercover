import 'dotenv/config';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'zerowiki-2bd39' });
const db = getFirestore();

async function main() {
  await db.collection('templates').add({
    title: '기본 위키', description: '개요/참고 포함', defaultTypes: ['overview'], defaultBlocks: [], createdBy: 'seed', createdAt: FieldValue.serverTimestamp(),
  });
  console.log('Seeded templates');
}

main().catch((e) => { console.error(e); process.exit(1); });


