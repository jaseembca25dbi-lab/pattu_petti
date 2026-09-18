import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Universal Zoom Lock: Disable pinch-to-zoom, gesture zoom, mouse wheel zoom, and keyboard zoom shortcuts
if (typeof window !== 'undefined') {
  // Prevent Ctrl + Mouse Wheel zoom / Trackpad pinch zoom
  document.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // Prevent Keyboard zoom shortcuts: Ctrl/Cmd + Plus, Minus, Zero
  document.addEventListener(
    'keydown',
    (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '+' ||
          e.key === '-' ||
          e.key === '=' ||
          e.key === '_' ||
          e.key === '0' ||
          e.code === 'NumpadAdd' ||
          e.code === 'NumpadSubtract')
      ) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // Prevent iOS / Safari gesture zoom
  document.addEventListener(
    'gesturestart',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    'gesturechange',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    'gestureend',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  // Prevent multi-touch pinch-to-zoom on mobile devices
  document.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

