import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useInventoryScope, familiesEnabled } from './context/InventoryScope';
import AddBoxPage from './pages/AddBoxPage';
import AddLooseItemPage from './pages/AddLooseItemPage';
import AllBoxesPage from './pages/AllBoxesPage';
import BoxQRPage from './pages/BoxQRPage';
import BoxViewPage from './pages/BoxViewPage';
import HomePage from './pages/HomePage';
import LooseItemsPage from './pages/LooseItemsPage';
import ScanPage from './pages/ScanPage';
import AuthForm from './components/AuthForm';
import TopBar from './components/TopBar';
import LostAndFoundPage from './pages/LostAndFoundPage';
import AdminConsolePage from './pages/AdminConsolePage';
import FamilyPage from './pages/FamilyPage';
import BugReportPage from './pages/BugReportPage';
function App() {
  const { user, ready, familyId } = useInventoryScope();
  if (!ready) return <main className="page-container" role="status">Opening your inventory…</main>;
  return <HashRouter>{!user ? <AuthForm /> : <>
    <a className="skip-link" href="#main-content">Skip to content</a><TopBar />
    <div id="main-content" key={user.uid + ':' + (familyId || '')}><Routes>
      <Route path="/" element={<HomePage />} /><Route path="/add-box" element={<AddBoxPage />} />
      <Route path="/add-loose-item" element={<AddLooseItemPage />} /><Route path="/boxes" element={<AllBoxesPage />} />
      <Route path="/qr-codes" element={<BoxQRPage />} /><Route path="/view/:boxId" element={<BoxViewPage />} />
      <Route path="/scan" element={<ScanPage />} /><Route path="/loose-items" element={<LooseItemsPage />} />
      <Route path="/lost-found" element={<LostAndFoundPage />} /><Route path="/admin-console" element={<AdminConsolePage />} />
      <Route path="/bug-report" element={<BugReportPage />} />
      {familiesEnabled && <Route path="/family" element={<FamilyPage />} />}
      <Route path="*" element={<main className="page-container"><h1>Page not found</h1><Link to="/">Back to inventory</Link></main>} />
    </Routes></div><ToastContainer position="top-center" autoClose={4000} /></>}</HashRouter>;
}
export default App;
