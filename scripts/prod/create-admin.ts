/**
 * One-time admin user bootstrap script for production.
 *
 * Usage (Windows CMD):
 *   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
 *   set ADMIN_EMAIL=skkse150@gmail.com
 *   set ADMIN_PASSWORD=your-strong-password
 *   set ADMIN_DISPLAY_NAME=관리자
 *   npm run create:admin:prod
 *
 * Security:
 * - Do not commit credentials. Provide them via environment variables.
 * - Requires a Firebase service account JSON (project Owner/Editor) to run.
 */
import 'dotenv/config';
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function initializeAdminApp(): void {
  const inlineServiceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (inlineServiceAccountJson) {
    const parsed = JSON.parse(inlineServiceAccountJson);
    initializeApp({ credential: cert(parsed as any) });
    return;
  }
  // Falls back to GOOGLE_APPLICATION_CREDENTIALS or ADC
  initializeApp({ credential: applicationDefault() });
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

async function ensureAdminUser(): Promise<void> {
  const email = requireEnv('ADMIN_EMAIL');
  const password = requireEnv('ADMIN_PASSWORD');
  const displayName = process.env.ADMIN_DISPLAY_NAME || '관리자';

  const auth = getAuth();
  const db = getFirestore();

  // 1) Find or create Auth user
  let uid: string;
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    // Optionally ensure display name
    if (existing.displayName !== displayName) {
      await auth.updateUser(uid, { displayName });
    }
    console.log(`Found existing user: ${email} (uid=${uid})`);
  } catch {
    const created = await auth.createUser({ email, password, displayName, emailVerified: true, disabled: false });
    uid = created.uid;
    console.log(`Created user: ${email} (uid=${uid})`);
  }

  // 2) Upsert Firestore profile with subadmin role
  const userRef = db.collection('users').doc(uid);
  const snap = await userRef.get();
  const now = FieldValue.serverTimestamp();
  const profile = {
    name: displayName,
    nickname: displayName,
    email,
    phone: '',
    role: 'subadmin' as const,
    blocked: false,
    createdAt: snap.exists ? snap.get('createdAt') ?? now : now,
    updatedAt: now,
  };
  await userRef.set(profile, { merge: true });
  console.log(`Upserted Firestore profile for ${email} with role=subadmin`);
}

async function main(): Promise<void> {
  try {
    initializeAdminApp();
    await ensureAdminUser();
    console.log('✅ Admin bootstrap complete.');
  } catch (error) {
    console.error('❌ Admin bootstrap failed:', error);
    process.exitCode = 1;
  }
}

void main();


