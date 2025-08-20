import { collection, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';

export interface CategoryItem {
  name: string;
  slug: string;
  count?: number;
}

export interface CategoryGroup {
  id: string;
  title: string;
  items: CategoryItem[];
}

/**
 * Fetches category groups from Firestore if present.
 * Structure:
 * - categories (collection)
 *   - {groupId}: { title }
 *     - items (subcollection)
 *       - {itemId}: { name, slug, count }
 */
export async function listCategoryGroups(): Promise<CategoryGroup[]> {
  const groupsSnap = await getDocs(query(collection(db, 'categories'), orderBy('title')));
  const groups: CategoryGroup[] = [];
  for (const g of groupsSnap.docs) {
    const { title } = g.data() as { title: string };
    const itemsSnap = await getDocs(query(collection(doc(db, 'categories', g.id), 'items'), orderBy('name')));
    const items = itemsSnap.docs.map((d) => {
      const data = d.data() as CategoryItem;
      return { name: data.name, slug: data.slug, count: data.count } as CategoryItem;
    });
    groups.push({ id: g.id, title, items });
  }
  return groups;
}


