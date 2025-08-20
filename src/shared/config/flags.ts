export const FEATURES = {
  discussion: true,
  watchlist: true,
  markdownIO: true,
  templates: true,
  imageMeta: true,
  roleRequest: true,
  sitemapOg: true,
  // notificationFanout: 'client' | 'functions'
  notificationFanout: 'client' as 'client' | 'functions',
  // dynamic sitemap via Cloud Functions (disabled by default)
  sitemapDynamic: false,
};

export type FeatureFlags = typeof FEATURES;


