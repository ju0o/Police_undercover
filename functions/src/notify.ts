/**
 * Cloud Functions scaffold for notification fanout.
 * Flip client flag FEATURES.notificationFanout = 'functions' to use.
 */
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const onModerationApproved = onDocumentUpdated('proposals/{proposalId}', async (event) => {
  const after = event.data?.after?.data() as { status?: string } | undefined;
  if (!after || after.status !== 'approved') {
    return;
  }
  // Fan-out notifications to watchers reading from watchlists/*
  // Implementation intentionally omitted (MVP scaffold only).
});


