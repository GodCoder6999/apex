import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles.css';
import { IconDefs } from './icons';
import { ToastProvider } from './ui';
import { App } from './App';
import { initStore } from './data/db';

// Hydrates from the live API when VITE_API_BASE is set; no-op on mock.
void initStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ToastProvider>
        <IconDefs />
        <App />
      </ToastProvider>
    </HashRouter>
  </StrictMode>,
);
