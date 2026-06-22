import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Product } from './pages/Product';
import { Search } from './pages/Search';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Account } from './pages/Account';
import { Enquiry } from './pages/Enquiry';
import { StaticPage } from './pages/StaticPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/c/:slug" element={<Shop />} />
        <Route path="/p/:slug" element={<Product />} />
        <Route path="/search" element={<Search />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/success" element={<OrderSuccess />} />
        <Route path="/account" element={<Account />} />
        <Route path="/track" element={<Account />} />
        <Route path="/enquiry" element={<Enquiry />} />
        <Route path="/about" element={<StaticPage k="about" />} />
        <Route path="/contact" element={<StaticPage k="contact" />} />
        <Route path="/policies/:k" element={<StaticPage />} />
        <Route path="*" element={<StaticPage k="notfound" />} />
      </Route>
    </Routes>
  );
}
