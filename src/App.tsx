import { Routes, Route } from 'react-router-dom';
import { Shell } from './components/Shell';
import { Dashboard } from './screens/Dashboard';
import { Products } from './screens/Products';
import { Categories } from './screens/Categories';
import { Stock } from './screens/Stock';
import { Intake } from './screens/Intake';
import { NewOrder } from './screens/NewOrder';
import { Enquiries } from './screens/Enquiries';
import { Invoices } from './screens/Invoices';
import { Customers } from './screens/Customers';
import { Dues } from './screens/Dues';
import { Sellers } from './screens/Sellers';
import { Profit } from './screens/Profit';
import { Analytics } from './screens/Analytics';
import { Settings } from './screens/Settings';

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/intake" element={<Intake />} />
        <Route path="/order" element={<NewOrder />} />
        <Route path="/enquiries" element={<Enquiries />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/dues" element={<Dues />} />
        <Route path="/sellers" element={<Sellers />} />
        <Route path="/profit" element={<Profit />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
