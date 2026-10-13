import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoxContext } from '../context/BoxContext';
import { useItemContext } from '../context/ItemContext';
import { useInventoryScope } from '../context/InventoryScope';
export default function HomePage() {
  const { boxes, loading: boxLoading, error: boxError } = useBoxContext();
  const { items, looseItems, loading, error } = useItemContext();
  const { familyId, families } = useInventoryScope();
  const [search, setSearch] = useState('');
  const family = families.find(f => f.id === familyId);
  const term = search.trim().toLowerCase();
  const matchingItems = items.filter(item => (item.name + ' ' + (item.description || '')).toLowerCase().includes(term));
  return <main className="dashboard page-container">
    <p className="eyebrow">{family ? family.name + ' · shared inventory' : 'Your personal inventory'}</p>
    <h1>A place for everything.</h1><p className="intro">Find what you packed, wherever home is now.</p>
    <div className="stats"><Link to="/boxes"><strong>{boxes.length}</strong> boxes</Link>
      <span><strong>{items.length}</strong> items</span><Link to="/loose-items"><strong>{looseItems.length}</strong> loose items</Link></div>
    <label className="search-label">What are you looking for?<input type="search" placeholder="Search every item, box or location…" value={search} onChange={e => setSearch(e.target.value)} /></label>
    {(error || boxError) && <p role="alert">{error || boxError}</p>}
    {(loading || boxLoading) && <p role="status">Loading your inventory…</p>}
    <div className="dashboard-actions"><Link className="primary-link" to="/add-loose-item">Add item</Link><Link className="primary-link" to="/add-box">Add box</Link>
      <Link className="primary-link" to="/scan">Scan a label</Link><Link to="/qr-codes">Print box labels</Link></div>
    {term ? <section><h2>Search results</h2>
      <ul className="search-results">{matchingItems.map(item => {
        const box = boxes.find(b => b.id === item.boxId);
        return <li key={item.id}><Link to={box ? '/view/' + box.id : item.boxId ? '/lost-found' : '/loose-items'}>
          <strong>{item.name}</strong><span>{box ? box.title + ' · ' + (box.location || 'Location not set') : item.boxId ? 'Missing box · recover item' : 'Loose item'}</span></Link></li>;
      })}{boxes.filter(b => (b.title + ' ' + (b.location || '') + ' ' + (b.notes || '')).toLowerCase().includes(term)).map(box =>
        <li key={box.id}><Link to={'/view/' + box.id}><strong>{box.title}</strong><span>{box.location || 'Location not set'} · Box</span></Link></li>)}</ul>
      {!matchingItems.length && !boxes.some(b => (b.title + ' ' + (b.location || '') + ' ' + (b.notes || '')).toLowerCase().includes(term)) && <p>No matches. Try another name or description.</p>}
    </section> : <section><div className="section-heading"><h2>Your boxes</h2><Link to="/boxes">View all</Link></div>
      {!boxes.length && !boxLoading && <div className="empty-state"><h3>Start with one box.</h3><p>Name it, add a location, and list what’s inside. The next move will be easier.</p><Link to="/add-box">Create your first box</Link></div>}
      <div className="boxes-grid">{boxes.slice(0, 6).map(box => <Link className="box-card" key={box.id} to={'/view/' + box.id}>
        <h3>{box.title}</h3><p className="location">{box.location || 'Location not set'}</p><span>{items.filter(i => i.boxId === box.id).length} items</span></Link>)}</div>
    </section>}
  </main>;
}
