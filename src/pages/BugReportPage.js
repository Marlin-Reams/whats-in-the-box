import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // make sure this is correct
import { getAuth } from 'firebase/auth';
import '../styles/BugReportPage.css';

const BugReportPage = () => {
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
    <div className="bug-report-page">
      <h2>🐞 Bug Report</h2>
      {submitted ? (
        <p>✅ Thank you! Your bug report has been submitted.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the bug you encountered..."
            rows={6}
            required
          />
          <button type="submit">📤 Submit Bug Report</button>
        </form>
      )}
    </div>
  );
};

export default BugReportPage;
