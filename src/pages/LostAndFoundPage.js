import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useItemContext } from '../context/ItemContext';
import { useBoxContext } from '../context/BoxContext';
import ItemPhoto from '../components/ItemPhoto';
export default function LostAndFoundPage() {
  const { items, moveItemToBox, loading, error } = useItemContext(), { boxes, loading: boxLoading } = useBoxContext();
  const [busy, setBusy] = useState(false), [failure, setFailure] = useState('');
  async function move(id, boxId) {
    if (busy) return; setBusy(true); setFailure('');
    try { await moveItemToBox(id, boxId); } catch (err) { setFailure(err.message || 'Could not move this item. Try again.'); } finally { setBusy(false); }
  }
  const missing = items.filter(item => item.boxId && !boxes.some(box => box.id === item.boxId));
  return <main className="page-container"><Link to="/" className="back-button">Back to inventory</Link><h1>Items with a missing box</h1>
    <p>These items are still saved. Choose a new box or keep them as loose items.</p>
    {(error || failure) && <p role="alert">{error || failure}</p>}
    {loading || boxLoading ? <p role="status">Checking your inventory…</p> : !missing.length ? <p>Everything has a known place.</p> :
      <div className="item-grid">{missing.map(item => <article className="item-card" key={item.id}><ItemPhoto item={item} /><h2>{item.name}</h2>
        <label>Move to box<select disabled={busy} defaultValue="" onChange={e => move(item.id, e.target.value)}><option value="" disabled>Choose a box</option>
          {boxes.map(box => <option key={box.id} value={box.id}>{box.title}</option>)}</select></label>
        <button disabled={busy} onClick={() => move(item.id, null)}>Move to loose items</button></article>)}</div>}
  </main>;
}
