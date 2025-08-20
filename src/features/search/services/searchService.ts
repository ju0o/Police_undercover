import MiniSearch from 'minisearch';
import { collection, doc, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';

export interface SubjectDocLite {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  fullContent?: string;
}

let mini: MiniSearch<SubjectDocLite> | null = null;
let cache: SubjectDocLite[] = [];

export async function buildSubjectIndex(): Promise<void> {
  const q = query(collection(db, 'subjects'), limit(200), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  const subjects = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SubjectDocLite, 'id'>) }));
  
  // Enrich with full content from all types
  await Promise.allSettled(subjects.map(async (s) => {
    try {
      const typesSnap = await getDocs(collection(doc(db, 'subjects', s.id), 'types'));
      const allContent: string[] = [];
      let summaryText = '';
      
      for (const typeDoc of typesSnap.docs) {
        const contentsSnap = await getDocs(query(
          collection(doc(doc(db, 'subjects', s.id), 'types', typeDoc.id), 'contents'), 
          orderBy('order', 'asc')
        ));
        
        const typeContent = contentsSnap.docs
          .map((d) => (d.data() as { text?: string; kind?: string }).text || '')
          .filter(Boolean)
          .join(' ');
        
        if (typeContent) {
          allContent.push(typeContent);
          // Use overview for summary if not already set
          if (!s.summary && typeDoc.data().slug === 'overview') {
            summaryText = typeContent.slice(0, 300);
          }
        }
      }
      
      if (!s.summary && summaryText) {
        s.summary = summaryText;
      }
      
      s.fullContent = allContent.join(' ').slice(0, 10000); // Limit to 10k chars
    } catch {
      // ignore enrichment errors
    }
  }));
  
  cache = subjects;
  mini = new MiniSearch<SubjectDocLite>({
    fields: ['title', 'summary', 'slug', 'fullContent'],
    storeFields: ['id', 'title', 'slug', 'summary'],
    searchOptions: {
      boost: { title: 3, summary: 2, fullContent: 1 }, // Boost title and summary
      prefix: true,
      fuzzy: 0.2
    }
  });
  mini.addAll(cache);
}

export async function searchSubjects(term: string, options?: { limit?: number; sortBy?: 'relevance' | 'recent' }): Promise<SubjectDocLite[]> {
  if (!mini) {
    await buildSubjectIndex();
  }
  const idx = mini as MiniSearch<SubjectDocLite>;
  if (!term) return [];
  
  const limit = options?.limit || 50;
  const results = idx.search(term, { 
    prefix: true, 
    fuzzy: 0.2,
    boost: { title: 3, summary: 2, fullContent: 1 }
  });
  
  if (results.length === 0) {
    // fallback to simple contains filter
    const fallback = cache.filter((d) => 
      d.title.toLowerCase().includes(term.toLowerCase()) ||
      d.summary?.toLowerCase().includes(term.toLowerCase()) ||
      d.fullContent?.toLowerCase().includes(term.toLowerCase())
    );
    return fallback.slice(0, limit);
  }
  
  let mapped = results.map((r) => r as unknown as SubjectDocLite);
  
  // Sort by recent if requested (assuming subjects have updatedAt in cache)
  if (options?.sortBy === 'recent') {
    // For now, keep relevance order since we don't have updatedAt in lite interface
    // In a full implementation, you'd add updatedAt to SubjectDocLite
  }
  
  return mapped.slice(0, limit);
}


