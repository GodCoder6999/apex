import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { Toast, MobileTab } from './Chrome';
import { useIsMobile, useScrolled } from './useViewport';

export function Layout() {
  const loc = useLocation();
  const isMobile = useIsMobile();
  const scrolled = useScrolled();
  useEffect(() => { try { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); } catch { window.scrollTo(0, 0); } }, [loc.pathname, loc.search]);
  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', position: 'relative' }}>
      <Header isMobile={isMobile} scrolled={scrolled} />
      <main style={{ minHeight: '60vh' }}><Outlet /></main>
      <Footer isMobile={isMobile} />
      <CartDrawer isMobile={isMobile} />
      <Toast />
      {isMobile && <MobileTab />}
    </div>
  );
}
