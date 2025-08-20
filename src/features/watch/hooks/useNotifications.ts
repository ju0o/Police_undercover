import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import type { NotificationDoc } from '@/shared/types/notify';
import { useAuth } from '@/app/providers/useAuth';

export function useNotifications(uid?: string) {
  const [items, setItems] = useState<NotificationDoc[]>([]);
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'notifications', uid, 'items'),
      orderBy('createdAt', 'desc'),
      limit(10),
    );
    const unsub = onSnapshot(q, (snap) => {
      const arr: NotificationDoc[] = snap.docs.map((d) => {
        const data = d.data() as Omit<NotificationDoc, 'id'>;
        return { id: d.id, ...data } as NotificationDoc;
      });
      setItems(arr);
    });
    return () => unsub();
  }, [uid]);
  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);
  return { items, unread };
}

export function useCurrentUserNotifications() {
  const { firebaseUser } = useAuth();
  return useNotifications(firebaseUser?.uid);
}


