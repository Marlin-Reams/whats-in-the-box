import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BoxProvider } from './context/BoxContext';
import { ItemProvider } from './context/ItemContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BoxProvider>
      <ItemProvider>
      <App />
      </ItemProvider>
    </BoxProvider>
  </React.StrictMode>
);
