// src/components/LogoutButton.js
// src/components/LogoutButton.js
import React from 'react';
import { getAuth, signOut } from 'firebase/auth';

const LogoutButton = () => {
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
    <button onClick={handleLogout} className="logout-button">
      Log Out
    </button>
  );
};

export default LogoutButton;



