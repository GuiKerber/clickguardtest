import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Foundations from the design system package. Nothing in this app declares a
// colour, a size or a duration of its own.
import '@clickguard/ui/styles.css';

import { App } from './App';
import './app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
