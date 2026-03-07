import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './providers/AppProvider';
import { Newtab } from './pages/Newtab';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <Newtab />
    </AppProvider>
  </React.StrictMode>,
);
