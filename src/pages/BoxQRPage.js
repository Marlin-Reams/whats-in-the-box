import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useBoxContext } from '../context/BoxContext';
import { useInventoryScope } from '../context/InventoryScope';
import { boxLink } from '../utils/inventory';
export default function BoxQRPage() {
  const { boxes, loading, error } = useBoxContext(), { familyId } = useInventoryScope();
  const [selected, setSelected] = useState([]);
  return <main className="page-container label-page">
    <div className="no-print"><Link to="/" className="back-button">Back to inventory</Link><h1>Box labels</h1>
      <p>Select the boxes to print. Labels open your inventory when scanned.</p>
      <div className="action-buttons"><button onClick={() => setSelected(boxes.map(b => b.id))}>Select all</button>
        <button onClick={() => setSelected([])}>Clear selection</button><button disabled={!selected.length} onClick={() => window.print()}>Print {selected.length} labels</button></div></div>
    {loading && <p role="status">Loading boxes…</p>}{error && <p role="alert">{error}</p>}
    {!boxes.length && !loading && <p>Add a box to create its first label.</p>}
    <div className="labels-grid">{boxes.map(box => <article key={box.id} className={'label-card ' + (selected.includes(box.id) ? 'print-selected' : 'print-hidden')}>
      <label className="no-print"><input type="checkbox" checked={selected.includes(box.id)} onChange={e => setSelected(e.target.checked ? [...selected, box.id] : selected.filter(id => id !== box.id))} /> Print this label</label>
      <QRCodeSVG value={boxLink(box.id, familyId)} size={180} marginSize={4} /><h2>{box.title}</h2><p>{box.location || ''}</p>
    </article>)}</div>
  </main>;
}
