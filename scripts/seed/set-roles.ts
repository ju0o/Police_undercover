import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp, connectFirestoreEmulator } from 'firebase/firestore';

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);
if (process.env.FIRESTORE_EMULATOR_HOST) {
  const [host, portStr] = (process.env.FIRESTORE_EMULATOR_HOST as string).split(':');
  connectFirestoreEmulator(db, host, Number(portStr));
}

async function main() {
  const users = [
    { uid: 'U_NEWBIE', email: 'newbie@example.com', role: 'newbie' },
    { uid: 'U_INTER', email: 'intermediate@example.com', role: 'intermediate' },
    { uid: 'U_ADV', email: 'advanced@example.com', role: 'advanced' },
    { uid: 'U_SUB', email: 'subadmin@example.com', role: 'subadmin' },
  ];
  for (const u of users) {
    await setDoc(doc(db, 'users', u.uid), {
      name: u.uid, nickname: u.uid, email: u.email, phone: '', role: u.role, blocked: false,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
  }
  console.log('Seeded users/roles');
}

main().catch((e) => { console.error(e); process.exit(1); });


