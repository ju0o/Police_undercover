import { collection, deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import { trackNotifications } from '@/features/analytics/track';

export async function toggleWatch(uid: string, targetKey: string, targetPath: string) {
  const ref = doc(db, 'watchlists', uid, 'items', targetKey);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { targetPath, createdAt: serverTimestamp() });
  return true;
}

export async function createNotification(uid: string, payload: { id?: string; type: string; targetPath: string; message: string }) {
  const ref = doc(collection(db, 'notifications', uid, 'items'));
  await setDoc(ref, { ...payload, createdAt: serverTimestamp(), read: false });
  return ref.id;
}

export async function markNotificationRead(uid: string, notifId: string, read = true) {
  const ref = doc(db, 'notifications', uid, 'items', notifId);
  await updateDoc(ref, { read });
  void trackNotifications('mark_read', { notifId });
}

export async function markAllNotificationsRead(uid: string) {
  const q = collection(db, 'notifications', uid, 'items');
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
  void trackNotifications('mark_all_read', { count: snap.size });
}


