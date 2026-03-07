import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './providers/AppProvider';
import { Popup } from './pages/Popup';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <Popup />
    </AppProvider>
  </React.StrictMode>,
);
