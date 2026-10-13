import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useBoxContext } from '../context/BoxContext';
import { useItemContext } from '../context/ItemContext';
import { useInventoryScope } from '../context/InventoryScope';
import ItemList from '../components/ItemList';
import ItemForm from '../components/ItemForm';
import { boxLink } from '../utils/inventory';
import '../styles/BoxViewPage.css';
export default function BoxViewPage() {
  const { boxId } = useParams(), [params] = useSearchParams();
  const { getBoxById, loading: boxesLoading, error: boxError } = useBoxContext();
  const { items, addItem, updateItem, deleteItem, moveItemToBox, loading, error } = useItemContext();
  const { familyId, families, setFamilyId } = useInventoryScope();
  const [adding, setAdding] = useState(false), [qr, setQr] = useState(false), [search, setSearch] = useState('');
  const [editingIndex, setEditingIndex] = useState(null), [editedItem, setEditedItem] = useState(null);
  const requestedFamily = params.get('family') || null;
  if (requestedFamily !== familyId) {
    const known = families.find(f => f.id === requestedFamily);
    return <main className="page-container"><h1>Open this box</h1>{!requestedFamily
      ? <button onClick={() => setFamilyId(null)}>Open personal inventory</button> : known
      ? <button onClick={() => setFamilyId(requestedFamily)}>Open {known.name || 'family'} inventory</button>
      : <p>This box belongs to a family you haven't joined. Ask its owner for an invitation.</p>}<Link to="/family">Family settings</Link></main>;
  }
  const box = getBoxById(boxId);
  if (boxesLoading || loading) return <main className="page-container" role="status">Loading your box…</main>;
  if (boxError || error) return <main className="page-container"><p role="alert">{boxError || error}</p><Link to="/">Back to inventory</Link></main>;
  if (!box) return <main className="page-container"><h1>Box not found</h1><p>It may have been removed or belong to another inventory.</p><Link to="/">Back to inventory</Link></main>;
  const boxItems = items.filter(item => item.boxId === box.id);
  const filtered = boxItems.filter(item => (item.name + ' ' + (item.description || '')).toLowerCase().includes(search.toLowerCase()));
  return <main className="page-container">
    <Link to="/" className="back-button">Back to inventory</Link>
    <h1>{box.title}</h1><p className="location">{box.location || 'Location not set'}</p>{box.notes && <p>{box.notes}</p>}
    <div className="action-buttons"><button onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : 'Add item to box'}</button>
      <button onClick={() => setQr(!qr)}>{qr ? 'Hide label' : 'Show QR label'}</button></div>
    {qr && <section className="printable-qr"><QRCodeSVG value={boxLink(box.id, familyId)} size={180} marginSize={4} />
      <h2>{box.title}</h2><p>{box.location}</p><button className="no-print" onClick={() => window.print()}>Print label</button></section>}
    {adding && <ItemForm onSubmit={async item => { await addItem({ ...item, boxId: box.id }); setAdding(false); }} buttonLabel="Add to box" />}
    <label className="search-label">Search this box<input type="search" value={search} onChange={e => setSearch(e.target.value)} /></label>
    <h2>{boxItems.length} {boxItems.length === 1 ? 'item' : 'items'} in this box</h2>
    <ItemList items={filtered} onDelete={item => deleteItem(item.id)} onMoveToLooseItems={item => moveItemToBox(item.id, null)}
      onEdit={item => { setEditingIndex(item.id); setEditedItem(item); }} onSaveEdit={item => updateItem(item.id, item)}
      editingIndex={editingIndex} editedItem={editedItem} setEditedItem={setEditedItem} setEditingIndex={setEditingIndex} />
  </main>;
}
