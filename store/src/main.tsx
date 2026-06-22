import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles.css';
import { StoreProvider } from './store';
import { App } from './App';
import { hydrateFromApi } from './data/api';

// Load the live shared catalog (if VITE_API_BASE is set) before first render.
hydrateFromApi().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HashRouter>
        <StoreProvider>
          <App />
        </StoreProvider>
      </HashRouter>
    </StrictMode>,
  );
});
