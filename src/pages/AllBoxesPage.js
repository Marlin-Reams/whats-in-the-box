import { useInventoryScope } from '../context/InventoryScope';
import { boxPath } from '../utils/inventory';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoxContext } from '../context/BoxContext';
import { useItemContext } from '../context/ItemContext';
import ItemPhoto from '../components/ItemPhoto';
export default function AllBoxesPage() {
  const { familyId } = useInventoryScope();
  const { boxes, updateBox, deleteBox, loading, error } = useBoxContext(), { items } = useItemContext();
  const [search, setSearch] = useState(''), [editing, setEditing] = useState(null), [data, setData] = useState({});
  const [busy, setBusy] = useState(false), [failure, setFailure] = useState('');
  async function act(task) {
    if (busy) return; setBusy(true); setFailure('');
    try { await task(); } catch (err) { setFailure(err.message || 'Could not save that change. Please try again.'); }
    finally { setBusy(false); }
  }
  const term = search.trim().toLowerCase();
  const matches = value => (value || '').toLowerCase().includes(term);
  const filtered = boxes.filter(box => matches(box.title + ' ' + (box.location || '') + ' ' + (box.notes || '')) ||
    items.some(item => item.boxId === box.id && matches(item.name + ' ' + (item.description || ''))));
  return <main className="page-container">
    <Link to="/" className="back-button">Back to inventory</Link><h1>Your boxes</h1><Link className="primary-link" to="/add-box">Add box</Link>
    <label className="search-label">Search boxes and their contents<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Try measuring cups or garage" /></label>
    {(error || failure) && <p role="alert" className="error-text">{error || failure}</p>}
    {loading ? <p role="status">Loading boxes…</p> : <div className="boxes-grid">
      {!filtered.length && <p className="empty-state">{boxes.length ? 'No matching boxes. Try another search.' : 'Your first box starts here. Add a box and give it a location.'}</p>}
      {filtered.map(box => <article key={box.id} className="box-card">
        {editing === box.id ? <form onSubmit={e => { e.preventDefault(); act(async () => { await updateBox(box.id, data); setEditing(null); }); }}>
          <fieldset disabled={busy}><label>Box name<input required maxLength={120} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
            <label>Location<input maxLength={200} value={data.location} onChange={e => setData({ ...data, location: e.target.value })} /></label>
            <label>Notes<textarea maxLength={2000} value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} /></label></fieldset>
          <button disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button><button type="button" disabled={busy} onClick={() => setEditing(null)}>Cancel</button>
        </form> : <>
          <h2>{box.title}</h2><p className="location">{box.location || 'Location not set'}</p><p>{box.notes}</p>
          <p>{items.filter(item => item.boxId === box.id).length} items</p>
          <div className="action-buttons"><Link className="primary-link" to={boxPath(box.id, familyId)}>Open box</Link>
            <button disabled={busy} onClick={() => { setEditing(box.id); setData({ title: box.title, notes: box.notes || '', location: box.location || '' }); }}>Edit</button>
            <button disabled={busy} className="delete" onClick={() => {
              if (window.confirm('Delete “' + box.title + '”? Its items will move to loose items.')) act(() => deleteBox(box.id));
            }}>Delete</button></div>
          {term && <ul className="search-results">{items.filter(item => item.boxId === box.id && matches(item.name + ' ' + (item.description || ''))).map(item =>
            <li key={item.id}><ItemPhoto item={item} /><span>{item.name} · {item.quantity}</span></li>)}</ul>}
        </>}
      </article>)}
    </div>}
  </main>;
}
