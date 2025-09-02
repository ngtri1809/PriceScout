import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

console.log('Main.jsx is loading...');

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log('Root element found:', document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('App rendered');