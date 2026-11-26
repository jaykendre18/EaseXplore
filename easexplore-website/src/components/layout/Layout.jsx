import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Icon from '@/components/ui/Icon';

/** Jump to the top of the page whenever the route changes. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-2 text-on-surface-variant" role="status">
      <Icon name="progress_activity" className="animate-spin" />
      Loading…
    </div>
  );
}

/** Wraps every page with the header and footer. Pages render where <Outlet /> sits. */
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Skip to main content
      </a>
      <ScrollToTop />
      <Header />
      {/* Suspense sits here so the header and footer stay visible while a page loads. */}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
