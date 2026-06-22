import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { Toast, MobileTab } from './Chrome';

export function Layout() {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <>
      <Header />
      <main style={{ minHeight: '60vh', paddingBottom: 60 }}><Outlet /></main>
      <Footer />
      <CartDrawer />
      <Toast />
      <MobileTab />
      <div className="mob-only" style={{ height: 64 }} />
    </>
  );
}
