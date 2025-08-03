import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { useBoxContext } from './context/BoxContext';

import AddBoxPage from './pages/AddBoxPage';
import AddLooseItemPage from './pages/AddLooseItemPage';
import AllBoxesPage from './pages/AllBoxesPage';
import BoxQRPage from './pages/BoxQRPage';
import BoxViewPage from './pages/BoxViewPage';
import HomePage from './pages/HomePage';
import LooseItemsPage from './pages/LooseItemsPage';
import ScanPage from './pages/ScanPage';
import AuthForm from './components/AuthForm';
import LogoutButton from './components/LogoutButton';

function App() {
  const { boxes } = useBoxContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) return <div>Loading...</div>;

  return (
    <Router basename="/whats-in-the-box">
      {!user ? (
        <AuthForm />
      ) : (
        <>
          <header
            style={{
              padding: '1rem',
              textAlign: 'right',
              backgroundColor: '#e8f5e9',
              borderBottom: '1px solid #c8e6c9',
              marginBottom: '1rem'
            }}
          >
            <LogoutButton />
          </header>

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
        </>
      )}
    </Router>
  );
}

export default App;

