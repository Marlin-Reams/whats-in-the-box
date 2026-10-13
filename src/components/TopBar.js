import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { signOut, getAuth } from 'firebase/auth';
import BugReportModal from './BugReportModal';
import { useInventoryScope, familiesEnabled } from '../context/InventoryScope';
import '../styles/TopBar.css';
export default function TopBar() {
  const { user, familyId, families, setFamilyId } = useInventoryScope();
  const [help, setHelp] = useState(false), [error, setError] = useState('');
  const admin = [process.env.REACT_APP_ADMIN_UID_1, process.env.REACT_APP_ADMIN_UID_2].filter(Boolean).includes(user?.uid);
  return <header className="app-header"><div className="brand-row"><Link to="/" className="brand">What's in the Box <span aria-hidden="true">📦</span></Link>
    <div className="account-actions"><button onClick={() => setHelp(true)}>Help</button>
      {admin && <Link to="/admin-console">Admin</Link>}<button onClick={async () => { try { await signOut(getAuth()); } catch { setError('Could not sign out. Try again.'); } }}>Sign out</button></div></div>
    <nav aria-label="Inventory"><NavLink to="/" end>Overview</NavLink><NavLink to="/boxes">Boxes</NavLink><NavLink to="/loose-items">Loose items</NavLink><NavLink to="/scan">Scan</NavLink>
      {familiesEnabled && <NavLink to="/family">Family</NavLink>}</nav>
    {familiesEnabled && <label className="scope-selector">Inventory<select value={familyId || ''} onChange={e => setFamilyId(e.target.value || null)}>
      <option value="">Personal</option>{families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>}
    {error && <p role="alert">{error}</p>}{help && <BugReportModal onClose={() => setHelp(false)} />}</header>;
}
