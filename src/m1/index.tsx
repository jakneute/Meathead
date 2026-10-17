// (first: in the desktop app, the saves on disk are swapped in before anything reads them)
import './game/platform/desktop';
import './game/platform/stillMouse';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource/press-start-2p';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element to mount to");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
