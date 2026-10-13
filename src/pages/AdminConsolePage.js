import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useInventoryScope } from '../context/InventoryScope';
export default function AdminConsolePage() {
  const { user } = useInventoryScope();
  const admin = [process.env.REACT_APP_ADMIN_UID_1, process.env.REACT_APP_ADMIN_UID_2].filter(Boolean).includes(user?.uid);
  const [requests, setRequests] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [type, setType] = useState('bug'), [filter, setFilter] = useState('all'), [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!admin) { setLoading(false); return; }
    return onSnapshot(collection(db, 'requests'), snapshot => {
      setRequests(snapshot.docs.map(record => ({ ...record.data(), id: record.id })).sort((a,b) => String(b.submittedAt).localeCompare(String(a.submittedAt))));
      setLoading(false);
    }, () => { setError('Could not load requests. Check your permissions and connection.'); setLoading(false); });
  }, [admin]);
  async function act(task) {
    setBusy(true); setError('');
    try { await task(); } catch { setError('The change could not be saved. Try again.'); } finally { setBusy(false); }
  }
  if (!admin) return <main className="page-container"><h1>Admin access required</h1><p>This page is for app support administrators.</p><Link to="/">Back to inventory</Link></main>;
  const filtered = requests.filter(r => r.type === type && (filter === 'all' || (r.status || 'submitted') === filter));
  return <main className="page-container"><Link to="/" className="back-button">Back to inventory</Link><h1>Support requests</h1>
    <label>Request type<select value={type} onChange={e => setType(e.target.value)}><option value="bug">Bugs</option><option value="feature">Ideas</option><option value="support">Support</option></select></label>
    <div className="action-buttons">{['all','submitted','working','testing','corrected'].map(status => <button aria-pressed={filter === status} key={status} onClick={() => setFilter(status)}>
      {status} ({requests.filter(r => r.type === type && (status === 'all' || (r.status || 'submitted') === status)).length})
    </button>)}</div>{error && <p role="alert">{error}</p>}
    {loading ? <p role="status">Loading requests…</p> : !filtered.length ? <p>No requests for this filter.</p> :
      filtered.map(request => <article className="box-card" key={request.id}><p>{request.description}</p><p>Status: {request.status || 'submitted'}</p>
        <label>Change status<select disabled={busy} value={request.status || 'submitted'} onChange={e => act(() => updateDoc(doc(db, 'requests', request.id), { status: e.target.value }))}>
          {['submitted','working','testing','corrected'].map(status => <option key={status}>{status}</option>)}</select></label>
        <button disabled={busy} className="delete" onClick={() => { if (window.confirm('Delete this support request?')) act(() => deleteDoc(doc(db, 'requests', request.id))); }}>Delete request</button>
      </article>)}</main>;
}
