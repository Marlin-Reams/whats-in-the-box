import React, { useState, useEffect } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import BugReportModal from './BugReportModal';
import { useNavigate } from 'react-router-dom';
import '../styles/TopBar.css'; // You can rename this to TopBar.css later if you’d like

const allowedAdminUIDs = [
  process.env.REACT_APP_ADMIN_UID_1,
  process.env.REACT_APP_ADMIN_UID_2
];

const TopBar = () => {
  const [showBugModal, setShowBugModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && allowedAdminUIDs.includes(user.uid)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      console.log('🔒 Logged out');
    } catch (err) {
      console.error('❌ Logout failed:', err);
    }
  };

  return (
    <>
      <div className="logout-bar">
        <button className="bug-report-button" onClick={() => setShowBugModal(true)}>
          Help Request
        </button>

        {isAdmin && (
          <button className="admin-button" onClick={() => navigate('/admin-console')}>
            Admin Console
          </button>
        )}

        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
      </div>

      {showBugModal && <BugReportModal onClose={() => setShowBugModal(false)} />}
    </>
  );
};

export default TopBar;



