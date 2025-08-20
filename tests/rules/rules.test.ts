import { initializeTestEnvironment, RulesTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { serverTimestamp } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

async function setupEnv() {
  if (!testEnv) {
    testEnv = await initializeTestEnvironment({
      projectId: 'zerowiki-2bd39',
      firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    });
  }
  return testEnv;
}

describe('Firestore Rules basic', () => {
  beforeAll(async () => {
    await setupEnv();
  });
  afterAll(async () => {
    if (testEnv) await testEnv.cleanup();
  });

  it('newbie can create proposal pending', async () => {
    const ctx = testEnv.authenticatedContext('u_newbie', { email: 'n@z.com' });
    const db = ctx.firestore();
    const ref = db.collection('proposals').doc('p1');
    await assertSucceeds(
      ref.set({
        createdBy: 'u_newbie',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending',
      }),
    );
  });

  it('non-owner cannot approve proposal', async () => {
    const ctx = testEnv.authenticatedContext('u_newbie', { email: 'n@z.com' });
    const db = ctx.firestore();
    const ref = db.collection('proposals').doc('p2');
    await assertFails(
      ref.set({
        createdBy: 'u_newbie',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'approved',
        approvedBy: 'u_newbie',
        approvedAt: serverTimestamp(),
      }),
    );
  });
});


