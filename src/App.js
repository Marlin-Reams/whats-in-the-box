import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useBoxContext } from './context/BoxContext';
import AddBoxPage from './pages/AddBoxPage';
import AddLooseItemPage from './pages/AddLooseItemPage';
import AllBoxesPage from './pages/AllBoxesPage';
import BoxQRPage from './pages/BoxQRPage';
import BoxViewPage from './pages/BoxViewPage';
import HomePage from './pages/HomePage';
import LooseItemsPage from './pages/LooseItemsPage';
import ScanPage from './pages/ScanPage';

function App() {
  const { boxes } = useBoxContext();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-box" element={<AddBoxPage />} />
        <Route path="/add-loose-item" element={<AddLooseItemPage />} />
        <Route path="/boxes" element={<AllBoxesPage />} />
        <Route path="/qr-codes" element={<BoxQRPage />} />
        <Route path="/view/:boxId" element={<BoxViewPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/loose-items" element={<LooseItemsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

