import React from 'react';
import { HelmetProvider as RHHelmetProvider } from 'react-helmet-async';

export function HelmetProvider({ children }: { children: React.ReactNode }) {
  return <RHHelmetProvider>{children}</RHHelmetProvider>;
}


