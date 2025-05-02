import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ThemeProvider } from './components/Theme-provider.tsx';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="period-tracker-theme">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
