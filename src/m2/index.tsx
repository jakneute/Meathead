import React from 'react';
import ReactDOM from 'react-dom/client';
import '../m1/game/platform/stillMouse';
import App2 from './App';
import '@fontsource/press-start-2p';
import '../m1/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element to mount to');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App2 />
  </React.StrictMode>
);
