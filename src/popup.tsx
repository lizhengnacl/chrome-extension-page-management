import React from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import Popup from './src/popup';
import { ToastContainer } from './src/components/ui/Toast';
import './entry.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <NextUIProvider>
      <Popup />
      <ToastContainer />
    </NextUIProvider>
  );
}
