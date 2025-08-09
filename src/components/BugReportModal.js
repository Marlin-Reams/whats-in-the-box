import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import '../styles/BugReportModal.css';

const BugReportModal = ({ onClose }) => {
  const [description, setDescription] = useState('');
  const [type, setType] = useState('bug');
  const [submitted, setSubmitted] = useState(false);
  const user = getAuth().currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'requests'), {
        type,
        description,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        userId: user?.uid || 'anonymous'
      });

      toast.success("Request submitted!");
      setSubmitted(true);
      setDescription('');

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('❌ Failed to submit request:', err);
      toast.error("Failed to submit request.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            {type === 'bug' && '🐞'}
            {type === 'feature' && '💡'}
            {type === 'support' && '🛠️'}
            <span> Submit a {type.charAt(0).toUpperCase() + type.slice(1)} Request</span>
          </div>
          <button className="modal-close" onClick={onClose}>✖</button>
        </div>

        <div className="type-selector">
          <label htmlFor="type">Request Type:</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="support">Support</option>
          </select>
        </div>

        <textarea
          className="bug-textarea"
          placeholder="Describe your request in detail..."
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
