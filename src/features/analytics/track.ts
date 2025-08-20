import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';
import { app } from '@/shared/config/firebase';

let analyticsPromise: Promise<Analytics | null> | null = null;

async function getAnalyticsIfAvailable(): Promise<Analytics | null> {
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      try {
        if (await isSupported()) {
          return getAnalytics(app);
        }
      } catch {
        // ignore
      }
      return null;
    })();
  }
  return analyticsPromise;
}

export async function trackPageView(path: string, additionalProps?: Record<string, unknown>): Promise<void> {
  try {
    const a = await getAnalyticsIfAvailable();
    if (!a) return;
    logEvent(a, 'page_view', { 
      page_location: path,
      page_title: document.title,
      ...additionalProps
    });
  } catch {
    // ignore
  }
}

export async function trackSearch(term: string, context?: { resultCount?: number; filters?: Record<string, unknown> }): Promise<void> {
  try {
    const a = await getAnalyticsIfAvailable();
    if (!a) return;
    logEvent(a, 'search', { 
      search_term: term,
      search_term_length: term.length,
      result_count: context?.resultCount,
      has_filters: !!context?.filters,
      ...context?.filters
    });
  } catch {
    // ignore
  }
  // Optional: mirror to activityLogs for simple admin dashboard stats
  try {
    const { collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('@/shared/config/firebase');
    const ref = doc(collection(db, 'activityLogs'));
    await setDoc(ref, { 
      actor: 'anon', 
      action: 'search', 
      targetPath: term,
      metadata: context,
      createdAt: serverTimestamp() 
    });
  } catch {
    // ignore
  }
}

export async function trackProposal(event: 'create' | 'approve' | 'reject', props: Record<string, unknown>): Promise<void> {
  try {
    const a = await getAnalyticsIfAvailable();
    if (!a) return;
    logEvent(a, `proposal_${event}`, props);
  } catch {
    // ignore
  }
}

export async function trackEdit(event: 'save' | 'error', props: Record<string, unknown>): Promise<void> {
  try {
    const a = await getAnalyticsIfAvailable();
    if (!a) return;
    logEvent(a, `edit_${event}`, props);
  } catch {
    // ignore
  }
}

export async function trackNotifications(event: 'mark_read' | 'mark_all_read', props: Record<string, unknown>): Promise<void> {
  try {
    const a = await getAnalyticsIfAvailable();
    if (!a) return;
    logEvent(a, `notifications_${event}`, props);
  } catch {
    // ignore
  }
}

// 사용자 행동 추적
export async function trackUserAction(action: string, category: string, props?: Record<string, unknown>): Promise<void> {
  try {
    const a = await getAnalyticsIfAvailable();
    if (!a) return;
    logEvent(a, 'user_action', { 
      action_name: action,
      action_category: category,
      timestamp: Date.now(),
      ...props
    });
  } catch {
    // ignore
  }
}

// 콘텐츠 상호작용 추적
export async function trackContentInteraction(type: 'view' | 'edit' | 'share' | 'like', contentId: string, props?: Record<string, unknown>): Promise<void> {
  try {
    const a = await getAnalyticsIfAvailable();
    if (!a) return;
    logEvent(a, 'content_interaction', {
      interaction_type: type,
      content_id: contentId,
      content_type: 'wiki_page',
      ...props
    });
  } catch {
    // ignore
  }
}

// 에러 추적
export async function trackError(error: Error, context?: string, additionalProps?: Record<string, unknown>): Promise<void> {
  try {
    const a = await getAnalyticsIfAvailable();
    if (!a) return;
    logEvent(a, 'error', {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack?.substring(0, 500), // 스택 트레이스 제한
      error_context: context,
      page_location: window.location.pathname,
      user_agent: navigator.userAgent,
      ...additionalProps
    });
  } catch {
    // ignore
  }
}

// 성능 추적
export async function trackPerformance(metric: string, value: number, unit: string, props?: Record<string, unknown>): Promise<void> {
  try {
    const a = await getAnalyticsIfAvailable();
    if (!a) return;
    logEvent(a, 'performance_metric', {
      metric_name: metric,
      metric_value: value,
      metric_unit: unit,
      page_location: window.location.pathname,
      ...props
    });
  } catch {
    // ignore
  }
}

// 기능 사용률 추적
export async function trackFeatureUsage(feature: string, action: 'start' | 'complete' | 'cancel', props?: Record<string, unknown>): Promise<void> {
  try {
    const a = await getAnalyticsIfAvailable();
    if (!a) return;
    logEvent(a, 'feature_usage', {
      feature_name: feature,
      feature_action: action,
      session_id: sessionStorage.getItem('session_id') || 'unknown',
      ...props
    });
  } catch {
    // ignore
  }
}

// 사용자 참여도 추적
export async function trackEngagement(event: 'session_start' | 'session_end' | 'scroll_depth' | 'time_on_page', props?: Record<string, unknown>): Promise<void> {
  try {
    const a = await getAnalyticsIfAvailable();
    if (!a) return;
    logEvent(a, 'user_engagement', {
      engagement_type: event,
      timestamp: Date.now(),
      page_location: window.location.pathname,
      ...props
    });
  } catch {
    // ignore
  }
}


