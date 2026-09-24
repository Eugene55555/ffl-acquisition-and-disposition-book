'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { type Locale } from '@/src/i18n/settings';

/**
 * FastComments widget — instant publishing with moderation dashboard.
 * Tenant ID: 1wJnFLu4BpK (from FastComments account)
 */
const TENANT_ID = '1wJnFLu4BpK';
const CDN_URL = 'https://cdn.fastcomments.com/js/embed-v2-async.min.js';

export function Comments({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.innerHTML = '';

    // Create container for FastComments
    const container = document.createElement('div');
    container.id = 'fastcomments-widget';
    el.appendChild(container);

    // Load FastComments script
    const script = document.createElement('script');
    script.src = CDN_URL;
    script.async = true;
    script.onload = () => {
      if (window.fcConfigs === undefined) {
        window.fcConfigs = [];
      }
      window.fcConfigs.push({
        target: '#fastcomments-widget',
        tenantId: TENANT_ID,
        urlId: pathname, // Use current path as urlId for correct page association
      });
      // Initialize FastComments if already loaded
      if (typeof window.FastComments !== 'undefined') {
        window.FastComments.init();
      }
    };
    document.head.appendChild(script);

    return () => {
      el.innerHTML = '';
      // Remove script on cleanup
      const existingScript = document.querySelector(`script[src="${CDN_URL}"]`);
      if (existingScript) existingScript.remove();
    };
  }, [pathname]);

  // Handle theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (typeof window.FastComments !== 'undefined') {
        window.FastComments.refresh();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className="fastcomments-slot min-w-0" />;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    fcConfigs: Array<{
      target: string;
      tenantId: string;
      urlId?: string;
    }>;
    FastComments?: {
      init: () => void;
      refresh: () => void;
    };
  }
}