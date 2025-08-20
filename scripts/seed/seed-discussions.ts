import 'dotenv/config';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'zerowiki-2bd39' });
const db = getFirestore();

async function main() {
  const tRef = await db.collection('discussions').add({
    subjectId: 'seed-subject', title: '시드 스레드', status: 'open', createdBy: 'seed', createdAt: FieldValue.serverTimestamp(), lastActivityAt: FieldValue.serverTimestamp(),
  });
  await db.collection('discussions').doc(tRef.id).collection('comments').add({
    text: '첫 댓글', createdBy: 'seed', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), edited: false,
  });
  console.log('Seeded discussions:', tRef.id);
}

main().catch((e) => { console.error(e); process.exit(1); });


