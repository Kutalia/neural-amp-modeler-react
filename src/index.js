import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const el = document.createElement('div');
document.body.appendChild(el);
el.id = 'root';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// only use offline-first PWA in standalone mode (when launching from desktop, taskbar, etc.)
const mqStandAlone = '(display-mode: standalone)';
if ((navigator.standalone || window.matchMedia(mqStandAlone).matches)) {
  serviceWorkerRegistration.register();
} else {
  serviceWorkerRegistration.unregister();
}
