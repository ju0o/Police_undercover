import { Helmet } from 'react-helmet-async';
import type { ReactElement } from 'react';

export function DefaultSeo(): ReactElement {
  const siteName = 'ZeroWiki';
  const title = 'ZeroWiki - 지식의 정원';
  const description = 'ZeroWiki는 모두가 함께 만드는 지식 위키입니다.';
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const ogImage = `${typeof window !== 'undefined' ? window.location.origin : ''}/og-default.png`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="theme-color" content="#111827" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="author" content="ZeroWiki" />
      <meta name="keywords" content="위키, 지식, 공유, 협업, 문서, 정보" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="ZeroWiki - 지식의 정원" />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:locale" content="ko_KR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="ZeroWiki - 지식의 정원" />
      
      {/* Additional SEO */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content="ZeroWiki" />
    </Helmet>
  );
}


