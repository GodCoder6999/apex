import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Listing } from './pages/Listing';
import { Product } from './pages/Product';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Track } from './pages/Track';
import { Account } from './pages/Account';
import { Enquiry } from './pages/Enquiry';
import { StaticPage } from './pages/StaticPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Listing />} />
        <Route path="/c/:slug" element={<Listing />} />
        <Route path="/search" element={<Listing />} />
        <Route path="/deals" element={<Listing />} />
        <Route path="/brands" element={<Listing />} />
        <Route path="/wishlist" element={<Listing />} />
        <Route path="/p/:slug" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/success" element={<OrderSuccess />} />
        <Route path="/track" element={<Track />} />
        <Route path="/account" element={<Account />} />
        <Route path="/enquiry" element={<Enquiry />} />
        <Route path="/about" element={<StaticPage k="about" />} />
        <Route path="/contact" element={<StaticPage k="contact" />} />
        <Route path="/policies/:k" element={<StaticPage />} />
        <Route path="*" element={<StaticPage k="about" />} />
      </Route>
    </Routes>
  );
}
