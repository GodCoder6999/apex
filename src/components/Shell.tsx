import { Outlet } from 'react-router-dom';
import { color } from '../theme';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Shell() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '246px 1fr', height: '100vh', width: '100vw',
      background: color.surface, overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={{ padding: '26px 30px 56px', maxWidth: 1320, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
