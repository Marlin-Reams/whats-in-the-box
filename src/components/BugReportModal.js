import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';
import '../styles/BugReportModal.css';

const BugReportModal = ({ onClose }) => {
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const user = getAuth().currentUser;


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'bugReports'), {
        description,
        userId: user?.uid || 'anonymous',
        submittedAt: new Date().toISOString()
      });
      setSubmitted(true);
      setDescription('');
    } catch (err) {
      console.error('❌ Failed to submit bug report:', err);
    }
  };

  return (
    <div className="modal-overlay">
  <div className="modal-content">
    <div className="modal-header">
      <div className="modal-title">
        🐞 <span>Report a Bug</span>
      </div>
      <button className="modal-close" onClick={onClose}>✖</button>
    </div>

    <textarea
  className="bug-textarea"
  placeholder="Describe the bug you encountered..."
  value={description}
onChange={(e) => setDescription(e.target.value)}

/>


    <button className="submit-button" onClick={handleSubmit}>
      📝 Submit
    </button>
  </div>
</div>

  );
};

export default BugReportModal;
