// src/components/LogoutButton.js
// src/components/LogoutButton.js
import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import BugReportModal from './BugReportModal'; // ✅ Ensure this is correctly imported
import '../styles/LogoutButton.css';


const LogoutButton = () => {
  const [showBugModal, setShowBugModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      console.log('🔒 Logged out');
      // No need to navigate — user state change will auto-trigger login screen
    } catch (err) {
      console.error('❌ Logout failed:', err);
    }
  };

  return (
    <>
      <div className="logout-bar">
        <button className="bug-report-button" onClick={() => setShowBugModal(true)}>
          🐞 Report a Bug
        </button>

        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
      </div>

      {showBugModal && <BugReportModal onClose={() => setShowBugModal(false)} />}
    </>
  );
};

export default LogoutButton;



