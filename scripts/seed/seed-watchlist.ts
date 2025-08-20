import 'dotenv/config';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'zerowiki-2bd39' });
const db = getFirestore();

async function main() {
  const uid = 'seed-user';
  await db.collection('watchlists').doc(uid).collection('items').doc('subject:sample-1').set({ targetPath: '/wiki/sample-1', createdAt: FieldValue.serverTimestamp() });
  console.log('Seeded watchlist for', uid);
}

main().catch((e) => { console.error(e); process.exit(1); });


