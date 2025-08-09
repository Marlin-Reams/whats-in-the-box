import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminConsole.css';

const allowedUIDs = [
  process.env.REACT_APP_ADMIN_UID_1,
  process.env.REACT_APP_ADMIN_UID_2
];

const AdminConsolePage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState('bug');
  const [countdown, setCountdown] = useState(30);
  const user = getAuth().currentUser;
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const q = query(collection(db, 'requests'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(all);
    } catch (err) {
      console.error("❌ Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      const ref = doc(db, 'requests', id);
      await updateDoc(ref, { status });
      setRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status } : r)
      );
    } catch (err) {
      console.error('❌ Failed to update status:', err);
    }
  };

  const deleteRequest = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this request?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'requests', id));
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('❌ Failed to delete request:', err);
    }
  };

  useEffect(() => {
    if (user && allowedUIDs.includes(user.uid)) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !allowedUIDs.includes(user.uid)) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            navigate('/');
            clearInterval(interval);
          }
          return prev - 1;
        });
      }, 1000);

      const logUnauthorizedAttempt = async () => {
        try {
          await addDoc(collection(db, 'unauthorizedAccessLogs'), {
            uid: user?.uid || 'anonymous',
            attemptedAt: new Date().toISOString(),
            page: 'admin-console'
          });
        } catch (err) {
          console.error("Failed to log unauthorized attempt:", err);
        }
      };

      logUnauthorizedAttempt();

      return () => clearInterval(interval);
    }
  }, [user, navigate]);

  if (loading) return <p>Loading requests...</p>;

  if (!user || !allowedUIDs.includes(user.uid)) {
    return (
      <div className="unauthorized-container">
        <h2 className="unauthorized-header">🚨 Unauthorized Access</h2>
        <p>This attempt has been logged.</p>
        <p>You will be redirected in <strong>{countdown}</strong> seconds.</p>
      </div>
    );
  }

  const filteredRequests = requests.filter(r =>
    r.type === tab && (filter === 'all' || (r.status || 'submitted') === filter)
  );

  const countByStatus = (status) =>
    requests.filter(r => r.type === tab && (r.status || 'submitted') === status).length;

  return (
    
    <div className="admin-console">
        <button className="return-button" onClick={() => navigate('/')}>
  🔙 Return to App
</button>
      <h1>🛠️ Admin Console</h1>
      

      {/* 🔄 Tab Bar */}
      <div className="tab-bar">
        {['bug', 'feature', 'support'].map(t => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}s
          </button>
        ))}
      </div>

      {/* 🧮 Status Filter */}
      <div className="status-filter">
        {['all', 'submitted', 'working', 'testing', 'corrected'].map(status => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status[0].toUpperCase() + status.slice(1)} ({countByStatus(status)})
          </button>
        ))}
      </div>

      {/* 📋 Request List */}
      {filteredRequests.length === 0 ? (
        <p>No {tab} requests found for filter: <strong>{filter}</strong>.</p>
      ) : (
        <ul className="bug-report-list">
          {filteredRequests.map((req) => {
            const statusClass = req.status || 'submitted';
            return (
              <li key={req.id} className={`bug-report-item ${statusClass}`}>
                <p><strong>Description:</strong> {req.description}</p>
                <p><strong>User:</strong> {req.userId}</p>
                <p><strong>Submitted:</strong> {new Date(req.submittedAt).toLocaleString()}</p>
                <p><strong>Status:</strong> {statusClass}</p>

                <div className="bug-actions">
                  <button onClick={() => updateRequestStatus(req.id, 'working')}>🔧 Working</button>
                  <button onClick={() => updateRequestStatus(req.id, 'testing')}>🧪 Testing</button>
                  <button onClick={() => updateRequestStatus(req.id, 'corrected')}>✅ Corrected</button>
                  <button onClick={() => deleteRequest(req.id)}>🗑️ Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminConsolePage;



