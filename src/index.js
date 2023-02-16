import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { YoroiProvider } from './hooks/yoroiProvider';
import { BrowserRouter, Route, Routes } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <YoroiProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </YoroiProvider>
  </React.StrictMode>
);
