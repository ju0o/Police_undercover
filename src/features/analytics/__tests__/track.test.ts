import { trackPageView, trackSearch, trackError, trackUserAction } from '../track';

// Firebase Analytics를 모킹
jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(),
  isSupported: jest.fn(() => Promise.resolve(true)),
  logEvent: jest.fn(),
}));

// Firebase config를 모킹
jest.mock('@/shared/config/firebase', () => ({
  app: {},
  db: {}
}));

// Firestore를 모킹
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 }))
}));

describe('Analytics Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // document.title을 모킹
    Object.defineProperty(document, 'title', {
      writable: true,
      value: 'Test Page'
    });
  });

  describe('trackPageView', () => {
    it('should track page view with basic parameters', async () => {
      const { logEvent } = await import('firebase/analytics');
      
      await trackPageView('/test-page');
      
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'page_view',
        expect.objectContaining({
          page_location: '/test-page',
          page_title: 'Test Page'
        })
      );
    });

    it('should track page view with additional props', async () => {
      const { logEvent } = await import('firebase/analytics');
      
      await trackPageView('/test-page', { user_type: 'admin' });
      
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'page_view',
        expect.objectContaining({
          page_location: '/test-page',
          page_title: 'Test Page',
          user_type: 'admin'
        })
      );
    });
  });

  describe('trackSearch', () => {
    it('should track search with term only', async () => {
      const { logEvent } = await import('firebase/analytics');
      
      await trackSearch('test query');
      
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'search',
        expect.objectContaining({
          search_term: 'test query',
          search_term_length: 10,
          has_filters: false
        })
      );
    });

    it('should track search with context', async () => {
      const { logEvent } = await import('firebase/analytics');
      
      await trackSearch('test', { 
        resultCount: 5, 
        filters: { category: 'tech' } 
      });
      
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'search',
        expect.objectContaining({
          search_term: 'test',
          search_term_length: 4,
          result_count: 5,
          has_filters: true,
          category: 'tech'
        })
      );
    });
  });

  describe('trackError', () => {
    it('should track error with basic information', async () => {
      const { logEvent } = await import('firebase/analytics');
      const testError = new Error('Test error message');
      
      await trackError(testError);
      
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'error',
        expect.objectContaining({
          error_message: 'Test error message',
          error_name: 'Error',
          page_location: expect.any(String),
          user_agent: expect.any(String)
        })
      );
    });

    it('should track error with context and additional props', async () => {
      const { logEvent } = await import('firebase/analytics');
      const testError = new Error('Context error');
      
      await trackError(testError, 'form_submission', { form_id: 'login' });
      
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'error',
        expect.objectContaining({
          error_message: 'Context error',
          error_context: 'form_submission',
          form_id: 'login'
        })
      );
    });
  });

  describe('trackUserAction', () => {
    it('should track user action with category', async () => {
      const { logEvent } = await import('firebase/analytics');
      
      await trackUserAction('click', 'button', { button_id: 'submit' });
      
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'user_action',
        expect.objectContaining({
          action_name: 'click',
          action_category: 'button',
          button_id: 'submit',
          timestamp: expect.any(Number)
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should handle analytics errors gracefully', async () => {
      const { logEvent } = await import('firebase/analytics');
      (logEvent as jest.Mock).mockImplementation(() => {
        throw new Error('Analytics error');
      });
      
      // Should not throw
      await expect(trackPageView('/test')).resolves.toBeUndefined();
      await expect(trackSearch('test')).resolves.toBeUndefined();
      await expect(trackError(new Error('test'))).resolves.toBeUndefined();
    });
  });
});
